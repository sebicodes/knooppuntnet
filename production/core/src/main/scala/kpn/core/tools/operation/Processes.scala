package kpn.core.tools.operation

object Processes {

  def apply(lines: List[String]): Processes = {
    assertHeader(lines.head)
    Processes(
      processInfo(lines.tail, "main-dispatcher", "bin/dispatcher --osm-base --attic"),
      processInfo(lines.tail, "areas-dispatcher", "bin/dispatcher --areas"),
      processInfo(lines.tail, "replicator", "replicator-log4j2.xml"),
      processInfo(lines.tail, "updater", "updater-log4j2.xml"),
      processInfo(lines.tail, "analyzer", "analyzer-log4j2.xml"),
      processInfos(lines.tail, "query", "overpass/bin/osm3s_query")
    )
  }

  private def processInfo(lines: Seq[String], name: String, signature: String): ProcessInfo = {
    val status = lines.find(_.contains(signature)).map(processStatus)
    ProcessInfo(name, status)
  }

  private def processInfos(lines: Seq[String], name: String, signature: String): Seq[ProcessInfo] = {
    lines.filter(_.contains(signature)).map { line =>
      ProcessInfo(name, Some(processStatus(line)))
    }
  }

  private def processStatus(line: String): ProcessStatus = {
    val pl = ProcessLine(line)
    ProcessStatus(pl.pid, pl.start, pl.elapsed)
  }

  private def assertHeader(line: String): Unit = {
    if (line != "UID        PID  PPID  C STIME TTY          TIME CMD") {
      throw new IllegalArgumentException("unexpected output from ps -ef")
    }
  }
}

case class Processes(
  mainDispatcher: ProcessInfo,
  areasDispatcher: ProcessInfo,
  replicator: ProcessInfo,
  updater: ProcessInfo,
  analyzer: ProcessInfo,
  queries: Seq[ProcessInfo]
) {
  def all: Seq[ProcessInfo] = Seq(mainDispatcher, areasDispatcher, replicator, updater, analyzer) ++ queries
}