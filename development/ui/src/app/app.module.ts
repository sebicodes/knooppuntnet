import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {LayoutModule} from '@angular/cdk/layout';
import {HttpClientModule} from '@angular/common/http';

import {AppComponent} from './app.component';
import {AppService} from './app.service';
import {KpnMaterialModule} from "./material/kpn-material.module";
import {AppRoutingModule} from './app-routing.module';
import {SharedModule} from "./components/shared/shared.module";
import {UserService} from "./user.service";
import {CookieService} from "ngx-cookie-service";
import {MarkdownModule} from "ngx-markdown";
import {PageService} from "./components/shared/page.service";
import {IconService} from "./icon.service";
import {PoiService} from "./poi.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    MarkdownModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    KpnMaterialModule,
    HttpClientModule,
    SharedModule,
    AppRoutingModule
  ],
  providers: [
    CookieService,
    UserService,
    AppService,
    PageService,
    IconService,
    PoiService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
}
