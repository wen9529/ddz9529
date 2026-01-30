import React from 'react';
import { Card } from '../types';

interface CardProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  hidden?: boolean;
  small?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, selected, onClick, hidden, small }) => {
  const baseClasses = "relative flex flex-col items-center justify-between rounded-lg shadow-md border border-gray-200 select-none transition-transform duration-200 cursor-pointer bg-white";
  
  // Dimensions
  const w = small ? "w-10" : "w-20 md:w-24";
  const h = small ? "h-14" : "h-28 md:h-36";
  const fontSize = small ? "text-xs" : "text-xl md:text-2xl";
  const suitSize = small ? "text-sm" : "text-3xl";

  const transform = selected ? "-translate-y-6" : "";
  const textColor = card.color === 'red' ? 'text-red-600' : 'text-gray-900';

  if (hidden) {
    return (
      <div 
        className={`${baseClasses} ${w} ${h} bg-blue-800 border-white border-2`}
        style={{ backgroundImage: 'linear-gradient(135deg, #1e3a8a 25%, #172554 25%, #172554 50%, #1e3a8a 50%, #1e3a8a 75%, #172554 75%, #172554 100%)', backgroundSize: '10px 10px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${w} ${h} ${textColor} ${transform} hover:-translate-y-2`}
      onClick={onClick}
    >
      {/* Top Left Rank/Suit */}
      <div className="absolute top-1 left-1 flex flex-col items-center leading-none">
        <span className={`font-bold ${fontSize}`}>{card.rank === 'Small Joker' ? 'SJ' : card.rank === 'Big Joker' ? 'BJ' : card.rank}</span>
        <span className={fontSize}>{card.suit}</span>
      </div>

      {/* Center Suit (Decoration) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${suitSize} opacity-20`}>
        {card.suit ? card.suit : (card.rank.includes('Joker') ? '🤡' : '')}
      </div>

      {/* Bottom Right Inverted */}
      <div className="absolute bottom-1 right-1 flex flex-col items-center leading-none transform rotate-180">
        <span className={`font-bold ${fontSize}`}>{card.rank === 'Small Joker' ? 'SJ' : card.rank === 'Big Joker' ? 'BJ' : card.rank}</span>
        <span className={fontSize}>{card.suit}</span>
      </div>
    </div>
  );
};

export default CardComponent;