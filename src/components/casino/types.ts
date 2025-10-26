export interface CaseItem {
  id: number;
  name: string;
  price: number;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UpgradeItem {
  id: number;
  name: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface BoxType {
  id: number;
  name: string;
  price: number;
  minPrize: number;
  maxPrize: number;
  emoji: string;
  isFree: boolean;
}

export const boxes: BoxType[] = [
  { 
    id: 1, 
    name: 'Бесплатный Бокс', 
    price: 0, 
    minPrize: 1, 
    maxPrize: 15,
    emoji: '🎁', 
    isFree: true 
  },
  { 
    id: 2, 
    name: 'Серебряный Бокс', 
    price: 25, 
    minPrize: 10, 
    maxPrize: 45,
    emoji: '🥈', 
    isFree: false 
  },
  { 
    id: 3, 
    name: 'Золотой Бокс', 
    price: 50, 
    minPrize: 20, 
    maxPrize: 90,
    emoji: '🥇', 
    isFree: false 
  },
  { 
    id: 4, 
    name: 'Платиновый Бокс', 
    price: 100, 
    minPrize: 40, 
    maxPrize: 180,
    emoji: '💎', 
    isFree: false 
  },
];

export const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-gold to-yellow-500',
};