import Coordinate from 'ol/View';
import {PlannerEngine} from "./planner-engine";
import {PlannerContext} from "./planner-context";
import {AppService} from "../../../app.service";
import {List} from "immutable";
import {fromLonLat} from 'ol/proj';
import {PlannerDragNodeAnalyzer} from "./planner-drag-node-analyzer";
import {PlannerDragNode} from "./planner-drag-node";
import {PlannerDragLeg} from "./planner-drag-leg";
import {PlanNode} from "./plan/plan-node";
import {PlannerCommandAddStartPoint} from "./commands/planner-command-add-start-point";
import {PlannerCommandAddLeg} from "./commands/planner-command-add-leg";
import {PlanLegFragment} from "./plan/plan-leg-fragment";
import {PlanLeg} from "./plan/plan-leg";
import {PlannerCommandSplitLeg} from "./commands/planner-command-split-leg";
import {PlannerMapFeature} from "./features/planner-map-feature";
import {PlannerMapFeatureLegNode} from "./features/planner-map-feature-leg-node";
import {PlannerMapFeatureNetworkNode} from "./features/planner-map-feature-network-node";
import {PlannerMapFeatureLeg} from "./features/planner-map-feature-leg";

export class PlannerEngineImpl implements PlannerEngine {

  private legIdGenerator = 0;

  private legDrag: PlannerDragLeg = null;
  private nodeDrag: PlannerDragNode = null;

  constructor(private context: PlannerContext,
              private appService: AppService) {
  }

  handleDownEvent(features: List<PlannerMapFeature>, coordinate: Coordinate): boolean {

    if (features.isEmpty()) {
      this.context.setCrosshairPosition(coordinate);
      return false;
    }

    const legNode = this.findDraggableLegNode(features);
    if (legNode != null) {
      if (this.legNodeDragStarted(legNode, coordinate)) {
        return true;
      }
    }

    const networkNode = this.findNetworkNode(features);
    if (networkNode != null) {
      this.nodeSelected(networkNode);
      this.context.setCrosshairPosition(networkNode.coordinate); // snap
      return true;
    }

    const leg = this.findLeg(features);
    if (leg != null) {
      if (this.legDragStarted(leg.legId, coordinate)) {
        return true;
      }
    }

    this.context.setCrosshairPosition(coordinate);
    return false;
  }

  handleMoveEvent(features: List<PlannerMapFeature>, coordinate: Coordinate): boolean {

    if (features.isEmpty()) {
      this.context.setCrosshairVisible(true);
      this.context.setCursorStyle("default");
      this.context.setCrosshairPosition(coordinate);
      return false;
    }

    const legNode = this.findDraggableLegNode(features);
    if (legNode != null) {
      this.context.setCrosshairVisible(false);
      this.context.setCursorStyle("move");
      return true;
    }

    const networkNode = this.findNetworkNode(features);
    if (networkNode != null) {
      this.context.setCursorStyle("default");
      this.context.setCrosshairPosition(networkNode.coordinate); // snap
      return true;
    }

    const leg = this.findLeg(features);
    if (leg != null) {
      this.context.setCrosshairVisible(false);
      this.context.setCursorStyle("move");
      return true;
    }

    this.context.setCrosshairVisible(true);
    this.context.setCursorStyle("default");
    this.context.setCrosshairPosition(coordinate);

    return true;
  }

  handleDragEvent(features: List<PlannerMapFeature>, coordinate: Coordinate): boolean {
    // get features --> snap to network node if above network node + highlight network node
    this.context.setElasticBandPosition(coordinate);
    return true;
  }

  handleUpEvent(features: List<PlannerMapFeature>, coordinate: Coordinate): boolean {

    if (this.isDraggingLeg() || this.isDraggingNode()) {
      this.context.setCursorStyle("default");

      const networkNode = this.findNetworkNode(features);
      if (networkNode != null) {

        if (this.isDraggingLeg()) {
          this.endDragLeg(networkNode.nodeId, networkNode.nodeName, networkNode.coordinate);
        } else if (this.isDraggingNode()) {
          this.endDragNode(networkNode.nodeId, networkNode.nodeName, networkNode.coordinate);
        }
        return true;
      }

      this.dragCancel();
    }

    this.context.setCrosshairVisible(true);
    return true;
  }

  handleMouseOut() {
    this.context.setCrosshairVisible(false);
  }

  handleMouseEnter() {
    this.context.setCrosshairVisible(true);
  }

  private nodeSelected(networkNode: PlannerMapFeatureNetworkNode): void {
    if (this.context.plan.source === null) {
      const node = new PlanNode(networkNode.nodeId, networkNode.nodeName, networkNode.coordinate);
      const command = new PlannerCommandAddStartPoint(node);
      this.context.execute(command);
    } else {
      const legId = "" + ++this.legIdGenerator;
      const source: PlanNode = this.context.plan.lastNode();
      const sink = new PlanNode(networkNode.nodeId, networkNode.nodeName, networkNode.coordinate);
      const command = new PlannerCommandAddLeg(legId, source, sink);
      this.context.execute(command);

      const cachedLeg = this.context.legCache.get(source.nodeId, sink.nodeId);
      if (cachedLeg == null) {
        this.appService.routeLeg("rwn", legId, source.nodeId, sink.nodeId).subscribe(response => {
          if (response.result) {
            const fragments = response.result.fragments.map(routeLegFragment => {
              const nodeId: string = routeLegFragment.sink.nodeId;
              const nodeName: string = routeLegFragment.sink.nodeName;

              const lon = parseFloat(routeLegFragment.sink.latLon.longitude);
              const lat = parseFloat(routeLegFragment.sink.latLon.latitude);

              const coordinate: Coordinate = fromLonLat([lon, lat]);

              const sink: PlanNode = new PlanNode(nodeId, nodeName, coordinate);
              const meters: number = routeLegFragment.meters;
              const coordinates: List<Coordinates> = routeLegFragment.latLons.map(f => {
                const lon = parseFloat(f.longitude);
                const lat = parseFloat(f.latitude);
                return fromLonLat([lon, lat]);
              });

              return new PlanLegFragment(sink, meters, coordinates);
            });

            this.context.updatePlanLeg(legId, fragments);
            const leg = new PlanLeg(legId, source, sink, fragments);
            this.context.legCache.add(leg);
            const coordinates = fragments.flatMap(f => f.coordinates);
            this.context.addRouteLeg(legId, coordinates);
          } else {
            // TODO handle leg not found
          }
        });
      }
    }
  }

  private legDragStarted(legId: string, coordinate: Coordinate): boolean {
    const leg = this.context.legCache.getById(legId);
    if (leg) {
      const anchor1 = leg.source.coordinate;
      const anchor2 = leg.sink.coordinate;
      this.legDrag = new PlannerDragLeg(legId, anchor1, anchor2);
      this.context.setElasticBand(anchor1, anchor2, coordinate);
      return true;
    }
    return false;
  }

  private legNodeDragStarted(legNode: PlannerMapFeatureLegNode, coordinate: Coordinate): boolean {
    this.nodeDrag = new PlannerDragNodeAnalyzer(this.context.plan).dragStarted(legNode.id, legNode.nodeId);
    if (this.nodeDrag !== null) {
      this.context.setElasticBand(this.nodeDrag.anchor1, this.nodeDrag.anchor2, coordinate);
      return true;
    }
    return false;
  }

  private isDraggingLeg(): boolean {
    return this.legDrag !== null;
  }

  private isDraggingNode(): boolean {
    return this.nodeDrag !== null;
  }

  private endDragLeg(nodeId: string, nodeName: string, coordinate: Coordinate): void {
    if (this.legDrag !== null) {
      const oldLeg = this.context.legCache.getById(this.legDrag.oldLegId);
      if (oldLeg) {
        const connection = new PlanNode(nodeId, nodeName, coordinate);
        const newLeg1 = this.buildLeg(this.newLegId(), oldLeg.source, connection);
        const newLeg2 = this.buildLeg(this.newLegId(), connection, oldLeg.sink);
        const command = new PlannerCommandSplitLeg(oldLeg, newLeg1, newLeg2);
        this.context.execute(command);
      }
      this.legDrag = null;
    }
  }

  private endDragNode(nodeId: string, nodeName: string, coordinate: Coordinate): void {
    this.nodeDrag = null;
  }

  private dragCancel(): void {
    if (this.legDrag !== null) {
      this.context.setElasticBandInvisible();
      this.legDrag = null;
    }

    if (this.nodeDrag !== null) {
      this.context.setElasticBandInvisible();
      this.nodeDrag = null;
    }
  }

  private buildLeg(legId: string, source: PlanNode, sink: PlanNode): PlanLeg {

    const cachedLeg = this.context.legCache.get(source.nodeId, sink.nodeId);
    if (cachedLeg) {
      return new PlanLeg(legId, source, sink, cachedLeg.fragments);
    }

    this.appService.routeLeg("rwn", legId, source.nodeId, sink.nodeId).subscribe(response => {
      if (response.result) {
        const fragments = response.result.fragments.map(routeLegFragment => {
          const nodeId: string = routeLegFragment.sink.nodeId;
          const nodeName: string = routeLegFragment.sink.nodeName;
          const lon = parseFloat(routeLegFragment.sink.latLon.longitude);
          const lat = parseFloat(routeLegFragment.sink.latLon.latitude);
          const coordinate: Coordinate = fromLonLat([lon, lat]);
          const sink: PlanNode = new PlanNode(nodeId, nodeName, coordinate);
          const meters: number = routeLegFragment.meters;
          const coordinates: List<Coordinates> = routeLegFragment.latLons.map(f => {
            const lon = parseFloat(f.longitude);
            const lat = parseFloat(f.latitude);
            return fromLonLat([lon, lat]);
          });

          return new PlanLegFragment(sink, meters, coordinates);
        });

        console.log("DEBUG PlannerEngineImpl received leg " + legId);

        this.context.updatePlanLeg(legId, fragments);
        const leg = new PlanLeg(legId, source, sink, fragments);
        this.context.legCache.add(leg);
        const coordinates = fragments.flatMap(f => f.coordinates);
        this.context.addRouteLeg(legId, coordinates);
      } else {
        // TODO handle leg not found
      }
    });
    return new PlanLeg(legId, source, sink, List());
  }

  private newLegId(): string {
    return "" + ++this.legIdGenerator;
  }

  private findDraggableLegNode(features: List<PlannerMapFeature>): PlannerMapFeatureLegNode {

    if (this.context.plan.legs.isEmpty()) {
      return null;
    }

    const nodes = features.filter(f => f.isLegNode());

    if (nodes.isEmpty()) {
      return null;
    }
    return nodes.get(0) as PlannerMapFeatureLegNode; // TODO find the closest
  }

  private findNetworkNode(features: List<PlannerMapFeature>): PlannerMapFeatureNetworkNode {
    const nodes = features.filter(f => f.isNetworkNode());
    if (nodes.isEmpty()) {
      return null;
    }
    return nodes.get(0) as PlannerMapFeatureNetworkNode; // TODO find the closest
  }

  private findLeg(features: List<PlannerMapFeature>): PlannerMapFeatureLeg {
    const legs = features.filter(f => f.isLeg());
    if (legs.isEmpty()) {
      return null;
    }
    return legs.get(0) as PlannerMapFeatureLeg; // TODO find the closest
  }

}
