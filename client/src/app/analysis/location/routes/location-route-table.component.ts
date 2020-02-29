import {SimpleChanges} from "@angular/core";
import {ViewChild} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {Output} from "@angular/core";
import {Input} from "@angular/core";
import {OnChanges} from "@angular/core";
import {Component, OnInit} from "@angular/core";
import {PageEvent} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {List} from "immutable";
import {PageWidthService} from "../../../components/shared/page-width.service";
import {PaginatorComponent} from "../../../components/shared/paginator/paginator.component";
import {LocationRouteInfo} from "../../../kpn/api/common/location/location-route-info";
import {TimeInfo} from "../../../kpn/api/common/time-info";

@Component({
  selector: "kpn-location-route-table",
  template: `
    <kpn-paginator
      (page)="page.emit($event)"
      [pageIndex]="0"
      [pageSize]="5"
      [pageSizeOptions]="[5, 10, 20, 50, 1000]"
      [length]="routeCount"
      [showFirstLastButtons]="true">
    </kpn-paginator>

    <mat-divider></mat-divider>

    <mat-table matSort [dataSource]="dataSource">

      <ng-container matColumnDef="nr">
        <mat-header-cell *matHeaderCellDef mat-sort-header i18n="@@location-routes.table.nr">Nr</mat-header-cell>
        <mat-cell *matCellDef="let i=index">{{rowNumber(i)}}</mat-cell>
      </ng-container>

      <ng-container matColumnDef="route">
        <mat-header-cell *matHeaderCellDef mat-sort-header i18n="@@location-routes.table.route">Route</mat-header-cell>
        <mat-cell *matCellDef="let route">
          <kpn-link-route [routeId]="route.id" [title]="route.name"></kpn-link-route>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="distance">
        <mat-header-cell *matHeaderCellDef i18n="@@location-routes.table.distance">Distance</mat-header-cell>
        <mat-cell *matCellDef="let route" i18n="@@location-routes.table.distance.value">
          {{route.meters}}m
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="broken">
        <mat-header-cell *matHeaderCellDef i18n="@@location-routes.table.broken">Broken</mat-header-cell>
        <mat-cell *matCellDef="let route">
          {{route.broken}}
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="lastEdit">
        <mat-header-cell *matHeaderCellDef mat-sort-header i18n="@@location-routes.table.last-edit">Last edit</mat-header-cell>
        <mat-cell *matCellDef="let route" class="kpn-line">
          <kpn-day [timestamp]="route.lastUpdated"></kpn-day>
          <kpn-josm-relation [relationId]="route.id"></kpn-josm-relation>
          <kpn-osm-link-relation [relationId]="route.id"></kpn-osm-link-relation>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedColumns()"></mat-header-row>
      <mat-row *matRowDef="let route; columns: displayedColumns();"></mat-row>
    </mat-table>  `,
  styles: []
})
export class LocationRouteTableComponent implements OnInit, OnChanges {

  @Input() timeInfo: TimeInfo;
  @Input() routes: List<LocationRouteInfo> = List();
  @Input() routeCount: number;
  @Output() page = new EventEmitter<PageEvent>();

  dataSource: MatTableDataSource<LocationRouteInfo>;

  @ViewChild(PaginatorComponent, {static: true}) paginator: PaginatorComponent;

  // private readonly filterCriteria: BehaviorSubject<NetworkNodeFilterCriteria> = new BehaviorSubject(new NetworkNodeFilterCriteria());

  constructor(private pageWidthService: PageWidthService
              /*private networkNodesService: NetworkNodesService*/) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator.matPaginator;
    this.dataSource.data = this.routes.toArray();
    // this.filterCriteria.subscribe(criteria => {
    //   const filter = new NetworkNodeFilter(this.timeInfo, criteria, this.filterCriteria);
    //   this.dataSource.data = filter.filter(this.nodes).toArray();
    //   this.networkNodesService.filterOptions.next(filter.filterOptions(this.nodes));
    // });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["routes"]) {
      this.dataSource.data = this.routes.toArray();
    }
  }

  displayedColumns() {

    if (this.pageWidthService.isVeryLarge()) {
      return ["nr", "route", "distance", "broken", "lastEdit"];
    }

    if (this.pageWidthService.isLarge()) {
      return ["nr", "route", "distance", "broken", "lastEdit"];
    }

    return ["nr", "route", "distance", "broken", "lastEdit"];
  }

  rowNumber(index: number): number {
    return this.paginator.rowNumber(index);
  }
}