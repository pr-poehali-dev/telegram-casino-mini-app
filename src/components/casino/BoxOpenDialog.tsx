import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BoxType, UpgradeItem } from './types';

interface BoxOpenDialogProps {
  isOpen: boolean;
  box: BoxType | null;
  wonItem: UpgradeItem | null;
  onClose: () => void;
}

const BoxOpenDialog = ({ isOpen, box, wonItem, onClose }: BoxOpenDialogProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [items, setItems] = useState<Array<{value: number, rarity: string}>>([]);

  useEffect(() => {
    if (isOpen && wonItem && box) {
      const generatedItems = [];
      for (let i = 0; i < 30; i++) {
        const value = Math.floor(Math.random() * (box.maxPrize - box.minPrize + 1)) + box.minPrize;
        const rarity = value > box.maxPrize * 0.75 ? 'legendary' : 
                       value > box.maxPrize * 0.55 ? 'epic' : 
                       value > box.maxPrize * 0.35 ? 'rare' : 'common';
        generatedItems.push({ value, rarity });
      }
      const winIndex = 25;
      generatedItems[winIndex] = { value: wonItem.value, rarity: wonItem.rarity };
      setItems(generatedItems);
      
      setIsAnimating(true);
      setRotationDeg(0);
      
      setTimeout(() => {
        const targetRotation = (winIndex * 100) + 50 + 3600;
        setRotationDeg(targetRotation);
      }, 100);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, wonItem, box]);

  if (!box) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {box.emoji} {box.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-8 space-y-6">
          {isAnimating ? (
            <div className="relative w-full overflow-hidden" style={{ height: '200px' }}>
              <div className="absolute left-1/2 top-1/2 w-1 h-full bg-primary/50 z-10" style={{ transform: 'translateX(-50%)' }} />
              <div 
                className="flex gap-2 absolute left-0 top-1/2 transition-transform"
                style={{
                  transform: `translate(calc(50% - 50px), -50%) translateX(-${rotationDeg}px)`,
                  transitionDuration: '3.5s',
                  transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                }}
              >
                {items.map((item, idx) => {
                  const bgColor = item.rarity === 'legendary' ? 'from-yellow-500 to-orange-500' :
                                  item.rarity === 'epic' ? 'from-purple-500 to-pink-500' :
                                  item.rarity === 'rare' ? 'from-blue-500 to-cyan-500' : 'from-gray-500 to-gray-600';
                  return (
                    <div
                      key={idx}
                      className={`flex-shrink-0 w-24 h-32 bg-gradient-to-br ${bgColor} rounded-lg flex flex-col items-center justify-center border-2 border-white/20 shadow-lg`}
                    >
                      <div className="text-3xl mb-1">{box.emoji}</div>
                      <div className="text-lg font-bold text-white">{item.value}⭐</div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute bottom-0 left-0 right-0 text-center">
                <p className="text-sm text-muted-foreground animate-pulse">Крутим колесо...</p>
              </div>
            </div>
          ) : wonItem ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-7xl animate-pulse">{wonItem.name.includes('⬆️') ? '⬆️' : '🎁'}</div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold gold-text-glow">{wonItem.name}</p>
                <div className="flex items-center justify-center gap-2 text-xl text-primary">
                  <span>{wonItem.value} ⭐</span>
                </div>
                <p className="text-sm text-muted-foreground">Добавлено в инвентарь!</p>
              </div>
            </div>
          ) : null}
        </div>

        {!isAnimating && (
          <Button onClick={onClose} className="w-full" size="lg">
            Отлично!
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BoxOpenDialog;