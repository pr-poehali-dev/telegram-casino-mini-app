import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { TabsContent } from '@/components/ui/tabs';

interface AdminTabProps {
  onClose: () => void;
}

const AdminTab = ({ onClose }: AdminTabProps) => {
  const [telegramId, setTelegramId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateBalance = async (operation: 'add' | 'remove') => {
    if (!telegramId || !amount) {
      setMessage('❌ Заполни все поля');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setMessage('❌ Введи корректную сумму');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://functions.poehali.dev/1c5c02b0-3e38-43f5-ac84-22b7995d4751', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: parseInt(telegramId),
          amount: operation === 'add' ? amountNum : -amountNum,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const operationText = operation === 'add' ? 'добавлено' : 'снято';
        setMessage(`✅ ${amountNum}⭐ ${operationText} пользователю TG ID: ${telegramId}`);
        setTelegramId('');
        setAmount('');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`❌ ${data.error || 'Ошибка при изменении баланса'}`);
      }
    } catch (error) {
      setMessage('❌ Ошибка сети. Проверь подключение');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TabsContent value="admin" className="space-y-4 mt-0">
      <Card className="bg-gradient-to-br from-red-950/50 to-secondary p-6 border-red-500/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Icon name="ShieldAlert" className="text-red-500" size={24} />
            Админ панель
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-red-500/30"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>

        <div className="space-y-4">
          {message && (
            <div className={`p-3 rounded-lg border ${
              message.startsWith('✅') 
                ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                : 'bg-red-500/20 border-red-500/50 text-red-400'
            }`}>
              <p className="text-sm font-semibold">{message}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold mb-2 block">Telegram ID</label>
            <Input
              placeholder="123456789"
              type="number"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="bg-secondary/50 font-mono text-lg"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Сумма (⭐)</label>
            <Input
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary/50"
              min="1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => updateBalance('add')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {isLoading ? (
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              ) : (
                <Icon name="Plus" size={20} className="mr-2" />
              )}
              Выдать
            </Button>
            <Button
              onClick={() => updateBalance('remove')}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
              size="lg"
            >
              {isLoading ? (
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
              ) : (
                <Icon name="Minus" size={20} className="mr-2" />
              )}
              Снять
            </Button>
          </div>

          <div className="bg-red-950/30 p-3 rounded-lg border border-red-500/30 mt-6">
            <div className="flex items-start gap-2">
              <Icon name="AlertTriangle" className="text-red-500 mt-0.5" size={16} />
              <p className="text-xs text-red-400">
                Будь осторожен! Изменения применяются мгновенно и необратимы
              </p>
            </div>
          </div>
        </div>
      </Card>
    </TabsContent>
  );
};

export default AdminTab;