import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AuthModal from '@/components/AuthModal';
import HomeTab from '@/components/casino/HomeTab';
import CasesTab from '@/components/casino/CasesTab';
import UpgradeTab from '@/components/casino/UpgradeTab';
import InventoryTab from '@/components/casino/InventoryTab';
import BottomNavigation from '@/components/casino/BottomNavigation';
import CaseOpenDialog from '@/components/casino/CaseOpenDialog';
import { CaseItem, UpgradeItem, CaseType, caseItems, cases } from '@/components/casino/types';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [balance, setBalance] = useState(1000);
  const [selectedCase, setSelectedCase] = useState<CaseType | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [rouletteItems, setRouletteItems] = useState<CaseItem[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [wonItem, setWonItem] = useState<CaseItem | null>(null);
  const [inventory, setInventory] = useState<UpgradeItem[]>([]);
  const [upgradeFrom, setUpgradeFrom] = useState<UpgradeItem | null>(null);
  const [upgradeChance] = useState(50);
  const [lastFreeOpen, setLastFreeOpen] = useState<number | null>(null);
  const [timeUntilFree, setTimeUntilFree] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const playTickSound = () => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  };

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

  const openCase = (caseData: CaseType) => {
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

    const items = Array.from({ length: 60 }, () => generateRandomItem());
    const winningIndex = Math.floor(items.length / 2);
    items[winningIndex] = generateRandomItem();
    setRouletteItems(items);

    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
    }

    playTickSound();

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
    }, 7000);
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
            <HomeTab 
              cases={cases}
              openCase={openCase}
              canOpenFree={canOpenFree}
              timeUntilFree={timeUntilFree}
            />
          </TabsContent>

          <TabsContent value="cases" className="space-y-4 mt-0">
            <CasesTab 
              cases={cases}
              openCase={openCase}
              canOpenFree={canOpenFree}
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

      <CaseOpenDialog 
        isOpening={isOpening}
        wonItem={wonItem}
        selectedCase={selectedCase}
        rouletteItems={rouletteItems}
        setWonItem={setWonItem}
      />
    </div>
  );
};

export default Index;