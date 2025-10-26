import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BoxType, UpgradeItem } from './types';
import { playButtonSound } from '@/utils/sounds';

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
      
      // Звук тряски бокса - барабанная дробь
      const shakeSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 1.5);
      
      // Через 1.5 сек открываем бокс
      setTimeout(() => {
        setPhase('open');
        
        // Звук открытия - "вжух"
        const openOsc = audioContext.createOscillator();
        const openGain = audioContext.createGain();
        openOsc.connect(openGain);
        openGain.connect(audioContext.destination);
        openOsc.type = 'sine';
        openOsc.frequency.setValueAtTime(400, audioContext.currentTime);
        openOsc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
        openGain.gain.setValueAtTime(0.2, audioContext.currentTime);
        openGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        openOsc.start();
        openOsc.stop(audioContext.currentTime + 0.2);
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
        
        // Звук победы зависит от редкости
        if (wonItem.rarity === 'legendary') {
          // Легендарный - эпический фанфар
          [440, 554, 659, 880].forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, audioContext.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.5);
            osc.start(audioContext.currentTime + i * 0.15);
            osc.stop(audioContext.currentTime + i * 0.15 + 0.5);
          });
        } else if (wonItem.rarity === 'epic') {
          // Эпик - красивый аккорд
          [523, 659, 784].forEach((freq) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.12, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            osc.start();
            osc.stop(audioContext.currentTime + 0.8);
          });
        } else {
          // Обычный - простой колокольчик
          const winOsc = audioContext.createOscillator();
          const winGain = audioContext.createGain();
          winOsc.connect(winGain);
          winGain.connect(audioContext.destination);
          winOsc.type = 'sine';
          winOsc.frequency.value = 800;
          winGain.gain.setValueAtTime(0.15, audioContext.currentTime);
          winGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          winOsc.start();
          winOsc.stop(audioContext.currentTime + 0.5);
        }
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
            onClick={() => {
              playButtonSound();
              onClose();
            }}
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