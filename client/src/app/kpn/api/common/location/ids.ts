// this class is generated, please do not modify

import {List} from "immutable";

export class Ids {

  constructor(readonly ids: List<number>) {
  }

  public static fromJSON(jsonObject: any): Ids {
    if (!jsonObject) {
      return undefined;
    }
    return new Ids(
      jsonObject.ids ? List(jsonObject.ids) : List()
    );
  }
}
