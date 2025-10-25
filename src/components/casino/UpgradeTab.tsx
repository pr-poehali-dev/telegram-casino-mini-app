import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { TabsContent } from '@/components/ui/tabs';
import { UpgradeItem, rarityColors } from './types';

interface UpgradeTabProps {
  inventory: UpgradeItem[];
  upgradeFrom: UpgradeItem | null;
  upgradeChance: number;
  setUpgradeFrom: (item: UpgradeItem | null) => void;
  performUpgrade: () => void;
}

const UpgradeTab = ({
  inventory,
  upgradeFrom,
  upgradeChance,
  setUpgradeFrom,
  performUpgrade,
}: UpgradeTabProps) => {
  return (
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
  );
};

export default UpgradeTab;
