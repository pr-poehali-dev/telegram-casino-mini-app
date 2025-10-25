import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import BoxesTab from '@/components/casino/BoxesTab';
import UpgradeTab from '@/components/casino/UpgradeTab';
import InventoryTab from '@/components/casino/InventoryTab';
import BottomNavigation from '@/components/casino/BottomNavigation';
import BoxOpenDialog from '@/components/casino/BoxOpenDialog';
import { UpgradeItem, BoxType, boxes } from '@/components/casino/types';

const Index = () => {
  const [activeTab, setActiveTab] = useState('boxes');
  const [balance, setBalance] = useState(1000);
  const [inventory, setInventory] = useState<UpgradeItem[]>([]);
  const [upgradeFrom, setUpgradeFrom] = useState<UpgradeItem | null>(null);
  const [upgradeChance] = useState(50);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [lastFreeOpen, setLastFreeOpen] = useState<number | null>(null);
  const [timeUntilFree, setTimeUntilFree] = useState<string>('');
  const [selectedBox, setSelectedBox] = useState<BoxType | null>(null);
  const [wonItem, setWonItem] = useState<UpgradeItem | null>(null);
  const [isBoxDialogOpen, setIsBoxDialogOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setBalance(userData.balance || 1000);
      setInventory(userData.inventory || []);
      setLastFreeOpen(userData.lastFreeOpen || null);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      users[user.email] = {
        ...users[user.email],
        balance,
        inventory,
        lastFreeOpen,
      };
      localStorage.setItem('users', JSON.stringify(users));
      
      const currentUser = {
        ...user,
        balance,
        inventory,
        lastFreeOpen,
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [balance, inventory, lastFreeOpen, user]);

  useEffect(() => {
    if (!lastFreeOpen) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const timePassed = now - lastFreeOpen;
      const timeLeft = 24 * 60 * 60 * 1000 - timePassed;
      
      if (timeLeft <= 0) {
        setTimeUntilFree('Доступен!');
      } else {
        const hours = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        setTimeUntilFree(`${hours}ч ${minutes}м`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastFreeOpen]);

  const handleAuthSuccess = (data: any) => {
    setUser(data.user);
    setBalance(data.user.balance || 1000);
    setInventory(data.user.inventory || []);
    setLastFreeOpen(data.user.lastFreeOpen || null);
    setIsAuthenticated(true);
  };

  const openBox = (box: BoxType) => {
    if (box.isFree) {
      const canOpen = !lastFreeOpen || (Date.now() - lastFreeOpen) >= 24 * 60 * 60 * 1000;
      if (!canOpen) {
        alert('⏰ Бесплатный бокс будет доступен через: ' + timeUntilFree);
        return;
      }
      setLastFreeOpen(Date.now());
    } else {
      if (balance < box.price) {
        alert('❌ Недостаточно звёзд!');
        return;
      }
      setBalance(balance - box.price);
    }

    const prize = Math.floor(Math.random() * (box.maxPrize - box.minPrize + 1)) + box.minPrize;
    
    const rarities: Array<'common' | 'rare' | 'epic' | 'legendary'> = ['common', 'rare', 'epic', 'legendary'];
    const rarity = prize > box.maxPrize * 0.8 ? 'legendary' : 
                   prize > box.maxPrize * 0.6 ? 'epic' : 
                   prize > box.maxPrize * 0.4 ? 'rare' : 'common';
    
    const newItem: UpgradeItem = {
      id: Date.now(),
      name: `Приз из ${box.name}`,
      value: prize,
      rarity: rarity,
    };
    
    setInventory([...inventory, newItem]);
    setSelectedBox(box);
    setWonItem(newItem);
    setIsBoxDialogOpen(true);
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

  const sellItem = (item: UpgradeItem) => {
    setInventory(inventory.filter(i => i.id !== item.id));
    setBalance(balance + item.value);
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setUser(null);
    setBalance(1000);
    setInventory([]);
    setLastFreeOpen(null);
  };

  if (!isAuthenticated) {
    return <AuthModal isOpen={true} onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🦆</span>
            <h1 className="text-2xl font-bold gold-text-glow">DuckCasino</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg gold-glow">
              <Icon name="Coins" className="text-primary" size={20} />
              <span className="font-semibold text-primary">{balance}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-primary"
            >
              <Icon name="LogOut" size={20} />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="boxes" className="space-y-4 mt-0">
            <BoxesTab 
              balance={balance}
              onOpenBox={openBox}
              lastFreeOpen={lastFreeOpen}
              timeUntilFree={timeUntilFree}
            />
          </TabsContent>

          <TabsContent value="upgrade" className="space-y-4 mt-0">
            <UpgradeTab 
              upgradeFrom={upgradeFrom}
              setUpgradeFrom={setUpgradeFrom}
              inventory={inventory}
              upgradeChance={upgradeChance}
              performUpgrade={performUpgrade}
            />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 mt-0">
            <InventoryTab 
              inventory={inventory}
              sellItem={sellItem}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <BoxOpenDialog 
        isOpen={isBoxDialogOpen}
        box={selectedBox}
        wonItem={wonItem}
        onClose={() => setIsBoxDialogOpen(false)}
      />
    </div>
  );
};

export default Index;
