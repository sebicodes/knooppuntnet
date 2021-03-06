import {List} from "immutable";
import {FlagFeature} from "../features/flag-feature";
import {LegFeature} from "../features/leg-feature";
import {MapFeature} from "../features/map-feature";
import {NetworkNodeFeature} from "../features/network-node-feature";
import {PoiFeature} from "../features/poi-feature";
import {RouteFeature} from "../features/route-feature";
import {FeatureLike} from "ol/Feature";
import Point from "ol/geom/Point";
import {Coordinate} from "ol/coordinate";

export class Features {

  static findFlag(features: List<MapFeature>): FlagFeature {
    return features.filter(f => f instanceof FlagFeature).map(f => f as FlagFeature).first(null);
  }

  static findNetworkNode(features: List<MapFeature>): NetworkNodeFeature {
    return features.filter(f => f instanceof NetworkNodeFeature).map(f => f as NetworkNodeFeature).first(null);
  }

  static findLeg(features: List<MapFeature>): LegFeature {
    return features.filter(f => f instanceof LegFeature).map(f => f as LegFeature).first(null);
  }

  static findPoi(features: List<MapFeature>): PoiFeature {
    return features.filter(f => f instanceof PoiFeature).map(f => f as PoiFeature).first(null);
  }

  static findRoute(features: List<MapFeature>): RouteFeature {
    return features.filter(f => f instanceof RouteFeature).map(f => f as RouteFeature).first(null);
  }

  static findRoutes(features: List<MapFeature>): List<RouteFeature> {
    return features.filter(f => f instanceof RouteFeature).map(f => f as RouteFeature);
  }

  static mapFeature(feature: FeatureLike): MapFeature {

    const layer = feature.get("layer");
    if (layer) {
      if ("leg" === layer) {
        const legId = feature.getId() as string;
        return new LegFeature(legId);
      }
      if ("flag" === layer) {
        const id = feature.getId() as string;
        const flagType = feature.get("flag-type");
        return new FlagFeature(flagType, id);
      }
      if (layer.endsWith("node")) {
        const nodeId = feature.get("id");
        const nodeName = feature.get("name");
        const point: Point = feature.getGeometry() as Point;
        const extent = point.getExtent();
        const coordinate: Coordinate = [extent[0], extent[1]];
        return NetworkNodeFeature.create(nodeId, nodeName, coordinate);
      }

      const layerType = feature.get("type");
      if ("node" === layerType || "way" === layerType || "relation" === layerType) {
        const poiId = feature.get("id");
        const point: Point = feature.getGeometry() as Point;
        const extent = point.getExtent();
        const coordinate: Coordinate = [extent[0], extent[1]];
        return new PoiFeature(poiId, layerType, layer, coordinate);
      }

      if (layer.endsWith("route")) {
        const segmentId = feature.get("id");
        const routeName = feature.get("name");
        const oneWay = feature.get("oneway") === "true";
        const dashIndex = segmentId.indexOf("-");
        const routeId = dashIndex === -1 ? segmentId : segmentId.substr(0, dashIndex);
        const pathId = dashIndex === -1 ? -1 : segmentId.substr(dashIndex + 1);
        return new RouteFeature(+routeId, +pathId, routeName, oneWay, feature);
      }
    }

    // we are not interested in the feature for planner purposes
    return null;
  }

}
