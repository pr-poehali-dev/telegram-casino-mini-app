import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { TabsContent } from '@/components/ui/tabs';
import { UpgradeItem, rarityColors } from './types';

interface InventoryTabProps {
  inventory: UpgradeItem[];
  balance: number;
  setBalance: (balance: number) => void;
  setInventory: (inventory: UpgradeItem[]) => void;
}

const InventoryTab = ({ inventory, balance, setBalance, setInventory }: InventoryTabProps) => {
  return (
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
  );
};

export default InventoryTab;
