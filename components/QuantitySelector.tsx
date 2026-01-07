
import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md';
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ 
  quantity, 
  onIncrease, 
  onDecrease, 
  disabled = false,
  min = 1,
  max = 99,
  className = "",
  size = 'md'
}) => {
  const btnSize = size === 'sm' ? 'p-1 w-6 h-6' : 'p-1.5 w-8 h-8';
  const iconSize = size === 'sm' ? 12 : 14;
  const textSize = size === 'sm' ? 'text-xs w-6' : 'text-sm w-8';

  return (
    <div className={`flex items-center bg-gray-100 rounded-lg p-1 shadow-inner ${className}`}>
      <button 
        onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            if (quantity > min && !disabled) onDecrease(); 
        }}
        disabled={disabled || quantity <= min}
        className={`${btnSize} flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none active:scale-90`}
        aria-label="Decrease quantity"
      >
        <Minus size={iconSize} strokeWidth={2.5} />
      </button>
      
      <span className={`${textSize} font-bold text-gray-800 text-center select-none font-mono flex items-center justify-center`}>
        {quantity}
      </span>
      
      <button 
        onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            if (quantity < max && !disabled) onIncrease(); 
        }}
        disabled={disabled || quantity >= max}
        className={`${btnSize} flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none active:scale-90`}
        aria-label="Increase quantity"
      >
        <Plus size={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default QuantitySelector;
