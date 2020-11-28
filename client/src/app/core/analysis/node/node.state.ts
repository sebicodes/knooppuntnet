import {NodeChangesPage} from '../../../kpn/api/common/node/node-changes-page';
import {NodeDetailsPage} from '../../../kpn/api/common/node/node-details-page';
import {NodeMapPage} from '../../../kpn/api/common/node/node-map-page';
import {ApiResponse} from '../../../kpn/api/custom/api-response';

export const initialState: NodeState = {
  nodeId: '',
  nodeName: '',
  changeCount: 0,
  details: null,
  map: null,
  changes: null
};

export interface NodeState {
  nodeId: string;
  nodeName: string;
  changeCount: number;
  details: ApiResponse<NodeDetailsPage>;
  map: ApiResponse<NodeMapPage>;
  changes: ApiResponse<NodeChangesPage>;
}