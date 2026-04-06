import { AddressResult, Collection, CouncilId } from './types';
import { ealingCouncil } from './councils/ealing';

export interface CouncilAPI {
  id: CouncilId;
  name: string;
  getAddresses(postcode: string): Promise<AddressResult[]>;
  getCollections(uprn: string): Promise<Collection[]>;
}

const registry: Record<CouncilId, CouncilAPI> = {
  ealing: ealingCouncil,
};

export function getCouncil(id: CouncilId): CouncilAPI {
  return registry[id];
}
