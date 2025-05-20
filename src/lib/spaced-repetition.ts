// MATE (Memory Adaptive Training Engine) Spaced Repetition Algorithm

export type Difficulty = 'easy' | 'medium' | 'hard';

interface CardMetadata {
  lastReviewed: Date;
  nextReview: Date;
  interval: number; // in days
  easeFactor: number;
  consecutiveCorrect: number;
  totalReviews: number;
}

export interface FlashcardWithMetadata {
  id: string;
  front: string;
  back: string;
  metadata: CardMetadata;
  masteryLevel?: number;  // Added for backward compatibility
}

// Constants for mastery level calculation
const MAX_INTERVAL = 365; // Maximum interval in days
const MAX_CONSECUTIVE = 5; // Number of consecutive correct answers for full mastery

const DEFAULT_METADATA: CardMetadata = {
  lastReviewed: new Date(),
  nextReview: new Date(),
  interval: 1,
  easeFactor: 2.5,
  consecutiveCorrect: 0,
  totalReviews: 0,
};

// Difficulty multipliers for adjusting intervals
const DIFFICULTY_FACTORS = {
  easy: 1.3,
  medium: 1.0,
  hard: 0.5,
};

// Ease factor adjustments
const EASE_ADJUSTMENTS = {
  easy: 0.15,
  medium: 0,
  hard: -0.15,
};

// Minimum and maximum values for ease factor
const MIN_EASE = 1.3;
const MAX_EASE = 2.5;

/**
 * Returns a mastery level (0-100) based on the card's metadata
 */
export function getMasteryLevel(metadata: CardMetadata): number {
  // Weight factors for different components
  const intervalWeight = 0.4;
  const consecutiveWeight = 0.3;
  const easeFactorWeight = 0.3;

  // Calculate individual components
  const intervalScore = Math.min(metadata.interval / MAX_INTERVAL, 1);
  const consecutiveScore = Math.min(metadata.consecutiveCorrect / MAX_CONSECUTIVE, 1);
  const easeFactorScore = (metadata.easeFactor - MIN_EASE) / (MAX_EASE - MIN_EASE);

  // Calculate weighted average
  const masteryLevel = Math.round(
    (intervalScore * intervalWeight +
    consecutiveScore * consecutiveWeight +
    easeFactorScore * easeFactorWeight) * 100
  );

  return Math.min(Math.max(masteryLevel, 0), 100);
}

export function initializeCard(front: string, back: string, id?: string): FlashcardWithMetadata {
  return {
    id: id || crypto.randomUUID(),
    front,
    back,
    metadata: { ...DEFAULT_METADATA },
  };
}

export function processReview(
  card: FlashcardWithMetadata,
  difficulty: Difficulty
): FlashcardWithMetadata {
  const now = new Date();
  const metadata = { ...card.metadata };

  // Update ease factor based on difficulty
  metadata.easeFactor = Math.max(
    MIN_EASE,
    Math.min(
      MAX_EASE,
      metadata.easeFactor + EASE_ADJUSTMENTS[difficulty]
    )
  );

  // Update consecutive correct answers
  if (difficulty === 'hard') {
    metadata.consecutiveCorrect = 0;
  } else {
    metadata.consecutiveCorrect++;
  }

  // Calculate new interval
  let newInterval: number;
  if (metadata.totalReviews === 0) {
    newInterval = 1;
  } else if (metadata.totalReviews === 1) {
    newInterval = 3;
  } else {
    newInterval = Math.round(
      metadata.interval * metadata.easeFactor * DIFFICULTY_FACTORS[difficulty]
    );
  }

  // Ensure minimum interval of 1 day
  newInterval = Math.max(1, newInterval);

  // Update metadata
  metadata.interval = newInterval;
  metadata.lastReviewed = now;
  metadata.nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
  metadata.totalReviews++;

  return {
    ...card,
    metadata,
  };
}

export function getDueCards(cards: FlashcardWithMetadata[]): FlashcardWithMetadata[] {
  const now = new Date();
  return cards.filter(card => card.metadata.nextReview <= now)
    .sort((a, b) => {
      // Prioritize cards with more reviews due
      const aOverdue = a.metadata.nextReview.getTime() - now.getTime();
      const bOverdue = b.metadata.nextReview.getTime() - now.getTime();
      return bOverdue - aOverdue;
    });
}

export function getReviewStats(cards: FlashcardWithMetadata[]) {
  const now = new Date();
  const dueToday = cards.filter(card => card.metadata.nextReview <= now).length;
  const dueTomorrow = cards.filter(card => {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return card.metadata.nextReview > now && card.metadata.nextReview <= tomorrow;
  }).length;

  const totalCards = cards.length;
  const masteredCards = cards.filter(card => card.metadata.interval >= 21).length;
  const masteryPercentage = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0;

  return {
    dueToday,
    dueTomorrow,
    totalCards,
    masteredCards,
    masteryPercentage,
  };
}
