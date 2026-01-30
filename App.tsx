import React from 'react';
import { useTelegram } from './hooks/useTelegram';
import { useGame } from './hooks/useGame';
import TopBar from './components/TopBar';
import GameTable from './components/GameTable';
import PlayerHand from './components/PlayerHand';
import ShopModal from './components/ShopModal';
import Lobby from './components/Lobby';
import { GamePhase } from './types';

const TG_GROUP_URL = 'https://t.me/+82103323067'; // Replace with your actual group link

const App: React.FC = () => {
  // Logic Hooks
  const { 
    isTg, credits, userName, isLoadingUser, syncCredits, 
    handleBuy, isBuying, showShop, setShowShop 
  } = useTelegram();
  
  const {
    phase, setPhase, players, landlordCards, currentTurn, lastPlayedHand,
    winner, gameLog, startGame, selectedCardIds, toggleSelectCard,
    isAiThinking, hintReasoning, humanPlay, humanPass, requestHint, consecutivePasses
  } = useGame(credits, syncCredits, isTg, setShowShop, userName);

  // Sign In Logic
  const handleSignIn = () => {
    const today = new Date().toDateString();
    const lastSignIn = localStorage.getItem('lastSignInDate');

    if (lastSignIn === today) {
        window.Telegram?.WebApp?.showPopup({
            title: '已签到',
            message: '今天已经签到过了，明天再来吧！'
        });
        return;
    }

    const reward = 100;
    syncCredits(reward, 'daily_checkin');
    localStorage.setItem('lastSignInDate', today);
    
    window.Telegram?.WebApp?.showPopup({
        title: '签到成功',
        message: `获得 ${reward} 积分奖励！`
    });
  };

  const handleJoinGroup = () => {
    if (isTg) {
       window.Telegram?.WebApp?.openTelegramLink(TG_GROUP_URL);
    } else {
       window.open(TG_GROUP_URL, '_blank');
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#1a2e1a] flex flex-col overflow-hidden text-gray-100 font-sans">
      
      {/* Show Lobby when in Lobby Phase */}
      {phase === GamePhase.Lobby ? (
        <Lobby 
          credits={credits}
          onStartGame={startGame}
          onOpenShop={() => setShowShop(true)}
          onSignIn={handleSignIn}
          onJoinGroup={handleJoinGroup}
        />
      ) : (
        /* Game View */
        <>
           {/* Header - Only shown during game */}
          <TopBar 
            credits={credits}
            isLoadingUser={isLoadingUser}
            gameLog={gameLog}
            landlordCards={landlordCards}
            onOpenShop={() => setShowShop(true)}
          />

          {/* Game Area */}
          <GameTable
            phase={phase}
            players={players}
            currentTurn={currentTurn}
            lastPlayedHand={lastPlayedHand}
            winner={winner}
            isAiThinking={isAiThinking}
            onStartGame={startGame}
            onReturnToLobby={() => setPhase(GamePhase.Lobby)}
          />

          {/* Player Hand Area */}
          <PlayerHand
            player={players[0]}
            phase={phase}
            currentTurn={currentTurn}
            consecutivePasses={consecutivePasses}
            selectedCardIds={selectedCardIds}
            hintReasoning={hintReasoning}
            isAiThinking={isAiThinking}
            onToggleCard={toggleSelectCard}
            onPlay={humanPlay}
            onPass={humanPass}
            onHint={requestHint}
          />
        </>
      )}

      {/* Shop Modal - Available globally */}
      {showShop && (
        <ShopModal 
          onClose={() => setShowShop(false)}
          onBuy={handleBuy}
          isBuying={isBuying}
        />
      )}

    </div>
  );
};

export default App;