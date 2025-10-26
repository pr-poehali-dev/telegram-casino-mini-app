import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WalletTabProps {
  balance: number;
  setBalance: (balance: number) => void;
  telegramUserId: number | null;
  userId: string | null;
}

const WalletTab = ({ balance, setBalance, telegramUserId, userId }: WalletTabProps) => {
  const { toast } = useToast();
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('250');

  const depositOptions = [100, 250, 500, 1000];
  const withdrawOptions = [250, 500, 1000];

  const handleDeposit = async (amount: number) => {
    if (!telegramUserId) {
      toast({
        title: '❌ Ошибка',
        description: 'Пополнение доступно только в Telegram Mini App',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/telegram-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          telegram_id: telegramUserId,
          stars_amount: amount,
          user_id: userId
        })
      });

      const data = await response.json();

      if (data.invoice_link) {
        window.open(data.invoice_link, '_blank');
        toast({
          title: '✅ Счёт создан',
          description: 'Оплатите счёт в Telegram. Звёзды зачислятся автоматически!',
        });
        setShowDepositDialog(false);
      } else {
        toast({
          title: '❌ Ошибка',
          description: data.error || 'Не удалось создать счёт',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось создать счёт',
        variant: 'destructive'
      });
    }
  };

  const handleWithdraw = (amount: number) => {
    if (balance < amount) {
      alert('❌ Недостаточно средств для вывода!');
      return;
    }

    if (amount < 250) {
      alert('❌ Минимальная сумма вывода: 250⭐');
      return;
    }

    // TODO: Integrate with Telegram Stars withdrawal
    alert(`💰 Запрос на вывод ${amount}⭐ отправлен администратору!`);
    setBalance(balance - amount);
    setShowWithdrawDialog(false);
  };

  return (
    <TabsContent value="wallet" className="space-y-4 mt-0">
      <Card className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 border-primary/30">
        <div className="text-center space-y-3">
          <Icon name="Wallet" className="mx-auto text-primary" size={48} />
          <div>
            <p className="text-sm text-muted-foreground">Твой баланс</p>
            <p className="text-4xl font-bold text-primary">{balance} ⭐</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => setShowDepositDialog(true)}
          className="bg-green-600 hover:bg-green-700 h-20 flex-col gap-2"
          size="lg"
        >
          <Icon name="Plus" size={24} />
          <span>Пополнить</span>
        </Button>
        <Button
          onClick={() => setShowWithdrawDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 h-20 flex-col gap-2"
          size="lg"
        >
          <Icon name="ArrowDownToLine" size={24} />
          <span>Вывести</span>
        </Button>
      </div>

      <Card className="p-4 bg-card/30 border-primary/10">
        <div className="flex items-start gap-3">
          <Icon name="Info" className="text-primary mt-1" size={20} />
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Пополнение:</strong> От 100⭐ через Telegram Stars</p>
            <p><strong className="text-foreground">Вывод:</strong> От 250⭐, обработка до 24 часов</p>
            <p><strong className="text-foreground">Комиссия:</strong> Без комиссии</p>
          </div>
        </div>
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Plus" className="text-green-500" size={24} />
              Пополнение баланса
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Текущий баланс</p>
              <p className="text-2xl font-bold text-primary">{balance} ⭐</p>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Сумма пополнения</label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="100"
                className="text-lg text-center font-bold"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {depositOptions.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setDepositAmount(amount.toString())}
                  className="font-semibold"
                >
                  {amount}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => handleDeposit(parseInt(depositAmount))}
              disabled={parseInt(depositAmount) < 100}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Пополнить {depositAmount}⭐
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Минимальная сумма пополнения: 100⭐
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="ArrowDownToLine" className="text-blue-500" size={24} />
              Вывод средств
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Доступно для вывода</p>
              <p className="text-2xl font-bold text-primary">{balance} ⭐</p>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Сумма вывода</label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="250"
                max={balance}
                className="text-lg text-center font-bold"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {withdrawOptions.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setWithdrawAmount(amount.toString())}
                  disabled={balance < amount}
                  className="font-semibold"
                >
                  {amount}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => handleWithdraw(parseInt(withdrawAmount))}
              disabled={parseInt(withdrawAmount) < 250 || parseInt(withdrawAmount) > balance}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Вывести {withdrawAmount}⭐
            </Button>

            <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
              <div className="flex items-start gap-2">
                <Icon name="AlertCircle" className="text-orange-500 mt-0.5" size={16} />
                <p className="text-xs text-orange-400">
                  Минимальная сумма вывода: 250⭐<br />
                  Обработка заявки до 24 часов
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default WalletTab;