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
      <DialogContent className="max-w-md w-[90vw] relative overflow-hidden top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
        {showFireworks && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={true}
              numberOfPieces={300}
              gravity={0.3}
            />
          </div>
        )}
        
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {box.emoji} {box.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-12 space-y-6">
          {isAnimating ? (
            <div className="flex flex-col items-center gap-6">
              <div className="text-9xl animate-bounce">{box.emoji}</div>
              <p className="text-xl text-muted-foreground animate-pulse font-semibold">Открываем...</p>
            </div>
          ) : wonItem ? (
            <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="text-8xl animate-pulse">{wonItem.name.includes('⬆️') ? '⬆️' : '🎁'}</div>
              <div className="text-center space-y-3">
                <p className="text-3xl font-bold gold-text-glow">{wonItem.name}</p>
                <div className="flex items-center justify-center gap-2 text-2xl text-primary font-bold">
                  <span>{wonItem.value} ⭐</span>
                </div>
                <p className="text-base text-muted-foreground">Добавлено в инвентарь!</p>
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