import Coordinate from 'ol/View';
import {PlannerContext} from "./planner-context";
import {BehaviorSubject, Observable} from "rxjs";
import {PlannerMode} from "./planner-mode";
import {PlannerRouteLayer} from "./planner-route-layer";
import {PlannerCrosshairLayer} from "./planner-crosshair-layer";
import {List} from "immutable";
import {Plan} from "./plan/plan";
import {PlanLegCache} from "./plan/plan-leg-cache";
import {PlannerCommandStack} from "./commands/planner-command-stack";
import {PlanLegFragment} from "./plan/plan-leg-fragment";
import {PlanLeg} from "./plan/plan-leg";
import {PlannerElasticBandLayer} from "./planner-elastic-band-layer";
import Feature from 'ol/Feature';
import {PlannerCommand} from "./commands/planner-command";

export class PlannerContextImpl implements PlannerContext {

  private _mode = new BehaviorSubject<PlannerMode>(PlannerMode.Idle);
  private _plan = new BehaviorSubject<Plan>(Plan.empty());
  public readonly legCache: PlanLegCache = new PlanLegCache();

  viewPort: HTMLElement;

  constructor(private commandStack: PlannerCommandStack,
              private routeLayer: PlannerRouteLayer,
              private crosshairLayer: PlannerCrosshairLayer,
              private elasticBandLayer: PlannerElasticBandLayer) {
  }

  execute(command: PlannerCommand): void {
    this.commandStack.push(command);
    command.do(this);
  }

  canUndo(): boolean {
    return this.commandStack.canUndo;
  }

  canRedo(): boolean {
    return this.commandStack.canRedo;
  }

  undo(): void {
    const command = this.commandStack.undo();
    command.undo(this);
  }

  redo(): void {
    const command = this.commandStack.redo();
    command.do(this);
  }

  setCrosshairVisible(visible: boolean): void {
    this.crosshairLayer.setVisible(visible);
  }

  setCrosshairPosition(coordinate: Coordinate): void {
    this.crosshairLayer.updatePosition(coordinate);
  }

  setCursorStyle(style: string): void {
    this.viewPort.style.cursor = style;
  }

  setElasticBand(anchor1: Coordinate, anchor2: Coordinate, coordinate: Coordinate): void {
    this.elasticBandLayer.set(anchor1, anchor2, coordinate);
  }

  setElasticBandInvisible(): void {
    this.elasticBandLayer.setInvisible();
  }

  setElasticBandPosition(coordinate: Coordinate): void {
    this.elasticBandLayer.updatePosition(coordinate);
  }

  addStartNodeFlag(nodeId: string, coordinate: Coordinate): Feature {
    return this.routeLayer.addStartNodeFlag(nodeId, coordinate);
  }

  addViaNodeFlag(legId: string, nodeId: string, coordinate: Coordinate): Feature {
    return this.routeLayer.addViaNodeFlag(legId, nodeId, coordinate);
  }

  removeStartNodeFlag(nodeId: string): void {
    this.routeLayer.removeStartNodeFlag(nodeId);
  }

  removeViaNodeFlag(legId: string, nodeId: string): void {
    this.routeLayer.removeViaNodeFlag(legId, nodeId);
  }

  addRouteLeg(legId: string, coordinates: List<Coordinate>): void {
    this.routeLayer.addRouteLeg(legId, coordinates);
  }

  removeRouteLeg(legId: string): void {
    this.routeLayer.removeRouteLeg(legId);
  }

  get mode(): Observable<PlannerMode> {
    return this._mode;
  }

  get planObserver(): Observable<Plan> {
    return this._plan;
  }

  get plan(): Plan {
    return this._plan.value;
  }

  updatePlan(plan: Plan) {
    this._plan.next(plan);
  }

  updatePlanLeg(legId: string, fragments: List<PlanLegFragment>) {
    const newLegs = this.plan.legs.map(leg => {
      if (leg.legId === legId) {
        return new PlanLeg(legId, leg.source, leg.sink, fragments);
      }
      return leg;
    });
    const newPlan = new Plan(this.plan.source, newLegs);
    this.updatePlan(newPlan);

    const coordinates = fragments.flatMap(f => f.coordinates); // TODO this duplicates code from PlannerCommandAddLeg.do() - can share?
    this.routeLayer.addRouteLeg(legId, coordinates);
  }

}
