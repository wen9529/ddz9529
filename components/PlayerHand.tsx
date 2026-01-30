import React from 'react';
import { Player, GamePhase } from '../types';
import { AVATARS } from '../constants';
import Avatar from './Avatar';
import CardComponent from './CardComponent';

interface PlayerHandProps {
  player: Player;
  phase: GamePhase;
  currentTurn: number;
  consecutivePasses: number;
  selectedCardIds: Set<string>;
  hintReasoning: string | null;
  isAiThinking: boolean;
  onToggleCard: (id: string) => void;
  onPlay: () => void;
  onPass: () => void;
  onHint: () => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  phase,
  currentTurn,
  consecutivePasses,
  selectedCardIds,
  hintReasoning,
  isAiThinking,
  onToggleCard,
  onPlay,
  onPass,
  onHint
}) => {
  const isMyTurn = phase === GamePhase.Playing && currentTurn === 0;

  const getOverlapStyle = (index: number, total: number) => {
    const offset = Math.min(30, 400 / total); 
    return { marginLeft: index === 0 ? 0 : `-${offset}px` };
  };

  return (
    <div className="h-[35%] md:h-[40%] bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 flex flex-col justify-end items-center relative z-20">
       
       {/* Action Bar */}
       {isMyTurn && (
           <div className="absolute -top-12 md:-top-16 flex gap-2 md:gap-4 scale-90 md:scale-100 origin-bottom">
               <button 
                  onClick={onPass}
                  disabled={consecutivePasses >= 2} 
                  className="bg-gray-600 hover:bg-gray-500 border-b-4 border-gray-800 active:border-b-0 active:translate-y-1 text-white font-bold py-2 px-6 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                  不出
               </button>
               
               <button 
                  onClick={onHint}
                  disabled={isAiThinking}
                  className="bg-blue-600 hover:bg-blue-500 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 text-white font-bold py-2 px-6 rounded-lg shadow disabled:opacity-50 transition-all"
               >
                  提示
               </button>

               <button 
                  onClick={onPlay}
                  disabled={selectedCardIds.size === 0}
                  className="bg-green-600 hover:bg-green-500 border-b-4 border-green-800 active:border-b-0 active:translate-y-1 text-white font-bold py-2 px-8 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                  出牌
               </button>
           </div>
       )}
       
       {/* Hint Bubble */}
       {hintReasoning && (
           <div className="absolute -top-28 md:-top-32 bg-blue-900/90 text-blue-100 p-3 rounded-lg max-w-xs md:max-w-md text-center text-xs md:text-sm border border-blue-500 shadow-xl animate-bounce-small">
               <span className="font-bold block mb-1 text-yellow-300">💡 建议:</span>
               {hintReasoning}
           </div>
       )}

       {/* Human Avatar */}
       <div className="absolute bottom-4 left-2 md:left-4 hidden md:block">
          <Avatar 
              url={AVATARS[0]} 
              name={player.name} 
              role={player.role} 
              isCurrent={isMyTurn} 
          />
       </div>

       {/* Hand Cards */}
       <div className="flex justify-center items-end w-full max-w-6xl h-32 md:h-48 mb-2 pb-safe">
          {player.hand.map((card, index) => (
              <div 
                  key={card.id} 
                  style={getOverlapStyle(index, player.hand.length)}
                  className="z-10 hover:z-20 transition-all duration-200"
              >
                  <CardComponent 
                      card={card} 
                      selected={selectedCardIds.has(card.id)}
                      onClick={() => onToggleCard(card.id)}
                  />
              </div>
          ))}
       </div>
    </div>
  );
};

export default PlayerHand;