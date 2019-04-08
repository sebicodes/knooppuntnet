import {PlannerContext} from "../context/planner-context";
import {Plan} from "../plan/plan";
import {PlannerCommand} from "./planner-command";

export class PlannerCommandAddLeg implements PlannerCommand {

  constructor(private legId: string) {
  }

  public do(context: PlannerContext) {
    const leg = context.legs.getById(this.legId);
    context.routeLayer.addViaNodeFlag(leg.legId, leg.sink.nodeId, leg.sink.coordinate);
    context.routeLayer.addRouteLeg(leg);
    const newLegs = context.plan().legs.push(leg);
    const newPlan = new Plan(context.plan().source, newLegs);
    context.updatePlan(newPlan);
  }

  public undo(context: PlannerContext) {
    const leg = context.legs.getById(this.legId);
    const plan = context.plan();
    const newLegs = plan.legs.slice(0, -1);
    const newPlan = new Plan(plan.source, newLegs);
    context.updatePlan(newPlan);
    context.routeLayer.removeRouteLeg(this.legId);
    context.routeLayer.removeViaNodeFlag(this.legId, leg.sink.nodeId);
  }

}
