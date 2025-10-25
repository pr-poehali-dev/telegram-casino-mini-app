import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { TabsContent } from '@/components/ui/tabs';

interface MinerTabProps {
  balance: number;
  setBalance: (balance: number) => void;
}

type CellType = 'empty' | 'plus' | 'mine' | 'hidden';

interface Cell {
  id: number;
  type: CellType;
  revealed: boolean;
  multiplier?: number;
}

const MinerTab = ({ balance, setBalance }: MinerTabProps) => {
  const [bet, setBet] = useState('10');
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [revealedCount, setRevealedCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const initGame = () => {
    const betAmount = parseInt(bet);
    if (isNaN(betAmount) || betAmount <= 0) {
      alert('❌ Введи корректную ставку!');
      return;
    }
    if (betAmount > balance) {
      alert('❌ Недостаточно звёзд!');
      return;
    }

    setBalance(balance - betAmount);

    const newGrid: Cell[] = [];
    const mineCount = 5;
    const plusCount = 8;
    const emptyCount = 25 - mineCount - plusCount;

    const types: CellType[] = [
      ...Array(mineCount).fill('mine'),
      ...Array(plusCount).fill('plus'),
      ...Array(emptyCount).fill('empty'),
    ];

    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }

    types.forEach((type, index) => {
      newGrid.push({
        id: index,
        type,
        revealed: false,
        multiplier: type === 'plus' ? Math.random() > 0.5 ? 1.5 : 2 : undefined,
      });
    });

    setGrid(newGrid);
    setIsPlaying(true);
    setCurrentMultiplier(1);
    setRevealedCount(0);
    setGameOver(false);
  };

  const revealCell = (cellId: number) => {
    if (gameOver) return;

    const cell = grid.find(c => c.id === cellId);
    if (!cell || cell.revealed) return;

    const newGrid = grid.map(c => 
      c.id === cellId ? { ...c, revealed: true } : c
    );
    setGrid(newGrid);

    if (cell.type === 'mine') {
      const newMultiplier = currentMultiplier * 0.5;
      setCurrentMultiplier(newMultiplier);
      setRevealedCount(revealedCount + 1);
    } else if (cell.type === 'plus') {
      const newMultiplier = currentMultiplier * (cell.multiplier || 1.5);
      setCurrentMultiplier(newMultiplier);
      setRevealedCount(revealedCount + 1);
    } else {
      setRevealedCount(revealedCount + 1);
    }
  };

  const cashOut = () => {
    const winAmount = Math.floor(parseInt(bet) * currentMultiplier);
    setBalance(balance + winAmount);
    setIsPlaying(false);
    alert(`✅ Забрано ${winAmount}⭐! (×${currentMultiplier.toFixed(2)})`);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGrid([]);
    setGameOver(false);
  };

  const getCellContent = (cell: Cell) => {
    if (!cell.revealed) return '❓';
    if (cell.type === 'mine') return '💣';
    if (cell.type === 'plus') return cell.multiplier === 2 ? '💎' : '⭐';
    return '✅';
  };

  const getCellClass = (cell: Cell) => {
    if (!cell.revealed) return 'bg-secondary hover:bg-secondary/80 cursor-pointer';
    if (cell.type === 'mine') return 'bg-red-500';
    if (cell.type === 'plus') return 'bg-gradient-to-br from-green-500 to-green-600';
    return 'bg-muted';
  };

  return (
    <TabsContent value="miner" className="space-y-4 mt-0">
      <Card className="bg-gradient-to-br from-secondary to-secondary/50 p-6 border-primary/20">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <span className="text-2xl">💣</span>
          Минёр
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Открывай клетки и собирай призы! Избегай мин и забирай в любой момент
        </p>

        {!isPlaying ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Ставка (⭐)</label>
              <Input
                type="number"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                placeholder="Введи ставку"
                className="text-lg"
                min="1"
                max={balance}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="text-center">
                <div>💣 Мина</div>
                <div className="font-bold text-red-500">-50%</div>
              </div>
              <div className="text-center">
                <div>⭐ Плюс</div>
                <div className="font-bold text-green-500">×1.5</div>
              </div>
              <div className="text-center">
                <div>💎 Джекпот</div>
                <div className="font-bold text-primary">×2.0</div>
              </div>
            </div>

            <Button 
              onClick={initGame} 
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              Начать игру
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-card rounded-lg">
              <div>
                <div className="text-xs text-muted-foreground">Множитель</div>
                <div className="text-xl font-bold text-primary">×{currentMultiplier.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Выигрыш</div>
                <div className="text-xl font-bold">{Math.floor(parseInt(bet) * currentMultiplier)}⭐</div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {grid.map((cell) => (
                <button
                  key={cell.id}
                  onClick={() => revealCell(cell.id)}
                  disabled={cell.revealed || gameOver}
                  className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${getCellClass(cell)} ${
                    cell.revealed ? 'scale-95' : 'hover:scale-105'
                  }`}
                >
                  {getCellContent(cell)}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {gameOver ? (
                <Button onClick={resetGame} className="w-full" variant="outline">
                  Новая игра
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={resetGame} 
                    className="flex-1" 
                    variant="outline"
                  >
                    Сдаться
                  </Button>
                  <Button 
                    onClick={cashOut} 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={revealedCount === 0}
                  >
                    Забрать {Math.floor(parseInt(bet) * currentMultiplier)}⭐
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Card>
    </TabsContent>
  );
};

export default MinerTab;