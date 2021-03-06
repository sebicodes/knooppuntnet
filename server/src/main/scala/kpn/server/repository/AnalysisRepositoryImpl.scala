package kpn.server.repository

import kpn.api.common.NodeInfo
import kpn.api.common.network.NetworkInfo
import kpn.api.common.route.RouteInfo
import kpn.api.custom.Fact
import kpn.api.custom.Timestamp
import kpn.core.analysis._
import kpn.core.database.Database
import kpn.core.database.doc.TimestampDoc
import kpn.core.gpx.GpxFile
import kpn.core.gpx.GpxRoute
import kpn.core.gpx.WayPoint
import kpn.server.analyzer.engine.changes.changes.NetworkElements
import kpn.server.analyzer.engine.changes.changes.RelationAnalyzer
import kpn.server.analyzer.engine.changes.changes.RouteElements
import org.springframework.stereotype.Component

@Component
class AnalysisRepositoryImpl(
  analysisDatabase: Database,
  networkRepository: NetworkRepository,
  routeRepository: RouteRepository,
  nodeRepository: NodeRepository,
  nodeInfoBuilder: NodeInfoBuilder,
  relationAnalyzer: RelationAnalyzer
) extends AnalysisRepository {

  private val lastUpdatedDocumentKey = "analysis"

  override def saveNetwork(network: Network): Unit = {
    buildNetworkDoc(network)
    buildRouteDocs(network)
    buildNodeDocs(network)
    buildGpxDoc(network)
  }

  override def saveIgnoredNetwork(networkInfo: NetworkInfo): Unit = {
    networkRepository.save(networkInfo)
  }

  override def saveRoute(route: RouteInfo): Unit = {
    routeRepository.save(route)
  }

  override def saveNode(node: NodeInfo): Unit = {
    nodeRepository.save(node)
  }

  override def lastUpdated(): Option[Timestamp] = {
    analysisDatabase.docWithId(lastUpdatedDocumentKey, classOf[TimestampDoc]).map(_.value)
  }

  override def saveLastUpdated(timestamp: Timestamp): Unit = {
    analysisDatabase.save(TimestampDoc(lastUpdatedDocumentKey, timestamp))
  }

  private def buildNetworkDoc(network: Network): Unit = {
    val networkInfo = new NetworkInfoBuilder().build(network)
    networkRepository.save(networkInfo)
    networkRepository.saveElements(
      NetworkElements(
        network.id,
        relationAnalyzer.toElementIds(network.relation)
      )
    )
  }

  private def buildRouteDocs(network: Network): Unit = {
    network.routes.foreach { networkMemberRoute =>
      routeRepository.save(networkMemberRoute.routeAnalysis.route)
      routeRepository.saveElements(
        RouteElements(
          networkMemberRoute.id,
          relationAnalyzer.toElementIds(networkMemberRoute.routeAnalysis.relation)
        )
      )
    }
  }

  private def buildNodeDocs(network: Network): Unit = {

    val nodeInfos: Seq[NodeInfo] = network.nodes.map { node =>

      val facts: Seq[Fact] = node.integrityCheck match {
        case None => Seq()
        case Some(nodeIntegrityCheck) =>
          if (nodeIntegrityCheck.failed) {
            Seq(Fact.IntegrityCheckFailed)
          }
          else {
            Seq()
          }
      }

      nodeInfoBuilder.build(
        node.networkNode.node.id,
        active = true,
        orphan = false,
        node.networkNode.country,
        node.networkNode.node.latitude,
        node.networkNode.node.longitude,
        node.networkNode.node.timestamp,
        node.networkNode.node.tags,
        facts
      )
    }
    nodeRepository.save(nodeInfos: _*)
  }

  private def buildGpxDoc(network: Network): Unit = {

    val wayPoints = network.nodes.map(node =>
      WayPoint(
        node.networkNode.name,
        node.networkNode.node.latitude.toString,
        node.networkNode.node.longitude.toString, ""
      )
    )

    val trackSegments = network.routes.flatMap(networkMemberRoute => new GpxRoute().trackSegments(networkMemberRoute.routeAnalysis.ways))

    val name = "%s-%s.gpx".format(network.id, network.name.replaceAll(" ", ""))
    networkRepository.saveGpxFile(GpxFile(network.id, name, wayPoints, trackSegments))
  }
}
