package kpn.server.api.longdistance

import kpn.api.common.longdistance.LongDistanceRouteChangeSummary
import kpn.api.common.longdistance.LongDistanceRouteChangesPage
import kpn.server.repository.LongDistanceRouteRepository
import org.springframework.stereotype.Component

@Component
class LongDistanceRouteChangesPageBuilderImpl(
  longDistanceRouteRepository: LongDistanceRouteRepository
) extends LongDistanceRouteChangesPageBuilder {

  override def build(routeId: Long): Option[LongDistanceRouteChangesPage] = {

    val changes = if (routeId == 3121667L) {
      longDistanceRouteRepository.changes().map { change =>
        LongDistanceRouteChangeSummary(
          change.key,
          change.wayCount,
          change.waysAdded,
          change.waysRemoved,
          change.waysUpdated,
          change.osmDistance,
          change.gpxDistance,
          change.gpxFilename,
          change.bounds,
          change.routeSegments.size,
          change.newNokSegments.size,
          change.resolvedNokSegments.size,
          change.happy,
          change.investigate
        )
      }.reverse
    }
    else {
      Seq()
    }

    longDistanceRouteRepository.routeWithId(routeId).map { route =>
      LongDistanceRouteChangesPage(
        route.id,
        route.ref,
        route.name,
        changes
      )
    }
  }

}
