import React, { useState } from 'react';
import { useCvStore } from '../../store/useCvStore';
import { Select } from '../ui/Select';

export const AddLanguageModal: React.FC = () => {
  const { showAddLanguageModal, data, setModal, addLanguage } = useCvStore();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [flag, setFlag] = useState('🌐');
  const [cloneFrom, setCloneFrom] = useState('en');

  if (!showAddLanguageModal) return null;

  const languages = data.meta.languages || [];

  const handleSubmit = () => {
    addLanguage({ code, name, flag, cloneFrom });
    setCode('');
    setName('');
  };

  return (
    <div
      onClick={() => setModal('addLanguage', false)}
      className="no-print fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-96 p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-zinc-900">
          Add New CV Language
        </h3>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="de, es, ar"
                className="w-full text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                Language Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Deutsch / Español"
                className="w-full text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                Flag Icon
              </label>
              <input
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="🇩🇪"
                className="w-full text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                Clone Content From
              </label>
              <Select
                value={cloneFrom}
                options={languages.map((l) => ({
                  value: l.code,
                  label: `${l.name} (${l.code.toUpperCase()})`,
                }))}
                onChange={(val) => setCloneFrom(val)}
                className="w-full"
                triggerClassName="w-full"
                menuClassName="w-full"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => setModal('addLanguage', false)}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#0D3880] text-white font-medium cursor-pointer"
          >
            Create Language
          </button>
        </div>
      </div>
    </div>
  );
};
