import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { TabsContent } from '@/components/ui/tabs';
import { cases } from './types';

interface CasesTabProps {
  canOpenFree: boolean;
  timeUntilFree: string;
  openCase: (caseData: typeof cases[0]) => void;
}

const CasesTab = ({ canOpenFree, timeUntilFree, openCase }: CasesTabProps) => {
  return (
    <TabsContent value="cases" className="space-y-4 mt-0">
      <h2 className="text-xl font-bold mb-4">Все кейсы</h2>
      <div className="grid gap-4">
        {cases.map((caseItem) => {
          const isFreeCase = caseItem.isFree;
          const showFreeTimer = isFreeCase && !canOpenFree;
          
          return (
            <Card
              key={caseItem.id}
              className="bg-card border-primary/20 hover:border-primary transition-all cursor-pointer overflow-hidden relative"
              onClick={() => openCase(caseItem)}
            >
              {isFreeCase && canOpenFree && (
                <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                  БЕСПЛАТНО
                </Badge>
              )}
              <div className="flex items-center gap-4 p-4">
                <div className="text-5xl">{caseItem.image}</div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{caseItem.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>{caseItem.minPrize}⭐</span>
                    <span>-</span>
                    <span>{caseItem.maxPrize}⭐</span>
                  </div>
                  {showFreeTimer ? (
                    <div className="text-sm text-muted-foreground">
                      Доступно через: {timeUntilFree}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isFreeCase && canOpenFree ? (
                        <span className="font-bold text-green-500">БЕСПЛАТНО</span>
                      ) : (
                        <>
                          <Icon name="Coins" className="text-primary" size={16} />
                          <span className="font-bold text-primary">{caseItem.price}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Открыть
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </TabsContent>
  );
};

export default CasesTab;
