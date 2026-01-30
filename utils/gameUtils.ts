import { Card, Suit } from '../types';
import { RANKS, VALUES } from '../constants';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  const suits = [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds];

  // Standard cards
  RANKS.forEach((rank, index) => {
    suits.forEach(suit => {
      deck.push({
        id: `${rank}-${suit}`,
        rank,
        value: VALUES[index],
        suit,
        color: (suit === Suit.Hearts || suit === Suit.Diamonds) ? 'red' : 'black'
      });
    });
  });

  // Jokers
  deck.push({
    id: 'SJ',
    rank: 'Small Joker',
    value: 16,
    suit: Suit.None,
    color: 'black'
  });
  
  deck.push({
    id: 'BJ',
    rank: 'Big Joker',
    value: 17,
    suit: Suit.None,
    color: 'red'
  });

  return shuffle(deck);
};

const shuffle = (array: Card[]): Card[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export const sortHand = (hand: Card[]): Card[] => {
  return [...hand].sort((a, b) => b.value - a.value); // Descending order
};

export const isSubset = (subset: Card[], superset: Card[]): boolean => {
  const supersetIds = new Set(superset.map(c => c.id));
  return subset.every(c => supersetIds.has(c.id));
};

export const formatHandForAI = (hand: Card[]): string => {
  return hand.map(c => {
    if (c.value >= 16) return c.rank;
    return `${c.rank}${c.suit}`;
  }).join(', ');
};