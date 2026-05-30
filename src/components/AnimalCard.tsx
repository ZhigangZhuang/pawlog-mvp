import { Camera, Clock, HeartPulse, MapPin } from "lucide-react";
import { Badge } from "./Badge";
import type { Animal, StrayLocation, TimelineItem } from "../types";
import {
  formatDate,
  getAgeText,
  healthLabels,
  neuterLabels,
  rescueLabels,
  speciesLabels,
} from "../utils/labels";

type AnimalCardProps = {
  animal: Animal;
  timeline: TimelineItem[];
  location?: StrayLocation;
  onOpen: () => void;
};

export function AnimalCard({
  animal,
  timeline,
  location,
  onOpen,
}: AnimalCardProps) {
  const latest = timeline.find((item) => item.animal_id === animal.id);
  const isStray = animal.animal_origin === "stray";
  const healthTone =
    animal.health_status === "urgent" ||
    animal.health_status === "suspected_injured"
      ? "red"
      : "green";

  return (
    <button
      className="w-full overflow-hidden rounded-lg bg-white text-left shadow-sm ring-1 ring-sand/70"
      onClick={onOpen}
    >
      <div className="relative h-44 w-full overflow-hidden bg-sand">
        {animal.cover_image_url ? (
          <img
            className="h-full w-full object-cover"
            src={animal.cover_image_url}
            alt={animal.name}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-stone-500">
            暂无封面
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge tone={isStray ? "green" : "orange"}>
            {isStray ? "流浪动物" : "自家宠物"}
          </Badge>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{animal.name}</h2>
            <p className="text-sm text-stone-500">
              {speciesLabels[animal.species]}
              {animal.breed ? ` / ${animal.breed}` : ""} /{" "}
              {getAgeText(animal.birthday, animal.age_stage)}
            </p>
          </div>
          {animal.health_status ? (
            <Badge tone={healthTone}>
              {healthLabels[animal.health_status]}
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {animal.neuter_status ? (
            <Badge
              tone={animal.neuter_status === "not_neutered" ? "yellow" : "gray"}
            >
              {neuterLabels[animal.neuter_status]}
            </Badge>
          ) : null}
          {isStray && animal.rescue_status ? (
            <Badge
              tone={animal.rescue_status === "needs_help" ? "red" : "gray"}
            >
              {rescueLabels[animal.rescue_status]}
            </Badge>
          ) : null}
          {!isStray && animal.home_date ? (
            <Badge tone="orange">到家日 {animal.home_date.slice(5)}</Badge>
          ) : null}
          {!isStray && animal.birthday ? (
            <Badge tone="orange">生日 {animal.birthday.slice(5)}</Badge>
          ) : null}
        </div>
        <div className="grid gap-2 text-sm text-stone-600">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            最近记录：{latest ? formatDate(latest.occurred_at) : "暂无记录"}
          </div>
          {isStray ? (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {location?.is_sensitive
                ? "敏感地点，仅自己可见"
                : location?.location_name || "未记录出没地点"}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Camera size={16} />
              成长相册、体重与纪念日
            </div>
          )}
          <div className="flex items-center gap-2">
            <HeartPulse size={16} />
            档案默认私密，仅自己可见
          </div>
        </div>
      </div>
    </button>
  );
}
