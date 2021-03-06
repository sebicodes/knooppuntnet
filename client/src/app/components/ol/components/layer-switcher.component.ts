import {ChangeDetectionStrategy} from "@angular/core";
import {Component, Input} from "@angular/core";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {List} from "immutable";
import BaseLayer from "ol/layer/Base";
import {MapLayers} from "../layers/map-layers";

@Component({
  selector: "kpn-layer-switcher",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="switcher">
      <div *ngIf="open" (mouseleave)="closePanel()">
        <div *ngFor="let layer of namedLayers()">
          <mat-checkbox
            (click)="$event.stopPropagation();"
            [checked]="isLayerVisible(layer)"
            (change)="layerVisibleChanged(layer, $event)">
            {{layerName(layer)}}
          </mat-checkbox>
        </div>
        <ng-content></ng-content>
      </div>
      <div *ngIf="!open" (mouseenter)="openPanel()" (mouseleave)="closePanel()">
        <img [src]="'/assets/images/layers.png'" alt="layers">
      </div>
    </div>
  `,
  styles: [`
    .switcher {
      position: absolute;
      top: 50px;
      right: 10px;
      z-index: 100;
      background-color: white;
      padding: 5px;
      border-color: lightgray;
      border-style: solid;
      border-width: 1px;
      border-radius: 5px;
    }
  `]
})
export class LayerSwitcherComponent {

  @Input() mapLayers: MapLayers;

  open = false;

  namedLayers(): List<BaseLayer> {
    return this.mapLayers.layers.map(ml => ml.layer).filter(layer => layer.get("name"));
  }

  openPanel(): void {
    this.open = true;
  }

  closePanel(): void {
    this.open = false;
  }

  isLayerVisible(layer: BaseLayer): boolean {
    return layer.getVisible();
  }

  layerVisibleChanged(layer: BaseLayer, event: MatCheckboxChange): void {
    layer.setVisible(event.checked);
  }

  layerName(layer: BaseLayer): string {
    return layer.get("name");
  }

}
