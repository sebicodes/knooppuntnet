import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {PlanNode} from "../../../../kpn/api/common/planner/plan-node";
import {PlannerCommandMoveViaRoute} from "../../commands/planner-command-move-via-route";
import {PlannerContext} from "../../context/planner-context";
import {FeatureId} from "../../features/feature-id";
import {PlanFlag} from "../../plan/plan-flag";
import {PlanFlagType} from "../../plan/plan-flag-type";
import {PlanLeg} from "../../plan/plan-leg";
import {PlanUtil} from "../../plan/plan-util";

export class MoveRouteViaPointToNode {

  constructor(private readonly context: PlannerContext) {
  }

  move(viaNode: PlanNode, oldLeg: PlanLeg): void {

    const newLeg1$ = this.buildNewLeg1(oldLeg.sourceNode, viaNode);
    const newLeg2$ = this.buildNewLeg2(viaNode, oldLeg.sinkNode, oldLeg.sinkFlag);

    combineLatest([newLeg1$, newLeg2$]).pipe(
      map(([newLeg1, newLeg2]) => new PlannerCommandMoveViaRoute(oldLeg, newLeg1, newLeg2))
    ).subscribe(command => this.context.execute(command));
  }

  private buildNewLeg1(sourceNode: PlanNode, sinkNode: PlanNode): Observable<PlanLeg> {
    const source = PlanUtil.legEndNode(+sourceNode.nodeId);
    const sink = PlanUtil.legEndNode(+sinkNode.nodeId);
    const sinkFlag = new PlanFlag(PlanFlagType.Via, FeatureId.next(), sinkNode.coordinate);
    return this.context.fetchLeg(source, sink).pipe(
      map(data => PlanUtil.leg(data, sinkFlag, null))
    );
  }

  private buildNewLeg2(sourceNode: PlanNode, sinkNode: PlanNode, sinkFlag: PlanFlag): Observable<PlanLeg> {
    const source = PlanUtil.legEndNode(+sourceNode.nodeId);
    const sink = PlanUtil.legEndNode(+sinkNode.nodeId);
    return this.context.fetchLeg(source, sink).pipe(
      map(data => PlanUtil.leg(data, sinkFlag, null))
    );
  }

}
