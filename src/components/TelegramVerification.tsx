import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface TelegramVerificationProps {
  isOpen: boolean;
  email: string;
  onVerified: (verificationCode: string) => void;
  onCancel: () => void;
}

const TelegramVerification = ({ isOpen, email, onVerified, onCancel }: TelegramVerificationProps) => {
  const [verificationCode] = useState(() => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  });
  const [isChecking, setIsChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const TELEGRAM_BOT_USERNAME = 'DuckCasinoBot'; // TODO: Replace with your actual bot username

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const checkInterval = setInterval(() => {
      const verifiedUsers = JSON.parse(localStorage.getItem('telegram_verified') || '{}');
      
      if (verifiedUsers[email] === verificationCode) {
        setIsChecking(false);
        onVerified(verificationCode);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [isOpen, email, verificationCode, onVerified]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenTelegram = () => {
    setIsChecking(true);
    const botUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${verificationCode}`;
    window.open(botUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-primary/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
            <Icon name="MessageCircle" className="text-blue-500" size={28} />
            Подтверждение Telegram
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Для создания аккаунта подтвердите действие через наш Telegram бот
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-6 border-blue-500/30 text-center space-y-3">
            <div className="text-6xl mb-2">🤖</div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Telegram бот</p>
              <p className="text-xl font-bold text-blue-400">@{TELEGRAM_BOT_USERNAME}</p>
            </div>
            <div className="bg-card/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Код подтверждения</p>
              <p className="text-2xl font-mono font-bold text-primary tracking-wider">
                {verificationCode}
              </p>
            </div>
          </Card>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <p className="text-sm text-muted-foreground">
                Нажмите кнопку ниже, чтобы перейти в Telegram бот
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <p className="text-sm text-muted-foreground">
                Нажмите кнопку "Старт" или отправьте команду /start
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <p className="text-sm text-muted-foreground">
                Нажмите кнопку "Подтвердить" в боте
              </p>
            </div>
          </div>

          <Button
            onClick={handleOpenTelegram}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-12"
            size="lg"
          >
            <Icon name="Send" className="mr-2" size={20} />
            Перейти в Telegram
          </Button>

          {isChecking && (
            <Card className="bg-primary/10 border-primary/30 p-4">
              <div className="flex items-center gap-3">
                <Icon name="Loader2" className="animate-spin text-primary" size={24} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Ожидание подтверждения...</p>
                  <p className="text-xs text-muted-foreground">
                    Подтвердите действие в Telegram боте
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Clock" className="text-muted-foreground" size={16} />
              <span className="text-muted-foreground">
                Осталось: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </span>
            </div>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              Отмена
            </Button>
          </div>

          {timeLeft === 0 && (
            <Card className="bg-destructive/20 border-destructive/50 p-4">
              <div className="flex items-start gap-3">
                <Icon name="AlertCircle" className="text-destructive mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-destructive">Время истекло</p>
                  <p className="text-xs text-destructive/80">
                    Начните регистрацию заново
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TelegramVerification;
