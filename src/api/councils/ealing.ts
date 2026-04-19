import { Platform } from 'react-native';
import { AddressResult, BinType, Collection } from '../types';
import { CouncilAPI } from '../council';
import { parseDDMMYYYY } from '../../utils/dates';

const DIRECT_URL = 'https://www.ealing.gov.uk/site/custom_scripts/WasteCollectionWS/home';
const isWeb = Platform.OS === 'web';

function mapServiceToBinType(service: string): BinType {
  const s = service.toUpperCase();
  if (s.includes('BLACK')) return 'black';
  if (s.includes('BLUE') || s.includes('RECYCLING')) return 'blue';
  if (s.includes('FOOD')) return 'food';
  if (s.includes('GARDEN')) return 'garden';
  return 'unknown';
}

async function fetchAddressDirect(postcode: string) {
  const normalised = postcode.trim().replace(/\s+/g, '+');
  return fetch(`${DIRECT_URL}/GetAddress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `Postcode=${encodeURIComponent(normalised).replace(/%2B/g, '+')}`,
  });
}

async function fetchAddressProxy(postcode: string) {
  return fetch(`/api/get-address?postcode=${encodeURIComponent(postcode.trim())}`);
}

async function fetchCollectionDirect(uprn: string) {
  return fetch(`${DIRECT_URL}/FindCollection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `UPRN=${encodeURIComponent(uprn)}`,
  });
}

async function fetchCollectionProxy(uprn: string) {
  return fetch(`/api/find-collection?uprn=${encodeURIComponent(uprn)}`);
}

export const ealingCouncil: CouncilAPI = {
  id: 'ealing',
  name: 'Ealing Council',

  async getAddresses(postcode: string): Promise<AddressResult[]> {
    const response = await (isWeb ? fetchAddressProxy(postcode) : fetchAddressDirect(postcode));

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
    const response = await (isWeb ? fetchCollectionProxy(uprn) : fetchCollectionDirect(uprn));

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.status}`);
    }

    const data = await response.json();
    console.log('[ealing] raw collection response:', JSON.stringify(data.param2, null, 2));
    if (!Array.isArray(data.param2)) {
      throw new Error('Unexpected response format from collection lookup');
    }

    const mapped = data.param2.map((item: { Service: string; collectionDate?: unknown; collectionDateString?: unknown }) => {
      const rawDate = (typeof item.collectionDateString === 'string' && item.collectionDateString) ||
        (Array.isArray(item.collectionDate) ? item.collectionDate[0] : '');
      const collectionDate = parseDDMMYYYY(typeof rawDate === 'string' ? rawDate : '');
      if (isNaN(collectionDate.getTime())) {
        console.warn('[ealing] could not parse date for:', item.Service, '| collectionDateString:', item.collectionDateString, '| collectionDate:', item.collectionDate);
      }
      return { service: item.Service, collectionDate, binType: mapServiceToBinType(item.Service) };
    });

    return mapped.filter((item: { collectionDate: Date }) => !isNaN(item.collectionDate.getTime()));
  },
};
