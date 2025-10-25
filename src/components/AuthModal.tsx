import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface AuthModalProps {
  isOpen: boolean;
  onAuthSuccess: (userData: any) => void;
}

const AuthModal = ({ isOpen, onAuthSuccess }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      
      // Migrate existing users without ID
      Object.keys(users).forEach(email => {
        if (!users[email].id) {
          const userCount = Object.keys(users).length;
          users[email].id = '#' + (1000 + userCount);
        }
      });
      localStorage.setItem('users', JSON.stringify(users));
      
      if (isLogin) {
        if (!users[email]) {
          setError('Пользователь не найден');
          setIsLoading(false);
          return;
        }
        
        if (users[email].password !== password) {
          setError('Неверный пароль');
          setIsLoading(false);
          return;
        }

        const userData = {
          id: users[email].id,
          email,
          balance: users[email].balance || 1000,
          inventory: users[email].inventory || [],
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        onAuthSuccess({ user: userData });
      } else {
        if (users[email]) {
          setError('Пользователь уже существует');
          setIsLoading(false);
          return;
        }

        // Get next user ID
        const existingIds = Object.values(users)
          .map((u: any) => u.id)
          .filter((id: string) => id && id.startsWith('#'))
          .map((id: string) => parseInt(id.substring(1)))
          .filter((num: number) => !isNaN(num));
        
        const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1000;
        const userId = '#' + nextId;
        
        const newUser = {
          id: userId,
          password,
          balance: 1000,
          inventory: [],
        };
        
        users[email] = newUser;
        localStorage.setItem('users', JSON.stringify(users));
        
        const userData = {
          id: userId,
          email,
          balance: 1000,
          inventory: [],
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        onAuthSuccess({ user: userData });
      }
    } catch (err) {
      setError('Ошибка авторизации');
    } finally {
      setIsLoading(false);
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
                onClick={handleAuth}
                disabled={isLoading || !email || !password}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" className="mr-2" size={16} />
                    {isLogin ? 'Войти' : 'Зарегистрироваться'}
                  </>
                )}
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;