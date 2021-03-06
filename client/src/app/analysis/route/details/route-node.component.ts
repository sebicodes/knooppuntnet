import {ChangeDetectionStrategy} from "@angular/core";
import {Component, Input} from "@angular/core";
import {RouteNetworkNodeInfo} from "../../../kpn/api/common/route/route-network-node-info";

@Component({
  selector: "kpn-route-node",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="kpn-line">
      <img [src]="'/assets/images/' + title" class="image">
      <kpn-link-node [nodeId]="node.id" [nodeName]="node.alternateName"></kpn-link-node>
      <kpn-brackets>
        <kpn-osm-link-node [nodeId]="node.id"></kpn-osm-link-node>
      </kpn-brackets>
    </p>
  `
})
export class RouteNodeComponent {
  @Input() title: string;
  @Input() node: RouteNetworkNodeInfo;
}
