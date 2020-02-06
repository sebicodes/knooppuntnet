package kpn.core.engine.changes.orphan.node

import kpn.core.engine.analysis.Interpreter
import kpn.core.repository.BlackListRepository
import kpn.core.engine.changes.ElementChanges
import kpn.core.engine.changes.data.AnalysisData
import kpn.core.util.Log
import kpn.shared.NetworkType
import kpn.shared.changes.ChangeAction.Create
import kpn.shared.changes.ChangeAction.Delete
import kpn.shared.changes.ChangeAction.Modify
import kpn.shared.changes.ChangeSet
import kpn.shared.data.raw.RawNode

class OrphanNodeChangeAnalyzerImpl(
  analysisData: AnalysisData,
  blackListRepository: BlackListRepository
) extends OrphanNodeChangeAnalyzer {

  private val log = Log(classOf[OrphanNodeChangeAnalyzerImpl])

  def analyze(changeSet: ChangeSet): OrphanNodeChangeAnalysis = {

    log.debugElapsed {

      val createdNodesById = nodeMap(changeSet, Create)
      val updatedNodesById = nodeMap(changeSet, Modify)
      val deletedNodesById = nodeMap(changeSet, Delete)

      val createdNetworkNodeIds = networkNodeIds(createdNodesById)
      val updatedNetworkNodeIds = networkNodeIds(updatedNodesById)

      val nodeCreateIds1 = withoutKnownNodes(createdNetworkNodeIds)
      val nodeCreateIds2 = withoutKnownNodes(updatedNetworkNodeIds)

      val nodeUpdateIds1 = createdNetworkNodeIds.filter(isKnownOrphanNode)
      val nodeUpdateIds2 = updatedNetworkNodeIds.filter(isKnownOrphanNode)
      val nodeUpdateIds3 = updatedNodesById.keySet.filter(isKnownOrphanNode)

      val deletes = deletedNodesById.keySet.filter(isKnownOrphanNode)
      val updates = nodeUpdateIds1 ++ nodeUpdateIds2 ++ nodeUpdateIds3 -- deletes
      val creates = nodeCreateIds1 ++ nodeCreateIds2 -- updates -- deletes

      val sortedCreates = creates.toList.sorted
      val sortedUpdates = updates.toList.sorted
      val sortedDeletes = deletes.toList.sorted

      val nodesById = createdNodesById ++ updatedNodesById ++ deletedNodesById

      val nodeCreates = sortedCreates.flatMap(nodesById.get)
      val nodeUpdates = sortedUpdates.flatMap(nodesById.get)
      val nodeDeletes = sortedDeletes.flatMap(nodesById.get)

      val message = s"creates=${creates.size}, updates=${updates.size}, deletes=${deletes.size}"

      (
        message,
        OrphanNodeChangeAnalysis(
          nodeCreates,
          nodeUpdates,
          nodeDeletes,
          ElementChanges(sortedCreates, sortedUpdates, sortedDeletes)
        )
      )
    }
  }

  private def nodeMap(changeSet: ChangeSet, action: Int): Map[Long, RawNode] = {
    changeSet.changes.filter(_.action == action).flatMap(_.elements).collect { case e: RawNode => e }.map(n => n.id -> n).toMap
  }

  private def networkNodeIds(nodesById: Map[Long, RawNode]): Set[Long] = {
    nodesById.values.
      filter(isNetworkNode).
      filterNot(isBlackListed).
      map(_.id).
      toSet
  }

  private def isNetworkNode(node: RawNode): Boolean = {
    new Interpreter(NetworkType.hiking).isNetworkNode(node) ||
      new Interpreter(NetworkType.bicycle).isNetworkNode(node) ||
      new Interpreter(NetworkType.horseRiding).isNetworkNode(node) ||
      new Interpreter(NetworkType.motorboat).isNetworkNode(node) ||
      new Interpreter(NetworkType.canoe).isNetworkNode(node) ||
      new Interpreter(NetworkType.inlineSkates).isNetworkNode(node)
  }

  private def withoutKnownNodes(nodeIds: Set[Long]): Set[Long] = {
    nodeIds.filterNot { nodeId =>
      isReferencedNode(nodeId) || isKnownOrphanNode(nodeId)
    }
  }

  private def isReferencedNode(nodeId: Long): Boolean = {
    analysisData.networks.isReferencingNode(nodeId) ||
      analysisData.orphanRoutes.isReferencingNode(nodeId)
  }

  private def isKnownOrphanNode(nodeId: Long): Boolean = {
    analysisData.orphanNodes.watched.contains(nodeId) ||
      analysisData.orphanNodes.ignored.contains(nodeId)
  }

  private def isBlackListed(node: RawNode): Boolean = {
    blackListRepository.get.containsRoute(node.id)
  }
}