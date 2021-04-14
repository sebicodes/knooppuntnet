package kpn.core.util

import scala.jdk.CollectionConverters._

class IdCacheTest extends UnitTest {

  test("LinkedHashMap stores values in access order, and automatically removes oldest entries") {

    val map = new java.util.LinkedHashMap[Long, Unit](100, 0.7f, true) {
      override def removeEldestEntry(e: java.util.Map.Entry[Long, Unit]): Boolean = {
        this.size > 3
      }
    }

    map.put(1, ())
    map.put(2, ())
    map.put(3, ())
    map.put(4, ())

    map.keySet().asScala should equal(Set(2, 3, 4))

    map.put(5, ())
    map.keySet().asScala should equal(Set(3, 4, 5))

    map.get(3L)

    map.put(6, ())
    map.keySet().asScala should equal(Set(3, 5, 6))
  }

  test("caching Long's") {

    val cache = new IdCache(3)

    assert(!cache.contains(1L))

    cache.put(1L)
    assert(cache.contains(1L))

    cache.put(2L)
    cache.put(3L)
    cache.put(4L)

    // 1 was the oldest entry, and has been removed from the cache
    assert(!cache.contains(1L))

    // by accessing 2, 2 is not the oldest entry anymore now, 3 is becoming the oldest entry
    assert(cache.contains(2L))

    cache.put(5L)

    // oldest entry 3 has been removed
    assert(!cache.contains(3L))

    assert(cache.contains(2L))
    assert(cache.contains(4L))
    assert(cache.contains(5L))
  }
}
