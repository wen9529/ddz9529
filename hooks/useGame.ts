import { useState, useEffect } from 'react';
import { Card, GamePhase, Player, PlayerRole, PlayedHand } from '../types';
import { createDeck, sortHand } from '../utils/gameUtils';
import { getBotMove, getHint } from '../services/ai';
import { GAME_COST, WIN_REWARD } from '../constants';

export const useGame = (
    credits: number, 
    syncCredits: (amount: number, reason: string) => void,
    isTg: boolean,
    setShowShop: (show: boolean) => void,
    userName: string
) => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.Lobby);
  const [deck, setDeck] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([
    { id: 0, name: userName, isHuman: true, hand: [], role: null, lastAction: null },
    { id: 1, name: '电脑 (右)', isHuman: false, hand: [], role: null, lastAction: null },
    { id: 2, name: '电脑 (左)', isHuman: false, hand: [], role: null, lastAction: null }
  ]);
  const [landlordCards, setLandlordCards] = useState<Card[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [lastPlayedHand, setLastPlayedHand] = useState<PlayedHand | null>(null);
  const [consecutivePasses, setConsecutivePasses] = useState(0);
  const [winner, setWinner] = useState<Player | null>(null);
  
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hintReasoning, setHintReasoning] = useState<string | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);

  const addLog = (msg: string) => setGameLog(prev => [msg, ...prev].slice(0, 5));

  // Sync username updates
  useEffect(() => {
    setPlayers(prev => {
        const newP = [...prev];
        if(newP[0].name !== userName) {
            newP[0].name = userName;
            return newP;
        }
        return prev;
    });
  }, [userName]);

  // Start Game
  const startGame = () => {
    if (credits < GAME_COST) {
      if (isTg) {
        window.Telegram?.WebApp.showPopup({
          title: '积分不足',
          message: `开始游戏需要 ${GAME_COST} 积分。请充值。`,
          buttons: [{ id: 'shop', type: 'default', text: '去充值' }]
        }, (id) => {
          if (id === 'shop') setShowShop(true);
        });
      } else {
        alert("积分不足，请点击右上角充值！");
        setShowShop(true);
      }
      return;
    }

    syncCredits(-GAME_COST, 'game_fee');

    const newDeck = createDeck();
    const p1Hand = sortHand(newDeck.slice(0, 17));
    const p2Hand = sortHand(newDeck.slice(17, 34));
    const p3Hand = sortHand(newDeck.slice(34, 51));
    const kitty = newDeck.slice(51, 54);

    setDeck(newDeck);
    setLandlordCards(kitty);
    setPlayers([
      { ...players[0], hand: p1Hand, role: null, lastAction: null },
      { ...players[1], hand: p2Hand, role: null, lastAction: null },
      { ...players[2], hand: p3Hand, role: null, lastAction: null }
    ]);
    setPhase(GamePhase.Bidding);
    setLastPlayedHand(null);
    setConsecutivePasses(0);
    setWinner(null);
    setGameLog([]);
    addLog("游戏开始，进入叫分阶段。");
    
    const landlordId = Math.floor(Math.random() * 3);
    setCurrentTurn(landlordId);
  };

  // Bidding Logic
  useEffect(() => {
    if (phase === GamePhase.Bidding) {
      setTimeout(() => {
        assignLandlord(currentTurn);
      }, 1500);
    }
  }, [phase]);

  const assignLandlord = (landlordId: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === landlordId) {
        return { ...p, role: PlayerRole.Landlord, hand: sortHand([...p.hand, ...landlordCards]) };
      }
      return { ...p, role: PlayerRole.Peasant };
    }));
    addLog(`${players[landlordId].name} 成为地主!`);
    setPhase(GamePhase.Playing);
    setCurrentTurn(landlordId);
  };

  // AI Turn Loop
  useEffect(() => {
    if (phase === GamePhase.Playing && !winner) {
      const currentPlayer = players[currentTurn];
      if (!currentPlayer.isHuman) {
        setIsAiThinking(true);
        const timer = setTimeout(async () => {
          await executeBotTurn(currentPlayer);
          setIsAiThinking(false);
        }, 1000 + Math.random() * 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentTurn, phase, winner, lastPlayedHand]);

  const executeBotTurn = async (bot: Player) => {
    const currentTableState = consecutivePasses >= 2 ? null : lastPlayedHand;
    const cardsToPlay = await getBotMove(
      bot.hand,
      currentTableState,
      bot.role!,
      players.find(p => p.role === PlayerRole.Landlord)?.role || null,
      []
    );
    handlePlayCards(bot.id, cardsToPlay);
  };

  const handlePlayCards = (playerId: number, cards: Card[]) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      const pIndex = newPlayers.findIndex(p => p.id === playerId);
      const player = newPlayers[pIndex];

      if (cards.length === 0) {
        addLog(`${player.name} 不出.`);
        newPlayers[pIndex] = { ...player, lastAction: 'pass' };
        return newPlayers;
      } else {
        addLog(`${player.name} 出了 ${cards.length} 张牌.`);
        const newHand = player.hand.filter(c => !cards.find(played => played.id === c.id));
        newPlayers[pIndex] = { ...player, hand: newHand, lastAction: 'play' };
        return newPlayers;
      }
    });

    if (cards.length === 0) {
      const nextPasses = consecutivePasses + 1;
      setConsecutivePasses(nextPasses);
    } else {
      setLastPlayedHand({ playerId, cards });
      setConsecutivePasses(0);
    }

    const player = players.find(p => p.id === playerId);
    const remainingCardsCount = player!.hand.length - cards.length;
    
    if (remainingCardsCount === 0 && cards.length > 0) {
      setWinner(player!);
      setPhase(GamePhase.GameOver);
      
      if (player?.isHuman) {
          syncCredits(WIN_REWARD, 'game_win');
          addLog(`胜利! 获得 ${WIN_REWARD} 积分`);
      }
    } else {
       setCurrentTurn((prev) => (prev + 1) % 3);
    }
  };

  // Human Actions
  const toggleSelectCard = (id: string) => {
    if (phase !== GamePhase.Playing || currentTurn !== 0) return;
    
    const newSelected = new Set(selectedCardIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedCardIds(newSelected);
  };

  const humanPlay = () => {
    const selectedCards = players[0].hand.filter(c => selectedCardIds.has(c.id));
    if (selectedCards.length === 0) return; 

    handlePlayCards(0, selectedCards);
    setSelectedCardIds(new Set());
    setHintReasoning(null);
  };

  const humanPass = () => {
    handlePlayCards(0, []);
    setSelectedCardIds(new Set());
    setHintReasoning(null);
  };

  const requestHint = async () => {
    if (isAiThinking) return;
    setIsAiThinking(true);
    const tableState = consecutivePasses >= 2 ? null : lastPlayedHand;
    const result = await getHint(players[0].hand, tableState);
    
    if (result.cards.length > 0) {
      const ids = new Set(result.cards.map(c => c.id));
      setSelectedCardIds(ids);
    }
    setHintReasoning(result.reasoning);
    setIsAiThinking(false);
  };

  return {
      phase, setPhase,
      players,
      landlordCards,
      currentTurn,
      lastPlayedHand,
      winner,
      gameLog,
      startGame,
      selectedCardIds,
      toggleSelectCard,
      isAiThinking,
      hintReasoning,
      humanPlay,
      humanPass,
      requestHint,
      consecutivePasses
  };
};