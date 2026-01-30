import React from 'react';
import { SHOP_ITEMS } from '../constants';

interface ShopModalProps {
  onClose: () => void;
  onBuy: (item: typeof SHOP_ITEMS[0]) => void;
  isBuying: string | null;
}

const ShopModal: React.FC<ShopModalProps> = ({ onClose, onBuy, isBuying }) => {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl w-full max-w-sm border border-white/20 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">💰 购买金豆</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        
        <div className="space-y-3">
          {SHOP_ITEMS.map(item => (
            <div key={item.id} className="bg-white/10 p-4 rounded-xl flex justify-between items-center border border-white/5 hover:bg-white/20 transition-colors">
              <div>
                <div className="font-bold text-lg text-yellow-300">{item.name}</div>
                <div className="text-gray-300 text-sm">{item.credits} 积分</div>
              </div>
              <button 
                onClick={() => onBuy(item)}
                disabled={isBuying !== null}
                className={`bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold py-2 px-4 rounded-full flex items-center gap-1 shadow-lg transform transition-all ${isBuying === item.id ? 'opacity-70 scale-95 cursor-wait' : 'hover:scale-105'}`}
              >
                {isBuying === item.id ? (
                    <span>处理中...</span>
                ) : (
                    <span>⭐️ {item.stars}</span>
                )}
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          使用 Telegram Stars (XTR) 进行安全支付
        </p>
      </div>
    </div>
  );
};

export default ShopModal;