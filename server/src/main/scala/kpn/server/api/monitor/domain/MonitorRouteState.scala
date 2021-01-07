package kpn.server.api.monitor.domain

import kpn.api.common.BoundsI
import kpn.api.common.monitor.MonitorRouteNokSegment
import kpn.api.common.monitor.MonitorRouteSegment
import kpn.api.custom.Timestamp

case class MonitorRouteState(
  routeId: Long,
  timestamp: Timestamp, // time of most recent analysis
  wayCount: Long,
  osmDistance: Long,
  gpxDistance: Long,
  bounds: BoundsI,
  referenceKey: Option[String], // use this to pick up the reference geometry
  osmSegments: Seq[MonitorRouteSegment],
  okGeometry: Option[String],
  nokSegments: Seq[MonitorRouteNokSegment]
)