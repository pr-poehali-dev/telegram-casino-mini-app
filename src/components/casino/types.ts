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

export const cases = [
  { id: 1, name: 'БЕСПЛАТНЫЙ КЕЙС', price: 25, minPrize: 50, maxPrize: 500, image: '💎', isFree: true },
  { id: 2, name: 'Золотой кейс', price: 500, minPrize: 250, maxPrize: 2500, image: '👑', isFree: false },
  { id: 3, name: 'Легендарный кейс', price: 1000, minPrize: 500, maxPrize: 10000, image: '⭐', isFree: false },
  { id: 4, name: 'NFT кейс', price: 2000, minPrize: 1000, maxPrize: 50000, image: '🎨', isFree: false },
];

export const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-gold to-yellow-500',
};
