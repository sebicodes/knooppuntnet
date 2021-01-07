package kpn.core.database.views.monitor

import kpn.api.common.SharedTestObjects
import kpn.api.common.monitor.MonitorChangesParameters
import kpn.core.test.TestSupport.withDatabase
import kpn.core.util.UnitTest
import kpn.server.api.monitor.domain.MonitorRouteChange
import kpn.server.repository.MonitorAdminRouteRepositoryImpl

class MonitorChangesViewTest extends UnitTest with SharedTestObjects {

  test("view") {

    withDatabase { database =>

      val groupRepository = new MonitorAdminRouteRepositoryImpl(database)

      val change1 = buildChange("group-1", 101L, 1L, "20200811000000", happy = false)
      val change2 = buildChange("group-1", 101L, 2L, "20200812000000", happy = true)
      val change3 = buildChange("group-1", 102L, 3L, "20200813000000", happy = false)
      val change4 = buildChange("group-2", 103L, 4L, "20200814000000", happy = false)
      val change5 = buildChange("group-2", 103L, 5L, "20200815000000", happy = true)

      groupRepository.saveRouteChange(change1)
      groupRepository.saveRouteChange(change2)
      groupRepository.saveRouteChange(change3)
      groupRepository.saveRouteChange(change4)
      groupRepository.saveRouteChange(change5)

      MonitorChangesView.changesCount(database, MonitorChangesParameters(), stale = false) should equal(5)
      MonitorChangesView.changes(database, MonitorChangesParameters(), stale = false) should equal(
        Seq(
          change5,
          change4,
          change3,
          change2,
          change1
        )
      )

      MonitorChangesView.changesCount(database, MonitorChangesParameters(impact = true), stale = false) should equal(2)
      MonitorChangesView.changes(database, MonitorChangesParameters(impact = true), stale = false) should equal(
        Seq(
          change5,
          change2
        )
      )

      MonitorChangesView.groupChangesCount(database, "group-1", MonitorChangesParameters(), stale = false) should equal(3)
      MonitorChangesView.groupChanges(database, "group-1", MonitorChangesParameters(), stale = false) should equal(
        Seq(
          change3,
          change2,
          change1
        )
      )

      MonitorChangesView.groupChangesCount(database, "group-1", MonitorChangesParameters(impact = true), stale = false) should equal(1)
      MonitorChangesView.groupChanges(database, "group-1", MonitorChangesParameters(impact = true), stale = false) should equal(
        Seq(
          change2
        )
      )

      MonitorChangesView.routeChangesCount(database, 101L, MonitorChangesParameters(), stale = false) should equal(2)
      MonitorChangesView.routeChanges(database, 101L, MonitorChangesParameters(), stale = false) should equal(
        Seq(
          change2,
          change1
        )
      )

      MonitorChangesView.routeChangesCount(database, 101L, MonitorChangesParameters(impact = true), stale = false) should equal(1)
      MonitorChangesView.routeChanges(database, 101L, MonitorChangesParameters(impact = true), stale = false) should equal(
        Seq(
          change2
        )
      )
    }
  }

  private def buildChange(groupName: String, routeId: Long, changeSetId: Long, timestamp: String, happy: Boolean): MonitorRouteChange = {
    newMonitorRouteChange(
      newChangeKeyI(
        1,
        timestamp,
        changeSetId,
        routeId
      ),
      groupName,
      happy = happy
    )
  }

}