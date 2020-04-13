import {OnInit} from "@angular/core";
import {AfterViewInit, Component, Input} from "@angular/core";
import {List} from "immutable";
import Map from "ol/Map";
import View from "ol/View";
import {NodeMapInfo} from "../../../kpn/api/common/node-map-info";
import {Util} from "../../shared/util";
import {ZoomLevel} from "../domain/zoom-level";
import {MapControls} from "../layers/map-controls";
import {MapLayer} from "../layers/map-layer";
import {MapLayers} from "../layers/map-layers";
import {MapClickService} from "../services/map-click.service";
import {MapLayerService} from "../services/map-layer.service";

@Component({
  selector: "kpn-node-map",
  template: `
    <div id="node-map" class="kpn-map">
      <kpn-layer-switcher [mapLayers]="layers"></kpn-layer-switcher>
    </div>
  `
})
export class NodeMapComponent implements OnInit, AfterViewInit {

  @Input() nodeMapInfo: NodeMapInfo;

  layers: MapLayers;
  private map: Map;

  constructor(private mapClickService: MapClickService,
              private mapLayerService: MapLayerService) {
  }

  ngOnInit(): void {
    this.layers = this.buildLayers();
  }

  ngAfterViewInit(): void {

    const center = Util.toCoordinate(this.nodeMapInfo.latitude, this.nodeMapInfo.longitude);

    this.map = new Map({
      target: "node-map",
      layers: this.layers.toArray(),
      controls: MapControls.build(),
      view: new View({
        center: center,
        minZoom: ZoomLevel.vectorTileMinZoom,
        maxZoom: ZoomLevel.maxZoom,
        zoom: 18
      })
    });

    this.layers.applyMap(this.map);

    this.mapClickService.installOn(this.map);
  }

  private buildLayers(): MapLayers {
    let mapLayers: List<MapLayer> = List();
    mapLayers = mapLayers.push(this.mapLayerService.osmLayer());
    mapLayers = mapLayers.concat(this.mapLayerService.networkLayers(this.nodeMapInfo.networkTypes).toArray());
    mapLayers = mapLayers.push(this.mapLayerService.nodeMarkerLayer(this.nodeMapInfo));
    return new MapLayers(mapLayers);
  }

}