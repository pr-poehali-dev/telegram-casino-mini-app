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

export interface CaseType {
  id: number;
  name: string;
  price: number;
  minPrize: number;
  maxPrize: number;
  image: string;
  isFree: boolean;
}

export const caseItems = [
  { emoji: '🎮', name: 'Игровая консоль', price: 0.8 },
  { emoji: '🎧', name: 'Наушники', price: 1.2 },
  { emoji: '⌚', name: 'Часы', price: 1.5 },
  { emoji: '💻', name: 'Ноутбук', price: 2.5 },
  { emoji: '📱', name: 'Смартфон', price: 2.0 },
  { emoji: '🎸', name: 'Гитара', price: 1.8 },
  { emoji: '📷', name: 'Камера', price: 2.2 },
  { emoji: '🎯', name: 'Дартс', price: 0.5 },
  { emoji: '🏆', name: 'Кубок', price: 3.0 },
  { emoji: '💍', name: 'Кольцо', price: 2.8 },
];

export const cases: CaseType[] = [
  { id: 1, name: 'БЕСПЛАТНЫЙ КЕЙС', price: 2.5, minPrize: 0.5, maxPrize: 3.5, image: '💎', isFree: true },
  { id: 2, name: 'Золотой кейс', price: 50, minPrize: 10, maxPrize: 55, image: '👑', isFree: false },
  { id: 3, name: 'Легендарный кейс', price: 100, minPrize: 20, maxPrize: 110, image: '⭐', isFree: false },
  { id: 4, name: 'NFT кейс', price: 200, minPrize: 40, maxPrize: 220, image: '🎨', isFree: false },
];

export const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-gold to-yellow-500',
};