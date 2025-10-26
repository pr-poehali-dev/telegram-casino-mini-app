import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DailyBonusCardProps {
  userId: number;
  onBonusClaimed: (newBalance: number) => void;
}

const DAILY_BONUS_URL = 'https://functions.poehali.dev/0f442a88-a419-4c31-a3a7-85dc47731e73';

const DailyBonusCard = ({ userId, onBonusClaimed }: DailyBonusCardProps) => {
  const [canClaim, setCanClaim] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [nextBonus, setNextBonus] = useState(100);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(0);

  useEffect(() => {
    checkBonusStatus();
  }, [userId]);

  const checkBonusStatus = async () => {
    try {
      const response = await fetch(`${DAILY_BONUS_URL}?user_id=${userId}`);
      const data = await response.json();
      
      setCanClaim(data.can_claim);
      setStreakDays(data.streak_days);
      setNextBonus(data.next_bonus);
    } catch (error) {
      console.error('Error checking bonus status:', error);
    }
  };

  const claimBonus = async () => {
    setIsClaiming(true);
    try {
      const response = await fetch(DAILY_BONUS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await response.json();

      if (data.success) {
        setClaimedAmount(data.bonus_amount);
        setShowSuccess(true);
        setCanClaim(false);
        setStreakDays(data.streak_days);
        onBonusClaimed(data.new_balance);

        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        alert(data.error || 'Ошибка при получении бонуса');
      }
    } catch (error) {
      console.error('Error claiming bonus:', error);
      alert('Ошибка при получении бонуса');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 border-yellow-500/30 relative overflow-hidden">
      {showSuccess && (
        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 animate-in fade-in">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-lg text-green-500">+{claimedAmount} ⭐</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name="Gift" className="text-yellow-500" size={24} />
          <h3 className="font-bold text-lg">Ежедневный бонус</h3>
        </div>
        {streakDays > 0 && (
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
            <Icon name="Flame" className="text-orange-500" size={16} />
            <span className="text-sm font-bold">{streakDays} {streakDays === 1 ? 'день' : 'дней'}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Награда за вход:</span>
          <span className="font-bold text-yellow-500 text-lg">+{nextBonus} ⭐</span>
        </div>

        <Button
          onClick={claimBonus}
          disabled={!canClaim || isClaiming}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClaiming ? (
            <>
              <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
              Получение...
            </>
          ) : canClaim ? (
            <>
              <Icon name="Gift" className="mr-2" size={16} />
              Получить бонус
            </>
          ) : (
            <>
              <Icon name="Check" className="mr-2" size={16} />
              Получено сегодня
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          {canClaim ? (
            <>Заходи каждый день и получай до 500 ⭐!</>
          ) : (
            <>Приходи завтра за новым бонусом!</>
          )}
        </div>

        {streakDays > 0 && (
          <div className="bg-card/50 p-2 rounded text-xs text-center">
            <span className="text-muted-foreground">Серия: </span>
            <span className="font-bold text-yellow-500">{streakDays} {streakDays === 1 ? 'день' : 'дней'} подряд</span>
            {streakDays < 8 && (
              <p className="text-muted-foreground mt-1">
                Следующий бонус: +{Math.min(100 + (streakDays * 50), 500)} ⭐
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DailyBonusCard;
