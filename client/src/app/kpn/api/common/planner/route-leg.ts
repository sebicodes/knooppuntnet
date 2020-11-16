// this class is generated, please do not modify

import {List} from 'immutable';
import {RouteLegRoute} from './route-leg-route';

export class RouteLeg {

  constructor(readonly legId: string,
              readonly routes: List<RouteLegRoute>) {
  }

  public static fromJSON(jsonObject: any): RouteLeg {
    if (!jsonObject) {
      return undefined;
    }
    return new RouteLeg(
      jsonObject.legId,
      jsonObject.routes ? List(jsonObject.routes.map((json: any) => RouteLegRoute.fromJSON(json))) : List()
    );
  }
}
