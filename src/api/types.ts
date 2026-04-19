export type CouncilId = 'ealing';

export type BinType = 'black' | 'blue' | 'food' | 'garden' | 'unknown';

export interface AddressResult {
  displayName: string;
  uprn: string;
}

export interface Collection {
  service: string;
  collectionDate: Date;
  binType: BinType;
}

export interface SavedAddress {
  displayName: string;
  uprn: string;
  councilId: CouncilId;
}

export interface ReminderPreferences {
  enabled: boolean;
  hoursBefore: number;
  enabledBinTypes: BinType[];
}
