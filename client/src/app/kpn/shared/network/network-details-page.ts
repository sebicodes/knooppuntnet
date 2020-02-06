// this class is generated, please do not modify

import {NetworkAttributes} from "./network-attributes";
import {NetworkFacts} from "../network-facts";
import {NetworkSummary} from "./network-summary";
import {Tags} from "../data/tags";

export class NetworkDetailsPage {

  constructor(readonly networkSummary: NetworkSummary,
              readonly active: boolean,
              readonly ignored: boolean,
              readonly attributes: NetworkAttributes,
              readonly tags: Tags,
              readonly facts: NetworkFacts) {
  }

  public static fromJSON(jsonObject): NetworkDetailsPage {
    if (!jsonObject) {
      return undefined;
    }
    return new NetworkDetailsPage(
      NetworkSummary.fromJSON(jsonObject.networkSummary),
      jsonObject.active,
      jsonObject.ignored,
      NetworkAttributes.fromJSON(jsonObject.attributes),
      Tags.fromJSON(jsonObject.tags),
      NetworkFacts.fromJSON(jsonObject.facts)
    );
  }
}