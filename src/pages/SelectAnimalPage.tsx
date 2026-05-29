import { Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import type { AppState, RecordType } from "../types";
import { speciesLabels } from "../utils/labels";
import { activeAnimals } from "../utils/storage";

export function SelectAnimalPage({
  state,
  recordType,
  onBack,
  onSelect,
}: {
  state: AppState;
  recordType: RecordType;
  onBack: () => void;
  onSelect: (animalId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const animals = activeAnimals(state).filter((animal) => canAddRecord(animal) && allowedForRecord(animal.animal_origin, recordType));
  const shown = animals.filter((animal) => `${animal.name}${animal.color || ""}${animal.features || ""}`.includes(query));
  return (
    <AppShell title="选择毛孩" subtitle="要给哪只毛孩发动态？" canGoBack onBack={onBack}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm text-stone-500 ring-1 ring-sand/80">
          <Search size={18} />
          <input className="min-w-0 flex-1 bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名字、毛色、特征" />
        </div>
        <div className="space-y-3">
          {shown.map((animal) => (
            <button key={animal.id} className="flex w-full items-center gap-3 rounded-lg bg-white p-3 text-left ring-1 ring-sand/70" onClick={() => onSelect(animal.id)}>
              <img className="h-16 w-16 rounded-lg object-cover" src={animal.cover_image_url} alt={animal.name} />
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{animal.name}</span>
                <span className="text-sm text-stone-500">
                  {speciesLabels[animal.species]} · {animal.animal_origin === "stray" ? "流浪动物" : "自家宠物"} · {animal.animal_source === "shared_to_me" ? "允许我记录" : "我的"}
                </span>
              </span>
              <Badge tone={animal.animal_origin === "stray" ? "green" : "orange"}>发动态</Badge>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function allowedForRecord(origin: "owned_pet" | "stray", type: RecordType) {
  if (origin === "owned_pet") return !["location", "neuter_status", "rescue_status"].includes(type) || type === "location";
  return !["medical", "anniversary"].includes(type);
}

function canAddRecord(animal: { animal_source?: string; visibility?: string }) {
  if (animal.animal_source !== "shared_to_me") return true;
  return animal.visibility === "shared_recordable";
}
