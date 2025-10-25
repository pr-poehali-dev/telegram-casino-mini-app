import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BoxType, UpgradeItem } from './types';
import Confetti from 'react-confetti';

interface BoxOpenDialogProps {
  isOpen: boolean;
  box: BoxType | null;
  wonItem: UpgradeItem | null;
  onClose: () => void;
}

const BoxOpenDialog = ({ isOpen, box, wonItem, onClose }: BoxOpenDialogProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isOpen && wonItem) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShowFireworks(true);
        
        setTimeout(() => {
          setShowFireworks(false);
        }, 5000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, wonItem]);

  if (!box) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm relative overflow-hidden">
        {showFireworks && (
          <div className="absolute inset-0 pointer-events-none z-50">
            <Confetti
              width={400}
              height={600}
              recycle={true}
              numberOfPieces={200}
              gravity={0.3}
            />
          </div>
        )}
        
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {box.emoji} {box.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-8 space-y-6">
          {isAnimating ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-8xl animate-bounce">{box.emoji}</div>
              <p className="text-lg text-muted-foreground animate-pulse">Открываем...</p>
            </div>
          ) : wonItem ? (
            <div className="flex flex-col items-center gap-4 relative z-10">
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
          <Button onClick={onClose} className="w-full relative z-10" size="lg">
            Отлично!
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BoxOpenDialog;
