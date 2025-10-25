import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface AuthModalProps {
  isOpen: boolean;
  onAuthSuccess: (userData: any) => void;
}

const API_URL = 'https://functions.poehali.dev/bdc6396e-6e37-490c-8498-1a249b75d550';

const AuthModal = ({ isOpen, onAuthSuccess }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка регистрации');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      onAuthSuccess({ user: data.user });
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка входа');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user));
      onAuthSuccess({ user: data.user });
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-primary/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2 gold-text-glow flex items-center justify-center gap-2">
            🦆 DuckCasino
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {isLogin ? 'Войдите в аккаунт' : 'Создайте новый аккаунт'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Icon name="Loader2" className="mx-auto animate-spin text-primary mb-4" size={48} />
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-destructive/20 border border-destructive/50 p-3 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-secondary border-primary/30"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Пароль <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-secondary border-primary/30"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !email || !password}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  >
                    <Icon name="LogIn" className="mr-2" size={16} />
                    {isLogin ? 'Войти' : 'Зарегистрироваться'}
                  </Button>

                  <Button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    variant="ghost"
                    className="w-full"
                  >
                    {isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт?'}
                  </Button>
                </>
              
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;