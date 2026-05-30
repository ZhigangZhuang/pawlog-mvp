import { AppShell } from "../components/AppShell";
import type { Animal, AnimalRecord, AppState } from "../types";
import { recordTypeLabels, speciesLabels } from "../utils/labels";
import { activeAnimals, animalIdsForRecord, primaryAnimalIdForRecord } from "../utils/storage";

export function HomePage({ state, onOpenPost, onOpenAnimal }: { state: AppState; onOpenPost: (id: string) => void; onOpenAnimal: (id: string) => void }) {
  const animals = activeAnimals(state);
  const animalById = new Map(animals.map((a) => [a.id, a]));
  const tagById = new Map(state.tags.map((t) => [t.id, t.name]));

  const records = [...state.feedRecords]
    .filter((r) => Boolean(animalById.get(primaryAnimalIdForRecord(r))))
    .sort((a, b) => recordPriority(a, animalById) - recordPriority(b, animalById) || new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

  const groups = groupByDate(records);

  return (
    <AppShell title="流浪毛孩动态">
      <div className="pb-24">
        {groups.map(({ label, items }) => (
          <section key={label}>
            <div className="px-4 pb-1 pt-4 text-xs font-semibold text-stone-400">{label}</div>
            {items.map((record) => {
              const animal = animalById.get(primaryAnimalIdForRecord(record));
              if (!animal) return null;
              const tags = record.tag_ids.map((id) => tagById.get(id)).filter(Boolean) as string[];
              const linkedAnimals = animalIdsForRecord(record).map((id) => animalById.get(id)).filter(Boolean) as Animal[];
              return (
                <TimelineRow
                  key={record.id}
                  record={record}
                  animal={animal}
                  linkedAnimals={linkedAnimals}
                  tags={tags}
                  onOpenPost={() => onOpenPost(record.id)}
                  onOpenAnimal={(id) => onOpenAnimal(id)}
                />
              );
            })}
          </section>
        ))}
      </div>
    </AppShell>
  );
}

function TimelineRow({
  record,
  animal,
  linkedAnimals,
  tags,
  onOpenPost,
  onOpenAnimal,
}: {
  record: AnimalRecord;
  animal: Animal;
  linkedAnimals: Animal[];
  tags: string[];
  onOpenPost: () => void;
  onOpenAnimal: (id: string) => void;
}) {
  const allAnimals = linkedAnimals.length ? linkedAnimals : [animal];
  const title = animalTitle(allAnimals);
  const firstImage = record.images[0] ?? animal.cover_image_url;
  const extraCount = record.images.length > 1 ? record.images.length - 1 : 0;
  const time = formatTime(record.occurred_at);
  const containsStray = allAnimals.some((a) => a.animal_origin === "stray");
  const locationText = record.location_text
    ? containsStray && record.location_privacy !== "none"
      ? "模糊地点"
      : record.location_text
    : null;

  const allTags = [recordTypeLabels[toRecordType(record.type)], ...tags].slice(0, 4);

  return (
    <article
      className="flex cursor-pointer gap-0 border-b border-stone-100 px-4 py-3 active:bg-stone-50"
      onClick={onOpenPost}
    >
      {/* Left: time column */}
      <div className="w-[60px] shrink-0 pt-1 text-right text-[11px] font-medium leading-5 text-stone-400">
        {time}
      </div>

      {/* Divider line */}
      <div className="mx-3 flex flex-col items-center">
        <div className="mt-1.5 h-2 w-2 rounded-full bg-stone-300" />
        <div className="mt-1 w-px flex-1 bg-stone-100" />
      </div>

      {/* Right: content */}
      <div className="flex min-w-0 flex-1 gap-3 pb-3">
        {/* Thumbnail */}
        {firstImage ? (
          <div className="relative shrink-0">
            <img
              className="h-[76px] w-[76px] rounded-xl object-cover"
              src={firstImage}
              alt={animal.name}
            />
            {extraCount > 0 && (
              <span className="absolute bottom-1 right-1 rounded bg-black/50 px-1 text-[10px] text-white">
                +{extraCount}
              </span>
            )}
          </div>
        ) : (
          <div className="h-[76px] w-[76px] shrink-0 rounded-xl bg-stone-100" />
        )}

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-x-1.5">
            <button
              className="font-semibold leading-5 text-stone-900"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAnimal(animal.id);
              }}
            >
              {title}
            </button>
            {locationText && (
              <span className="text-xs text-stone-400">· {locationText}</span>
            )}
            {!locationText && (
              <span className="text-xs text-stone-400">
                · {containsStray ? "流浪动物" : speciesLabels[animal.species]}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-sm leading-5 text-stone-600">{record.content}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {allTags.map((tag) => (
              <TinyTag key={tag}>{tag}</TinyTag>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function TinyTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500">
      #{children}
    </span>
  );
}

function animalTitle(animals: Animal[]) {
  if (animals.length <= 1) return animals[0]?.name || "毛孩";
  if (animals.length <= 3) return animals.map((a) => a.name).join("、");
  return `${animals[0].name}等 ${animals.length} 只毛孩`;
}

function toRecordType(type: AnimalRecord["type"]) {
  if (type === "adoption" || type === "shared_update") return "note";
  return type;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

function dateGroupLabel(value: string) {
  const d = new Date(value);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - itemDay.getTime()) / 86400000);
  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric" }).format(d);
}

function groupByDate(records: AnimalRecord[]) {
  const groups: { label: string; items: AnimalRecord[] }[] = [];
  const seen = new Map<string, AnimalRecord[]>();
  for (const r of records) {
    const label = dateGroupLabel(r.occurred_at);
    if (!seen.has(label)) {
      const arr: AnimalRecord[] = [];
      seen.set(label, arr);
      groups.push({ label, items: arr });
    }
    seen.get(label)!.push(r);
  }
  return groups;
}

function recordPriority(record: AnimalRecord, animalById: Map<string, Animal>) {
  const animals = animalIdsForRecord(record).map((id) => animalById.get(id)).filter(isAnimal);
  if (!animals.some((a) => a.animal_origin === "stray")) return 4;
  if (animals.some((a) => a.rescue_status === "needs_help" || a.health_status === "urgent" || a.health_status === "injured" || a.health_status === "suspected_injured")) return 0;
  if (animals.some((a) => a.neuter_status === "not_neutered" || a.neuter_status === "unknown")) return 1;
  if (animals.some((a) => a.adoption_status === "available")) return 2;
  return 3;
}

function isAnimal(a: Animal | undefined): a is Animal {
  return Boolean(a);
}
