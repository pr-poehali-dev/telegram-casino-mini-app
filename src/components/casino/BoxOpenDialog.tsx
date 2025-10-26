import { useEffect, useState } from 'react';
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
  const [phase, setPhase] = useState<'shake' | 'open' | 'reveal'>('shake');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; rotation: number; delay: number }>>([]);

  useEffect(() => {
    if (isOpen && wonItem && box) {
      setPhase('shake');
      
      // Звук тряски бокса
      const shakeSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8=');
      shakeSound.volume = 0.3;
      shakeSound.play().catch(() => {});
      
      // Через 1.5 сек открываем бокс
      setTimeout(() => {
        setPhase('open');
        
        // Звук открытия
        const openSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8=');
        openSound.volume = 0.4;
        openSound.play().catch(() => {});
      }, 1500);
      
      // Через 2 сек показываем приз с конфетти
      setTimeout(() => {
        setPhase('reveal');
        
        // Генерируем частицы конфетти
        const newParticles = [];
        for (let i = 0; i < 30; i++) {
          newParticles.push({
            id: i,
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            rotation: Math.random() * 360,
            delay: Math.random() * 0.3
          });
        }
        setParticles(newParticles);
        
        // Звук победы
        const winSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAD/+/f08Onk4Nza1dHMx8K+ubWwrKilop+bl5SQjYmGg4B9enZzb2xpZWJeW1hUUU5LSEc/PDs4NTIvLCkl');
        winSound.volume = 0.5;
        winSound.play().catch(() => {});
      }, 2000);
    }
  }, [isOpen, wonItem, box]);

  if (!box || !wonItem) return null;

  const rarityColors = {
    legendary: 'from-yellow-400 via-orange-500 to-red-600',
    epic: 'from-purple-500 via-pink-500 to-purple-700',
    rare: 'from-blue-400 via-cyan-500 to-blue-600',
    common: 'from-gray-400 via-gray-500 to-gray-600'
  };

  const rarityGlow = {
    legendary: 'shadow-[0_0_30px_rgba(251,191,36,0.8)]',
    epic: 'shadow-[0_0_30px_rgba(168,85,247,0.8)]',
    rare: 'shadow-[0_0_30px_rgba(59,130,246,0.8)]',
    common: 'shadow-[0_0_20px_rgba(156,163,175,0.5)]'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-gradient-to-br from-background via-background to-primary/10 border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl gold-text-glow">
            {box.emoji} {box.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-12 relative overflow-hidden">
          {phase === 'shake' && (
            <div className="flex justify-center">
              <div className="text-9xl animate-[shake_0.5s_ease-in-out_infinite] relative">
                {box.emoji}
                <div className="absolute inset-0 blur-xl opacity-50 animate-pulse">{box.emoji}</div>
              </div>
            </div>
          )}

          {phase === 'open' && (
            <div className="flex justify-center">
              <div className="text-9xl animate-[bounce_0.5s_ease-in-out_1] scale-125">
                {box.emoji}
              </div>
            </div>
          )}

          {phase === 'reveal' && (
            <>
              {/* Конфетти */}
              {particles.map((particle) => (
                <div
                  key={particle.id}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: `hsl(${Math.random() * 360}, 70%, 60%)`,
                    animation: `confetti 1.5s ease-out forwards`,
                    animationDelay: `${particle.delay}s`,
                    transform: `translate(-50%, -50%) translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg)`
                  }}
                />
              ))}

              {/* Приз */}
              <div className="flex flex-col items-center gap-6 animate-[fadeInScale_0.5s_ease-out]">
                <div 
                  className={`text-8xl p-8 rounded-3xl bg-gradient-to-br ${rarityColors[wonItem.rarity as keyof typeof rarityColors]} ${rarityGlow[wonItem.rarity as keyof typeof rarityGlow]} animate-[float_3s_ease-in-out_infinite]`}
                >
                  {wonItem.name.includes('⬆️') ? '⬆️' : '🎁'}
                </div>
                
                <div className="text-center space-y-3">
                  <div className={`text-3xl font-black uppercase tracking-wider bg-gradient-to-r ${rarityColors[wonItem.rarity as keyof typeof rarityColors]} bg-clip-text text-transparent`}>
                    {wonItem.rarity === 'legendary' ? '🏆 Легендарно!' : 
                     wonItem.rarity === 'epic' ? '💎 Эпично!' :
                     wonItem.rarity === 'rare' ? '⭐ Редко!' : '✨ Неплохо!'}
                  </div>
                  
                  <p className="text-xl font-bold text-foreground">{wonItem.name}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-3xl font-bold text-primary">
                    <span className="animate-pulse">{wonItem.value} ⭐</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">Приз добавлен в инвентарь!</p>
                </div>
              </div>
            </>
          )}
        </div>

        {phase === 'reveal' && (
          <Button 
            onClick={onClose} 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg font-bold shadow-lg" 
            size="lg"
          >
            Отлично! 🎉
          </Button>
        )}

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            25% { transform: translateX(-10px) rotate(-5deg); }
            75% { transform: translateX(10px) rotate(5deg); }
          }
          
          @keyframes confetti {
            0% {
              transform: translate(-50%, -50%) translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) translateY(300px) rotate(720deg);
              opacity: 0;
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default BoxOpenDialog;
