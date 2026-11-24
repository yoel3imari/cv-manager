import React, { useState } from 'react';
import { useCvStore } from '../../store/useCvStore';
import { Select } from '../ui/Select';

export const AddSectionModal: React.FC = () => {
  const { showAddSectionModal, setModal, createCustomSection } = useCvStore();
  const [titleEn, setTitleEn] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [type, setType] = useState<'custom_entries' | 'custom_bullets'>(
    'custom_entries'
  );

  if (!showAddSectionModal) return null;

  const handleSubmit = () => {
    createCustomSection({ titleEn, titleFr, type });
    setTitleEn('');
    setTitleFr('');
  };

  return (
    <div
      onClick={() => setModal('addSection', false)}
      className="no-print fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-96 p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-zinc-900">
          Create Custom Section
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
              Section Title (English)
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g., Publications, Awards, Volunteering"
              className="w-full text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
              Section Title (French)
            </label>
            <input
              type="text"
              value={titleFr}
              onChange={(e) => setTitleFr(e.target.value)}
              placeholder="e.g., Publications, Distinctions, Bénévolat"
              className="w-full text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
              Layout Style
            </label>
            <Select
              value={type}
              options={[
                {
                  value: 'custom_entries',
                  label: 'Dated Entries (\\entry + bullets)',
                },
                {
                  value: 'custom_bullets',
                  label: 'Compact Bullet List (\\item \\textbf)',
                },
              ]}
              onChange={(val) =>
                setType(val as 'custom_entries' | 'custom_bullets')
              }
              className="w-full"
              triggerClassName="w-full"
              menuClassName="w-full"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setModal('addSection', false)}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#0D3880] text-white font-medium cursor-pointer"
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  );
};
