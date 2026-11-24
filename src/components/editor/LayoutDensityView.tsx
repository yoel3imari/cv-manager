import React from 'react';
import { useCvStore } from '../../store/useCvStore';

export const LayoutDensityView: React.FC = () => {
  const { data, updateData } = useCvStore();
  const style = data.meta.style;

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3.5">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
            Base Font Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['10pt', '10.5pt', '11pt'] as const).map((fs) => (
              <button
                key={fs}
                onClick={() =>
                  updateData((d) => {
                    d.meta.style.fontSize = fs;
                  })
                }
                className={`py-1.5 rounded-lg text-xs transition cursor-pointer ${
                  style.fontSize === fs
                    ? 'bg-[#0D3880] text-white font-semibold'
                    : 'bg-white text-zinc-700 border border-zinc-200'
                }`}
              >
                {fs}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-zinc-600">Page Margins (cm)</span>
            <span className="font-mono text-zinc-900">{style.marginCm} cm</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.1"
            value={style.marginCm}
            onChange={(e) =>
              updateData((d) => {
                d.meta.style.marginCm = parseFloat(e.target.value);
              })
            }
            className="w-full accent-[#0D3880]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-zinc-600">
              Section Top Spacing (pt)
            </span>
            <span className="font-mono text-zinc-900">
              {style.sectionSpacingPt} pt
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="20"
            step="1"
            value={style.sectionSpacingPt}
            onChange={(e) =>
              updateData((d) => {
                d.meta.style.sectionSpacingPt = parseInt(e.target.value, 10);
              })
            }
            className="w-full accent-[#0D3880]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-zinc-600">
              Project Item Spacing (pt)
            </span>
            <span className="font-mono text-zinc-900">
              {style.projectItemSepPt} pt
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={style.projectItemSepPt}
            onChange={(e) =>
              updateData((d) => {
                d.meta.style.projectItemSepPt = parseInt(e.target.value, 10);
              })
            }
            className="w-full accent-[#0D3880]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
            Primary Accent Color (\definecolor&#123;maincolor&#125;)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.mainColor}
              onChange={(e) =>
                updateData((d) => {
                  d.meta.style.mainColor = e.target.value;
                })
              }
              className="w-8 h-8 rounded cursor-pointer border border-zinc-200"
            />
            <input
              type="text"
              value={style.mainColor}
              onChange={(e) =>
                updateData((d) => {
                  d.meta.style.mainColor = e.target.value;
                })
              }
              className="text-xs font-mono bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 w-28"
            />
            <button
              onClick={() =>
                updateData((d) => {
                  d.meta.style.mainColor = '#0D3880';
                })
              }
              className="text-xs text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
            >
              Reset (#0D3880)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
