import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { TabsContent } from '@/components/ui/tabs';
import { cases } from './types';

interface HomeTabProps {
  canOpenFree: boolean;
  timeUntilFree: string;
  openCase: (caseData: typeof cases[0]) => void;
}

const HomeTab = ({ canOpenFree, timeUntilFree, openCase }: HomeTabProps) => {
  return (
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
          {cases.slice(0, 4).map((caseItem) => {
            const isFreeCase = caseItem.isFree;
            const showFreeTimer = isFreeCase && !canOpenFree;
            
            return (
              <Card
                key={caseItem.id}
                className="bg-card/50 border-primary/30 hover:border-primary transition-all cursor-pointer p-4 text-center relative"
                onClick={() => openCase(caseItem)}
              >
                {isFreeCase && canOpenFree && (
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                    БЕСПЛАТНО
                  </Badge>
                )}
                <div className="text-4xl mb-2">{caseItem.image}</div>
                <h3 className="font-semibold text-sm mb-1">{caseItem.name}</h3>
                {showFreeTimer ? (
                  <div className="text-xs text-muted-foreground">
                    Через: {timeUntilFree}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-primary">
                    {isFreeCase && canOpenFree ? (
                      <span className="text-sm font-bold text-green-500">БЕСПЛАТНО</span>
                    ) : (
                      <>
                        <Icon name="Coins" size={14} />
                        <span className="text-sm font-bold">{caseItem.price}</span>
                      </>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
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
  );
};

export default HomeTab;
