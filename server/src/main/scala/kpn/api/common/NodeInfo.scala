package kpn.api.common

import kpn.api.common.common.ToStringBuilder
import kpn.api.common.data.Tagable
import kpn.api.common.location.Location
import kpn.api.custom.Country
import kpn.api.custom.Day
import kpn.api.custom.Fact
import kpn.api.custom.NetworkType
import kpn.api.custom.Subset
import kpn.api.custom.Tags
import kpn.api.custom.Timestamp

case class NodeInfo(
  id: Long,
  active: Boolean,
  orphan: Boolean,
  country: Option[Country],
  name: String,
  names: Seq[NodeName],
  latitude: String,
  longitude: String,
  lastUpdated: Timestamp,
  lastSurvey: Option[Day],
  tags: Tags,
  facts: Seq[Fact],
  location: Option[Location],
  tiles: Seq[String]
) extends Tagable with LatLon {

  def name(networkType: NetworkType): String = {
    names.filter(_.scopedNetworkType.networkType == networkType).map(_.name).mkString(" / ")
  }

  def subsets: Seq[Subset] = {
    country match {
      case Some(c) => names.map(_.scopedNetworkType.networkType).map(networkType => Subset(c, networkType))
      case None => Seq()
    }
  }

  def locations: Seq[String] = {
    location match {
      case Some(location) => location.names
      case None => Seq.empty
    }
  }

  override def toString: String = ToStringBuilder(this.getClass.getSimpleName).
    field("id", id).
    field("active", active).
    field("orphan", orphan).
    field("country", country).
    field("name", name).
    field("names", names).
    field("latitude", latitude).
    field("longitude", longitude).
    field("lastUpdated", lastUpdated).
    field("tags", tags).
    field("facts", facts).
    field("tiles", tiles).
    build
}
