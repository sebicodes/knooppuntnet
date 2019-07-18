import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {AppService} from "../../../../app.service";
import {PageService} from "../../../../components/shared/page.service";
import {Util} from "../../../../components/shared/util";
import {ApiResponse} from "../../../../kpn/shared/api-response";
import {Subset} from "../../../../kpn/shared/subset";
import {SubsetChangesPage} from "../../../../kpn/shared/subset/subset-changes-page";
import {SubsetCacheService} from "../../../../services/subset-cache.service";
import {Subscriptions} from "../../../../util/Subscriptions";
import {flatMap, map, tap} from "rxjs/operators";

@Component({
  selector: "kpn-subset-changes-page",
  template: `

    <kpn-subset-page-header-block
      [subset]="subset"
      pageName="changes"
      pageTitle="Changes"
      i18n-pageTitle="@@subset-changes.title">
    </kpn-subset-page-header-block>

    <div *ngIf="response">
      <json [object]="response"></json>
    </div>
  `
})
export class SubsetChangesPageComponent implements OnInit, OnDestroy {

  private readonly subscriptions = new Subscriptions();

  subset: Subset;
  response: ApiResponse<SubsetChangesPage>;

  constructor(private activatedRoute: ActivatedRoute,
              private appService: AppService,
              private pageService: PageService,
              private subsetCacheService: SubsetCacheService) {
  }

  ngOnInit() {
    this.pageService.initSubsetPage();
    this.subscriptions.add(
      this.activatedRoute.params.pipe(
        map(params => Util.subsetInRoute(params)),
        tap(subset => {
          this.subset = subset;
          this.pageService.subset = subset;
        }),
        flatMap(subset => this.appService.subsetChanges(subset))
      ).subscribe(response => {
        this.response = response;
        this.subsetCacheService.setSubsetInfo(this.subset.key(), this.response.result.subsetInfo)
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
