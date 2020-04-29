package kpn.server.repository

import kpn.api.common.network.NetworkAttributes
import kpn.api.common.network.NetworkElements
import kpn.api.common.network.NetworkInfo
import kpn.api.custom.Subset
import kpn.core.database.Database
import kpn.core.database.doc.GpxDoc
import kpn.core.database.doc.NetworkDoc
import kpn.core.database.doc.NetworkElementsDoc
import kpn.core.database.views.analyzer.DocumentView
import kpn.core.database.views.analyzer.NetworkView
import kpn.core.db._
import kpn.core.gpx.GpxFile
import kpn.core.util.Log
import org.springframework.stereotype.Component

@Component
class NetworkRepositoryImpl(analysisDatabase: Database) extends NetworkRepository {

  private val log = Log(classOf[NetworkRepository])

  override def allNetworkIds(): Seq[Long] = {
    DocumentView.allNetworkIds(analysisDatabase)
  }

  override def network(networkId: Long): Option[NetworkInfo] = {
    analysisDatabase.docWithId(networkKey(networkId), classOf[NetworkDoc]).map(_.network)
  }

  override def elements(networkId: Long): Option[NetworkElements] = {
    analysisDatabase.docWithId(networkElementsKey(networkId), classOf[NetworkElementsDoc]).map(_.networkElements)
  }

  override def saveElements(networkElements: NetworkElements): Boolean = {

    val key = networkElementsKey(networkElements.networkId)

    analysisDatabase.docWithId(key, classOf[NetworkElementsDoc]) match {
      case Some(doc) =>
        if (networkElements == doc.networkElements) {
          log.info(s"""Network elements "${networkElements.networkId}" not saved (no change)""")
          false
        }
        else {
          log.infoElapsed(s"""Network elements "${networkElements.networkId}" update""") {
            analysisDatabase.save(NetworkElementsDoc(key, networkElements, doc._rev))
            true
          }
        }

      case None =>
        log.infoElapsed(s"""Network elements "${networkElements.networkId}" saved""") {
          analysisDatabase.save(NetworkElementsDoc(key, networkElements))
          true
        }
    }
  }

  override def save(network: NetworkInfo): Boolean = {

    val key = networkKey(network.id)

    analysisDatabase.docWithId(key, classOf[NetworkDoc]) match {
      case Some(doc) =>
        if (network == doc.network) {
          log.info(s"""Network "${network.id}" not saved (no change)""")
          false
        }
        else {
          log.infoElapsed(s"""Network "${network.id}" update""") {
            analysisDatabase.save(NetworkDoc(key, network, doc._rev))
            true
          }
        }

      case None =>
        log.infoElapsed(s"""Network "${network.id}" saved""") {
          analysisDatabase.save(NetworkDoc(key, network))
          true
        }
    }
  }

  override def delete(networkId: Long): Unit = {
    analysisDatabase.deleteDocWithId(networkKey(networkId))
    analysisDatabase.deleteDocWithId(networkElementsKey(networkId))
  }

  private def networkKey(networkId: Long): String = s"${KeyPrefix.Network}:$networkId"

  private def networkElementsKey(networkId: Long): String = s"${KeyPrefix.NetworkElements}:$networkId"

  override def gpx(networkId: Long): Option[GpxFile] = {
    analysisDatabase.docWithId(gpxKey(networkId), classOf[GpxDoc]).map(_.file)
  }

  override def saveGpxFile(gpxFile: GpxFile): Boolean = {
    val key = gpxKey(gpxFile.networkId)

    def doSave(): Unit = {
      log.info(s"""Save gpx file "${gpxFile.networkId}"""")
      analysisDatabase.save(GpxDoc(key, gpxFile))
    }

    analysisDatabase.docWithId(key, classOf[GpxDoc]) match {
      case Some(doc) =>
        if (gpxFile == doc.file) {
          log.info(s"""Network "${gpxFile.networkId}" gpx not saved (no change)""")
          false
        }
        else {
          log.infoElapsed(s"""Network "${gpxFile.networkId}" gpx update""") {
            analysisDatabase.deleteDocWithId(key)
            doSave()
            true
          }
        }

      case None =>
        log.infoElapsed(s"""Network "${gpxFile.networkId}" gpx saved""") {
          doSave()
          true
        }
    }
  }

  private def gpxKey(networkId: Long): String = s"${KeyPrefix.NetworkGpx}:$networkId"

  override def networks(subset: Subset, stale: Boolean): Seq[NetworkAttributes] = {
    NetworkView.query(analysisDatabase, subset, stale)
  }

}
