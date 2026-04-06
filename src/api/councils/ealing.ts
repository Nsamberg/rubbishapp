import { AddressResult, BinType, Collection } from '../types';
import { CouncilAPI } from '../council';
import { parseDDMMYYYY } from '../../utils/dates';

const BASE_URL = 'https://www.ealing.gov.uk/site/custom_scripts/WasteCollectionWS/home';

function mapServiceToBinType(service: string): BinType {
  const s = service.toUpperCase();
  if (s.includes('BLACK')) return 'black';
  if (s.includes('BLUE') || s.includes('RECYCLING')) return 'blue';
  if (s.includes('FOOD')) return 'food';
  return 'unknown';
}

export const ealingCouncil: CouncilAPI = {
  id: 'ealing',
  name: 'Ealing Council',

  async getAddresses(postcode: string): Promise<AddressResult[]> {
    const normalised = postcode.trim().replace(/\s+/g, '+');
    const response = await fetch(`${BASE_URL}/GetAddress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `Postcode=${encodeURIComponent(normalised).replace(/%2B/g, '+')}`,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch addresses: ${response.status}`);
    }

    const data = await response.json();
    if (!data.param1 || !Array.isArray(data.param2)) {
      throw new Error('Unexpected response format from address lookup');
    }

    return data.param2.map((item: { Text: string; Value: string }) => ({
      displayName: item.Text.trim(),
      uprn: item.Value,
    }));
  },

  async getCollections(uprn: string): Promise<Collection[]> {
    const response = await fetch(`${BASE_URL}/FindCollection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `UPRN=${encodeURIComponent(uprn)}`,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.param2)) {
      throw new Error('Unexpected response format from collection lookup');
    }

    return data.param2.map((item: { Service: string; collectionDateString: string }) => ({
      service: item.Service,
      collectionDate: parseDDMMYYYY(item.collectionDateString),
      binType: mapServiceToBinType(item.Service),
    }));
  },
};
