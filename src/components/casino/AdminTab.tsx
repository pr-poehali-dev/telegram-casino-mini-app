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
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const updateBalance = (operation: 'add' | 'remove') => {
    if (!userId || !amount) {
      setMessage('❌ Заполни все поля');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setMessage('❌ Введи корректную сумму');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    let userFound = false;
    let userEmail = '';

    for (const email in users) {
      if (users[email].id === userId) {
        userFound = true;
        userEmail = email;
        break;
      }
    }

    if (!userFound) {
      setMessage('❌ Игрок с таким ID не найден');
      return;
    }

    const currentBalance = users[userEmail].balance || 0;
    const newBalance = operation === 'add' 
      ? currentBalance + amountNum 
      : Math.max(0, currentBalance - amountNum);

    users[userEmail].balance = newBalance;
    localStorage.setItem('users', JSON.stringify(users));

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id === userId) {
      currentUser.balance = newBalance;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      window.location.reload();
    }

    const operationText = operation === 'add' ? 'добавлено' : 'снято';
    setMessage(`✅ ${amountNum}⭐ ${operationText} игроку ${userId}`);
    setUserId('');
    setAmount('');

    setTimeout(() => setMessage(''), 5000);
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
            <label className="text-sm font-semibold mb-2 block">ID игрока</label>
            <Input
              placeholder="#1000"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
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
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Icon name="Plus" size={20} className="mr-2" />
              Выдать
            </Button>
            <Button
              onClick={() => updateBalance('remove')}
              className="bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <Icon name="Minus" size={20} className="mr-2" />
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