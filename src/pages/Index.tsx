import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AuthModal from '@/components/AuthModal';

interface CaseItem {
  id: number;
  name: string;
  price: number;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UpgradeItem {
  id: number;
  name: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const caseItems = [
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

const cases = [
  { id: 1, name: 'БЕСПЛАТНЫЙ КЕЙС', price: 2.5, minPrize: 0.5, maxPrize: 3.5, image: '💎', isFree: true },
  { id: 2, name: 'Золотой кейс', price: 50, minPrize: 10, maxPrize: 55, image: '👑', isFree: false },
  { id: 3, name: 'Легендарный кейс', price: 100, minPrize: 20, maxPrize: 110, image: '⭐', isFree: false },
  { id: 4, name: 'NFT кейс', price: 200, minPrize: 40, maxPrize: 220, image: '🎨', isFree: false },
];

const rarityColors = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-gold to-yellow-500',
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [balance, setBalance] = useState(1000);
  const [selectedCase, setSelectedCase] = useState<typeof cases[0] | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [rouletteItems, setRouletteItems] = useState<CaseItem[]>([]);
  const [wonItem, setWonItem] = useState<CaseItem | null>(null);
  const [inventory, setInventory] = useState<UpgradeItem[]>([]);
  const [upgradeFrom, setUpgradeFrom] = useState<UpgradeItem | null>(null);
  const [upgradeChance, setUpgradeChance] = useState(50);
  const [lastFreeOpen, setLastFreeOpen] = useState<number | null>(null);
  const [timeUntilFree, setTimeUntilFree] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setBalance(userData.balance);
      setIsAuthenticated(true);
    }
    
    const saved = localStorage.getItem('lastFreeOpen');
    if (saved) {
      setLastFreeOpen(parseInt(saved));
    }
  }, []);

  const handleAuthSuccess = (data: any) => {
    setUser(data.user);
    setBalance(data.user.balance);
    setIsAuthenticated(true);
    
    if (data.inventory && data.inventory.length > 0) {
      const mappedInventory = data.inventory.map((item: any, idx: number) => ({
        id: Date.now() + idx,
        name: item.name,
        value: item.value,
        rarity: item.rarity,
      }));
      setInventory(mappedInventory);
    }
  };

  useEffect(() => {
    if (!lastFreeOpen) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const timePassed = now - lastFreeOpen;
      const timeLeft = 24 * 60 * 60 * 1000 - timePassed;
      
      if (timeLeft <= 0) {
        setTimeUntilFree('');
        setLastFreeOpen(null);
        localStorage.removeItem('lastFreeOpen');
      } else {
        const hours = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        setTimeUntilFree(`${hours}ч ${minutes}м`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastFreeOpen]);

  const canOpenFree = !lastFreeOpen || (Date.now() - lastFreeOpen) >= 24 * 60 * 60 * 1000;

  const openCase = (caseData: typeof cases[0]) => {
    if (caseData.isFree && canOpenFree) {
      const now = Date.now();
      setLastFreeOpen(now);
      localStorage.setItem('lastFreeOpen', now.toString());
    } else if (balance < caseData.price) {
      alert('Недостаточно средств!');
      return;
    } else {
      setBalance(balance - caseData.price);
    }
    
    setSelectedCase(caseData);
    setIsOpening(true);

    const generateRandomItem = () => {
      const rarityRoll = Math.random();
      let rarity: CaseItem['rarity'];
      if (rarityRoll < 0.65) rarity = 'common';
      else if (rarityRoll < 0.88) rarity = 'rare';
      else if (rarityRoll < 0.97) rarity = 'epic';
      else rarity = 'legendary';

      const prizeValue = parseFloat(
        (Math.random() * (caseData.maxPrize - caseData.minPrize) + caseData.minPrize).toFixed(1)
      );

      const randomCaseItem = caseItems[Math.floor(Math.random() * caseItems.length)];

      return {
        id: Date.now() + Math.random(),
        name: randomCaseItem.name,
        price: prizeValue,
        image: randomCaseItem.emoji,
        rarity,
      };
    };

    const items = Array.from({ length: 50 }, () => generateRandomItem());
    const winningIndex = 45;
    setRouletteItems(items);

    setTimeout(() => {
      const newItem = items[winningIndex];
      setWonItem(newItem);
      setIsOpening(false);
      
      const upgradeItem: UpgradeItem = {
        id: newItem.id,
        name: newItem.name,
        value: newItem.price,
        rarity: newItem.rarity,
      };
      setInventory([...inventory, upgradeItem]);
    }, 3000);
  };

  const performUpgrade = () => {
    if (!upgradeFrom) return;
    
    const success = Math.random() * 100 < upgradeChance;
    
    if (success) {
      const newValue = Math.floor(upgradeFrom.value * 1.5);
      const upgradedItem: UpgradeItem = {
        ...upgradeFrom,
        value: newValue,
        name: `⬆️ ${upgradeFrom.name}`,
      };
      
      setInventory(inventory.map(item => 
        item.id === upgradeFrom.id ? upgradedItem : item
      ));
      setBalance(balance + (newValue - upgradeFrom.value));
      alert('✅ Апгрейд успешен!');
    } else {
      setInventory(inventory.filter(item => item.id !== upgradeFrom.id));
      alert('❌ Апгрейд провален!');
    }
    
    setUpgradeFrom(null);
  };

  if (!isAuthenticated) {
    return <AuthModal isOpen={true} onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold gold-text-glow">CASINO</h1>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg gold-glow">
            <Icon name="Coins" className="text-primary" size={20} />
            <span className="font-semibold text-primary">{balance}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="home" className="space-y-4 mt-0">
            <Card className="bg-gradient-to-br from-secondary to-secondary/50 p-6 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">Популярные кейсы</h2>
                  <p className="text-sm text-muted-foreground">Открой и получи призы</p>
                </div>
                <div className="text-4xl animate-pulse-gold">💰</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {cases.slice(0, 4).map((caseItem) => {
                  const isFreeCase = caseItem.isFree;
                  const showFreeTimer = isFreeCase && !canOpenFree;
                  
                  return (
                    <Card
                      key={caseItem.id}
                      className="bg-card/50 border-primary/30 hover:border-primary transition-all cursor-pointer p-4 text-center relative"
                      onClick={() => openCase(caseItem)}
                    >
                      {isFreeCase && canOpenFree && (
                        <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                          БЕСПЛАТНО
                        </Badge>
                      )}
                      <div className="text-4xl mb-2">{caseItem.image}</div>
                      <h3 className="font-semibold text-sm mb-1">{caseItem.name}</h3>
                      {showFreeTimer ? (
                        <div className="text-xs text-muted-foreground">
                          Через: {timeUntilFree}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 text-primary">
                          {isFreeCase && canOpenFree ? (
                            <span className="text-sm font-bold text-green-500">БЕСПЛАТНО</span>
                          ) : (
                            <>
                              <Icon name="Coins" size={14} />
                              <span className="text-sm font-bold">{caseItem.price}</span>
                            </>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>

            <Card className="bg-card p-4 border-primary/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="TrendingUp" className="text-primary" size={18} />
                Последние выигрыши
              </h3>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between bg-secondary/50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        👤
                      </div>
                      <span className="text-sm">Игрок #{1000 + i}</span>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/50">
                      +{(500 * i).toFixed(0)}⭐
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-4 mt-0">
            <h2 className="text-xl font-bold mb-4">Все кейсы</h2>
            <div className="grid gap-4">
              {cases.map((caseItem) => {
                const isFreeCase = caseItem.isFree;
                const showFreeTimer = isFreeCase && !canOpenFree;
                
                return (
                  <Card
                    key={caseItem.id}
                    className="bg-card border-primary/20 hover:border-primary transition-all cursor-pointer overflow-hidden relative"
                    onClick={() => openCase(caseItem)}
                  >
                    {isFreeCase && canOpenFree && (
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                        БЕСПЛАТНО
                      </Badge>
                    )}
                    <div className="flex items-center gap-4 p-4">
                      <div className="text-5xl">{caseItem.image}</div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1">{caseItem.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span>{caseItem.minPrize}⭐</span>
                          <span>-</span>
                          <span>{caseItem.maxPrize}⭐</span>
                        </div>
                        {showFreeTimer ? (
                          <div className="text-sm text-muted-foreground">
                            Доступно через: {timeUntilFree}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {isFreeCase && canOpenFree ? (
                              <span className="font-bold text-green-500">БЕСПЛАТНО</span>
                            ) : (
                              <>
                                <Icon name="Coins" className="text-primary" size={16} />
                                <span className="font-bold text-primary">{caseItem.price}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Открыть
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="upgrade" className="space-y-4 mt-0">
            <Card className="bg-gradient-to-br from-secondary to-secondary/50 p-6 border-primary/20">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Icon name="ArrowUpCircle" className="text-primary" size={24} />
                Апгрейд предметов
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Улучши свои предметы с шансом {upgradeChance}%
              </p>
              
              {!upgradeFrom ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Выбери предмет из инвентаря:</p>
                  {inventory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="Package" size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Инвентарь пуст</p>
                      <p className="text-xs">Открой кейс, чтобы получить предметы</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {inventory.map((item) => (
                        <Card
                          key={item.id}
                          className={`bg-gradient-to-r ${rarityColors[item.rarity]} p-3 cursor-pointer hover:scale-105 transition-transform`}
                          onClick={() => setUpgradeFrom(item)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{item.name}</span>
                            <span className="font-bold">{item.value}⭐</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Card className={`bg-gradient-to-r ${rarityColors[upgradeFrom.rarity]} p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{upgradeFrom.name}</span>
                      <span className="font-bold">{upgradeFrom.value}⭐</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="ArrowUp" size={16} />
                      <span>→ {Math.floor(upgradeFrom.value * 1.5)}⭐</span>
                    </div>
                  </Card>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Шанс успеха</span>
                      <span className="font-bold text-primary">{upgradeChance}%</span>
                    </div>
                    <Progress value={upgradeChance} className="h-2" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setUpgradeFrom(null)}
                    >
                      Отмена
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={performUpgrade}
                    >
                      Улучшить
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 mt-0">
            <h2 className="text-xl font-bold mb-4">Инвентарь</h2>
            {inventory.length === 0 ? (
              <Card className="bg-card p-8 text-center border-primary/20">
                <Icon name="Package" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">Инвентарь пуст</p>
                <p className="text-sm text-muted-foreground">Открой кейсы, чтобы получить предметы</p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {inventory.map((item) => (
                  <Card
                    key={item.id}
                    className={`bg-gradient-to-r ${rarityColors[item.rarity]} p-4 border-0`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{item.name}</span>
                      <Badge className="bg-black/30">{item.rarity}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{item.value}⭐</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setBalance(balance + item.value);
                          setInventory(inventory.filter(i => i.id !== item.id));
                        }}
                      >
                        Продать
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary/20 backdrop-blur-lg">
        <div className="container mx-auto max-w-md">
          <div className="flex items-center justify-around py-3">
            <Button
              variant="ghost"
              className={`flex-col h-auto gap-1 ${activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('home')}
            >
              <Icon name="Home" size={20} />
              <span className="text-xs">Главная</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex-col h-auto gap-1 ${activeTab === 'cases' ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('cases')}
            >
              <Icon name="Package" size={20} />
              <span className="text-xs">Кейсы</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex-col h-auto gap-1 ${activeTab === 'upgrade' ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('upgrade')}
            >
              <Icon name="ArrowUpCircle" size={20} />
              <span className="text-xs">Апгрейд</span>
            </Button>
            <Button
              variant="ghost"
              className={`flex-col h-auto gap-1 ${activeTab === 'inventory' ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('inventory')}
            >
              <Icon name="Backpack" size={20} />
              <span className="text-xs">Инвентарь</span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isOpening || wonItem !== null} onOpenChange={(open) => !open && setWonItem(null)}>
        <DialogContent className="bg-card border-primary/30 max-w-lg">
          {isOpening ? (
            <div className="py-6">
              <h3 className="text-xl font-bold mb-4 text-center">Открываем кейс...</h3>
              <div className="relative h-32 overflow-hidden rounded-lg bg-secondary/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-full bg-primary z-10"></div>
                </div>
                <div className="flex gap-2 py-4 animate-roulette">
                  {rouletteItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg bg-gradient-to-br ${rarityColors[item.rarity]} flex flex-col items-center justify-center p-1 gap-0.5`}
                    >
                      <div className="text-2xl">{item.image}</div>
                      <div className="text-[10px] font-semibold text-center leading-tight">{item.name}</div>
                      <div className="text-xs font-bold text-primary-foreground">{item.price}⭐</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : wonItem ? (
            <div className="text-center py-6">
              <DialogHeader>
                <DialogTitle className="text-2xl mb-4">Поздравляем! 🎉</DialogTitle>
              </DialogHeader>
              <Card className={`bg-gradient-to-br ${rarityColors[wonItem.rarity]} p-6 mb-4 gold-glow`}>
                <div className="text-5xl mb-3">{wonItem.image}</div>
                <h3 className="text-xl font-bold mb-2">{wonItem.name}</h3>
                <div className="text-2xl font-bold">{wonItem.price}⭐</div>
              </Card>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setWonItem(null)}
              >
                Забрать
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;