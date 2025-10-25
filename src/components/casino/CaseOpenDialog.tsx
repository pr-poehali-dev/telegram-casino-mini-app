import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent className="bg-card border-primary/30 max-w-2xl">
        {isOpening ? (
          <div className="py-8">
            <h3 className="text-2xl font-bold mb-6 text-center gold-text-glow">Открываем кейс...</h3>
            <div className="relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-20 mb-2">
                <div className="text-4xl text-primary drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">▼</div>
              </div>
              
              <div className="relative h-40 overflow-hidden rounded-xl bg-black/60 border-2 border-primary/40">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-0.5 h-full bg-primary shadow-[0_0_30px_10px_rgba(255,215,0,0.6)]"></div>
                </div>
                
                <div className="absolute left-0 right-0 top-0 bottom-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none z-10"></div>
                
                <div className="flex gap-3 py-6 animate-roulette" style={{ paddingLeft: 'calc(50% - 60px)' }}>
                  {rouletteItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex-shrink-0 w-28 h-28 rounded-xl bg-gradient-to-br ${rarityColors[item.rarity]} flex flex-col items-center justify-center p-2 border-2 border-white/40 shadow-2xl`}
                    >
                      <div className="text-3xl mb-1">{item.image}</div>
                      <div className="text-[10px] font-bold text-center leading-tight text-white drop-shadow-lg">{item.name}</div>
                      <div className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded mt-1">{item.price}⭐</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full z-20 mt-2">
                <div className="text-4xl text-primary drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">▲</div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6 animate-pulse">Удача решает всё...</p>
          </div>
        ) : wonItem ? (
          <div className="text-center py-8">
            <DialogHeader>
              <DialogTitle className="text-3xl mb-6 gold-text-glow">Поздравляем! 🎉</DialogTitle>
            </DialogHeader>
            <Card className={`bg-gradient-to-br ${rarityColors[wonItem.rarity]} p-8 mb-6 gold-glow border-2 border-white/30`}>
              <div className="text-6xl mb-4">{wonItem.image}</div>
              <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">{wonItem.name}</h3>
              <div className="text-3xl font-bold text-white bg-black/30 inline-block px-4 py-2 rounded-lg">{wonItem.price}⭐</div>
            </Card>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6"
              onClick={() => setWonItem(null)}
            >
              Забрать приз
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default CaseOpenDialog;
