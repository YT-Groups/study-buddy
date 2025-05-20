import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  FlashcardWithMetadata, 
  Difficulty, 
  processReview, 
  getDueCards 
} from '@/lib/spaced-repetition';
import { Trash2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

interface FlashcardStudyProps {
  deck: FlashcardWithMetadata[];
  onUpdateDeck: (updatedDeck: FlashcardWithMetadata[]) => void;
  onClose: () => void;
}

export function FlashcardStudy({ deck, onUpdateDeck, onClose }: FlashcardStudyProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [dueCards, setDueCards] = useState<FlashcardWithMetadata[]>([]);
  const [studyComplete, setStudyComplete] = useState(false);
  const { deleteFlashcard } = useUser();

  useEffect(() => {
    const due = getDueCards(deck);
    setDueCards(due);
    setStudyComplete(due.length === 0);
  }, [deck]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleDifficultyResponse = (difficulty: Difficulty) => {
    const currentCard = dueCards[currentCardIndex];
    const updatedCard = processReview(currentCard, difficulty);
    
    // Update the deck with the new card metadata
    const updatedDeck = deck.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    );
    onUpdateDeck(updatedDeck);

    // Move to next card
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setStudyComplete(true);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      deleteFlashcard(deck[0].id, dueCards[currentCardIndex].id);
      toast.success("Flashcard deleted");
      
      // If this was the last card, close the study session
      if (deck.length === 1) {
        onClose();
      } else {
        // Move to next card or previous card if at the end
        if (currentCardIndex === deck.length - 1) {
          setCurrentCardIndex(currentCardIndex - 1);
        }
        setIsFlipped(false);
      }
    }
  };

  if (studyComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <h3 className="text-2xl font-light mb-4">Study Session Complete!</h3>
        <p className="text-black/60 mb-8">
          You've reviewed all cards due for today. Come back tomorrow for more!
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-black hover:bg-black/90 text-white font-light px-8 py-6 rounded-full"
        >
          Review Again
        </Button>
      </div>
    );
  }

  const currentCard = dueCards[currentCardIndex];

  if (!currentCard) return null;

  return (
    <div className="flex flex-col items-center gap-8 p-4">
      <div className="w-full max-w-2xl aspect-[3/2] perspective-1000">
        <motion.div
          className="relative w-full h-full preserve-3d cursor-pointer"
          onClick={handleFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Front of card */}
          <div className="absolute inset-0 backface-hidden bg-background text-foreground border border-border rounded-xl p-8 flex items-center justify-center text-center">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-muted-foreground">
                Card {currentCardIndex + 1} of {dueCards.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xl font-light">{currentCard.front}</p>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-background text-foreground border border-border rounded-xl p-8 flex items-center justify-center text-center">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-muted-foreground">
                Card {currentCardIndex + 1} of {dueCards.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xl font-light">{currentCard.back}</p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex gap-4"
          >
            <Button
              onClick={() => handleDifficultyResponse('hard')}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 font-light px-6 py-2 rounded-full"
            >
              Hard
            </Button>
            <Button
              onClick={() => handleDifficultyResponse('medium')}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 font-light px-6 py-2 rounded-full"
            >
              Medium
            </Button>
            <Button
              onClick={() => handleDifficultyResponse('easy')}
              className="bg-green-500/10 hover:bg-green-500/20 text-green-600 font-light px-6 py-2 rounded-full"
            >
              Easy
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-sm text-black/40 font-light">
        Card {currentCardIndex + 1} of {dueCards.length}
      </div>
    </div>
  );
}
