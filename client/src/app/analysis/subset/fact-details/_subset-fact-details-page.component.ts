import {ChangeDetectionStrategy} from "@angular/core";
import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Params} from "@angular/router";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {flatMap, map} from "rxjs/operators";
import {AppService} from "../../../app.service";
import {Util} from "../../../components/shared/util";
import {SubsetFactDetailsPage} from "../../../kpn/api/common/subset/subset-fact-details-page";
import {ApiResponse} from "../../../kpn/api/custom/api-response";
import {Subset} from "../../../kpn/api/custom/subset";
import {SubsetCacheService} from "../../../services/subset-cache.service";

class SubsetFact {
  constructor(readonly subset: Subset,
              readonly factName: string) {
  }
}

@Component({
  selector: "kpn-subset-fact-details-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `

    <div *ngIf="subsetFact$ | async as subsetFact">
      <kpn-subset-page-header-block
        [subset]="subsetFact.subset"
        pageName="facts"
        pageTitle="Facts"
        i18n-pageTitle="@@subset-facts.title">
      </kpn-subset-page-header-block>
      <h2>
        <kpn-fact-name [factName]="subsetFact.factName"></kpn-fact-name>
      </h2>
    </div>

    <div *ngIf="response$ | async as response">
      <div class="fact-description">
        <kpn-fact-description [factName]="factName"></kpn-fact-description>
      </div>
      <div *ngIf="!hasFacts">
        <i i18n="@@subset-facts.no-facts">No facts</i>
      </div>
      <div *ngIf="hasFacts">
        <div class="kpn-space-separated kpn-label">
          <span>{{refCount}}</span>
          <span *ngIf="hasNodeRefs()" i18n="@@subset-facts.node-refs">{refCount, plural, one {node} other {nodes}}</span>
          <span *ngIf="hasRouteRefs()" i18n="@@subset-facts.route-refs">{refCount, plural, one {route} other {routes}}</span>
          <span *ngIf="hasOsmNodeRefs()" i18n="@@subset-facts.osm-node-refs">{refCount, plural, one {node} other {nodes}}</span>
          <span *ngIf="hasOsmWayRefs()" i18n="@@subset-facts.osm-way-refs">{refCount, plural, one {way} other {ways}}</span>
          <span *ngIf="hasOsmRelationRefs()"
                i18n="@@subset-facts.osm-relation-refs">{refCount, plural, one {relation} other {relations}}</span>
          <span i18n="@@subset-facts.in-networks">{networkCount, plural, one {in 1 network} other {in {{networkCount}} networks}}</span>
        </div>

        <kpn-items>
          <kpn-item *ngFor="let networkFactRefs of response.result.networks; let i=index" [index]="i">
            <div class="fact-detail">
              <span *ngIf="networkFactRefs.networkId === 0" i18n="@@subset-facts.orphan-routes">Orphan routes</span>
              <a *ngIf="networkFactRefs.networkId !== 0" [routerLink]="'/analysis/network/' + networkFactRefs.networkId">
                {{networkFactRefs.networkName}}
              </a>
            </div>
            <div class="fact-detail">
              <span i18n="@@subset-facts.routes" class="kpn-label">{networkFactRefs.factRefs.size, plural, one {1 route} other {{{networkFactRefs.factRefs.size}} routes}}</span>
            </div>
            <div class="kpn-comma-list fact-detail">
              <span *ngFor="let ref of networkFactRefs.factRefs">
                <a *ngIf="hasNodeRefs()" [routerLink]="'/analysis/node/' + ref.id">{{ref.name}}</a>
                <a *ngIf="hasRouteRefs()" [routerLink]="'/analysis/route/' + ref.id">{{ref.name}}</a>
                <kpn-osm-link-node *ngIf="hasOsmNodeRefs()" [id]="ref.id" title="ref.id"></kpn-osm-link-node>
                <kpn-osm-link-way *ngIf="hasOsmWayRefs()" [id]="ref.id" title="ref.id"></kpn-osm-link-way>
                <kpn-osm-link-relation *ngIf="hasOsmRelationRefs()" [relationId]="ref.id" title="{{ref.id}}"></kpn-osm-link-relation>
              </span>
            </div>
          </kpn-item>
        </kpn-items>
      </div>
    </div>
  `,
  styleUrls: ["./_subset-fact-details-page.component.scss"]
})
export class SubsetFactDetailsPageComponent implements OnInit {

  subsetFact$: Observable<SubsetFact>;
  response$: Observable<ApiResponse<SubsetFactDetailsPage>>;

  factName: string;
  hasFacts: boolean;
  refCount: number;
  networkCount: number;

  constructor(private activatedRoute: ActivatedRoute,
              private appService: AppService,
              private subsetCacheService: SubsetCacheService) {
  }

  ngOnInit(): void {
    this.subsetFact$ = this.activatedRoute.params.pipe(map(params => this.interpreteParams(params)));
    this.response$ = this.subsetFact$.pipe(
      flatMap(subsetFact => this.appService.subsetFactDetails(subsetFact.subset, subsetFact.factName).pipe(
        tap(response => {
          this.hasFacts = response.result && response.result.networks.size > 0;
          this.refCount = this.calculateRefCount(response);
          this.networkCount = response.result.networks.size;
          this.subsetCacheService.setSubsetInfo(subsetFact.subset.key(), response.result.subsetInfo);
        })
      ))
    );
  }

  hasNodeRefs(): boolean {
    return this.factName === "NodeMemberMissing"
      || this.factName === "IntegrityCheckFailed";
  }

  hasOsmNodeRefs(): boolean {
    return this.factName === "NetworkExtraMemberNode";
  }

  hasOsmWayRefs(): boolean {
    return this.factName === "NetworkExtraMemberWay";
  }

  hasOsmRelationRefs(): boolean {
    return this.factName === "NetworkExtraMemberRelation";
  }

  hasRouteRefs(): boolean {
    return !(this.hasNodeRefs()
      || this.hasOsmNodeRefs()
      || this.hasOsmWayRefs()
      || this.hasOsmRelationRefs());
  }

  private interpreteParams(params: Params): SubsetFact {
    const subset = Util.subsetInRoute(params);
    this.factName = params["fact"];
    return new SubsetFact(subset, this.factName);
  }

  private calculateRefCount(response: ApiResponse<SubsetFactDetailsPage>): number {
    return Util.sum(response.result.networks.map(n => n.factRefs.size));
  }
}
