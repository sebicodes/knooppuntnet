import {List} from "immutable";
import {Util} from "../../../components/shared/util";
import {LatLonImpl} from "../../../kpn/api/common/lat-lon-impl";
import {LegEnd} from "../../../kpn/api/common/planner/leg-end";
import {RouteLeg} from "../../../kpn/api/common/planner/route-leg";
import {RouteLegFragment} from "../../../kpn/api/common/planner/route-leg-fragment";
import {RouteLegNode} from "../../../kpn/api/common/planner/route-leg-node";
import {RouteLegRoute} from "../../../kpn/api/common/planner/route-leg-route";
import {RouteLegSegment} from "../../../kpn/api/common/planner/route-leg-segment";
import {PlanFragment} from "../../../kpn/api/common/planner/plan-fragment";
import {PlanLeg} from "../../../kpn/api/common/planner/plan-leg";
import {PlanNode} from "../../../kpn/api/common/planner/plan-node";
import {PlanRoute} from "../../../kpn/api/common/planner/plan-route";
import {PlanSegment} from "../../../kpn/api/common/planner/plan-segment";
import {PlanUtil} from "./plan-util";

export class PlanLegBuilder {

  static toPlanLeg(source: LegEnd, sink: LegEnd, sourceNode: PlanNode, sinkNode: PlanNode, routeLeg: RouteLeg): PlanLeg {
    const routes = routeLeg.routes.map(routeLegRoute => this.toPlanRoute(routeLegRoute));
    const meters = routes.map(f => f.meters).reduce((sum, current) => sum + current, 0);
    const legKey = PlanUtil.key(source, sink);
    return new PlanLeg(routeLeg.legId, legKey, source, sink, sourceNode, sinkNode, meters, routes);
  }

  static toPlanLeg2(routeLeg: RouteLeg): PlanLeg {
    const routes = routeLeg.routes.map(routeLegRoute => this.toPlanRoute(routeLegRoute));
    const sourceNode = routes.get(0).sourceNode;
    const lastRoute: PlanRoute = routes.last();
    const sinkNode = lastRoute.sinkNode;
    const meters = routes.map(f => f.meters).reduce((sum, current) => sum + current, 0);

    // TODO PLAN further work out this temporary code
    const source = PlanUtil.legEndNode(+sourceNode.nodeId);
    const sink =  PlanUtil.legEndNode(+sinkNode.nodeId);

    const legKey = PlanUtil.key(source, sink);
    return new PlanLeg(routeLeg.legId, legKey, source, sink, sourceNode, sinkNode, meters, routes);
  }

  private static toPlanRoute(route: RouteLegRoute): PlanRoute {
    const source = this.toPlanNode(route.source);
    const sink = this.toPlanNode(route.sink);
    const segments: List<PlanSegment> = route.segments.map(s => this.toPlanSegment(s));
    return new PlanRoute(source, sink, route.meters, segments, route.streets);
  }

  private static toPlanSegment(segment: RouteLegSegment): PlanSegment {
    const fragments = segment.fragments.map(f => this.toPlanFragment(f));
    return new PlanSegment(segment.meters, segment.surface, segment.colour, fragments);
  }

  private static toPlanFragment(fragment: RouteLegFragment): PlanFragment {
    const latLon = new LatLonImpl(fragment.lat, fragment.lon);
    const coordinate = Util.latLonToCoordinate(latLon);
    return new PlanFragment(
      fragment.meters,
      fragment.orientation,
      fragment.streetIndex,
      coordinate,
      latLon
    );
  }

  private static toPlanNode(routeLegNode: RouteLegNode): PlanNode {
    const nodeId: string = routeLegNode.nodeId;
    const nodeName: string = routeLegNode.nodeName;
    const latLon = new LatLonImpl(routeLegNode.lat, routeLegNode.lon);
    return PlanUtil.planNode(nodeId, nodeName, latLon);
  }

}
