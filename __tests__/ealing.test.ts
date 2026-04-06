import { ealingCouncil } from '../src/api/councils/ealing';

const mockAddressResponse = {
  param1: true,
  param2: [
    { Disabled: false, Group: null, Selected: false, Text: ' 112 MIDHURST ROAD, WEST EALING, LONDON, W13 9TP', Value: '12068516' },
    { Disabled: false, Group: null, Selected: false, Text: ' 114 MIDHURST ROAD, WEST EALING, LONDON, W13 9TP', Value: '12068517' },
  ],
};

const mockCollectionResponse = {
  param1: 'M2',
  param2: [
    { Service: 'BLACK RUBBISH WHEELIE BIN', collectionDate: ['13/04/2026'], collectionDateString: '13/04/2026', collectionSchedule: 'REF4 MonFort1' },
    { Service: 'BLUE RECYCLING WHEELIE BIN', collectionDate: ['06/04/2026'], collectionDateString: '06/04/2026', collectionSchedule: 'REC4 MonFort2' },
    { Service: 'FOOD BOX', collectionDate: ['06/04/2026'], collectionDateString: '06/04/2026', collectionSchedule: 'FOOD3 Mon' },
  ],
  param3: false,
  param4: 'NF',
};

beforeEach(() => {
  global.fetch = jest.fn();
});

describe('ealingCouncil.getAddresses', () => {
  it('maps API response to AddressResult array', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAddressResponse),
    });

    const results = await ealingCouncil.getAddresses('W13 9TP');
    expect(results).toHaveLength(2);
    expect(results[0].uprn).toBe('12068516');
    expect(results[0].displayName).toBe('112 MIDHURST ROAD, WEST EALING, LONDON, W13 9TP');
    expect(results[1].uprn).toBe('12068517');
  });

  it('throws on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    await expect(ealingCouncil.getAddresses('W13 9TP')).rejects.toThrow('500');
  });

  it('throws on unexpected response format', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ param1: false }),
    });
    await expect(ealingCouncil.getAddresses('W13 9TP')).rejects.toThrow();
  });
});

describe('ealingCouncil.getCollections', () => {
  it('maps API response to Collection array with correct bin types', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCollectionResponse),
    });

    const results = await ealingCouncil.getCollections('12068516');
    expect(results).toHaveLength(3);

    const black = results.find(r => r.binType === 'black');
    const blue = results.find(r => r.binType === 'blue');
    const food = results.find(r => r.binType === 'food');

    expect(black).toBeDefined();
    expect(blue).toBeDefined();
    expect(food).toBeDefined();
  });

  it('parses collection dates correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCollectionResponse),
    });

    const results = await ealingCouncil.getCollections('12068516');
    const black = results.find(r => r.binType === 'black')!;
    expect(black.collectionDate.getFullYear()).toBe(2026);
    expect(black.collectionDate.getMonth()).toBe(3); // April
    expect(black.collectionDate.getDate()).toBe(13);
  });

  it('throws on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });
    await expect(ealingCouncil.getCollections('12068516')).rejects.toThrow('503');
  });
});
