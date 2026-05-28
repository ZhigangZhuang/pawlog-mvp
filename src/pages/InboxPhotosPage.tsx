import { Camera, Check, EyeOff, Plus } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import type { AppState } from "../types";
import { createId, withChangeLog } from "../utils/storage";

export function InboxPhotosPage({ state, onBack, onSave, onCreateAnimal }: { state: AppState; onBack: () => void; onSave: (state: AppState) => void; onCreateAnimal: () => void }) {
  const [imageUrl, setImageUrl] = useState("");
  const [targetAnimalId, setTargetAnimalId] = useState(state.animals[0]?.id || "");
  const inbox = state.inboxPhotos.filter((photo) => photo.status === "unassigned");

  const addPhoto = () => {
    if (!imageUrl.trim()) return;
    onSave({
      ...state,
      inboxPhotos: [
        {
          id: createId("inbox"),
          image_url: imageUrl.trim(),
          note: "手动批量导入照片，待归档",
          status: "unassigned",
          created_at: new Date().toISOString(),
        },
        ...state.inboxPhotos,
      ],
    });
    setImageUrl("");
  };

  const assign = (photoId: string) => {
    const photo = state.inboxPhotos.find((item) => item.id === photoId);
    if (!photo || !targetAnimalId) return;
    const now = new Date().toISOString();
    const nextState = {
      ...state,
      inboxPhotos: state.inboxPhotos.map((item) => (item.id === photoId ? { ...item, status: "assigned" as const, assigned_animal_id: targetAnimalId } : item)),
      photos: [
        {
          id: createId("photo"),
          animal_id: targetAnimalId,
          image_url: photo.image_url,
          taken_at: photo.taken_at || now,
          note: photo.note || "从待归档照片箱归档",
          created_at: now,
          source: { source_type: "self" as const },
        },
        ...state.photos,
      ],
      timeline: [
        {
          id: createId("tl"),
          animal_id: targetAnimalId,
          type: "photo" as const,
          title: "归档待处理照片",
          description: photo.note || "从待归档照片箱归档",
          image_url: photo.image_url,
          occurred_at: now,
          created_at: now,
          source: { source_type: "self" as const },
        },
        ...state.timeline,
      ],
    };
    onSave(withChangeLog(nextState, { animal_id: targetAnimalId, action: "assigned_inbox_photo", after: { inbox_photo_id: photoId } }));
  };

  const ignore = (photoId: string) => {
    onSave({ ...state, inboxPhotos: state.inboxPhotos.map((item) => (item.id === photoId ? { ...item, status: "ignored" } : item)) });
  };

  return (
    <AppShell title="待归档照片" subtitle={`${inbox.length} 张待处理`} canGoBack onBack={onBack}>
      <div className="space-y-5">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
          MVP 暂不做 AI 识别。你可以先批量导入照片，再手动归档到已有动物，或用照片新建档案。
        </div>

        <div className="space-y-3 rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <label className="block text-sm font-bold">批量导入照片 URL</label>
          <div className="flex gap-2">
            <input className="min-w-0 flex-1 rounded-lg border border-sand px-3 py-2 outline-none focus:border-clay" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="粘贴图片地址" />
            <button className="rounded-full bg-clay px-4 text-white" onClick={addPhoto}>
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <label className="mb-2 block text-sm font-bold">归档到</label>
          <select className="w-full rounded-lg border border-sand bg-white px-3 py-2" value={targetAnimalId} onChange={(event) => setTargetAnimalId(event.target.value)}>
            {state.animals.filter((animal) => animal.archive_status === "active").map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {inbox.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-[20px] bg-white ring-1 ring-sand/70">
              <img className="h-56 w-full object-cover" src={photo.image_url} alt={photo.note || "待归档照片"} />
              <div className="space-y-3 p-4">
                <p className="text-sm text-stone-600">{photo.note || "待归档照片"}</p>
                <div className="grid grid-cols-3 gap-2">
                  <button className="rounded-full bg-clay px-3 py-2 text-sm font-bold text-white" onClick={() => assign(photo.id)}>
                    <Check className="inline" size={15} /> 归档
                  </button>
                  <button className="rounded-full bg-white px-3 py-2 text-sm font-bold text-ink ring-1 ring-sand/80" onClick={onCreateAnimal}>
                    <Camera className="inline" size={15} /> 新建
                  </button>
                  <button className="rounded-full bg-stone-100 px-3 py-2 text-sm font-bold text-stone-600" onClick={() => ignore(photo.id)}>
                    <EyeOff className="inline" size={15} /> 忽略
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
