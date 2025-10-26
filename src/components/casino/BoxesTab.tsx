import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { BoxType, boxes } from './types';

interface BoxesTabProps {
  balance: number;
  onOpenBox: (box: BoxType) => void;
  lastFreeOpen: number | null;
  timeUntilFree: string;
}

const BoxesTab = ({ balance, onOpenBox, lastFreeOpen, timeUntilFree }: BoxesTabProps) => {
  const canOpenFree = !lastFreeOpen || (Date.now() - lastFreeOpen) >= 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold gold-text-glow">🎰 Боксы удачи</h2>
        <p className="text-sm text-muted-foreground">Открывай боксы и получай ценные призы!</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {boxes.map((box) => {
          const canAfford = balance >= box.price;
          const isDisabled = box.isFree ? !canOpenFree : !canAfford;

          return (
            <Card key={box.id} className="p-4 bg-card/50 backdrop-blur border-primary/20 gold-glow">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{box.emoji}</div>
                
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-lg">{box.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="TrendingUp" size={14} />
                    <span>Призы: {box.minPrize} - {box.maxPrize} ⭐</span>
                  </div>
                  
                  {box.isFree ? (
                    <div className="flex items-center gap-1 text-sm">
                      {canOpenFree ? (
                        <span className="text-green-500 font-semibold">✅ Доступен!</span>
                      ) : (
                        <span className="text-orange-500">⏰ {timeUntilFree}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                      <Icon name="Coins" size={14} />
                      <span>{box.price} звёзд</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => onOpenBox(box)}
                  disabled={isDisabled}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {box.isFree ? 'Открыть' : 'Купить'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-card/30 border-primary/10">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="text-primary mt-1" size={20} />
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Бесплатный бокс:</strong> Один раз в 24 часа с подпиской</p>
            <p><strong className="text-foreground">Окупаемость:</strong> В среднем 50% от стоимости бокса</p>
            <p><strong className="text-foreground">Шанс джекпота:</strong> 10% на крупный приз</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BoxesTab;