package kpn.core.database.views.analyzer

import kpn.api.common.RouteSummary
import kpn.api.common.SharedTestObjects
import kpn.api.custom.Country
import kpn.api.custom.NetworkType
import kpn.api.custom.Subset
import kpn.core.database.Database
import kpn.core.test.TestSupport.withDatabase
import org.scalatest.FunSuite
import org.scalatest.matchers.should.Matchers

class OrphanRouteViewTest extends FunSuite with Matchers with SharedTestObjects {

  test("orphan routes are included in the view") {
    withDatabase { database =>
      val summaries = route(database, orphan = true)
      summaries.map(_.id) should equal(Seq(11))
    }
  }

  test("regular routes are not included in the view") {
    withDatabase { database =>
      val summaries = route(database, orphan = false)
      summaries should equal(Seq())
    }
  }

  test("inactive orphan routes are not included in the view") {
    withDatabase { database =>
      val summaries = route(database, orphan = true, active = false)
      summaries should equal(Seq())
    }
  }

  private def route(database: Database, orphan: Boolean, active: Boolean = true): Seq[RouteSummary] = {

    val routeInfo = newRoute(
      11,
      active = active,
      orphan = orphan,
      country = Some(Country.nl),
      networkType = NetworkType.hiking
    )

    val routeRepository = newRouteRepository(database)
    routeRepository.save(routeInfo)

    OrphanRouteView.query(database, Subset.nlHiking, stale = false)
  }
}
