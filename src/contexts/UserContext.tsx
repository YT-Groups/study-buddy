import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export type ActivityType = 'quiz' | 'flashcard' | 'study' | 'timetable';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
  lastReviewed?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  masteredCount: number;
  lastStudied: string;
  subject: string;
  color: string;
  cards: Flashcard[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  result?: string | number;
  subject?: string;
}

export interface User {
  name: string;
  email: string;
  joinDate: string;
  avatar?: string | null;
  username: string;
  stats: {
    totalStudyHours: number;
    flashcardsMastered: number;
    quizzesTaken: number;
    averageScore: number;
  };
  recentActivity: Activity[];
  subjects?: {
    name: string;
    progress: number;
    lastStudied: string;
  }[];
  flashcardDecks: FlashcardDeck[];
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  addFlashcardDeck: (deck: Omit<FlashcardDeck, 'id'>) => FlashcardDeck;
  updateFlashcardDeck: (deckId: string, deck: Partial<FlashcardDeck>) => void;
  deleteFlashcardDeck: (deckId: string) => void;
  deleteFlashcard: (deckId: string, cardId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const addActivity = (newActivity: Omit<Activity, 'id' | 'timestamp'>) => {
    setUser(currentUser => {
      if (!currentUser) return null;

      const activity: Activity = {
        ...newActivity,
        id: `activity-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      const updatedUser = {
        ...currentUser,
        recentActivity: [activity, ...currentUser.recentActivity].slice(0, 10) // Keep only last 10 activities
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const addFlashcardDeck = (deck: Omit<FlashcardDeck, 'id'>) => {
    let newDeck: FlashcardDeck;
    setUser(currentUser => {
      if (!currentUser) return null;

      newDeck = {
        ...deck,
        id: `deck-${Date.now()}`,
      };

      const updatedUser = {
        ...currentUser,
        flashcardDecks: [...currentUser.flashcardDecks, newDeck]
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
    return newDeck;
  };

  const updateFlashcardDeck = (deckId: string, deckUpdate: Partial<FlashcardDeck>) => {
    setUser(currentUser => {
      if (!currentUser) return null;

      const updatedDecks = currentUser.flashcardDecks.map(deck => 
        deck.id === deckId ? { ...deck, ...deckUpdate } : deck
      );

      const updatedUser = {
        ...currentUser,
        flashcardDecks: updatedDecks
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const deleteFlashcardDeck = (deckId: string) => {
    setUser(currentUser => {
      if (!currentUser) return null;

      const updatedUser = {
        ...currentUser,
        flashcardDecks: currentUser.flashcardDecks.filter(deck => deck.id !== deckId)
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const deleteFlashcard = (deckId: string, cardId: string) => {
    setUser(currentUser => {
      if (!currentUser) return null;

      const updatedDecks = currentUser.flashcardDecks.map(deck => {
        if (deck.id === deckId) {
          const updatedCards = deck.cards.filter(card => card.id !== cardId);
          return {
            ...deck,
            cards: updatedCards,
            cardCount: updatedCards.length,
            masteredCount: updatedCards.filter(card => card.mastered).length
          };
        }
        return deck;
      });

      const updatedUser = {
        ...currentUser,
        flashcardDecks: updatedDecks
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (!parsed.recentActivity) {
        parsed.recentActivity = [];
      }
      if (!parsed.flashcardDecks) {
        parsed.flashcardDecks = [];
      }
      setUser(parsed);
    }
    setIsLoading(false);
  }, []);

  const value = {
    user,
    setUser: (newUser: User | null) => {
      if (newUser) {
        if (!newUser.recentActivity) {
          newUser.recentActivity = [];
        }
        if (!newUser.flashcardDecks) {
          newUser.flashcardDecks = [];
        }
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    },
    isLoading,
    addActivity,
    addFlashcardDeck,
    updateFlashcardDeck,
    deleteFlashcardDeck,
    deleteFlashcard
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};