import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {SelectedFeature} from "./domain/selected-feature";
import {NetworkType} from "../../kpn/shared/network-type";

export class PoiId {
  constructor(readonly elementType: string,
              readonly elementId: number) {
  }
}

@Injectable()
export class MapService {

  highlightedRouteId: string;
  highlightedNodeId: string;
  selectedRouteId: string;
  selectedNodeId: string;

  networkType: BehaviorSubject<NetworkType> = new BehaviorSubject(new NetworkType("rcn"));
  selectedFeature: BehaviorSubject<SelectedFeature> = new BehaviorSubject(null);
  poiClicked: BehaviorSubject<PoiId> = new BehaviorSubject(null);

}