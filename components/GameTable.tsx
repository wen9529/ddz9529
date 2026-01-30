import React from 'react';
import { Player, GamePhase, PlayedHand, PlayerRole } from '../types';
import { AVATARS } from '../constants';
import Avatar from './Avatar';
import CardComponent from './CardComponent';

interface GameTableProps {
  phase: GamePhase;
  players: Player[];
  currentTurn: number;
  lastPlayedHand: PlayedHand | null;
  winner: Player | null;
  isAiThinking: boolean;
  onStartGame: () => void;
  onReturnToLobby: () => void;
}

const GameTable: React.FC<GameTableProps> = ({
  phase,
  players,
  currentTurn,
  lastPlayedHand,
  winner,
  isAiThinking,
  onStartGame,
  onReturnToLobby
}) => {
  return (
    <div className="flex-1 relative flex justify-center items-center perspective-1000">
      
      {/* Player 2 (Bot Left) */}
      <div className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 md:gap-4 transition-all">
          <Avatar 
              url={AVATARS[2]} 
              name={players[2].name} 
              role={players[2].role} 
              isCurrent={currentTurn === 2} 
          />
          <div className="bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
              {players[2].hand.length} 张
          </div>
          {players[2].lastAction === 'pass' && (
              <div className="text-yellow-400 font-bold text-sm bg-black/60 px-2 rounded">不出</div>
          )}
      </div>

      {/* Player 1 (Bot Right) */}
      <div className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 md:gap-4 transition-all">
           <Avatar 
              url={AVATARS[1]} 
              name={players[1].name} 
              role={players[1].role} 
              isCurrent={currentTurn === 1} 
          />
          <div className="bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
              {players[1].hand.length} 张
          </div>
           {players[1].lastAction === 'pass' && (
              <div className="text-yellow-400 font-bold text-sm bg-black/60 px-2 rounded">不出</div>
          )}
      </div>

      {/* Center Table (Played Cards) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-48 flex justify-center items-center z-0">
          {lastPlayedHand ? (
              <div className="flex">
                  {lastPlayedHand.cards.map((c, i) => (
                       <div key={c.id} style={{ marginLeft: i === 0 ? 0 : '-35px' }} className="transform hover:scale-105 transition-transform">
                           <CardComponent card={c} />
                       </div>
                  ))}
              </div>
          ) : (
              <div className="text-white/10 font-bold text-2xl md:text-4xl select-none">
                  {phase === GamePhase.Playing ? "等待出牌..." : ""}
              </div>
          )}
      </div>

      {/* AI Thinking Indicator */}
      {isAiThinking && (
           <div className="absolute top-[35%] md:top-[40%] left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-white px-4 py-1.5 rounded-full animate-pulse z-20 text-sm border border-white/20">
              AI 正在思考...
           </div>
      )}

      {/* Game Over Overlay */}
      {phase === GamePhase.GameOver && winner && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
              <h2 className={`text-5xl md:text-6xl font-bold mb-4 ${winner.isHuman ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {winner.isHuman ? "胜利!" : "失败"}
              </h2>
              <p className="text-white text-lg md:text-xl mb-8">
                  {winner.role === PlayerRole.Landlord ? "地主" : "农民"} 赢了本局
              </p>
              <div className="flex gap-4">
                <button 
                    onClick={onStartGame}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all"
                >
                    再来一局 (50金豆)
                </button>
                <button 
                    onClick={onReturnToLobby}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full"
                >
                    返回大厅
                </button>
              </div>
          </div>
      )}
      
    </div>
  );
};

export default GameTable;