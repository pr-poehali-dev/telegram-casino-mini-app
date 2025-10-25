import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface AuthModalProps {
  isOpen: boolean;
  onAuthSuccess: (userData: any) => void;
}

const AuthModal = ({ isOpen, onAuthSuccess }: AuthModalProps) => {
  const { user: tgUser, isTelegramWebApp } = useTelegramWebApp();
  const [telegramId, setTelegramId] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tgUser && isTelegramWebApp) {
      handleAuth(tgUser.id, tgUser.username || '', tgUser.first_name, tgUser.last_name || '');
    }
  }, [tgUser, isTelegramWebApp]);

  const handleAuth = async (
    id?: number,
    user?: string,
    fname?: string,
    lname?: string
  ) => {
    const authTelegramId = id || parseInt(telegramId);
    
    if (!authTelegramId) {
      setError('Введите ваш Telegram ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://functions.poehali.dev/48711fed-189d-4b70-b667-b7fbff222c1a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: authTelegramId,
          username: user || username || '',
          first_name: fname || firstName || '',
          last_name: lname || '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.last_free_open) {
          localStorage.setItem('lastFreeOpen', new Date(data.last_free_open).getTime().toString());
        }
        onAuthSuccess(data);
      } else {
        setError(data.error || 'Ошибка авторизации');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-primary/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 gold-text-glow">
            🎰 CASINO
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Войдите через Telegram, чтобы начать играть
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Icon name="Loader2" className="mx-auto animate-spin text-primary mb-4" size={48} />
              <p className="text-muted-foreground">Авторизация...</p>
            </div>
          ) : isTelegramWebApp ? (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-lg font-semibold mb-2">Автоматический вход</p>
              <p className="text-sm text-muted-foreground">
                Вы авторизуетесь через Telegram Web App
              </p>
            </div>
          ) : (
            <>
              <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Icon name="Info" size={16} />
                  <span className="font-semibold">Как получить Telegram ID?</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  1. Откройте бот <span className="text-primary font-semibold">@userinfobot</span> в Telegram
                </p>
                <p className="text-xs text-muted-foreground">
                  2. Нажмите /start и скопируйте ваш ID
                </p>
                <p className="text-xs text-muted-foreground">
                  3. Вставьте ID в поле ниже
                </p>
              </div>

              {error && (
                <div className="bg-destructive/20 border border-destructive/50 p-3 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Telegram ID <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="123456789"
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    className="bg-secondary border-primary/30"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Имя пользователя</label>
                  <Input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-secondary border-primary/30"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Имя</label>
                  <Input
                    type="text"
                    placeholder="Иван"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-secondary border-primary/30"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                onClick={() => handleAuth()}
                disabled={isLoading || !telegramId}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                    Вход...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" className="mr-2" size={16} />
                    Войти
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Один Telegram аккаунт = один игровой аккаунт
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;