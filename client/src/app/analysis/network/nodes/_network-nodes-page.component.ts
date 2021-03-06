import {ChangeDetectionStrategy} from "@angular/core";
import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {shareReplay} from "rxjs/operators";
import {flatMap, map, tap} from "rxjs/operators";
import {AppService} from "../../../app.service";
import {NetworkNodesPage} from "../../../kpn/api/common/network/network-nodes-page";
import {ApiResponse} from "../../../kpn/api/custom/api-response";
import {NetworkService} from "../network.service";

@Component({
  selector: "kpn-network-nodes-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `

    <kpn-network-page-header
      [networkId]="networkId$ | async"
      pageName="nodes"
      pageTitle="Nodes"
      i18n-pageTitle="@@network-nodes.title">
    </kpn-network-page-header>

    <div *ngIf="response$ | async as response" class="kpn-spacer-above">
      <div *ngIf="!response.result">
        <p i18n="@@network-nodes.network-not-found">Network not found</p>
      </div>
      <div *ngIf="response.result">
        <p>
          <kpn-situation-on [timestamp]="response.situationOn"></kpn-situation-on>
        </p>
        <div *ngIf="response.result.nodes.isEmpty()" i18n="@@network-nodes.no-nodes">
          No network nodes in network
        </div>
        <kpn-network-node-table
          *ngIf="!response.result.nodes.isEmpty()"
          [networkType]="response.result.networkType"
          [timeInfo]="response.result.timeInfo"
          [surveyDateInfo]="response.result.surveyDateInfo"
          [nodes]="response.result.nodes">
        </kpn-network-node-table>
      </div>
    </div>
  `
})
export class NetworkNodesPageComponent implements OnInit {

  networkId$: Observable<number>;
  response$: Observable<ApiResponse<NetworkNodesPage>>;

  constructor(private activatedRoute: ActivatedRoute,
              private appService: AppService,
              private networkService: NetworkService) {
  }

  ngOnInit(): void {

    this.networkId$ = this.activatedRoute.params.pipe(
      map(params => +params["networkId"]),
      tap(networkId => this.networkService.init(networkId)),
      shareReplay()
    );

    this.response$ = this.networkId$.pipe(
      flatMap(networkId =>
        this.appService.networkNodes(networkId).pipe(
          tap(response => {
            if (response.result) {
              this.networkService.update(networkId, response.result.networkSummary);
            }
          })
        )
      )
    );
  }
}
