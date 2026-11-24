import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  onClick,
  title,
  className = '',
  size = 'md',
}) => {
  const dim = size === 'sm' ? 'w-3.5 h-3.5 rounded-[4px]' : 'w-4 h-4 rounded-[5px]';
  const iconDim = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      title={title}
      onClick={(e) => {
        if (onClick) onClick(e);
        onChange(!checked);
      }}
      className={`${dim} inline-flex items-center justify-center border transition-all shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D3880]/20 ${
        checked
          ? 'bg-[#0D3880] border-[#0D3880] text-white shadow-2xs'
          : 'bg-white border-zinc-300 hover:border-zinc-400 text-transparent'
      } ${className}`}
    >
      <Check className={`${iconDim} stroke-[2.75]`} />
    </button>
  );
};
