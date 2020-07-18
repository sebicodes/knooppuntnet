import {List} from "immutable";
import {TestSupport} from "../../../util/test-support";
import {PlannerTestSetup} from "../context/planner-test-setup";
import {Plan} from "../plan/plan";
import {PlanFlag} from "../plan/plan-flag";
import {PlanUtil} from "../plan/plan-util";
import {PlannerCommandAddPlan} from "./planner-command-add-plan";
import {PlannerCommandMoveEndPoint} from "./planner-command-move-end-point";

describe("PlannerCommandMoveEndPoint", () => {

  it("move end point - do, undo and redo", () => {

    const setup = new PlannerTestSetup();

    const startFlag = PlanFlag.start("startFlag", [1, 1]);
    const oldSinkFlag = PlanFlag.end("oldSinkFlag", [2, 2]);
    const newSinkFlag = PlanFlag.end("newSinkFlag", [3, 3]);

    const oldLeg = PlanUtil.singleRoutePlanLeg("12", setup.node1, setup.node2, oldSinkFlag, null);
    const newLeg = PlanUtil.singleRoutePlanLeg("13", setup.node1, setup.node3, newSinkFlag, null);

    setup.legs.add(oldLeg);
    setup.legs.add(newLeg);

    const plan = new Plan(setup.node1, startFlag, List([oldLeg]));
    setup.context.execute(new PlannerCommandAddPlan(plan));

    const command = new PlannerCommandMoveEndPoint("12", "13");
    setup.context.execute(command);

    setup.markerLayer.expectFlagCount(2);
    setup.markerLayer.expectStartFlagExists("startFlag", [1, 1]);
    setup.markerLayer.expectEndFlagExists("newSinkFlag", [3, 3]);
    setup.routeLayer.expectRouteLegCount(1);
    setup.routeLayer.expectRouteLegExists("13", newLeg);

    expect(setup.context.plan.sourceNode.nodeId).toEqual("1001");
    expect(setup.context.plan.legs.size).toEqual(1);
    expect(setup.context.plan.legs.get(0).featureId).toEqual("13");
    TestSupport.expectEndFlag(setup.context.plan.legs.get(0).sinkFlag, "newSinkFlag", [3, 3]);

    command.undo(setup.context);

    setup.markerLayer.expectFlagCount(2);
    setup.markerLayer.expectStartFlagExists("startFlag", [1, 1]);
    setup.markerLayer.expectEndFlagExists("oldSinkFlag", [2, 2]);
    setup.routeLayer.expectRouteLegCount(1);
    setup.routeLayer.expectRouteLegExists("12", oldLeg);

    expect(setup.context.plan.sourceNode.nodeId).toEqual("1001");
    expect(setup.context.plan.legs.size).toEqual(1);
    expect(setup.context.plan.legs.get(0).featureId).toEqual("12");
    TestSupport.expectEndFlag(setup.context.plan.legs.get(0).sinkFlag, "oldSinkFlag", [2, 2]);

    command.do(setup.context);

    setup.markerLayer.expectFlagCount(2);
    setup.markerLayer.expectStartFlagExists("startFlag", [1, 1]);
    setup.markerLayer.expectEndFlagExists("newSinkFlag", [3, 3]);
    setup.routeLayer.expectRouteLegCount(1);
    setup.routeLayer.expectRouteLegExists("13", newLeg);

    expect(setup.context.plan.sourceNode.nodeId).toEqual("1001");
    expect(setup.context.plan.legs.size).toEqual(1);
    expect(setup.context.plan.legs.get(0).featureId).toEqual("13");
    TestSupport.expectEndFlag(setup.context.plan.legs.get(0).sinkFlag, "newSinkFlag", [3, 3]);

  });

  it("move end point to via-route - do, undo and redo", () => {

    const setup = new PlannerTestSetup();

    const startFlag = PlanFlag.start("startFlag", [1, 1]);
    const oldSinkFlag = PlanFlag.end("oldSinkFlag", [2, 2]);
    const newSinkFlag = PlanFlag.end("newSinkFlag", [3, 3]);
    const newViaFlag = PlanFlag.via("newViaFlag", [3.5, 3.5]);

    const oldLeg = PlanUtil.singleRoutePlanLeg("12", setup.node1, setup.node2, oldSinkFlag, null);
    const newLeg = PlanUtil.singleRoutePlanLeg("13", setup.node1, setup.node3, newSinkFlag, newViaFlag);

    setup.legs.add(oldLeg);
    setup.legs.add(newLeg);

    const plan = new Plan(setup.node1, startFlag, List([oldLeg]));
    setup.context.execute(new PlannerCommandAddPlan(plan));

    const command = new PlannerCommandMoveEndPoint("12", "13");
    setup.context.execute(command);

    setup.markerLayer.expectFlagCount(3);
    setup.markerLayer.expectStartFlagExists("startFlag", [1, 1]);
    setup.markerLayer.expectViaFlagExists("newViaFlag", [3.5, 3.5]);
    setup.markerLayer.expectEndFlagExists("newSinkFlag", [3, 3]);
    setup.routeLayer.expectRouteLegCount(1);
    setup.routeLayer.expectRouteLegExists("13", newLeg);

    expect(setup.context.plan.sourceNode.nodeId).toEqual("1001");
    expect(setup.context.plan.legs.size).toEqual(1);
    expect(setup.context.plan.legs.get(0).featureId).toEqual("13");
    TestSupport.expectEndFlag(setup.context.plan.legs.get(0).sinkFlag, "newSinkFlag", [3, 3]);

    command.undo(setup.context);

    setup.markerLayer.expectFlagCount(2);
    setup.markerLayer.expectStartFlagExists("startFlag", [1, 1]);
    setup.markerLayer.expectEndFlagExists("oldSinkFlag", [2, 2]);
    setup.routeLayer.expectRouteLegCount(1);
    setup.routeLayer.expectRouteLegExists("12", oldLeg);

    expect(setup.context.plan.sourceNode.nodeId).toEqual("1001");
    expect(setup.context.plan.legs.size).toEqual(1);
    expect(setup.context.plan.legs.get(0).featureId).toEqual("12");
    TestSupport.expectEndFlag(setup.context.plan.legs.get(0).sinkFlag, "oldSinkFlag", [2, 2]);

    command.do(setup.context);

    setup.markerLayer.expectFlagCount(3);
    setup.markerLayer.expectStartFlagExists("startFlag", [1, 1]);
    setup.markerLayer.expectViaFlagExists("newViaFlag", [3.5, 3.5]);
    setup.markerLayer.expectEndFlagExists("newSinkFlag", [3, 3]);
    setup.routeLayer.expectRouteLegCount(1);
    setup.routeLayer.expectRouteLegExists("13", newLeg);

    expect(setup.context.plan.sourceNode.nodeId).toEqual("1001");
    expect(setup.context.plan.legs.size).toEqual(1);
    expect(setup.context.plan.legs.get(0).featureId).toEqual("13");
    TestSupport.expectEndFlag(setup.context.plan.legs.get(0).sinkFlag, "newSinkFlag", [3, 3]);

  });

});
