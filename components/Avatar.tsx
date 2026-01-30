import React from 'react';
import { PlayerRole } from '../types';

interface AvatarProps {
  url: string;
  name: string;
  role: PlayerRole | null;
  isCurrent: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ url, name, role, isCurrent }) => (
  <div className={`flex flex-col items-center gap-1 p-1 md:p-2 rounded-lg transition-colors ${isCurrent ? 'bg-yellow-500/30 ring-2 ring-yellow-400' : 'bg-black/30'}`}>
    <div className="relative">
      <img src={url} alt={name} className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-white object-cover" />
      {role === PlayerRole.Landlord && (
        <span className="absolute -top-2 -right-2 text-lg md:text-xl" title="地主">🤠</span>
      )}
      {role === PlayerRole.Peasant && (
        <span className="absolute -top-2 -right-2 text-lg md:text-xl" title="农民">👨‍🌾</span>
      )}
    </div>
    <span className="text-white text-xs md:text-sm font-semibold truncate max-w-[80px] text-center">{name}</span>
  </div>
);

export default Avatar;