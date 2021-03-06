package kpn.core.database.views.changes

import kpn.api.common.changes.details.LocationChange
import kpn.api.common.changes.filter.ChangesParameters
import kpn.core.database.Database
import kpn.core.database.query.Query
import kpn.server.repository.QueryParameters

object ChangesViewLocationChangesQuery {

  private case class ViewResultRowDoc(locationChange: LocationChange)

  private case class ViewResultRow(doc: ViewResultRowDoc)

  private case class ViewResult(rows: Seq[ViewResultRow])

  def locationChanges(database: Database, parameters: ChangesParameters, stale: Boolean = true): Seq[LocationChange] = {

    val queryParameters = QueryParameters.from(parameters)

    val query = Query(ChangesDesign, ChangesView, classOf[ViewResult])
      .startKey(queryParameters("startkey"))
      .endKey(queryParameters("endkey"))
      .skip(queryParameters("skip").toInt)
      .limit(queryParameters("limit").toInt)
      .includeDocs(true)
      .descending(true)
      .reduce(false)
      .stale(stale)

    val result = database.execute(query)
    result.rows.map(_.doc.locationChange)
  }

}
