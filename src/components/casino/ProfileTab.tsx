import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { TabsContent } from '@/components/ui/tabs';

interface ProfileTabProps {
  user: any;
  balance: number;
  inventory: any[];
  onLogout: () => void;
}

const ProfileTab = ({ user, balance, inventory, onLogout }: ProfileTabProps) => {
  const copyId = () => {
    navigator.clipboard.writeText(user.telegram_id.toString());
    alert('✅ Telegram ID скопирован!');
  };

  return (
    <TabsContent value="profile" className="space-y-4 mt-0">
      <Card className="bg-gradient-to-br from-secondary to-secondary/50 p-6 border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Icon name="User" className="text-primary" size={24} />
            Профиль
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg flex items-center gap-4">
            {user.photo_url ? (
              <img 
                src={user.photo_url} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full border-2 border-primary/30"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <Icon name="User" className="text-primary" size={32} />
              </div>
            )}
            <div className="flex-1">
              <span className="text-sm text-muted-foreground">Имя</span>
              <p className="font-semibold text-lg">
                {user.first_name} {user.last_name}
              </p>
              {user.username && (
                <p className="text-sm text-muted-foreground mt-1">@{user.username}</p>
              )}
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Telegram ID</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyId}
                className="h-auto p-1"
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
            <p className="font-mono font-bold text-primary text-xl">{user.telegram_id}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card p-4 rounded-lg text-center">
              <Icon name="Coins" className="mx-auto mb-2 text-primary" size={32} />
              <div className="text-2xl font-bold text-primary">{balance}</div>
              <div className="text-xs text-muted-foreground">Баланс</div>
            </div>

            <div className="bg-card p-4 rounded-lg text-center">
              <Icon name="Package" className="mx-auto mb-2 text-primary" size={32} />
              <div className="text-2xl font-bold text-primary">{inventory.length}</div>
              <div className="text-xs text-muted-foreground">Предметов</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="text-primary mt-1" size={20} />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-primary">Твой Telegram ID</p>
                <p className="text-muted-foreground">
                  Используй его для получения бонусов от администратора
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </TabsContent>
  );
};

export default ProfileTab;