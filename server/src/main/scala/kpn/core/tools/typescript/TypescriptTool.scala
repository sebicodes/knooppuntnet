package kpn.core.tools.typescript

import kpn.api.common.BoundsI

import java.io.File
import java.io.PrintStream
import kpn.api.common.data.raw.RawNode
import kpn.api.common.longdistance.LongDistanceRoute
import kpn.api.common.longdistance.LongDistanceRouteChange
import kpn.api.common.longdistance.LongDistanceRouteChangePage
import kpn.api.common.longdistance.LongDistanceRouteChangeSummary
import kpn.api.common.longdistance.LongDistanceRouteChangesPage
import kpn.api.common.longdistance.LongDistanceRouteDetail
import kpn.api.common.longdistance.LongDistanceRouteDetailsPage
import kpn.api.common.longdistance.LongDistanceRouteMapPage
import kpn.api.common.longdistance.LongDistanceRouteNokSegment
import kpn.api.common.longdistance.LongDistanceRouteSegment
import kpn.api.common.longdistance.LongDistanceRoutesPage
import kpn.api.common.status.ActionTimestamp
import org.apache.commons.io.FileUtils

import scala.jdk.CollectionConverters._
import scala.reflect.runtime.universe._

object TypescriptTool {
  def main(args: Array[String]): Unit = {
    new TypescriptTool().generate()
  }
}

class TypescriptTool() {

  val root = "/home/marcv/wrk/projects1/knooppuntnet/server/src/main/scala/kpn/api/common"

  val targetDir = "/home/marcv/wrk/projects1/knooppuntnet/client/src/app"

  val ignoredClasses: Seq[String] = Seq(
  )

  val newClasses = Seq(
    classOf[LongDistanceRoute], // no used in API ?
    classOf[LongDistanceRoutesPage],
    classOf[LongDistanceRouteDetail],
    classOf[LongDistanceRouteChangesPage],
    classOf[LongDistanceRouteDetail],
    classOf[LongDistanceRouteDetailsPage],
    classOf[LongDistanceRouteMapPage],
    classOf[LongDistanceRouteNokSegment],
    classOf[LongDistanceRouteSegment],
    classOf[LongDistanceRouteChangePage],
    classOf[LongDistanceRouteChange],
    classOf[LongDistanceRouteChangeSummary],
    classOf[BoundsI],
  )

  def generate(): Unit = {

    val mirror = runtimeMirror(classOf[RawNode].getClassLoader)
    val scalaTypes: Seq[Type] = scalaClassNames().map(className => mirror.staticClass(className).typeSignature)
    val caseClasses: Seq[Type] = scalaTypes.filter(isCaseClass)

    val newClassNames = newClasses.map(_.getSimpleName)

    caseClasses.foreach { caseClass =>
      val className = caseClass.typeSymbol.name.toString
      if (newClassNames.contains(className)) {
        println("Generate typescript interface instead of typescript class " + className)
      }
      else {
        val classInfo = new ClassAnalyzer().analyze(caseClass)
        val file = new File(targetDir + "/" + classInfo.fileName)
        file.getParentFile.mkdirs()
        val out = new PrintStream(file)
        new TypescriptWriter(out, classInfo).write()
        out.close()
      }
    }

    println("end")
  }

  private def scalaClassNames(): Seq[String] = {
    val files = FileUtils.listFiles(new File(root), Array("scala"), true).asScala.toSeq
    files.flatMap { file =>
      if (ignoredClasses.exists(n => file.getName.endsWith(n + ".scala"))) {
        None
      }
      else {
        val className = file.getAbsolutePath.drop(root.length - "kpn/api/common".length).dropRight(".scala".length).replace('/', '.')
        Some(className)
      }
    }
  }

  private def isCaseClass(scalaType: Type): Boolean = {
    scalaType.typeSymbol.toString.contains("NetworkNameMissing") ||
      scalaType.members.collect({ case m: MethodSymbol if m.isCaseAccessor => m }).nonEmpty
  }

}
