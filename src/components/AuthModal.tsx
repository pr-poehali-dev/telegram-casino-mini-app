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
  const [verificationCode, setVerificationCode] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

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

      setNeedsVerification(true);
      setSuccessMessage('📧 Код отправлен на email! Проверь почту.');
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Введите код подтверждения');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Неверный код');
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

      if (response.status === 403 && data.needsVerification) {
        setError('Email не подтверждён! Запросите новый код.');
        setIsLoading(false);
        return;
      }

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
    if (needsVerification) {
      handleVerify();
    } else if (isLogin) {
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
            {needsVerification 
              ? 'Подтвердите email' 
              : isLogin 
                ? 'Войдите в аккаунт' 
                : 'Создайте новый аккаунт'}
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

              {successMessage && (
                <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-lg">
                  <p className="text-sm text-green-400">{successMessage}</p>
                </div>
              )}

              {needsVerification ? (
                <div className="space-y-3">
                  <div className="bg-primary/10 p-4 rounded-lg text-center">
                    <Icon name="Mail" className="mx-auto text-primary mb-2" size={32} />
                    <p className="text-sm text-muted-foreground mb-1">Код отправлен на:</p>
                    <p className="font-semibold">{email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      Код из письма <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="123456"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="bg-secondary border-primary/30 text-center text-2xl font-bold tracking-widest"
                      maxLength={6}
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  >
                    <Icon name="CheckCircle" className="mr-2" size={16} />
                    Подтвердить
                  </Button>

                  <Button
                    onClick={() => {
                      setNeedsVerification(false);
                      setVerificationCode('');
                      setError('');
                      setSuccessMessage('');
                    }}
                    variant="ghost"
                    className="w-full"
                  >
                    Назад
                  </Button>
                </div>
              ) : (
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
                      setSuccessMessage('');
                    }}
                    variant="ghost"
                    className="w-full"
                  >
                    {isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт?'}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
