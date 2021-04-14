package kpn.server.analyzer.engine.analysis.route

import kpn.api.common.SharedTestObjects
import kpn.core.util.UnitTest

class WayAnalyzerTest extends UnitTest with SharedTestObjects {

  test("linear way is not self intersecting or closed loop") {

    val d = new RouteTestData("01-02") {
      way(10, 1, 2, 3)
    }.data
    val way = d.ways.values.head

    assert(!WayAnalyzer.isClosedLoop(way))
    assert(!WayAnalyzer.isSelfIntersecting(way))
  }

  test("a self intersecting way is not necessarily a closed loop") {

    val d = new RouteTestData("01-02") {
      way(10, 1, 2, 3, 4, 2)
    }.data
    val way = d.ways.values.head

    assert(!WayAnalyzer.isClosedLoop(way))
    assert(WayAnalyzer.isSelfIntersecting(way))
  }

  test("closed loop when begin and endnode the same; do not consider this 'self intersecting'") {

    val d = new RouteTestData("01-02") {
      way(10, 1, 2, 3, 1)
    }.data
    val way = d.ways.values.head

    assert(WayAnalyzer.isClosedLoop(way))
    assert(!WayAnalyzer.isSelfIntersecting(way))
  }

  test("way with single segment cannot be closed loop or self intersecting") {

    val d = new RouteTestData("01-02") {
      way(10, 1, 2)
    }.data
    val way = d.ways.values.head

    assert(!WayAnalyzer.isClosedLoop(way))
    assert(!WayAnalyzer.isSelfIntersecting(way))
  }

  test("way without nodes cannot be closed loop or self intersecting") {

    val d = new RouteTestData("01-02") {
      way(10)
    }.data
    val way = d.ways.values.head

    assert(!WayAnalyzer.isClosedLoop(way))
    assert(!WayAnalyzer.isSelfIntersecting(way))
  }

}
