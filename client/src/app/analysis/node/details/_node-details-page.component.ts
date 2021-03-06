import {ChangeDetectionStrategy} from "@angular/core";
import {OnInit} from "@angular/core";
import {Component} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {List} from "immutable";
import {Subject} from "rxjs";
import {Observable} from "rxjs";
import {flatMap, map, tap} from "rxjs/operators";
import {AppService} from "../../../app.service";
import {PageService} from "../../../components/shared/page.service";
import {InterpretedTags} from "../../../components/shared/tags/interpreted-tags";
import {Ref} from "../../../kpn/api/common/common/ref";
import {NodeInfo} from "../../../kpn/api/common/node-info";
import {NodeDetailsPage} from "../../../kpn/api/common/node/node-details-page";
import {NodeReferences} from "../../../kpn/api/common/node/node-references";
import {ApiResponse} from "../../../kpn/api/custom/api-response";
import {FactInfo} from "../../fact/fact-info";

@Component({
  selector: "kpn-node-details-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="breadcrumb">
      <li><a routerLink="/" i18n="@@breadcrumb.home">Home</a></li>
      <li><a routerLink="/analysis" i18n="@@breadcrumb.analysis">Analysis</a></li>
      <li i18n="@@breadcrumb.node">Node</li>
    </ul>

    <kpn-node-page-header
      pageName="details"
      [nodeId]="nodeId$ | async"
      [nodeName]="nodeName$ | async"
      [changeCount]="changeCount$ | async">
    </kpn-node-page-header>

    <div *ngIf="response$ | async as response" class="kpn-spacer-above">
      <div *ngIf="!response.result" i18n="@@node.node-not-found">
        Node not found
      </div>
      <div *ngIf="response.result">

        <kpn-data title="Summary" i18n-title="@@node.summary">
          <kpn-node-summary [nodeInfo]="nodeInfo"></kpn-node-summary>
        </kpn-data>

        <kpn-data title="Situation on" i18n-title="@@node.situation-on">
          <kpn-timestamp [timestamp]="response.situationOn"></kpn-timestamp>
        </kpn-data>

        <kpn-data title="Last updated" i18n-title="@@node.last-updated">
          <kpn-timestamp [timestamp]="nodeInfo.lastUpdated"></kpn-timestamp>
        </kpn-data>

        <kpn-data title="Tags" i18n-title="@@node.tags">
          <kpn-tags-table [tags]="tags"></kpn-tags-table>
        </kpn-data>

        <kpn-data title="Location" i18n-title="@@node.location">
          <kpn-node-location [location]="nodeInfo.location"></kpn-node-location>
        </kpn-data>

        <kpn-data title="Networks" i18n-title="@@node.networks">
          <kpn-node-network-references [nodeInfo]="nodeInfo" [references]="references.networkReferences"></kpn-node-network-references>
        </kpn-data>

        <kpn-data title="Orphan routes" i18n-title="@@node.orphan-routes">
          <kpn-node-orphan-route-references [references]="references.routeReferences"></kpn-node-orphan-route-references>
        </kpn-data>

        <kpn-data title="Facts" i18n-title="@@node.facts">
          <kpn-facts [factInfos]="factInfos"></kpn-facts>
        </kpn-data>

      </div>
    </div>
  `
})
export class NodeDetailsPageComponent implements OnInit {

  response$: Observable<ApiResponse<NodeDetailsPage>>;

  nodeId$ = new Subject<string>();
  nodeName$ = new Subject<string>();
  changeCount$ = new Subject<number>();

  tags: InterpretedTags;
  nodeInfo: NodeInfo;
  factInfos: List<FactInfo>;
  references: NodeReferences;

  constructor(private activatedRoute: ActivatedRoute,
              private appService: AppService,
              private pageService: PageService) {
  }

  ngOnInit(): void {
    this.nodeName$.next(history.state.nodeName);
    this.changeCount$.next(history.state.changeCount);
    this.pageService.showFooter = true;
    this.response$ = this.activatedRoute.params.pipe(
      map(params => params["nodeId"]),
      tap(nodeId => this.nodeId$.next(nodeId)),
      flatMap(nodeId => this.appService.nodeDetails(nodeId).pipe(
        tap(response => {
          this.nodeName$.next(response.result.nodeInfo.name);
          this.changeCount$.next(response.result.changeCount);
          this.tags = InterpretedTags.nodeTags(response.result.nodeInfo.tags);
          this.factInfos = this.buildFactInfos(response.result);
          this.nodeInfo = response.result.nodeInfo;
          this.references = response.result.references;
        })
      ))
    );
  }

  private buildFactInfos(page: NodeDetailsPage): List<FactInfo> {
    const nodeFacts = page.nodeInfo.facts.map(fact => new FactInfo(fact));
    const extraFacts = page.references.networkReferences.flatMap(networkReference => {
      return networkReference.facts.map(fact => {
        const networkRef = new Ref(networkReference.networkId, networkReference.networkName);
        return new FactInfo(fact, networkRef, null, null);
      });
    });
    return nodeFacts.concat(extraFacts);
  }

}
