import { ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import type { Animal, AppState } from "../types";
import { genderLabels, healthLabels, neuterLabels, speciesLabels } from "../utils/labels";
import { activeAnimals, createId } from "../utils/storage";

type MergeAnimalPageProps = {
  state: AppState;
  animal: Animal;
  onBack: () => void;
  onSave: (state: AppState, primaryId: string) => void;
};

type Choice = "primary" | "secondary" | "both";

export function MergeAnimalPage({ state, animal, onBack, onSave }: MergeAnimalPageProps) {
  const candidates = activeAnimals(state).filter((item) => item.id !== animal.id && item.animal_origin === animal.animal_origin);
  const [targetId, setTargetId] = useState(candidates[0]?.id || "");
  const [primarySide, setPrimarySide] = useState<"current" | "target">("current");
  const [nameChoice, setNameChoice] = useState<Choice>("primary");
  const [genderChoice, setGenderChoice] = useState<Choice>("secondary");
  const [neuterChoice, setNeuterChoice] = useState<Choice>("secondary");
  const [healthChoice, setHealthChoice] = useState<Choice>("secondary");
  const [importPhotos, setImportPhotos] = useState(true);
  const [importRecords, setImportRecords] = useState(true);
  const [importLocations, setImportLocations] = useState<"none" | "private" | "blurred">("private");
  const target = state.animals.find((item) => item.id === targetId);

  const primary = primarySide === "current" ? animal : target;
  const secondary = primarySide === "current" ? target : animal;
  const preview = useMemo(() => {
    if (!primary || !secondary) return undefined;
    return buildMergedAnimal(primary, secondary, { nameChoice, genderChoice, neuterChoice, healthChoice });
  }, [genderChoice, healthChoice, nameChoice, neuterChoice, primary, secondary]);

  const confirm = () => {
    if (!primary || !secondary || !preview) return;
    const now = new Date().toISOString();
    const source = { source_type: "imported" as const, source_animal_id: secondary.id, imported_at: now };
    const importedPhotos = importPhotos
      ? state.photos
          .filter((photo) => photo.animal_id === secondary.id)
          .map((photo) => ({ ...photo, id: createId("photo"), animal_id: primary.id, source }))
      : [];
    const importedRecords = importRecords
      ? state.timeline
          .filter((item) => item.animal_id === secondary.id)
          .map((item) => ({ ...item, id: createId("tl"), animal_id: primary.id, title: `${item.title}（导入）`, source }))
      : [];
    const importedLocations =
      importLocations === "none"
        ? []
        : state.locations
            .filter((location) => location.animal_id === secondary.id)
            .map((location) => ({
              ...location,
              id: createId("loc"),
              animal_id: primary.id,
              precision_level: importLocations === "blurred" || location.animal_origin === "stray" ? ("text_only" as const) : location.precision_level,
              is_sensitive: true,
              visibility: "private" as const,
              address_text: "合并导入后保持私密",
              source,
            }));

    const nextState: AppState = {
      ...state,
      animals: state.animals.map((item) => {
        if (item.id === primary.id) return { ...preview, updated_at: now };
        if (item.id === secondary.id) return { ...item, archive_status: "merged", merged_into_animal_id: primary.id, updated_at: now };
        return item;
      }),
      photos: [...importedPhotos, ...state.photos],
      timeline: [
        {
          id: createId("tl"),
          animal_id: primary.id,
          type: "status",
          title: "完成档案合并",
          description: `${secondary.name} 已合并进 ${primary.name}，来源与敏感位置规则已保留。`,
          occurred_at: now,
          created_at: now,
          source: { source_type: "self" },
        },
        ...importedRecords,
        ...state.timeline,
      ],
      locations: [...importedLocations, ...state.locations],
      mergeLogs: [
        {
          id: createId("merge"),
          primary_animal_id: primary.id,
          merged_animal_id: secondary.id,
          initiated_by: "user_1",
          status: "completed",
          field_choices: { nameChoice, genderChoice, neuterChoice, healthChoice, importLocations },
          imported_photo_ids: importedPhotos.map((photo) => photo.id),
          imported_record_ids: importedRecords.map((item) => item.id),
          imported_location_ids: importedLocations.map((location) => location.id),
          created_at: now,
          completed_at: now,
        },
        ...state.mergeLogs,
      ],
    };
    onSave(nextState, primary.id);
  };

  return (
    <AppShell title="合并档案" subtitle={animal.name} canGoBack onBack={onBack}>
      <div className="space-y-5">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
          <div className="mb-1 flex items-center gap-2 font-bold">
            <ShieldCheck size={18} />
            合并不会自动公开位置
          </div>
          敏感地点导入后仍为私密，原档案会标记为 merged，不会直接删除。
        </div>

        <div className="rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <label className="mb-2 block text-sm font-bold">选择要合并的另一个档案</label>
          <select className="w-full rounded-lg border border-sand bg-white px-3 py-2" value={targetId} onChange={(event) => setTargetId(event.target.value)}>
            {candidates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {speciesLabels[item.species]}
              </option>
            ))}
          </select>
        </div>

        {target && primary && secondary && preview ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <AnimalMini animal={animal} active={primarySide === "current"} onClick={() => setPrimarySide("current")} label="当前档案" />
              <AnimalMini animal={target} active={primarySide === "target"} onClick={() => setPrimarySide("target")} label="合并对象" />
            </div>

            <MergeField label="昵称" a={primary.name} b={secondary.name} choice={nameChoice} onChange={setNameChoice} allowBoth />
            <MergeField label="性别" a={genderLabels[primary.gender]} b={genderLabels[secondary.gender]} choice={genderChoice} onChange={setGenderChoice} />
            <MergeField label="绝育状态" a={primary.neuter_status ? neuterLabels[primary.neuter_status] : "未知"} b={secondary.neuter_status ? neuterLabels[secondary.neuter_status] : "未知"} choice={neuterChoice} onChange={setNeuterChoice} />
            <MergeField label="健康状态" a={primary.health_status ? healthLabels[primary.health_status] : "未知"} b={secondary.health_status ? healthLabels[secondary.health_status] : "未知"} choice={healthChoice} onChange={setHealthChoice} />

            <div className="space-y-3 rounded-lg bg-white p-4 ring-1 ring-sand/70">
              <p className="font-bold">导入内容</p>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={importPhotos} onChange={(event) => setImportPhotos(event.target.checked)} />导入照片</label>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={importRecords} onChange={(event) => setImportRecords(event.target.checked)} />导入时间线记录并保留来源</label>
              <label className="block text-sm font-semibold">地点处理</label>
              <select className="w-full rounded-lg border border-sand bg-white px-3 py-2" value={importLocations} onChange={(event) => setImportLocations(event.target.value as "none" | "private" | "blurred")}>
                <option value="none">不导入地点</option>
                <option value="private">导入为私密地点</option>
                <option value="blurred">导入为模糊地点</option>
              </select>
            </div>

            <div className="rounded-lg bg-white p-4 ring-1 ring-sand/70">
              <p className="font-bold">合并后预览</p>
              <p className="mt-2 text-sm text-stone-600">主名：{preview.name}</p>
              <p className="text-sm text-stone-600">别名：{preview.aliases?.length ? preview.aliases.join("、") : "无"}</p>
            </div>

            <button className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white" onClick={confirm}>
              确认合并
            </button>
          </>
        ) : (
          <div className="rounded-lg bg-white p-5 text-sm text-stone-500 ring-1 ring-sand/70">暂无可合并的同类型档案。</div>
        )}
      </div>
    </AppShell>
  );
}

function buildMergedAnimal(primary: Animal, secondary: Animal, choices: { nameChoice: Choice; genderChoice: Choice; neuterChoice: Choice; healthChoice: Choice }): Animal {
  const aliases = new Set([...(primary.aliases || []), ...(secondary.aliases || [])]);
  if (choices.nameChoice === "secondary") aliases.add(primary.name);
  if (choices.nameChoice === "both") aliases.add(secondary.name);
  const name = choices.nameChoice === "secondary" ? secondary.name : primary.name;
  return {
    ...primary,
    name,
    aliases: [...aliases].filter((alias) => alias && alias !== name),
    gender: choices.genderChoice === "secondary" ? secondary.gender : primary.gender,
    neuter_status: choices.neuterChoice === "secondary" ? secondary.neuter_status : primary.neuter_status,
    health_status: choices.healthChoice === "secondary" ? secondary.health_status : primary.health_status,
    features: primary.features || secondary.features,
    personality: primary.personality || secondary.personality,
  };
}

function AnimalMini({ animal, label, active, onClick }: { animal: Animal; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`rounded-lg p-3 text-left ring-1 ${active ? "bg-orange-50 ring-clay" : "bg-white ring-sand/70"}`} onClick={onClick}>
      <img className="mb-2 h-24 w-full rounded-lg object-cover" src={animal.cover_image_url} alt={animal.name} />
      <p className="text-xs text-stone-500">{label}</p>
      <p className="font-bold">{animal.name}</p>
    </button>
  );
}

function MergeField({ label, a, b, choice, onChange, allowBoth }: { label: string; a: string; b: string; choice: Choice; onChange: (value: Choice) => void; allowBoth?: boolean }) {
  return (
    <div className="rounded-lg bg-white p-4 ring-1 ring-sand/70">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-bold">{label}</p>
        <Badge tone="gray">字段级选择</Badge>
      </div>
      <div className="grid gap-2 text-sm">
        <label className="flex items-center gap-2"><input type="radio" checked={choice === "primary"} onChange={() => onChange("primary")} />使用主档案：{a}</label>
        <label className="flex items-center gap-2"><input type="radio" checked={choice === "secondary"} onChange={() => onChange("secondary")} />使用对方：{b}</label>
        {allowBoth ? <label className="flex items-center gap-2"><input type="radio" checked={choice === "both"} onChange={() => onChange("both")} />主名 + 对方作为别名</label> : null}
      </div>
    </div>
  );
}
