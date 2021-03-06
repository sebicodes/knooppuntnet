package kpn.server.analyzer.engine.tiles

import kpn.api.common.NodeInfo
import kpn.api.common.route.RouteInfo
import kpn.api.common.tiles.ZoomLevel
import kpn.api.custom.NetworkType
import kpn.core.util.Log
import kpn.server.analyzer.engine.tile.NodeTileAnalyzer
import kpn.server.analyzer.engine.tile.RouteTileAnalyzer
import kpn.server.analyzer.engine.tile.TileFileBuilder
import kpn.server.analyzer.engine.tiles.domain.TileDataNode
import kpn.server.analyzer.engine.tiles.domain.TileDataRoute
import kpn.server.analyzer.engine.tiles.domain.TileNodes
import kpn.server.analyzer.engine.tiles.domain.TileRoutes

class TilesBuilder(
  bitmapTileFileRepository: TileFileRepository,
  vectorTileFileRepository: TileFileRepository,
  tileFileBuilder: TileFileBuilder,
  nodeTileAnalyzer: NodeTileAnalyzer,
  routeTileAnalyzer: RouteTileAnalyzer
) {

  private val log = Log(classOf[TilesBuilder])

  def build(
    z: Int,
    analysis: TileAnalysis
  ): Unit = {

    val existingTileNames = if (z < ZoomLevel.vectorTileMinZoom) {
      bitmapTileFileRepository.existingTileNames(analysis.networkType.name, z)
    }
    else {
      vectorTileFileRepository.existingTileNames(analysis.networkType.name, z)
    }

    val existingTileNamesSurface = if (z < ZoomLevel.vectorTileMinZoom) {
      bitmapTileFileRepository.existingTileNames(analysis.networkType.name + "/surface", z)
    }
    else {
      Seq()
    }
    val existingTileNamesSurvey = if (z < ZoomLevel.vectorTileMinZoom) {
      bitmapTileFileRepository.existingTileNames(analysis.networkType.name + "/survey", z)
    }
    else {
      Seq()
    }

    val existingTileNamesAnalysis = if (z < ZoomLevel.vectorTileMinZoom) {
      bitmapTileFileRepository.existingTileNames(analysis.networkType.name + "/analysis", z)
    }
    else {
      Seq()
    }

    log.info(s"Processing zoomlevel $z")
    log.info(s"Number of tiles before: " + existingTileNames.size)
    if (z < ZoomLevel.vectorTileMinZoom) {
      log.info(s"Number of surface tiles before: " + existingTileNamesSurface.size)
      log.info(s"Number of survey tiles before: " + existingTileNamesSurvey.size)
      log.info(s"Number of analysis tiles before: " + existingTileNamesAnalysis.size)
    }

    log.info(s"buildTileNodeMap()")
    val tileNodes = buildTileNodeMap(analysis.networkType, z, analysis.nodes, analysis.orphanNodes)
    log.info(s"buildTileRoutes()")
    val tileRoutes = buildTileRoutes(z, analysis.routeInfos)
    log.info(s"buildTileRouteMap()")
    val tileRoutesMap = buildTileRouteMap(z, tileRoutes)
    val tileNames = (tileNodes.keys ++ tileRoutesMap.keys).toSet.toSeq
    log.info(s"build ${tileNames.size} tiles")

    var progress: Int = 0

    tileNames.zipWithIndex.foreach { case (tileName: String, index) =>
      val currentProgress = (100d * (index + 1) / tileNames.size).round.toInt
      if (currentProgress != progress) {
        progress = currentProgress
        log.info(s"Build tile ${index + 1}/${tileNames.size} $progress $tileName")
      }

      val tileNodesOption = tileNodes.get(tileName)
      val tileRoutesOption = tileRoutesMap.get(tileName)

      val tile = tileNodesOption match { // TODO MAP can do this cleaner?
        case Some(tileNodes1) => tileNodes1.tile
        case None => tileRoutesOption match {
          case Some(tileRoutes1) => tileRoutes1.tile
          case None => throw new IllegalStateException()
        }
      }

      val nodes = tileNodesOption match {
        case None => Seq()
        case Some(tn) => tn.nodes
      }
      val routes = tileRoutesOption match {
        case None => Seq()
        case Some(tr) => tr.routes
      }

      val tileData = TileData(
        analysis.networkType,
        tile,
        nodes,
        routes
      )

      tileFileBuilder.build(tileData)
    }

    val afterTileNames = tileNames.map(tileName => analysis.networkType.name + "-" + tileName)
    val obsoleteTileNames = (existingTileNames.toSet -- afterTileNames.toSet).toSeq.sorted
    log.info(s"Obsolete: " + obsoleteTileNames)

    log.info(s"Obsolete tile count: " + obsoleteTileNames.size)

    if (z < ZoomLevel.vectorTileMinZoom) {

      bitmapTileFileRepository.delete(obsoleteTileNames)
      log.info(s"Obsolete bitmap tiles removed: " + obsoleteTileNames.size)

      val afterTileNamesSurface = tileNames.map(tileName => analysis.networkType.name + "-surface-" + tileName)

      log.info(s"z=$z, existingTileNamesSurface=$existingTileNamesSurface")
      log.info(s"z=$z, afterTileNamesSurface=$afterTileNamesSurface")

      val obsoleteTileNamesSurface = (existingTileNamesSurface.toSet -- afterTileNamesSurface.toSet).toSeq.sorted
      bitmapTileFileRepository.delete(obsoleteTileNamesSurface)
      log.info(s"Obsolete bitmap surface tiles removed: " + obsoleteTileNamesSurface.size)

      val afterTileNamesSurvey = tileNames.map(tileName => analysis.networkType.name + "-survey-" + tileName)
      val obsoleteTileNamesSurvey = (existingTileNamesSurvey.toSet -- afterTileNamesSurvey.toSet).toSeq.sorted
      bitmapTileFileRepository.delete(obsoleteTileNamesSurvey)
      log.info(s"Obsolete bitmap survey tiles removed: " + obsoleteTileNamesSurvey.size)

      val afterTileNamesAnalysis = tileNames.map(tileName => analysis.networkType.name + "-analysis-" + tileName)
      val obsoleteTileNamesAnalysis = (existingTileNamesAnalysis.toSet -- afterTileNamesAnalysis.toSet).toSeq.sorted
      bitmapTileFileRepository.delete(obsoleteTileNamesAnalysis)
      log.info(s"Obsolete bitmap analysis tiles removed: " + obsoleteTileNamesAnalysis.size)
    }
    else {
      vectorTileFileRepository.delete(obsoleteTileNames)
      log.info(s"Obsolete vector tiles removed")
    }
  }

  private def buildTileNodeMap(networkType: NetworkType, z: Int, nodes: Seq[TileDataNode], orphanNodes: Seq[NodeInfo]): Map[String, TileNodes] = {
    if (z < ZoomLevel.nodeMinZoom) {
      Map()
    }
    else {
      val allNodes = nodes ++ orphanNodes.map(node => new TileDataNodeBuilder().build(networkType, node))

      val map = scala.collection.mutable.Map[String, TileNodes]()

      allNodes.foreach { node =>
        val tiles = nodeTileAnalyzer.tiles(z, node)
        tiles.foreach { tile =>
          map(tile.name) = map.get(tile.name) match {
            case Some(tileNodes) => TileNodes(tile, tileNodes.nodes :+ node)
            case None => TileNodes(tile, Seq(node))
          }
        }
      }
      map.toMap
    }
  }

  private def buildTileRouteMap(z: Int, tileRoutes: Seq[TileDataRoute]): Map[String, TileRoutes] = {

    val map = scala.collection.mutable.Map[String, TileRoutes]()

    var progress: Int = 0
    tileRoutes.zipWithIndex.foreach { case (tileRoute, index) =>
      val tiles = routeTileAnalyzer.tiles(z, tileRoute)
      val currentProgress = (100d * (index + 1) / tileRoutes.size).round.toInt
      if (currentProgress != progress) {
        progress = currentProgress
        log.info(s"Build route map ${index + 1}/${tileRoutes.size} $progress% tilecount=${tiles.size}")
      }
      tiles.foreach { tile =>
        map(tile.name) = map.get(tile.name) match {
          case Some(tileRoutes1) => TileRoutes(tile, tileRoutes1.routes :+ tileRoute)
          case None => TileRoutes(tile, Seq(tileRoute))
        }
      }
    }
    map.toMap
  }

  private def buildTileRoutes(z: Int, routeInfos: Seq[RouteInfo]): Seq[TileDataRoute] = {
    val b = new TileDataRouteBuilder(z)
    routeInfos.flatMap(b.build)
  }
}
