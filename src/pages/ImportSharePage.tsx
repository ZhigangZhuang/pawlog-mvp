import { FileInput, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import type { AppState, SharedAnimalPackage } from "../types";
import { healthLabels, speciesLabels } from "../utils/labels";
import { activeAnimals, createId } from "../utils/storage";

export function ImportSharePage({
  state,
  onBack,
  onSave,
}: {
  state: AppState;
  onBack: () => void;
  onSave: (state: AppState, animalId: string) => void;
}) {
  const share = state.sharedPackages[0];
  const [targetId, setTargetId] = useState(
    activeAnimals(state).find(
      (animal) => animal.animal_origin === share?.animal.animal_origin,
    )?.id || "",
  );
  const [importPhotos, setImportPhotos] = useState(true);
  const [importRecords, setImportRecords] = useState(true);
  if (!share) {
    return (
      <AppShell title="导入分享" canGoBack onBack={onBack}>
        <div className="rounded-lg bg-white p-5 text-sm text-stone-500 ring-1 ring-sand/70">
          暂无分享包。
        </div>
      </AppShell>
    );
  }

  const saveAsNew = () => {
    const now = new Date().toISOString();
    const newId = createId("animal");
    const source = {
      source_type: "shared_link" as const,
      source_user_id: share.animal.user_id,
      source_animal_id: share.animal.id,
      imported_at: now,
    };
    onSave(
      {
        ...state,
        animals: [
          {
            ...share.animal,
            id: newId,
            user_id: "user_1",
            archive_status: "active",
            created_at: now,
            updated_at: now,
          },
          ...state.animals,
        ],
        photos: importPhotos
          ? [
              ...share.photos.map((photo) => ({
                ...photo,
                id: createId("photo"),
                animal_id: newId,
                source,
              })),
              ...state.photos,
            ]
          : state.photos,
        timeline: importRecords
          ? [
              ...share.timeline.map((item) => ({
                ...item,
                id: createId("tl"),
                animal_id: newId,
                source,
              })),
              ...state.timeline,
            ]
          : state.timeline,
        locations: [
          ...share.locations.map((location) => ({
            ...location,
            id: createId("loc"),
            animal_id: newId,
            precision_level:
              location.animal_origin === "stray"
                ? ("text_only" as const)
                : location.precision_level,
            is_sensitive: true,
            visibility: "private" as const,
            address_text: "导入分享后保持私密",
            source,
          })),
          ...state.locations,
        ],
      },
      newId,
    );
  };

  const mergeToExisting = () => {
    const target = state.animals.find((animal) => animal.id === targetId);
    if (!target) return;
    const now = new Date().toISOString();
    const source = {
      source_type: "shared_link" as const,
      source_user_id: share.animal.user_id,
      source_animal_id: share.animal.id,
      imported_at: now,
    };
    onSave(
      {
        ...state,
        animals: state.animals.map((animal) =>
          animal.id === target.id
            ? {
                ...animal,
                aliases: [
                  ...new Set([...(animal.aliases || []), share.animal.name]),
                ],
                health_status:
                  animal.health_status === "normal"
                    ? share.animal.health_status
                    : animal.health_status,
                neuter_status:
                  animal.neuter_status === "unknown"
                    ? share.animal.neuter_status
                    : animal.neuter_status,
                updated_at: now,
              }
            : animal,
        ),
        photos: importPhotos
          ? [
              ...share.photos.map((photo) => ({
                ...photo,
                id: createId("photo"),
                animal_id: target.id,
                source,
              })),
              ...state.photos,
            ]
          : state.photos,
        timeline: importRecords
          ? [
              ...share.timeline.map((item) => ({
                ...item,
                id: createId("tl"),
                animal_id: target.id,
                title: `${item.title}（分享导入）`,
                source,
              })),
              ...state.timeline,
            ]
          : state.timeline,
        locations: [
          ...share.locations.map((location) => ({
            ...location,
            id: createId("loc"),
            animal_id: target.id,
            precision_level: "text_only" as const,
            is_sensitive: true,
            visibility: "private" as const,
            address_text: "分享导入后保持私密",
            source,
          })),
          ...state.locations,
        ],
      },
      target.id,
    );
  };

  return (
    <AppShell
      title="导入分享"
      subtitle={share.shared_by}
      canGoBack
      onBack={onBack}
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
          <div className="mb-1 flex items-center gap-2 font-bold">
            <ShieldCheck size={18} />
            导入前确认
          </div>
          请确认你有权保存或使用这些记录。流浪动物的位置和敏感信息将默认保持私密。
        </div>

        <SharePreview share={share} />

        <div className="space-y-3 rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <p className="font-bold">导入内容</p>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={importPhotos}
              onChange={(event) => setImportPhotos(event.target.checked)}
            />
            导入照片
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={importRecords}
              onChange={(event) => setImportRecords(event.target.checked)}
            />
            导入健康/喂养等记录
          </label>
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-900">
            地点会以私密、模糊方式导入，不会包含精确坐标。
          </p>
        </div>

        <button
          className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white"
          onClick={saveAsNew}
        >
          保存为新档案
        </button>

        <div className="space-y-3 rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <label className="block text-sm font-bold">合并到已有档案</label>
          <select
            className="w-full rounded-lg border border-sand bg-white px-3 py-2"
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
          >
            {activeAnimals(state)
              .filter(
                (animal) => animal.animal_origin === share.animal.animal_origin,
              )
              .map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.name}
                </option>
              ))}
          </select>
          <button
            className="w-full rounded-full bg-white px-5 py-3 font-bold text-ink ring-1 ring-sand/80"
            onClick={mergeToExisting}
          >
            合并到已有档案
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function SharePreview({ share }: { share: SharedAnimalPackage }) {
  const animal = share.animal;
  return (
    <div className="overflow-hidden rounded-[20px] bg-white ring-1 ring-sand/70">
      <img
        className="h-64 w-full object-cover"
        src={animal.cover_image_url}
        alt={animal.name}
      />
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone={animal.animal_origin === "stray" ? "green" : "orange"}>
            {animal.animal_origin === "stray" ? "流浪动物" : "自家宠物"}
          </Badge>
          <Badge tone="gray">分享包</Badge>
        </div>
        <h2 className="text-2xl font-black">{animal.name}</h2>
        <p className="text-sm text-stone-500">
          {speciesLabels[animal.species]} · {animal.color || "毛色未记录"}
        </p>
        {animal.health_status ? (
          <p className="text-sm text-stone-600">
            健康：{healthLabels[animal.health_status]}
          </p>
        ) : null}
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-900">
          <FileInput size={18} />
          包含 {share.photos.length} 张照片、{share.timeline.length} 条记录、
          {share.locations.length} 个私密地点
        </div>
      </div>
    </div>
  );
}
