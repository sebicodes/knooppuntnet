import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {AppService} from "../../../app.service";
import {ApiResponse} from "../../../kpn/shared/api-response";
import {SubsetNetworksPage} from "../../../kpn/shared/subset/subset-networks-page";
import {Util} from "../../../components/shared/util";
import {Subset} from "../../../kpn/shared/subset";
import {PageService} from "../../../components/shared/page.service";
import {NetworkCacheService} from "../../../services/network-cache.service";

@Component({
  selector: 'kpn-subset-networks-page',
  template: `

    <div>
      <a routerLink="/">Home</a> >
      <a routerLink="/analysis">Analysis</a> >
      <a routerLink="/analysis">The Netherlands</a> >
      Cycling > Networks
    </div>
    
    <h1>
      <kpn-subset-name [subset]="subset"></kpn-subset-name>
    </h1>

    <div>
      <div class="kpn-thick">Networks</div> | 
      <a routerLink="/">Facts</a> |
      <a routerLink="/analysis">Orphan Nodes</a> |
      <a routerLink="/analysis">Orphan Routes</a> |
      <a routerLink="/analysis">History</a>
    </div>
    <br/>
    
    <kpn-subset-network-list
      *ngIf="response"
      [networks]="response.result.networks">
    </kpn-subset-network-list>

    <br/>
    <br/>
    <br/>

    <kpn-subset-network-table
      *ngIf="response"
      [networks]="response.result.networks">
    </kpn-subset-network-table>

    <div *ngIf="response">
      <json [object]="response"></json>
    </div>
  `
})
export class SubsetNetworksPageComponent implements OnInit, OnDestroy {

  subset: Subset;
  response: ApiResponse<SubsetNetworksPage>;
  paramsSubscription: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
              private appService: AppService,
              private pageService: PageService,
              private networkCacheService: NetworkCacheService) {
  }

  ngOnInit() {
    this.pageService.initSubsetPage();
    this.paramsSubscription = this.activatedRoute.params.subscribe(params => {
      this.subset = Util.subsetInRoute(params);
      this.pageService.subset = this.subset;
      this.response = null;
      this.appService.subsetNetworks(this.subset).subscribe(response => {
        this.response = response;
        response.result.networks.forEach(networkAttributes => {
          this.networkCacheService.setNetworkName(networkAttributes.id.toString(), networkAttributes.name);
        });
      });
    });
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }

}
