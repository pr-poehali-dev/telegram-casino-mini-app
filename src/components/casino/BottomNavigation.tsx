import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, setActiveTab }: BottomNavigationProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary/20 backdrop-blur-lg">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center justify-around py-3">
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
  );
};

export default BottomNavigation;
