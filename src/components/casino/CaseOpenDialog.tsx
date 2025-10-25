import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CaseItem, cases, rarityColors } from './types';

interface CaseOpenDialogProps {
  isOpening: boolean;
  wonItem: CaseItem | null;
  selectedCase: typeof cases[0] | null;
  setWonItem: (item: CaseItem | null) => void;
}

const CaseOpenDialog = ({ isOpening, wonItem, selectedCase, setWonItem }: CaseOpenDialogProps) => {
  return (
    <Dialog open={isOpening || wonItem !== null} onOpenChange={(open) => !open && setWonItem(null)}>
      <DialogContent className="bg-card border-primary/30">
        {isOpening ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4 animate-spin-slow">{selectedCase?.image}</div>
            <h3 className="text-xl font-bold mb-2">Открываем кейс...</h3>
            <Progress value={66} className="w-full" />
          </div>
        ) : wonItem ? (
          <div className="text-center py-6">
            <DialogHeader>
              <DialogTitle className="text-2xl mb-4">Поздравляем! 🎉</DialogTitle>
            </DialogHeader>
            <Card className={`bg-gradient-to-br ${rarityColors[wonItem.rarity]} p-6 mb-4 gold-glow`}>
              <div className="text-5xl mb-3">{wonItem.image}</div>
              <h3 className="text-xl font-bold mb-2">{wonItem.name}</h3>
              <div className="text-2xl font-bold">{wonItem.price}⭐</div>
            </Card>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setWonItem(null)}
            >
              Забрать
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default CaseOpenDialog;
