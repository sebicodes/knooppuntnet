package kpn.core.database.views.poi

import kpn.api.common.SharedTestObjects
import kpn.core.test.TestSupport.withDatabase
import kpn.core.util.UnitTest
import kpn.server.repository.PoiRepositoryImpl

class PoiNodeIdViewTest extends UnitTest with SharedTestObjects {

  test("all id's of pois of type 'node'") {

    withDatabase { database =>

      val repo = new PoiRepositoryImpl(database)

      repo.save(newPoi("node", 1001))
      repo.save(newPoi("node", 1002))
      repo.save(newPoi("way", 101))
      repo.save(newPoi("relation", 1))

      PoiNodeIdView.query(database, stale = false) should equal(Seq(1001, 1002))
    }
  }
}
