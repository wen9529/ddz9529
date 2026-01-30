import React from 'react';
import { Card } from '../types';
import CardComponent from './CardComponent';

interface TopBarProps {
  credits: number;
  isLoadingUser: boolean;
  gameLog: string[];
  landlordCards: Card[];
  onOpenShop: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ credits, isLoadingUser, gameLog, landlordCards, onOpenShop }) => {
  return (
    <div className="absolute top-0 w-full p-2 md:p-4 flex justify-between items-start z-10 pointer-events-none">
      
      {/* Info Box */}
      <div className="bg-black/40 backdrop-blur-sm p-2 rounded text-sm pointer-events-auto border border-white/10">
        <h1 className="font-bold text-yellow-400">Gemini 斗地主</h1>
        <div className="flex items-center gap-2 my-1">
           <span className="text-yellow-300 font-bold text-lg">
              💰 {isLoadingUser ? '...' : credits}
           </span>
           <button 
              onClick={onOpenShop}
              className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs px-2 py-1 rounded"
           >
              充值
           </button>
        </div>
        <div className="mt-1 text-xs text-gray-400 max-h-20 overflow-hidden">
          {gameLog.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
      
      {/* Landlord Cards */}
      {landlordCards.length > 0 && (
        <div className="flex flex-col items-center pointer-events-auto bg-black/20 p-2 rounded-lg backdrop-blur-sm">
          <span className="text-white/60 text-[10px] mb-1 uppercase tracking-wider font-bold">地主底牌</span>
          <div className="flex">
            {landlordCards.map((c) => (
              <div key={c.id} className="mx-0.5 md:mx-1">
                 <CardComponent card={c} small />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;