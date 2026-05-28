import { MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { Animal, AnimalRecord, AppState } from "../types";
import { formatDate, recordTypeLabels, speciesLabels } from "../utils/labels";
import { activeAnimals, animalIdsForRecord, primaryAnimalIdForRecord } from "../utils/storage";

export function HomePage({ state, onOpenPost }: { state: AppState; onOpenPost: (id: string) => void }) {
  const animals = activeAnimals(state);
  const animalById = new Map(animals.map((animal) => [animal.id, animal]));
  const tagById = new Map(state.tags.map((tag) => [tag.id, tag.name]));
  const records = [...state.feedRecords]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .filter((record) => {
      const animal = animalById.get(primaryAnimalIdForRecord(record));
      return Boolean(animal);
    });

  return (
    <AppShell title="毛孩动态">
      <div className="space-y-4 pb-24 pt-1">
        <div className="space-y-4">
          {records.map((record) => {
            const animal = animalById.get(primaryAnimalIdForRecord(record));
            if (!animal) return null;
            const tags = record.tag_ids.map((id) => tagById.get(id)).filter(Boolean) as string[];
            const linkedAnimals = animalIdsForRecord(record).map((id) => animalById.get(id)).filter(Boolean) as Animal[];
            return <FeedCard key={record.id} record={record} animal={animal} linkedAnimals={linkedAnimals} tags={tags} onOpenPost={() => onOpenPost(record.id)} />;
          })}
        </div>
      </div>
    </AppShell>
  );
}

function FeedCard({ record, animal, linkedAnimals, tags, onOpenPost }: { record: AnimalRecord; animal: Animal; linkedAnimals: Animal[]; tags: string[]; onOpenPost: () => void }) {
  const images = record.images.length ? record.images : animal.cover_image_url ? [animal.cover_image_url] : [];
  const permissionTags = permissionLabels(animal);
  const title = animalTitle(linkedAnimals.length ? linkedAnimals : [animal]);
  const containsStray = (linkedAnimals.length ? linkedAnimals : [animal]).some((item) => item.animal_origin === "stray");
  return (
    <article className="overflow-hidden rounded-[18px] bg-white ring-1 ring-sand/70" onClick={onOpenPost}>
      <div className="flex items-start gap-3 p-3">
        <img className="h-11 w-11 shrink-0 rounded-full object-cover" src={animal.cover_image_url} alt={animal.name} />
        <div className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className="font-bold">{title}</h2>
            <span className="text-sm text-stone-500">· {formatDate(record.occurred_at)}</span>
          </div>
          <p className="mt-0.5 text-xs text-stone-500">
            {record.location_text ? safeLocationText(linkedAnimals.length ? linkedAnimals : [animal], record) : containsStray ? "流浪动物" : speciesLabels[animal.species]}
          </p>
        </div>
        <button className="grid h-8 w-8 place-items-center rounded-full text-stone-500" onClick={(event) => event.stopPropagation()} aria-label="更多">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <button className="block w-full text-left" onClick={onOpenPost}>
        <ImageGrid images={images} animalName={animal.name} />
      </button>
      <button className="block w-full space-y-3 p-4 text-left" onClick={onOpenPost}>
        <p className="text-[15px] leading-6 text-stone-700">{record.content}</p>

        <div className="flex flex-wrap gap-1.5">
          <TinyTag>{recordTypeLabels[toRecordType(record.type)]}</TinyTag>
          {[...tags, ...permissionTags].slice(0, 5).map((tag) => (
            <TinyTag key={tag}>{tag}</TinyTag>
          ))}
        </div>
      </button>
      <div className="flex items-center gap-5 px-4 pb-4 pt-1 text-sm font-semibold text-stone-500">
        <button className="inline-flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
          <MessageCircle size={17} />
          备注
        </button>
        <button className="inline-flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
          <Share2 size={17} />
          分享
        </button>
      </div>
    </article>
  );
}

function animalTitle(animals: Animal[]) {
  if (animals.length <= 1) return animals[0]?.name || "毛孩";
  if (animals.length <= 3) return animals.map((animal) => animal.name).join("、");
  return `${animals[0].name}等 ${animals.length} 只毛孩`;
}

function TinyTag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">#{children}</span>;
}

function ImageGrid({ images, animalName }: { images: string[]; animalName: string }) {
  if (!images.length) return <div className="grid aspect-[4/3] place-items-center bg-sand text-sm text-stone-500">还没有照片</div>;
  if (images.length === 1) return <img className="aspect-[4/3] w-full object-cover" src={images[0]} alt={animalName} />;
  return (
    <div className="grid aspect-[4/3] grid-cols-2 gap-1 bg-sand">
      {images.slice(0, 4).map((image, index) => (
        <div key={image} className={index === 0 && images.length === 3 ? "row-span-2" : ""}>
          <img className="h-full w-full object-cover" src={image} alt={`${animalName} ${index + 1}`} />
        </div>
      ))}
    </div>
  );
}

function permissionLabels(animal: Animal) {
  const labels: string[] = [];
  if (animal.animal_source === "created_by_me") labels.push("我的");
  if (animal.animal_source === "shared_to_me") labels.push("分享给我的");
  if (animal.visibility === "shared_recordable") labels.push("允许我记录");
  return labels;
}

function safeLocationText(animals: Animal[], record: AnimalRecord) {
  if (animals.some((animal) => animal.animal_origin === "stray") && record.location_privacy !== "none") return "模糊地点";
  return record.location_text;
}

function toRecordType(type: AnimalRecord["type"]) {
  if (type === "adoption" || type === "shared_update") return "note";
  return type;
}
