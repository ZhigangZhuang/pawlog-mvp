import { Sparkles } from "lucide-react";
import type { Animal } from "../types";
import { speciesLabels } from "../utils/labels";

export function NewAnimalToast({
  animal,
  count,
  onClose,
  onOpen,
}: {
  animal: Animal;
  count: number;
  onClose: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-6">
      <div className="w-full max-w-sm rounded-[28px] bg-white p-5 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-clay">
          <Sparkles size={30} />
        </div>
        <p className="mt-4 text-sm font-semibold text-clay">今日加新</p>
        <h2 className="mt-1 text-3xl font-black">{animal.name}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          你记录的第 {count} 只
          {animal.animal_origin === "stray" ? "流浪" : "自家"}
          {speciesLabels[animal.species]}。 我的图鉴又点亮了一格。
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="rounded-full bg-stone-100 px-4 py-3 font-bold text-stone-600"
            onClick={onClose}
          >
            稍后看
          </button>
          <button
            className="rounded-full bg-clay px-4 py-3 font-bold text-white"
            onClick={onOpen}
          >
            查看档案
          </button>
        </div>
      </div>
    </div>
  );
}
