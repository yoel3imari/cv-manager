import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  description?: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  footer?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  align = 'left',
  footer,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 text-xs font-medium bg-white hover:bg-zinc-50/90 text-zinc-800 rounded-lg px-2.5 py-1.5 border border-zinc-200/90 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0D3880]/20 focus:border-[#0D3880] transition cursor-pointer ${triggerClassName}`}
      >
        <span className="flex items-center gap-1.5 truncate">
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          {selected?.badge && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-100 text-zinc-500 font-medium shrink-0">
              {selected.badge}
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180 text-zinc-700' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-1.5 min-w-[180px] rounded-xl bg-white border border-zinc-200/90 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
        >
          <div className="max-h-64 overflow-y-auto px-1 space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 text-[#0D3880] font-semibold'
                      : 'text-zinc-700 hover:bg-zinc-100/80 font-medium'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{opt.label}</div>
                    {opt.description && (
                      <div className="text-[10px] text-zinc-400 truncate font-normal">
                        {opt.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded ${
                          isSelected
                            ? 'bg-blue-100/80 text-[#0D3880]'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                    <span className="w-3.5 h-3.5 flex items-center justify-center">
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0D3880]" />}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {footer && (
            <div
              onClick={() => setOpen(false)}
              className="mt-1 pt-1 px-1 border-t border-zinc-100"
            >
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
