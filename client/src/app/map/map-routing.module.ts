import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {BaseSidebarComponent} from "../base/base-sidebar.component";
import {Util} from "../components/shared/util";
import {MapPageComponent} from "./pages/map/_map-page.component";
import {MapMainPageComponent} from "./pages/map/map-main-page.component";
import {MapSidebarComponent} from "./sidebar/_map-sidebar.component";
import {MapToolbarComponent} from "./sidebar/map-toolbar.component";

const routes: Routes = [
  Util.routePath("", MapPageComponent, BaseSidebarComponent),
  Util.routePathWithToolbar(":networkType", MapMainPageComponent, MapSidebarComponent, MapToolbarComponent)
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class MapRoutingModule {
}
