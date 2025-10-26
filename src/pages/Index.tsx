import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import BoxesTab from '@/components/casino/BoxesTab';
import MinerTab from '@/components/casino/MinerTab';
import UpgradeTab from '@/components/casino/UpgradeTab';
import InventoryTab from '@/components/casino/InventoryTab';
import ProfileTab from '@/components/casino/ProfileTab';
import WalletTab from '@/components/casino/WalletTab';
import AdminTab from '@/components/casino/AdminTab';
import BottomNavigation from '@/components/casino/BottomNavigation';
import BoxOpenDialog from '@/components/casino/BoxOpenDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { UpgradeItem, BoxType, boxes } from '@/components/casino/types';

const Index = () => {
  const [activeTab, setActiveTab] = useState('boxes');
  const [balance, setBalance] = useState(1000);
  const [inventory, setInventory] = useState<UpgradeItem[]>([]);
  const [upgradeFrom, setUpgradeFrom] = useState<UpgradeItem | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [lastFreeOpen, setLastFreeOpen] = useState<number | null>(null);
  const [timeUntilFree, setTimeUntilFree] = useState<string>('');
  const [selectedBox, setSelectedBox] = useState<BoxType | null>(null);
  const [wonItem, setWonItem] = useState<UpgradeItem | null>(null);
  const [isBoxDialogOpen, setIsBoxDialogOpen] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [telegramUserId, setTelegramUserId] = useState<number | null>(null);
  const [isTelegramUser, setIsTelegramUser] = useState(false);
  const BOT_USERNAME = 'DuckCasinoMiniBot'; // Замени на свой username бота
  const ADMIN_PASSWORD = 'admin2025';
  const CHANNEL_URL = 'https://t.me/tgDuckCasino';
  const CHECK_SUBSCRIPTION_URL = 'https://functions.poehali.dev/71badaea-20b7-4e06-b88d-f58b43731c3f';

  useEffect(() => {
    const initTelegramAuth = async () => {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        if (tg.initDataUnsafe?.user) {
          const telegramUser = tg.initDataUnsafe.user;
          setTelegramUserId(telegramUser.id);
          setIsTelegramUser(true);
          
          try {
            const response = await fetch('https://functions.poehali.dev/48711fed-189d-4b70-b667-b7fbff222c1a', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                telegram_id: telegramUser.id,
                username: telegramUser.username || '',
                first_name: telegramUser.first_name || '',
                last_name: telegramUser.last_name || '',
                photo_url: telegramUser.photo_url || '',
              }),
            });
            
            const data = await response.json();
            
            if (data.user) {
              setUser(data.user);
              setBalance(data.user.balance);
              setInventory(data.inventory || []);
              setLastFreeOpen(data.last_free_open ? new Date(data.last_free_open).getTime() : null);
              setIsAuthenticated(true);
            }
          } catch (error) {
            console.error('Auth error:', error);
          }
        } else {
          // Если открыто не из Telegram - создаём тестового пользователя
          const testUserId = Math.floor(Math.random() * 1000000);
          try {
            const response = await fetch('https://functions.poehali.dev/48711fed-189d-4b70-b667-b7fbff222c1a', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                telegram_id: testUserId,
                username: 'test_user',
                first_name: 'Гость',
                last_name: '',
                photo_url: '',
              }),
            });
            
            const data = await response.json();
            
            if (data.user) {
              setUser(data.user);
              setBalance(data.user.balance);
              setInventory(data.inventory || []);
              setLastFreeOpen(data.last_free_open ? new Date(data.last_free_open).getTime() : null);
              setIsAuthenticated(true);
              setIsTelegramUser(false);
            }
          } catch (error) {
            console.error('Test user auth error:', error);
          }
        }
      }
    };
    
    initTelegramAuth();
  }, []);



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



  const openBox = (box: BoxType) => {
    if (!isTelegramUser) {
      alert('❌ Эта функция доступна только в Telegram!');
      return;
    }
    
    if (box.isFree) {
      const canOpen = !lastFreeOpen || (Date.now() - lastFreeOpen) >= 24 * 60 * 60 * 1000;
      if (!canOpen) {
        alert('⏰ Бесплатный бокс будет доступен через: ' + timeUntilFree);
        return;
      }
      
      // Check subscription
      const hasSubscribed = localStorage.getItem('subscribed_to_channel');
      if (!hasSubscribed) {
        setShowSubscribeDialog(true);
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

  const performUpgrade = (multiplier: number) => {
    if (!isTelegramUser) {
      alert('❌ Эта функция доступна только в Telegram!');
      return;
    }
    if (!upgradeFrom) return;
    
    const baseChance = 70;
    const reduction = (multiplier - 1.5) * 40;
    const upgradeChance = Math.max(5, Math.round(baseChance - reduction));
    
    const success = Math.random() * 100 < upgradeChance;
    
    if (success) {
      const newValue = Math.floor(upgradeFrom.value * multiplier);
      const upgradedItem: UpgradeItem = {
        ...upgradeFrom,
        value: newValue,
        name: `⬆️ ${upgradeFrom.name}`,
      };
      
      setInventory(inventory.map(item => 
        item.id === upgradeFrom.id ? upgradedItem : item
      ));
      alert('✅ Апгрейд успешен!');
    } else {
      setInventory(inventory.filter(item => item.id !== upgradeFrom.id));
      alert('❌ Апгрейд провален!');
    }
    
    setUpgradeFrom(null);
  };

  const logout = () => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.close();
    }
    setIsAuthenticated(false);
    setUser(null);
    setBalance(1000);
    setInventory([]);
    setLastFreeOpen(null);
    setIsAdmin(false);
    setActiveTab('boxes');
  };

  const checkAdminPassword = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setActiveTab('admin');
      setShowAdminPrompt(false);
      setAdminPassword('');
    } else {
      alert('❌ Неверный пароль!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🦆</div>
          <h1 className="text-2xl font-bold gold-text-glow">DuckCasino</h1>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не из Telegram - показываем предупреждение
  if (!isTelegramUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🦆</div>
            <h1 className="text-2xl font-bold gold-text-glow">DuckCasino</h1>
            <div className="bg-card border border-primary/30 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" className="text-yellow-500 mt-1" size={24} />
                <div className="text-left space-y-2">
                  <p className="font-semibold text-lg">Требуется Telegram</p>
                  <p className="text-sm text-muted-foreground">
                    Для игры в DuckCasino нужно открыть приложение через Telegram бота.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Только пользователи Telegram могут открывать кейсы, играть в майнер и апгрейды!
                  </p>
                </div>
              </div>
              <Button 
                className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold"
                onClick={() => window.open(`https://t.me/${BOT_USERNAME}`, '_blank')}
              >
                <Icon name="Send" className="mr-2" size={20} />
                Открыть в Telegram
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Демо-режим недоступен. Весь функционал работает только в Telegram.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🦆</span>
              <h1 className="text-2xl font-bold gold-text-glow flex items-center gap-2">
                DuckCasino
                <span className="inline-flex items-center justify-center w-5 h-5 bg-white rounded-full">
                  <Icon name="Check" size={14} className="text-black" strokeWidth={3} />
                </span>
              </h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowAdminPrompt(true)}
              className="text-muted-foreground hover:text-red-500"
              title="Админ панель"
            >
              <Icon name="ShieldAlert" size={20} />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border border-primary/20">
              <Icon name="User" className="text-muted-foreground" size={16} />
              <span className="font-mono font-bold text-sm text-primary">{user?.id}</span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg gold-glow flex-1">
              <Icon name="Coins" className="text-primary" size={20} />
              <span className="font-semibold text-primary">{balance}</span>
            </div>
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

          <MinerTab 
            balance={balance}
            setBalance={setBalance}
          />

          <TabsContent value="upgrade" className="space-y-4 mt-0">
            <UpgradeTab 
              upgradeFrom={upgradeFrom}
              setUpgradeFrom={setUpgradeFrom}
              inventory={inventory}
              performUpgrade={performUpgrade}
            />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 mt-0">
            <InventoryTab 
              inventory={inventory}
              balance={balance}
              setBalance={setBalance}
              setInventory={setInventory}
            />
          </TabsContent>

          <WalletTab
            balance={balance}
            setBalance={setBalance}
          />

          <ProfileTab
            user={user}
            balance={balance}
            inventory={inventory}
            onLogout={logout}
          />

          {isAdmin && (
            <AdminTab onClose={() => {
              setIsAdmin(false);
              setActiveTab('boxes');
            }} />
          )}
        </Tabs>
      </div>

      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <BoxOpenDialog 
        isOpen={isBoxDialogOpen}
        box={selectedBox}
        wonItem={wonItem}
        onClose={() => setIsBoxDialogOpen(false)}
      />

      <Dialog open={showAdminPrompt} onOpenChange={setShowAdminPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="ShieldAlert" className="text-red-500" size={24} />
              Админ панель
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Пароль</label>
              <Input
                type="password"
                placeholder="Введи пароль администратора"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAdminPassword()}
              />
            </div>
            <Button onClick={checkAdminPassword} className="w-full bg-red-600 hover:bg-red-700">
              Войти
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <span className="text-2xl">💎</span>
              Подпишись на канал
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Чтобы открыть <strong className="text-primary">Бесплатный бокс</strong>, подпишись на наш Telegram канал
            </p>
            
            <div className="bg-card p-4 rounded-lg border border-primary/20 text-center">
              <Icon name="Bell" className="mx-auto mb-2 text-primary" size={32} />
              <p className="text-sm text-muted-foreground">Узнавай первым о бонусах и акциях!</p>
            </div>

            <Button 
              onClick={() => window.open(CHANNEL_URL, '_blank')}
              className="w-full bg-[#0088cc] hover:bg-[#0088cc]/90"
              size="lg"
            >
              <Icon name="Send" size={20} className="mr-2" />
              Перейти в Telegram
            </Button>

            <Button
              onClick={async () => {
                if (!telegramUserId) {
                  // Fallback for non-Telegram users
                  localStorage.setItem('subscribed_to_channel', 'true');
                  setShowSubscribeDialog(false);
                  alert('✅ Спасибо за подписку!');
                  return;
                }
                
                setIsCheckingSubscription(true);
                try {
                  const response = await fetch(`${CHECK_SUBSCRIPTION_URL}?user_id=${telegramUserId}`);
                  const data = await response.json();
                  
                  if (data.subscribed) {
                    localStorage.setItem('subscribed_to_channel', 'true');
                    setShowSubscribeDialog(false);
                    alert('✅ Подписка подтверждена! Теперь можешь открыть бокс');
                  } else {
                    alert('❌ Подписка не найдена. Подпишись на канал и попробуй снова');
                  }
                } catch (error) {
                  alert('❌ Ошибка проверки. Попробуй позже');
                } finally {
                  setIsCheckingSubscription(false);
                }
              }}
              variant="outline"
              className="w-full"
              disabled={isCheckingSubscription}
            >
              {isCheckingSubscription ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                  Проверяю...
                </>
              ) : (
                'Я подписался!'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;