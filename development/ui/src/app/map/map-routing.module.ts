import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {MapSidebarComponent} from "./sidebar/_map-sidebar.component";
import {MapPageComponent} from "./pages/map/_map-page.component";
import {MapMainPageComponent} from "./pages/map/map-main-page.component";
import {DirectionsPageComponent} from "./pages/directions/_directions-page.component";

const routes: Routes = [
  {
    path: '',
    component: MapSidebarComponent,
    outlet: "sidebar"
  },
  {
    path: '',
    component: MapPageComponent
  },
  {
    path: 'directions/:exampleName',
    component: DirectionsPageComponent
  },
  {
    path: ':networkType',
    component: MapMainPageComponent
  }
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