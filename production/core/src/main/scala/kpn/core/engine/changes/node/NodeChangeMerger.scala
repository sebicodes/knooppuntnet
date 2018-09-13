package kpn.core.engine.changes.node

import kpn.core.util.Log
import kpn.shared.Fact
import kpn.shared.Subset
import kpn.shared.changes.details.ChangeType
import kpn.shared.changes.details.NodeChange
import kpn.shared.changes.details.RefBooleanChange
import kpn.shared.common.Ref
import kpn.shared.data.raw.RawNode
import kpn.shared.diff.TagDiffs
import kpn.shared.diff.common.FactDiffs
import kpn.shared.diff.node.NodeMoved

class NodeChangeMerger(left: NodeChange, right: NodeChange) {

  private val log = Log(classOf[NodeChangeMerger])

  def merged: NodeChange = {

    if (left == right) {
      left
    }
    else {
      assertFixedFields(left, right)

      NodeChange(
        left.key,
        mergedChangeType(),
        mergedSubsets(),
        left.name,
        mergedBefore(),
        mergedAfter(),
        mergedConnectionChanges(),
        mergedDefinedInNetworkChanges(),
        mergedTagDiffs(),
        mergedNodeMoved(),
        mergedAddedToRoute(),
        mergedRemovedFromRoute(),
        mergedAddedToNetwork(),
        mergedRemovedFromNetwork(),
        mergedFactDiffs(),
        mergedFacts()
      )
    }
  }

  private def assertFixedFields(left: NodeChange, right: NodeChange): Unit = {
    if (left.key != right.key) {
      log.info(s"Node keys do not match: ${left.key} != ${right.key}")
    }
  }

  private def mergedChangeType(): ChangeType = {
    if (left.changeType == right.changeType) {
      left.changeType
    }
    else {
      log.info(s"Node changeTypes do not match: ${left.changeType} != ${right.changeType}")
      if (left.changeType == ChangeType.Create || right.changeType == ChangeType.Create) {
        ChangeType.Create
      }
      else if (left.changeType == ChangeType.Delete || right.changeType == ChangeType.Delete) {
        ChangeType.Delete
      }
      else {
        left.changeType
      }
    }
  }

  private def mergedSubsets(): Seq[Subset] = {
    (left.subsets ++ right.subsets).distinct
  }

  private def mergedName(): String = {
    left.name
  }

  private def mergedBefore(): Option[RawNode] = {
    if (left.before.isEmpty && right.before.isEmpty) {
      None
    }
    else if (left.before.nonEmpty && right.before.isEmpty) {
      left.before
    } else if (left.before.isEmpty && right.before.nonEmpty) {
      right.before
    }
    else {
      if (left.before != right.before) {
        log.warn(s"Node 'before' values do not match: ${left.before} != ${right.before}. Continue processing with left value.")
      }
      left.before
    }
  }

  private def mergedAfter(): Option[RawNode] = {
    if (left.after.isEmpty && right.after.isEmpty) {
      None
    }
    else if (left.after.nonEmpty && right.after.isEmpty) {
      left.after
    } else if (left.after.isEmpty && right.after.nonEmpty) {
      right.after
    }
    else {
      if (left.after != right.after) {
        log.warn(s"Node 'after' values do not match: ${left.after} != ${right.after}. Continue processing with left value.")
      }
      left.after
    }
  }

  private def mergedConnectionChanges(): Seq[RefBooleanChange] = {
    // TODO CHANGE expand code to make sure there are no duplicate entries per network id
    left.connectionChanges ++ right.connectionChanges
  }

  private def mergedDefinedInNetworkChanges(): Seq[RefBooleanChange] = {
    // TODO CHANGE expand code to make sure there are no duplicate entries per network id
    left.definedInNetworkChanges ++ right.definedInNetworkChanges
  }

  private def mergedTagDiffs(): Option[TagDiffs] = {
    left.tagDiffs
  }

  private def mergedNodeMoved(): Option[NodeMoved] = {
    left.nodeMoved
  }

  private def mergedAddedToRoute(): Seq[Ref] = {
    (left.addedToRoute ++ right.addedToRoute).distinct.sortBy(_.id)
  }

  private def mergedRemovedFromRoute(): Seq[Ref] = {
    (left.removedFromRoute ++ right.removedFromRoute).distinct.sortBy(_.id)
  }

  private def mergedAddedToNetwork(): Seq[Ref] = {
    (left.addedToNetwork ++ right.addedToNetwork).distinct.sortBy(_.id)
  }

  private def mergedRemovedFromNetwork(): Seq[Ref] = {
    (left.removedFromNetwork ++ right.removedFromNetwork).distinct.sortBy(_.id)
  }

  private def mergedFactDiffs(): FactDiffs = {
    left.factDiffs
  }

  private def mergedFacts(): Seq[Fact] = {
    (left.facts ++ right.facts).distinct.sortBy(_.id)
  }
}