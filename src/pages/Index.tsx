import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const cases = [
  { id: 1, name: 'Стартовый кейс', price: 100, minPrize: 50, maxPrize: 500, image: '💎' },
  { id: 2, name: 'Золотой кейс', price: 500, minPrize: 250, maxPrize: 2500, image: '👑' },
  { id: 3, name: 'Легендарный кейс', price: 1000, minPrize: 500, maxPrize: 10000, image: '⭐' },
  { id: 4, name: 'NFT кейс', price: 2000, minPrize: 1000, maxPrize: 50000, image: '🎨' },
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
  const [wonItem, setWonItem] = useState<CaseItem | null>(null);
  const [inventory, setInventory] = useState<UpgradeItem[]>([]);
  const [upgradeFrom, setUpgradeFrom] = useState<UpgradeItem | null>(null);
  const [upgradeChance, setUpgradeChance] = useState(50);

  const openCase = (caseData: typeof cases[0]) => {
    if (balance < caseData.price) {
      alert('Недостаточно средств!');
      return;
    }
    
    setSelectedCase(caseData);
    setIsOpening(true);
    setBalance(balance - caseData.price);

    setTimeout(() => {
      const rarityRoll = Math.random();
      let rarity: CaseItem['rarity'];
      if (rarityRoll < 0.5) rarity = 'common';
      else if (rarityRoll < 0.8) rarity = 'rare';
      else if (rarityRoll < 0.95) rarity = 'epic';
      else rarity = 'legendary';

      const prizeValue = Math.floor(
        Math.random() * (caseData.maxPrize - caseData.minPrize) + caseData.minPrize
      );

      const newItem: CaseItem = {
        id: Date.now(),
        name: `${rarity === 'legendary' ? '⭐ ' : ''}Приз ${prizeValue}`,
        price: prizeValue,
        image: caseData.image,
        rarity,
      };

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
                {cases.slice(0, 4).map((caseItem) => (
                  <Card
                    key={caseItem.id}
                    className="bg-card/50 border-primary/30 hover:border-primary transition-all cursor-pointer p-4 text-center"
                    onClick={() => openCase(caseItem)}
                  >
                    <div className="text-4xl mb-2">{caseItem.image}</div>
                    <h3 className="font-semibold text-sm mb-1">{caseItem.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <Icon name="Coins" size={14} />
                      <span className="text-sm font-bold">{caseItem.price}</span>
                    </div>
                  </Card>
                ))}
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
              {cases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className="bg-card border-primary/20 hover:border-primary transition-all cursor-pointer overflow-hidden"
                  onClick={() => openCase(caseItem)}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="text-5xl">{caseItem.image}</div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{caseItem.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>{caseItem.minPrize}⭐</span>
                        <span>-</span>
                        <span>{caseItem.maxPrize}⭐</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Coins" className="text-primary" size={16} />
                        <span className="font-bold text-primary">{caseItem.price}</span>
                      </div>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Открыть
                    </Button>
                  </div>
                </Card>
              ))}
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
        <DialogContent className="bg-card border-primary/30">
          {isOpening ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 animate-spin-slow">{selectedCase?.image}</div>
              <h3 className="text-xl font-bold mb-2">Открываем кейс...</h3>
              <Progress value={66} className="w-full" />
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
