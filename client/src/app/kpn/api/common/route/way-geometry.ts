// this class is generated, please do not modify

import {List} from "immutable";
import {LatLonImpl} from "../lat-lon-impl";

export class WayGeometry {

  constructor(readonly id: number,
              readonly nodes: List<LatLonImpl>) {
  }

  public static fromJSON(jsonObject: any): WayGeometry {
    if (!jsonObject) {
      return undefined;
    }
    return new WayGeometry(
      jsonObject.id,
      jsonObject.nodes ? List(jsonObject.nodes.map((json: any) => LatLonImpl.fromJSON(json))) : List()
    );
  }
}
