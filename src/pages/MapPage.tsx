import { EyeOff, MapPin, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import type { Animal, AnimalRecord, AppState, StrayLocation } from "../types";
import { formatDate, healthLabels, locationTypeLabels, speciesLabels } from "../utils/labels";
import { activeAnimals, animalIdsForRecord } from "../utils/storage";

type MapFilter = "all" | "owned_pet" | "stray" | "shared";

const filters: Array<{ id: MapFilter; label: string }> = [
  { id: "all", label: "全部" },
  { id: "owned_pet", label: "我的宠物" },
  { id: "stray", label: "流浪动物" },
  { id: "shared", label: "分享给我的" },
];

export function MapPage({ state, onOpenAnimal, onOpenPost }: { state: AppState; onOpenAnimal: (id: string) => void; onOpenPost: (id: string) => void }) {
  const animals = activeAnimals(state);
  const [filter, setFilter] = useState<MapFilter>("all");
  const [selectedId, setSelectedId] = useState(state.locations[0]?.id || "");
  const visibleLocations = state.locations.filter((location) => {
    const animal = animals.find((item) => item.id === location.animal_id);
    if (!animal) return false;
    if (filter === "all") return true;
    if (filter === "owned_pet") return animal.animal_origin === "owned_pet" && animal.animal_source !== "shared_to_me";
    if (filter === "stray") return animal.animal_origin === "stray";
    if (filter === "shared") return animal.animal_source === "shared_to_me";
    return true;
  });
  const selected = visibleLocations.find((location) => location.id === selectedId) || visibleLocations[0];
  const selectedAnimal = selected ? animals.find((animal) => animal.id === selected.animal_id) : undefined;

  return (
    <AppShell title="地图" subtitle="我的记录地点">
      <div className="space-y-5 pb-24">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item.id}
              className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold ${filter === item.id ? "bg-moss text-white" : "bg-white text-stone-600 ring-1 ring-sand/70"}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
          <div className="mb-1 flex items-center gap-2 font-bold">
            <ShieldCheck size={18} />
            my_private_map
          </div>
          这里只看你的记录地点。流浪动物点位默认模糊，敏感地点不展示精确坐标，也不会进入公开分享。
        </div>

        <div className="relative h-[420px] overflow-hidden rounded-[20px] bg-[#e9f0df] ring-1 ring-sand/70">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute left-0 top-1/4 h-px w-full bg-white" />
            <div className="absolute left-0 top-2/4 h-px w-full bg-white" />
            <div className="absolute left-0 top-3/4 h-px w-full bg-white" />
            <div className="absolute left-1/4 top-0 h-full w-px bg-white" />
            <div className="absolute left-2/4 top-0 h-full w-px bg-white" />
            <div className="absolute left-3/4 top-0 h-full w-px bg-white" />
          </div>
          {visibleLocations.map((location, index) => {
            const animal = animals.find((item) => item.id === location.animal_id);
            if (!animal) return null;
            const point = positionFor(location, index);
            const isStray = animal.animal_origin === "stray";
            const selectedPoint = selected?.id === location.id;
            return (
              <button
                key={location.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 ${selectedPoint ? "z-10" : ""}`}
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                onClick={() => setSelectedId(location.id)}
              >
                {isStray ? <span className="absolute -inset-4 rounded-full bg-green-500/10 blur-sm" /> : null}
                <span className={`relative grid h-12 w-12 place-items-center rounded-full text-white shadow-soft ring-4 ring-white ${isStray ? "bg-moss" : "bg-clay"}`}>
                  {isStray || location.is_sensitive ? <EyeOff size={19} /> : <MapPin size={19} />}
                </span>
              </button>
            );
          })}
        </div>

        {selected && selectedAnimal ? (
          <MapBottomSheet
            location={selected}
            animal={selectedAnimal}
            recentPost={state.feedRecords.find((record) => animalIdsForRecord(record).includes(selectedAnimal.id))}
            onOpenAnimal={() => onOpenAnimal(selectedAnimal.id)}
            onOpenPost={(postId) => onOpenPost(postId)}
          />
        ) : null}
      </div>
    </AppShell>
  );
}

function MapBottomSheet({ location, animal, recentPost, onOpenAnimal, onOpenPost }: { location: StrayLocation; animal: Animal; recentPost?: AnimalRecord; onOpenAnimal: () => void; onOpenPost: (id: string) => void }) {
  const isStray = animal.animal_origin === "stray";
  return (
    <div className="rounded-[20px] bg-white p-4 shadow-soft ring-1 ring-sand/70">
      <div className="flex gap-3">
        <img className="h-16 w-16 rounded-lg object-cover" src={animal.cover_image_url} alt={animal.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold">{animal.name}</h2>
            <Badge tone={isStray ? "green" : "orange"}>{speciesLabels[animal.species]}</Badge>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            {locationTypeLabels[location.type]} · {isStray || location.is_sensitive ? "模糊地点" : location.location_name}
          </p>
          {animal.health_status ? <p className="mt-1 text-sm text-stone-500">{healthLabels[animal.health_status]}</p> : null}
        </div>
      </div>
      {isStray ? <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm leading-6 text-green-900">为保护动物安全，这里不展示精确坐标、固定出没时间或敏感地点。</p> : null}
      {recentPost ? (
        <button className="mt-3 w-full rounded-2xl bg-cream p-3 text-left ring-1 ring-sand/70" onClick={() => onOpenPost(recentPost.id)}>
          <span className="block text-sm font-bold">最近动态</span>
          <span className="mt-1 line-clamp-1 block text-sm text-stone-500">{formatDate(recentPost.occurred_at)} · {recentPost.content}</span>
        </button>
      ) : null}
      <button className="mt-3 w-full rounded-full bg-clay px-4 py-3 font-bold text-white" onClick={onOpenAnimal}>
        查看主页
      </button>
    </div>
  );
}

function positionFor(location: StrayLocation, index: number) {
  if (location.latitude && location.longitude) {
    const x = ((location.longitude * 1000) % 58) + 20;
    const y = ((location.latitude * 1000) % 58) + 20;
    return { x, y };
  }
  return { x: 24 + ((index * 17) % 52), y: 22 + ((index * 23) % 56) };
}
