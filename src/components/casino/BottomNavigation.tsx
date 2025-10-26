import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { playButtonSound } from '@/utils/sounds';

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, setActiveTab }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary/20 backdrop-blur-lg">
      <div className="container mx-auto max-w-md">
        <div className="grid grid-cols-6 gap-1 py-2 px-2">
          <Button
            variant="ghost"
            className={`flex-col h-auto gap-1 py-2 ${activeTab === 'boxes' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => {
              playButtonSound();
              setActiveTab('boxes');
            }}
          >
            <Icon name="Package" size={18} />
            <span className="text-xs">Боксы</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-col h-auto gap-1 py-2 ${activeTab === 'miner' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => {
              playButtonSound();
              setActiveTab('miner');
            }}
          >
            <span className="text-lg">💣</span>
            <span className="text-xs">Минёр</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-col h-auto gap-1 py-2 ${activeTab === 'upgrade' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => {
              playButtonSound();
              setActiveTab('upgrade');
            }}
          >
            <Icon name="ArrowUpCircle" size={18} />
            <span className="text-xs">Улучш.</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-col h-auto gap-1 py-2 ${activeTab === 'wallet' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => {
              playButtonSound();
              setActiveTab('wallet');
            }}
          >
            <Icon name="Wallet" size={18} />
            <span className="text-xs">Кошелёк</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-col h-auto gap-1 py-2 ${activeTab === 'inventory' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => {
              playButtonSound();
              setActiveTab('inventory');
            }}
          >
            <Icon name="Backpack" size={18} />
            <span className="text-xs">Инвент.</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-col h-auto gap-1 py-2 ${activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => {
              playButtonSound();
              setActiveTab('profile');
            }}
          >
            <Icon name="User" size={18} />
            <span className="text-xs">Профиль</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;