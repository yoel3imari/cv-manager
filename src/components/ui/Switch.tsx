import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  className = '',
}) => {
  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0D3880]/20 ${
          checked ? 'bg-[#0D3880]' : 'bg-zinc-200 hover:bg-zinc-300'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-150 ease-in-out ${
            checked ? 'translate-x-3' : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className="text-xs text-zinc-600 font-medium">{label}</span>}
    </label>
  );
};
