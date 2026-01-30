import React from 'react';

interface LobbyProps {
  credits: number;
  onStartGame: () => void;
  onOpenShop: () => void;
  onSignIn: () => void;
  onJoinGroup: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ credits, onStartGame, onOpenShop, onSignIn, onJoinGroup }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#1a2e1a] bg-opacity-90 backdrop-blur-sm animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex justify-between items-center p-4 md:p-6 w-full max-w-6xl mx-auto">
        
        {/* Top Left: Sign In */}
        <button 
          onClick={onSignIn}
          className="flex flex-col items-center justify-center gap-1 group"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform border-2 border-white/20">
            <span className="text-xl">📅</span>
          </div>
          <span className="text-xs md:text-sm text-white font-bold shadow-black drop-shadow-md">签到</span>
        </button>

        {/* Center: Credits */}
        <div className="flex items-center bg-black/40 rounded-full px-4 py-2 border border-white/10 backdrop-blur-md shadow-inner gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-yellow-400 font-bold text-lg md:text-xl font-mono">{credits}</span>
          </div>
          <button 
            onClick={onOpenShop}
            className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transition-colors"
          >
            + 充值
          </button>
        </div>

        {/* Top Right: Group */}
        <button 
          onClick={onJoinGroup}
          className="flex flex-col items-center justify-center gap-1 group"
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform border-2 border-white/20">
            <span className="text-xl">👥</span>
          </div>
          <span className="text-xs md:text-sm text-white font-bold shadow-black drop-shadow-md">官方群</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-4">
        
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-xl tracking-wider" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            斗地主
          </h1>
          <p className="text-yellow-200/80 text-sm md:text-base mt-2 font-light tracking-widest">GEMINI AI POWERED</p>
        </div>

        {/* Game Modes */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center items-center">
          
          {/* Auto Match */}
          <button 
            onClick={onStartGame}
            className="w-full md:w-80 h-40 md:h-56 rounded-2xl bg-gradient-to-br from-green-600 to-teal-800 border-t border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:scale-105 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-white/20 transition-colors">
              <span className="text-4xl">⚡️</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">自动匹配</h2>
            <p className="text-green-200 text-sm">单人 AI 极速对战</p>
          </button>

          {/* Play with Friends */}
          <button 
            onClick={() => window.Telegram?.WebApp?.showPopup({ title: '敬请期待', message: '好友约战功能正在开发中...' })}
            className="w-full md:w-80 h-40 md:h-56 rounded-2xl bg-gradient-to-br from-orange-600 to-red-800 border-t border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:scale-105 transition-all duration-300 grayscale-[0.3] hover:grayscale-0"
          >
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-white/20 transition-colors">
              <span className="text-4xl">🏓</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">牌友约战</h2>
            <p className="text-orange-200 text-sm">创建房间 邀请好友</p>
          </button>

        </div>
      </div>

      {/* Footer / Version */}
      <div className="p-4 text-center text-white/20 text-xs">
        v1.0.0 • Gemini 3 Flash Preview
      </div>
    </div>
  );
};

export default Lobby;