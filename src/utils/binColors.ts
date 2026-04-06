import { BinType } from '../api/types';

export interface BinConfig {
  color: string;
  backgroundColor: string;
  label: string;
  emoji: string;
}

export const BIN_CONFIG: Record<BinType, BinConfig> = {
  black: {
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    label: 'Black Rubbish',
    emoji: '🗑️',
  },
  blue: {
    color: '#ffffff',
    backgroundColor: '#1a4fa8',
    label: 'Blue Recycling',
    emoji: '♻️',
  },
  food: {
    color: '#ffffff',
    backgroundColor: '#2e7d32',
    label: 'Food Waste',
    emoji: '🍃',
  },
  unknown: {
    color: '#ffffff',
    backgroundColor: '#757575',
    label: 'Collection',
    emoji: '📦',
  },
};
