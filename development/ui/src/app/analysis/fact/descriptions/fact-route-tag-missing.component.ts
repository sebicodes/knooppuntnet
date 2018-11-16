import {Component} from '@angular/core';

@Component({
  selector: 'kpn-fact-route-tag-missing',
  template: `
    <!--De verplichte _"route"_ tag ontbreekt in de routerelatie.-->
    <markdown>
      Routerelation does not contain the required _route_ tag.
    </markdown>
  `
})
export class FactRouteTagMissingComponent {
}
