import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { CaseItem, CaseType, rarityColors } from './types';

interface CaseOpenDialogProps {
  isOpening: boolean;
  wonItem: CaseItem | null;
  selectedCase: CaseType | null;
  rouletteItems: CaseItem[];
  setWonItem: (item: CaseItem | null) => void;
}

const CaseOpenDialog = ({ isOpening, wonItem, rouletteItems, setWonItem }: CaseOpenDialogProps) => {
  return (
    <Dialog open={isOpening || wonItem !== null} onOpenChange={(open) => !open && setWonItem(null)}>
      <DialogContent className="bg-card border-primary/30 max-w-lg">
        {isOpening ? (
          <div className="py-6">
            <h3 className="text-xl font-bold mb-4 text-center gold-text-glow">Открываем кейс...</h3>
            <div className="relative mb-4">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                <div className="flex flex-col items-center">
                  <div className="text-3xl animate-bounce">▼</div>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
                <div className="flex flex-col items-center">
                  <div className="text-3xl animate-bounce" style={{ animationDelay: '0.15s' }}>▲</div>
                </div>
              </div>
              <div className="relative h-32 overflow-hidden rounded-lg bg-gradient-to-b from-secondary/30 via-secondary/50 to-secondary/30 border-2 border-primary/20">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(255,215,0,0.5)]"></div>
                </div>
                <div className="flex gap-2 py-4 pl-[calc(50%-52px)] animate-roulette">
                  {rouletteItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg bg-gradient-to-br ${rarityColors[item.rarity]} flex flex-col items-center justify-center p-1 gap-0.5 border-2 border-white/30 shadow-lg transition-transform hover:scale-105`}
                    >
                      <div className="text-2xl">{item.image}</div>
                      <div className="text-[9px] font-bold text-center leading-tight text-white drop-shadow-md">{item.name}</div>
                      <div className="text-xs font-bold text-white bg-black/30 px-1.5 py-0.5 rounded">{item.price}⭐</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground animate-pulse">Удача решает всё...</p>
          </div>
        ) : wonItem ? (
          <div className="text-center py-6">
            <DialogHeader>
              <DialogTitle className="text-2xl mb-4">Поздравляем! 🎉</DialogTitle>
            </DialogHeader>
            <Card className={`bg-gradient-to-br ${rarityColors[wonItem.rarity]} p-6 mb-4 gold-glow`}>
              <div className="text-5xl mb-3">{wonItem.image}</div>
              <h3 className="text-xl font-bold mb-2">{wonItem.name}</h3>
              <div className="text-2xl font-bold">{wonItem.price}⭐</div>
            </Card>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setWonItem(null)}
            >
              Забрать
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default CaseOpenDialog;
