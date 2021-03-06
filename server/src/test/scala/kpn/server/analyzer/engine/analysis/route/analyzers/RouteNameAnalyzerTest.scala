package kpn.server.analyzer.engine.analysis.route.analyzers

import kpn.api.common.SharedTestObjects
import kpn.api.common.data.raw.RawData
import kpn.api.custom.Fact.RouteNameMissing
import kpn.api.custom.ScopedNetworkType
import kpn.api.custom.Tags
import kpn.core.data.DataBuilder
import kpn.core.util.UnitTest
import kpn.server.analyzer.engine.analysis.route.RouteNameAnalysis
import kpn.server.analyzer.engine.analysis.route.domain.RouteAnalysisContext
import kpn.server.analyzer.engine.context.AnalysisContext
import kpn.server.analyzer.load.data.LoadedRoute

class RouteNameAnalyzerTest extends UnitTest with SharedTestObjects {

  test("route name based on 'ref' tag") {
    val routeNameAnalysis = analyzeRouteName(Tags.from("ref" -> "01-02"))
    routeNameAnalysis should equal(
      Some(
        RouteNameAnalysis(
          Some("01-02"),
          Some("01"),
          Some("02")
        )
      )
    )
  }

  test("route name based on 'name' tag") {
    val routeNameAnalysis = analyzeRouteName(Tags.from("name" -> "01-02"))
    routeNameAnalysis should equal(
      Some(
        RouteNameAnalysis(
          Some("01-02"),
          Some("01"),
          Some("02")
        )
      )
    )
  }

  test("route name based on 'note' tag") {
    val routeNameAnalysis = analyzeRouteName(Tags.from("note" -> "01-02"))
    routeNameAnalysis should equal(
      Some(
        RouteNameAnalysis(
          Some("01-02"),
          Some("01"),
          Some("02")
        )
      )
    )
  }

  test("route name based on 'note' tag with ignored comment") {
    val routeNameAnalysis = analyzeRouteName(Tags.from("note" -> "01-02;ignored comment"))
    routeNameAnalysis should equal(
      Some(
        RouteNameAnalysis(
          Some("01-02"),
          Some("01"),
          Some("02")
        )
      )
    )
  }

  test("route name based on 'from' and 'to' tag") {
    val routeNameAnalysis = analyzeRouteName(Tags.from("from" -> "01", "to" -> "02"))
    routeNameAnalysis should equal(
      Some(
        RouteNameAnalysis(
          Some("01-02"),
          Some("01"),
          Some("02")
        )
      )
    )
  }

  test("route name based on 'from' tag only") {
    val routeNameAnalysis = analyzeRouteName(Tags.from("from" -> "01"))
    routeNameAnalysis should equal(
      Some(
        RouteNameAnalysis(
          Some("01-"),
          Some("01"),
          None
        )
      )
    )
  }

  test("route name based on 'to' tag only") {
    val routeNameAnalysis = analyzeRouteName(Tags.from("to" -> "02"))
    routeNameAnalysis should equal(
      Some(
        RouteNameAnalysis(
          Some("-02"),
          None,
          Some("02")
        )
      )
    )
  }

  test("route name with non-numeric start- and end-node names") {
    val routeNameAnalysis = analyzeRouteName(Tags.from("ref" -> "B-A"))
    routeNameAnalysis should equal(
      Some(
        RouteNameAnalysis(
          Some("B-A"),
          Some("B"),
          Some("A")
        )
      )
    )
  }

  test("route name with start- and end-node names reversed") {
    val routeNameAnalysis = analyzeRouteName(Tags.from("ref" -> "02-01"))
    routeNameAnalysis should equal(
      Some(
        RouteNameAnalysis(
          Some("02-01"),
          Some("01"),
          Some("02"),
          reversed = true
        )
      )
    )
  }

  test("route name without dash to separate start- and end-node names") {
    val routeNameAnalysis = analyzeRouteName(Tags.from("ref" -> "01/02"))
    routeNameAnalysis should equal(
      Some(
        RouteNameAnalysis(
          Some("01/02"),
          None,
          None
        )
      )
    )
  }

  test("route name missing") {
    val context = analyze(Tags.empty)
    context.routeNameAnalysis should equal(None)
    context.facts should equal(Seq(RouteNameMissing))
  }

  private def analyzeRouteName(tags: Tags): Option[RouteNameAnalysis] = {
    val newContext = analyze(tags)
    newContext.routeNameAnalysis
  }

  private def analyze(tags: Tags): RouteAnalysisContext = {

    val standardRouteTags = Tags.from(
      "network" -> "rwn",
      "type" -> "route",
      "route" -> "foot",
      "network:type" -> "node_network"
    )

    val allTags = standardRouteTags ++ tags
    val relation = newRawRelation(11L, members = Seq.empty, tags = allTags)
    val rawData = RawData(None, Seq.empty, Seq.empty, Seq(relation))
    val data = new DataBuilder(rawData).data

    val loadedRoute = LoadedRoute(
      country = None,
      ScopedNetworkType.rwn,
      data,
      data.relations(11L)
    )

    val analysisContext = new AnalysisContext()

    val context = RouteAnalysisContext(
      analysisContext,
      loadedRoute,
      orphan = false,
      Map.empty
    )

    RouteNameAnalyzer.analyze(context)
  }

}
