import {Component, Input} from "@angular/core";
import {Util} from "../../../../components/shared/util";
import {Subset} from "../../../../kpn/shared/subset";
import {SubsetInfo} from "../../../../kpn/shared/subset/subset-info";
import {SubsetCacheService} from "../../../../services/subset-cache.service";

@Component({
  selector: "kpn-subset-page-header",
  template: `

    <div>
      <a routerLink="/" i18n="@@breadcrumb.home">Home</a> >
      <a routerLink="/analysis" i18n="@@breadcrumb.analysis">Analysis</a> >
      <a routerLink="{{countryLink()}}">
        <kpn-country-name [country]="subset.country"></kpn-country-name>
      </a> >
      <kpn-network-type-name [networkType]="subset.networkType"></kpn-network-type-name>
    </div>

    <h1>
      <kpn-subset-name [subset]="subset"></kpn-subset-name>
    </h1>

    <kpn-page-menu>

      <kpn-page-menu-option
        pageName="networks"
        [selectedPageName]="pageName"
        [link]="link('networks')"
        pageTitle="Networks"
        i18n-pageTitle="@@subset-page.menu.networks"
        [elementCount]="networkCount()">
      </kpn-page-menu-option>

      <kpn-page-menu-option
        pageName="facts"
        [selectedPageName]="pageName"
        [link]="link('facts')"
        pageTitle="Facts"
        i18n-pageTitle="@@subset-page.menu.facts"
        [elementCount]="factCount()">
      </kpn-page-menu-option>

      <kpn-page-menu-option
        pageName="orphan-nodes"
        [selectedPageName]="pageName"
        [link]="link('orphan-nodes')"
        pageTitle="Orphan Nodes"
        i18n-pageTitle="@@subset-page.menu.orphan-nodes"
        [elementCount]="orphanNodeCount()">
      </kpn-page-menu-option>

      <kpn-page-menu-option
        pageName="orphan-routes"
        [selectedPageName]="pageName"
        [link]="link('orphan-routes')"
        pageTitle="Orphan routes"
        i18n-pageTitle="@@subset-page.menu.orphan-routes"
        [elementCount]="orphanRouteCount()">
      </kpn-page-menu-option>

      <kpn-page-menu-option
        pageName="changes"
        [selectedPageName]="pageName"
        [link]="link('changes')"
        pageTitle="Changes"
        i18n-pageTitle="@@subset-page.menu.changes">
      </kpn-page-menu-option>

    </kpn-page-menu>

  `
})
export class SubsetPageHeaderComponent {

  @Input() subset: Subset;
  @Input() pageName: string;

  constructor(private subsetCacheService: SubsetCacheService) {
  }

  countryLink(): string {
    return "/analysis/" + Util.safeGet(() => this.subset.country.domain);
  }

  link(targetPageName: string) {
    if (this.subset != null) {
      return `/analysis/${this.subset.country.domain}/${this.subset.networkType.name}/${targetPageName}`;
    }
    return "/";
  }

  networkCount() {
    return Util.safeGet(() => this.subsetInfo().networkCount);
  }

  factCount() {
    return Util.safeGet(() => this.subsetInfo().factCount);
  }

  orphanNodeCount() {
    return Util.safeGet(() => this.subsetInfo().orphanNodeCount);
  }

  orphanRouteCount() {
    return Util.safeGet(() => this.subsetInfo().orphanRouteCount);
  }

  subsetInfo(): SubsetInfo {
    return this.subsetCacheService.getSubsetInfo(this.subset.key());
  }

}