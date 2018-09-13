package kpn.core.tiles

import com.vividsolutions.jts.geom.Coordinate
import com.vividsolutions.jts.geom.GeometryFactory
import com.vividsolutions.jts.geom.LineString
import com.vividsolutions.jts.simplify.DouglasPeuckerSimplifier
import kpn.core.tiles.domain.Line
import kpn.core.tiles.domain.Point
import kpn.core.tiles.domain.Tile
import kpn.core.tiles.domain.TileRoute
import kpn.core.tiles.domain.TileRouteSegment
import kpn.shared.Fact
import kpn.shared.route.RouteInfo
import kpn.shared.tiles.ZoomLevel

class TileRouteBuilder(z: Int) {

  private val ROUTE_ALL_SEGMENTS_MIN_ZOOM_LEVEL = 1

  private val distanceTolerance = {
    val tileX = (z - 7) * 65
    (Tile.lon(z, tileX + 1) - Tile.lon(z, tileX)) / 256d
  }

  private val geomFactory = new GeometryFactory

  def build(routeInfo: RouteInfo): Option[TileRoute] = {

    routeInfo.analysis.flatMap { analysis =>

      val segments = analysis.map.unusedSegments ++ // TODO MAP add some logic here to eliminate double ways (e.g. ways that are both part of forward and backward)
        analysis.map.forwardSegments ++
        analysis.map.backwardSegments ++
        analysis.map.startTentacles ++
        analysis.map.endTentacles

      val tileRouteSegments = segments.flatMap { segment =>

        val coordinates = segment.trackPoints.map { trackPoint =>
          val lat = trackPoint.lat.toDouble
          val lon = trackPoint.lon.toDouble
          new Coordinate(lon, lat)
        }

        if (z < ZoomLevel.vectorTileMinZoom) {
          val lineString = geomFactory.createLineString(coordinates.toArray)
          val simplifiedLineString: LineString = DouglasPeuckerSimplifier.simplify(lineString, distanceTolerance).asInstanceOf[LineString]
          val simplifiedCoordinates = simplifiedLineString.getCoordinates.toSeq

          val lines = simplifiedCoordinates.sliding(2).flatMap { case (Seq(c1, c2)) =>
            val line = Line(Point(c1.x, c1.y), Point(c2.x, c2.y))

            // TODO MAP should check if line is within clipbounds of tile - return none if outside clipBounds

            if (line.length > 0.00000001) Some(line) else None
          }.toSeq

          Some(TileRouteSegment(lines))
        }
        else {
          val lines = coordinates.sliding(2).flatMap { case (Seq(c1, c2)) =>
            // TODO MAP should make sure that empty lines are eliminated long before this point !!!
            val line = Line(Point(c1.x, c1.y), Point(c2.x, c2.y))
            if (line.length > 0.00000001) Some(line) else None
          }.toSeq
          Some(TileRouteSegment(lines))
        }
      }

      if (tileRouteSegments.isEmpty) {
        None
      }
      else {

        val layer = if (routeInfo.orphan) {
          "orphan-route"
        }
        else if (routeInfo.facts.contains(Fact.RouteIncomplete)) {
          "incomplete-route"
        }
        else if (routeInfo.facts.exists(_.isError)) {
          "error-route"
        }
        else {
          "route"
        }

        Some(TileRoute(routeInfo.id, routeInfo.summary.name, layer, tileRouteSegments))
      }
    }
  }
}