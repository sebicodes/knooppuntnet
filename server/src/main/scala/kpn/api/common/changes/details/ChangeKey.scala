package kpn.api.common.changes.details

import kpn.api.custom.Timestamp

case class ChangeKey(
  replicationNumber: Long,
  timestamp: Timestamp,
  changeSetId: Long,
  elementId: Long
) {
  def toI: ChangeKeyI = {
    ChangeKeyI(
      replicationNumber,
      timestamp.yyyymmddhhmmss,
      changeSetId,
      elementId
    )
  }
}
