package kpn.core.planner

import kpn.shared.NodeInfo
import kpn.shared.NetworkType
import kpn.shared.route.RouteInfo

object PlanJson {

  def build(networkType: NetworkType, nodes: Seq[NodeInfo], routes: Seq[RouteInfo]): String = {

    val nodeFeatures = nodes.map { node =>
      """{"type":"Feature","geometry":{"type":"Point","coordinates":[%s,%s]},"properties":{"nodeId":"%s","name":"%s"}}""".format(
        node.longitude,
        node.latitude,
        node.id,
        node.name(networkType))
    }

    val routeFeatures = routes.map { route =>
      val segments = route.analysis match {
        case Some(analysis) => analysis.map.forwardSegments ++ analysis.map.backwardSegments ++ analysis.map.unusedSegments
        case None => Seq()
      }
      val lineCoordinates = segments.map { segment =>
        val coordinates = segment.trackPoints.map(p => "[%s,%s]".format(p.lon, p.lat)).mkString(",")
        "[%s]".format(coordinates)
      }.mkString(",")
      """{"type":"Feature","geometry":{"type":"MultiLineString","coordinates":[%s]},"properties":{"route":"01-02"}}""".format(lineCoordinates)
    }

    val features = nodeFeatures ++ routeFeatures

    """{"type":"FeatureCollection","features":[%s]}""".format(features.mkString(","))
  }
}