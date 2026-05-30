import { Grid2X2, List, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import type { Animal, AppState } from "../types";
import { neuterLabels, speciesLabels } from "../utils/labels";
import { activeAnimals, animalIdsForRecord } from "../utils/storage";

type Filter = "all" | "stray_cat" | "stray_dog" | "watching" | "not_neutered" | "neutered" | "rescue_needed" | "adoptable" | "shared" | "recordable" | "family" | "transferred" | "owned_pet" | "stray";

const filters: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "全部" },
  { id: "stray_cat", label: "流浪猫" },
  { id: "stray_dog", label: "流浪狗" },
  { id: "watching", label: "待观察" },
  { id: "not_neutered", label: "未绝育" },
  { id: "neutered", label: "已绝育" },
  { id: "rescue_needed", label: "需救助" },
  { id: "adoptable", label: "可领养" },
  { id: "shared", label: "分享给我的" },
  { id: "recordable", label: "允许我记录" },
  { id: "family", label: "家庭/同窝" },
  { id: "transferred", label: "已送养" },
  { id: "owned_pet", label: "自家宠物" },
  { id: "stray", label: "流浪动物" },
];

export function CatalogPage({ state, onOpenAnimal }: { state: AppState; onOpenAnimal: (id: string) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const animals = activeAnimals(state);
  const shown = animals
    .filter((animal) => matchFilter(animal, filter, state))
    .filter((animal) => `${animal.name}${animal.color || ""}${animal.features || ""}${animal.personality || ""}`.includes(query))
    .sort((a, b) => animalPriority(a) - animalPriority(b) || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const strayCount = animals.filter((animal) => animal.animal_origin === "stray").length;
  const watchingCount = animals.filter((animal) => animal.animal_origin === "stray" && animal.health_status && animal.health_status !== "normal").length;
  const tnrCount = animals.filter((animal) => animal.animal_origin === "stray" && animal.neuter_status !== "confirmed_neutered").length;
  const adoptableCount = animals.filter((animal) => animal.animal_origin === "stray" && animal.adoption_status === "available").length;

  return (
    <AppShell title="图鉴" subtitle="流浪猫狗档案集合">
      <div className="space-y-4 pb-24">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm text-stone-500 ring-1 ring-sand/80">
          <Search size={18} />
          <input className="min-w-0 flex-1 bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索昵称、毛色、特征" />
        </div>

        <p className="text-sm font-semibold text-stone-500">
          已记录 {strayCount} 只流浪毛孩 · 待观察 {watchingCount} · 待绝育 {tnrCount} · 可领养 {adoptableCount}
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item.id}
              className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold ${filter === item.id ? "bg-clay text-white" : "bg-white text-stone-600 ring-1 ring-sand/70"}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Badge tone="gray">默认隐藏已合并档案</Badge>
          <div className="flex rounded-full bg-white p-1 ring-1 ring-sand/70">
            <button className={`grid h-8 w-8 place-items-center rounded-full ${view === "grid" ? "bg-orange-50 text-clay" : "text-stone-500"}`} onClick={() => setView("grid")} aria-label="网格视图">
              <Grid2X2 size={17} />
            </button>
            <button className={`grid h-8 w-8 place-items-center rounded-full ${view === "list" ? "bg-orange-50 text-clay" : "text-stone-500"}`} onClick={() => setView("list")} aria-label="列表视图">
              <List size={17} />
            </button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-2 gap-3">
            {shown.map((animal) => (
              <AnimalGridCard key={animal.id} animal={animal} postCount={state.feedRecords.filter((record) => animalIdsForRecord(record).includes(animal.id)).length} onOpen={() => onOpenAnimal(animal.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((animal) => (
              <AnimalListCard key={animal.id} animal={animal} postCount={state.feedRecords.filter((record) => animalIdsForRecord(record).includes(animal.id)).length} onOpen={() => onOpenAnimal(animal.id)} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function AnimalGridCard({ animal, postCount, onOpen }: { animal: Animal; postCount: number; onOpen: () => void }) {
  return (
    <button className="overflow-hidden rounded-[18px] bg-white text-left ring-1 ring-sand/70" onClick={onOpen}>
      <img className="aspect-square w-full object-cover" src={animal.cover_image_url} alt={animal.name} />
      <div className="space-y-2 p-3">
        <div>
          <p className="truncate font-bold">{animal.name}</p>
          <p className="truncate text-xs text-stone-500">{postCount} 动态 · {animal.color || speciesLabels[animal.species]}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {catalogTags(animal).slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-clay">#{tag}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

function AnimalListCard({ animal, postCount, onOpen }: { animal: Animal; postCount: number; onOpen: () => void }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-lg bg-white p-3 text-left ring-1 ring-sand/70" onClick={onOpen}>
      <img className="h-16 w-16 rounded-lg object-cover" src={animal.cover_image_url} alt={animal.name} />
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{animal.name}</span>
        <span className="line-clamp-1 text-sm text-stone-500">{postCount} 动态 · {catalogTags(animal).map((tag) => `#${tag}`).join(" ")}</span>
      </span>
      <Badge tone={animal.animal_origin === "stray" ? "green" : "orange"}>{speciesLabels[animal.species]}</Badge>
    </button>
  );
}

function matchFilter(animal: Animal, filter: Filter, state: AppState) {
  if (filter === "all") return true;
  if (filter === "owned_pet") return animal.animal_origin === "owned_pet" && animal.animal_source !== "shared_to_me";
  if (filter === "stray") return animal.animal_origin === "stray";
  if (filter === "stray_cat") return animal.animal_origin === "stray" && animal.species === "cat";
  if (filter === "stray_dog") return animal.animal_origin === "stray" && animal.species === "dog";
  if (filter === "watching") return animal.animal_origin === "stray" && Boolean(animal.health_status && animal.health_status !== "normal");
  if (filter === "neutered") return animal.animal_origin === "stray" && animal.neuter_status === "confirmed_neutered";
  if (filter === "not_neutered") return animal.animal_origin === "stray" && animal.neuter_status !== "confirmed_neutered";
  if (filter === "rescue_needed") return animal.animal_origin === "stray" && animal.rescue_status === "needs_help";
  if (filter === "adoptable") return animal.animal_origin === "stray" && animal.adoption_status === "available";
  if (filter === "shared") return animal.animal_source === "shared_to_me";
  if (filter === "recordable") return animal.visibility === "shared_recordable";
  if (filter === "transferred") return animal.ownership_status === "transferred_out" || animal.ownership_status === "transferred_to_me";
  if (filter === "family") return state.animalRelationships.some((item) => item.from_animal_id === animal.id || item.to_animal_id === animal.id);
  return true;
}

function catalogTags(animal: Animal) {
  const tags = [animal.animal_origin === "stray" ? "流浪动物" : "自家宠物"];
  if (animal.animal_source === "shared_to_me") tags.push("分享给我的");
  if (animal.visibility === "shared_recordable") tags.push("允许我记录");
  if (animal.animal_source === "shared_to_me" && animal.visibility === "shared_readonly") tags.push("只读");
  if (animal.animal_origin === "stray" && animal.species === "cat") tags.push("流浪猫");
  if (animal.animal_origin === "stray" && animal.species === "dog") tags.push("流浪狗");
  if (animal.neuter_status) tags.push(neuterLabels[animal.neuter_status]);
  if (animal.adoption_status === "available") tags.push("可领养");
  if (animal.ownership_status === "transferred_out") tags.push("已送养");
  if (animal.ownership_status === "transferred_to_me") tags.push("转交给我的");
  return tags;
}

function animalPriority(animal: Animal) {
  if (animal.animal_origin !== "stray") return 5;
  if (animal.rescue_status === "needs_help" || animal.health_status === "urgent" || animal.health_status === "injured" || animal.health_status === "suspected_injured") return 0;
  if (animal.health_status && animal.health_status !== "normal") return 1;
  if (animal.neuter_status !== "confirmed_neutered") return 2;
  if (animal.adoption_status === "available") return 3;
  return 4;
}
