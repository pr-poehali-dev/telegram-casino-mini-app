import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import UpgradeTab from '@/components/casino/UpgradeTab';
import InventoryTab from '@/components/casino/InventoryTab';
import BottomNavigation from '@/components/casino/BottomNavigation';
import { UpgradeItem } from '@/components/casino/types';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upgrade');
  const [balance, setBalance] = useState(1000);
  const [inventory, setInventory] = useState<UpgradeItem[]>([]);
  const [upgradeFrom, setUpgradeFrom] = useState<UpgradeItem | null>(null);
  const [upgradeChance] = useState(50);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setBalance(userData.balance);
      setInventory(userData.inventory || []);
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
      };
      localStorage.setItem('users', JSON.stringify(users));
      
      const currentUser = {
        ...user,
        balance,
        inventory,
      };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [balance, inventory, user]);

  const handleAuthSuccess = (data: any) => {
    setUser(data.user);
    setBalance(data.user.balance);
    setInventory(data.user.inventory || []);
    setIsAuthenticated(true);
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
    </div>
  );
};

export default Index;
