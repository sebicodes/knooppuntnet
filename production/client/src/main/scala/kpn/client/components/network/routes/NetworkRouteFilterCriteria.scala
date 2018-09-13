package kpn.client.components.network.routes

import kpn.client.filter.TimeFilterKind

case class NetworkRouteFilterCriteria(
  page: Int = 1,
  investigate: Option[Boolean] = None,
  unaccessible: Option[Boolean] = None,
  role: Seq[String] = Seq(),
  lastUpdated: TimeFilterKind.Value = TimeFilterKind.ALL
)