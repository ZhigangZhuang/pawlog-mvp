import { Camera, FilePlus2, Images } from "lucide-react";
import type React from "react";

type AddActionSheetProps = {
  open: boolean;
  onClose: () => void;
  onCreateRecord: () => void;
  onCreateAnimal: () => void;
  onImportPhotos: () => void;
};

export function AddActionSheet({ open, onClose, onCreateRecord, onCreateAnimal, onImportPhotos }: AddActionSheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[28px] bg-cream p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-stone-300" />
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">添加什么？</h2>
            <p className="text-sm text-stone-500">先轻轻记一笔，细节可以之后补</p>
          </div>
          <button className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-stone-600 ring-1 ring-sand/80" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="space-y-2">
          <Action icon={<Camera size={20} />} title="发动态" text="给某只毛孩发一条新动态" onClick={onCreateRecord} tone="green" />
          <Action icon={<FilePlus2 size={20} />} title="新建毛孩档案" text="记录自家宠物或流浪猫狗" onClick={onCreateAnimal} tone="orange" />
          <Action icon={<Images size={20} />} title="导入照片" text="先放进待归档照片箱" onClick={onImportPhotos} tone="gray" />
        </div>
      </div>
    </div>
  );
}

function Action({ icon, title, text, tone, onClick }: { icon: React.ReactNode; title: string; text: string; tone: "green" | "orange" | "gray"; onClick: () => void }) {
  const toneClass = {
    green: "bg-green-50 text-moss",
    orange: "bg-orange-50 text-clay",
    gray: "bg-stone-100 text-stone-600",
  }[tone];
  return (
    <button className="flex w-full items-center gap-3 rounded-lg bg-white p-4 text-left ring-1 ring-sand/70" onClick={onClick}>
      <span className={`grid h-11 w-11 place-items-center rounded-full ${toneClass}`}>{icon}</span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className="text-sm text-stone-500">{text}</span>
      </span>
    </button>
  );
}
