import { Camera, MapPin, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import type { Animal, AppState, FeedRecordType, HealthStatus, NeuterStatus, RecordType, RescueStatus, StrayLocation } from "../types";
import { healthLabels, neuterLabels, recordTypeLabels, rescueLabels } from "../utils/labels";
import { activeAnimals, createId, upsertAnimalUpdatedAt } from "../utils/storage";

type AddRecordPageProps = {
  animal: Animal;
  state: AppState;
  initialType?: RecordType;
  onBack: () => void;
  onSave: (state: AppState, primaryAnimalId: string) => void;
};

export function AddRecordPage({ animal, state, initialType, onBack, onSave }: AddRecordPageProps) {
  const availableAnimals = activeAnimals(state).filter((item) => item.animal_source !== "shared_to_me" || item.visibility === "shared_recordable");
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([animal.id]);
  const [primaryAnimalId, setPrimaryAnimalId] = useState(animal.id);
  const primaryAnimal = availableAnimals.find((item) => item.id === primaryAnimalId) || animal;
  const selectedAnimals = selectedAnimalIds.map((id) => availableAnimals.find((item) => item.id === id)).filter(Boolean) as Animal[];
  const containsStray = selectedAnimals.some((item) => item.animal_origin === "stray");
  const allowedTypes: RecordType[] =
    primaryAnimal.animal_origin === "owned_pet"
      ? ["photo", "feeding", "health", "weight", "medical", "anniversary", "location", "note"]
      : ["photo", "feeding", "health", "weight", "location", "neuter_status", "rescue_status", "note"];
  const [type, setType] = useState<RecordType>(initialType && allowedTypes.includes(initialType) ? initialType : "photo");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [weight, setWeight] = useState("");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(primaryAnimal.health_status || "normal");
  const [neuterStatus, setNeuterStatus] = useState<NeuterStatus>(primaryAnimal.neuter_status || "unknown");
  const [rescueStatus, setRescueStatus] = useState<RescueStatus>(primaryAnimal.rescue_status || "observing");
  const [locationName, setLocationName] = useState("");
  const [isSensitive, setIsSensitive] = useState(primaryAnimal.animal_origin === "stray");
  const selectedIds = selectedAnimals.map((item) => item.id);

  useEffect(() => {
    if (!allowedTypes.includes(type)) setType(allowedTypes[0]);
    setHealthStatus(primaryAnimal.health_status || "normal");
    setNeuterStatus(primaryAnimal.neuter_status || "unknown");
    setRescueStatus(primaryAnimal.rescue_status || "observing");
  }, [primaryAnimalId]);

  useEffect(() => {
    if (containsStray) setIsSensitive(true);
  }, [containsStray]);

  const title = useMemo(() => {
    if (type === "weight" && weight) return `体重更新：${weight}kg`;
    if (type === "health") return `健康观察：${healthLabels[healthStatus]}`;
    if (type === "neuter_status") return `绝育状态更新：${neuterLabels[neuterStatus]}`;
    if (type === "rescue_status") return `救助状态更新：${rescueLabels[rescueStatus]}`;
    if (type === "location") return "出现动态";
    return recordTypeLabels[type];
  }, [healthStatus, neuterStatus, rescueStatus, type, weight]);

  const save = () => {
    if (!selectedIds.length) return;
    const now = new Date().toISOString();
    const postId = createId("feed");
    const source = { source_type: "self" as const };
    const nextAnimal = upsertAnimalUpdatedAt({
      ...primaryAnimal,
      health_status: type === "health" ? healthStatus : primaryAnimal.health_status,
      neuter_status: type === "neuter_status" ? neuterStatus : primaryAnimal.neuter_status,
      rescue_status: type === "rescue_status" ? rescueStatus : primaryAnimal.rescue_status,
      cover_image_url: imageUrl ? imageUrl : primaryAnimal.cover_image_url,
    });
    const locationDescription = type === "location" ? `${locationName || "附近"}。${containsStray ? "位置已模糊。" : ""}` : undefined;
    const feedType = toFeedRecordType(type);
    const feedContent = note || locationDescription || title || defaultDescription(type, containsStray ? "stray" : primaryAnimal.animal_origin);
    const feedImage = imageUrl || primaryAnimal.cover_image_url;

    const nextState: AppState = {
      ...state,
      animals: state.animals.map((item) => {
        if (item.id === primaryAnimal.id) return nextAnimal;
        if (selectedIds.includes(item.id)) return upsertAnimalUpdatedAt(item);
        return item;
      }),
      postAnimals: [
        ...selectedIds.map((animalId) => ({
          id: createId("pa"),
          post_id: postId,
          animal_id: animalId,
          role_in_post: animalId === primaryAnimal.id ? ("main" as const) : ("appears_with" as const),
          created_at: now,
        })),
        ...state.postAnimals,
      ],
      feedRecords: [
        {
          id: postId,
          animal_id: primaryAnimal.id,
          primary_animal_id: primaryAnimal.id,
          animal_ids: selectedIds,
          type: feedType,
          images: feedImage ? [feedImage] : [],
          content: feedContent,
          occurred_at: now,
          location_text: locationName || undefined,
          location_privacy: locationName ? (containsStray ? "blurred" : isSensitive ? "exact_private" : "none") : "none",
          tag_ids: [],
          created_by: "user_1",
          source: "me",
          visibility: primaryAnimal.visibility === "public_card" ? "public_card" : "private",
          created_at: now,
        },
        ...state.feedRecords,
      ],
      timeline: [
        ...selectedIds.map((animalId) => ({
          id: createId("tl"),
          animal_id: animalId,
          type,
          title,
          description: locationDescription || note || defaultDescription(type, containsStray ? "stray" : primaryAnimal.animal_origin),
          image_url: imageUrl || undefined,
          source,
          occurred_at: now,
          created_at: now,
        })),
        ...state.timeline,
      ],
      photos:
        imageUrl
          ? [
              ...selectedIds.map((animalId) => ({
                id: createId("photo"),
                animal_id: animalId,
                image_url: imageUrl,
                taken_at: now,
                note: note || "动态照片",
                source,
                created_at: now,
              })),
              ...state.photos,
            ]
          : state.photos,
      locations:
        locationName
          ? [
              ...selectedIds.map((animalId): StrayLocation => {
                const targetAnimal = availableAnimals.find((item) => item.id === animalId) || primaryAnimal;
                const locationType = targetAnimal.animal_origin === "stray" ? "stray_seen" : "pet_photo_place";
                const precisionLevel = containsStray ? "text_only" : isSensitive ? "exact" : "blurred";
                return {
                  id: createId("loc"),
                  animal_id: animalId,
                  animal_origin: targetAnimal.animal_origin,
                  type: locationType,
                  location_name: locationName,
                  name: locationName,
                  precision_level: precisionLevel,
                  address_text: containsStray || targetAnimal.animal_origin === "stray" ? "位置已模糊" : locationName,
                  is_sensitive: containsStray || isSensitive,
                  visibility: "private",
                  created_by: "user_1",
                  source,
                  seen_at: now,
                  created_at: now,
                  updated_at: now,
                };
              }),
              ...state.locations,
            ]
          : state.locations,
    };

    onSave(nextState, primaryAnimal.id);
  };

  return (
    <AppShell title="发动态" subtitle={selectedAnimals.map((item) => item.name).join("、")} canGoBack onBack={onBack}>
      <div className="space-y-5 pb-28">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-sand/70">
          <img className="h-12 w-12 rounded-full object-cover" src={primaryAnimal.cover_image_url} alt={primaryAnimal.name} />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{selectedAnimals.map((item) => item.name).join("、")}</p>
            <p className="text-sm text-stone-500">给这条动态选择一只或多只毛孩</p>
          </div>
        </div>

        {containsStray ? (
          <div className="flex gap-2 rounded-2xl border border-green-200 bg-green-50 p-3 text-xs leading-5 text-green-900">
            <ShieldCheck className="mt-0.5 shrink-0" size={16} />
            <p>请避免写入楼栋门牌、固定出没时间、幼崽窝点或抓捕计划。分享时会自动隐藏精确位置。</p>
          </div>
        ) : null}

        <div className="rounded-[22px] bg-white p-4 ring-1 ring-sand/70">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-stone-600">这条动态里的毛孩</p>
            <span className="shrink-0 rounded-full bg-orange-50 px-2 py-1 text-xs font-bold text-clay">已选 {selectedAnimals.length} 只</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">主角：{primaryAnimal.name}</p>
          <div className="mt-3 space-y-2">
            {availableAnimals.map((item) => {
              const selected = selectedAnimalIds.includes(item.id);
              return (
                <label key={item.id} className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => {
                      const nextIds = event.target.checked ? [...selectedAnimalIds, item.id] : selectedAnimalIds.filter((id) => id !== item.id);
                      const safeIds = nextIds.length ? Array.from(new Set(nextIds)) : [item.id];
                      setSelectedAnimalIds(safeIds);
                      if (!safeIds.includes(primaryAnimalId)) setPrimaryAnimalId(safeIds[0]);
                    }}
                  />
                  <img className="h-9 w-9 rounded-full object-cover" src={item.cover_image_url} alt={item.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{item.name}</span>
                    <span className="block text-xs text-stone-500">{item.animal_source === "shared_to_me" ? "允许我记录" : "我的"}</span>
                  </span>
                  {selected ? (
                    <button
                      type="button"
                      className={`rounded-full px-2 py-1 text-xs font-bold ${primaryAnimalId === item.id ? "bg-clay text-white" : "bg-white text-stone-500 ring-1 ring-sand/70"}`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setPrimaryAnimalId(item.id);
                      }}
                    >
                      {primaryAnimalId === item.id ? "主角" : "设为主角"}
                    </button>
                  ) : null}
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-4 ring-1 ring-sand/70">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-600">照片，可选</span>
            <div className="flex gap-3">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sand text-stone-500">
                {imageUrl ? <img className="h-full w-full object-cover" src={imageUrl} alt="预览" /> : <Camera size={22} />}
              </div>
              <input className="min-w-0 flex-1 rounded-2xl border border-sand px-3 py-2 text-sm outline-none focus:border-clay" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="粘贴图片地址" />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-stone-600">写点什么</span>
            <textarea
              className="min-h-36 w-full resize-none rounded-2xl border border-sand px-3 py-3 leading-6 outline-none focus:border-clay"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={primaryAnimal.animal_origin === "stray" ? "比如：今天又见到了，精神不错，吃完就去花坛边休息了。" : "比如：今天睡成一滩，完全不想理人。"}
            />
          </label>
        </div>

        <div className="space-y-3">
          <p className="px-1 text-sm font-bold text-stone-500">这条动态属于</p>
          <div className="flex flex-wrap gap-2">
            {allowedTypes.map((item) => (
              <button type="button" key={item} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${type === item ? "bg-clay text-white" : "bg-white text-stone-600 ring-1 ring-sand/70"}`} onClick={() => setType(item)}>
                #{recordTypeLabels[item]}
              </button>
            ))}
          </div>
        </div>

        {type === "health" ? (
          <CompactSelect label="健康状态" value={healthStatus} onChange={(value) => setHealthStatus(value as HealthStatus)} options={healthLabels} />
        ) : null}
        {type === "neuter_status" ? (
          <CompactSelect label="绝育/TNR 状态" value={neuterStatus} onChange={(value) => setNeuterStatus(value as NeuterStatus)} options={neuterLabels} />
        ) : null}
        {type === "rescue_status" ? (
          <CompactSelect label="救助状态" value={rescueStatus} onChange={(value) => setRescueStatus(value as RescueStatus)} options={rescueLabels} />
        ) : null}
        {type === "weight" ? (
          <CompactInput label="体重 kg" value={weight} onChange={setWeight} placeholder="例如：4.2" />
        ) : null}

        <div className="rounded-2xl bg-white p-4 ring-1 ring-sand/70">
          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-sm font-bold text-stone-600">
              <MapPin size={15} />
              地点，可选
            </span>
            <input className="w-full rounded-2xl border border-sand px-3 py-2 text-sm outline-none focus:border-clay" value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder={containsStray ? "例如：北门附近" : "例如：家里 / 公园"} />
          </label>
          {locationName ? (
            <label className="mt-3 flex items-center gap-2 text-sm text-stone-600">
              <input type="checkbox" checked={containsStray || isSensitive} disabled={containsStray} onChange={(event) => setIsSensitive(event.target.checked)} />
              {containsStray ? "已按流浪动物规则保护位置" : "仅自己可见"}
            </label>
          ) : null}
        </div>

        <button type="button" className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white" onClick={save} aria-label="发布动态">
          发布动态
        </button>
      </div>
    </AppShell>
  );
}

function CompactInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block rounded-2xl bg-white p-4 ring-1 ring-sand/70">
      <span className="mb-2 block text-sm font-bold text-stone-600">{label}</span>
      <input className="w-full rounded-2xl border border-sand px-3 py-2 outline-none focus:border-clay" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function CompactSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Record<string, string> }) {
  return (
    <label className="block rounded-2xl bg-white p-4 ring-1 ring-sand/70">
      <span className="mb-2 block text-sm font-bold text-stone-600">{label}</span>
      <select className="w-full rounded-2xl border border-sand bg-white px-3 py-2 outline-none focus:border-clay" value={value} onChange={(event) => onChange(event.target.value)}>
        {Object.entries(options).map(([key, labelText]) => (
          <option key={key} value={key}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}

function defaultDescription(type: RecordType, origin: Animal["animal_origin"]) {
  if (type === "feeding") return "今天吃得不错，状态稳定。";
  if (type === "medical") return "更新了一条疫苗、驱虫或用药动态。";
  if (type === "anniversary") return "新的纪念日动态。";
  if (type === "location") return "记录了这次出现的位置，分享时不会展示精确地点。";
  if (type === "photo") return origin === "stray" ? "拍到了一张可以识别它的照片。" : "更新了一张新照片。";
  return "更新了一条新动态。";
}

function toFeedRecordType(type: RecordType): FeedRecordType {
  if (type === "medical" || type === "neuter_status" || type === "rescue_status") return "note";
  return type;
}
