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

  return (
    <AppShell title="毛孩动态">
      {/* AppShell already provides px-4, so no extra horizontal padding here */}
      <div className="space-y-4 pb-24 pt-1">
        {records.map((record) => {
          const animal = animalById.get(primaryAnimalIdForRecord(record));
          if (!animal) return null;
          const tags = record.tag_ids.map((id) => tagById.get(id)).filter(Boolean) as string[];
          const linkedAnimals = animalIdsForRecord(record).map((id) => animalById.get(id)).filter(Boolean) as Animal[];
          return (
            <FeedCard
              key={record.id}
              record={record}
              animal={animal}
              linkedAnimals={linkedAnimals}
              tags={tags}
              onOpenPost={() => onOpenPost(record.id)}
              onOpenAnimal={onOpenAnimal}
            />
          );
        })}
      </div>
    </AppShell>
  );
}

function FeedCard({
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
  const containsStray = allAnimals.some((a) => a.animal_origin === "stray");
  const locationText = record.location_text
    ? containsStray && record.location_privacy !== "none"
      ? "模糊地点"
      : record.location_text
    : null;

  const typeLabel = recordTypeLabels[toRecordType(record.type)];
  const tagLine = [typeLabel, ...tags]
    .slice(0, 3)
    .map((t) => `#${t}`)
    .join("  ");
  const meta = [locationText ?? (containsStray ? "流浪动物" : speciesLabels[animal.species]), tagLine]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div>
      {/* Time label — tight to card, visually belongs to it */}
      <p className="mb-1 text-[11px] text-stone-400">{timeWithDate(record.occurred_at)}</p>

      <article
        className="cursor-pointer overflow-hidden rounded-[18px] bg-white ring-1 ring-sand/70 active:bg-sand/20"
        onClick={onOpenPost}
      >
        <div className="flex gap-3 p-3">
          {/* Thumbnail */}
          {firstImage ? (
            <div className="relative shrink-0">
              <img
                className="h-[76px] w-[76px] rounded-xl object-cover"
                src={firstImage}
                alt={animal.name}
              />
              {extraCount > 0 && (
                <span className="absolute bottom-1 right-1 rounded bg-black/50 px-1 text-[10px] leading-4 text-white">
                  +{extraCount}
                </span>
              )}
            </div>
          ) : (
            <div className="h-[76px] w-[76px] shrink-0 rounded-xl bg-sand" />
          )}

          {/* Text */}
          <div className="min-w-0 flex-1">
            <button
              className="mb-0.5 block text-[14px] font-semibold leading-snug text-ink"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAnimal(animal.id);
              }}
            >
              {title}
            </button>
            <p className="line-clamp-2 text-[13px] leading-[1.5] text-stone-500">{record.content}</p>
            <p className="mt-1.5 truncate text-[11px] leading-4 text-stone-400">{meta}</p>
          </div>
        </div>
      </article>
    </div>
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

function timeWithDate(value: string) {
  const d = new Date(value);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - itemDay.getTime()) / 86400000);
  const hhmm = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  if (diffDays === 0) return `今天 ${hhmm}`;
  if (diffDays === 1) return `昨天 ${hhmm}`;
  return `${new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric" }).format(d)} ${hhmm}`;
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
