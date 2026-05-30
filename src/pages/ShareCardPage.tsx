import { Download, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import type { Animal, AppState } from "../types";
import {
  getAgeText,
  healthLabels,
  rescueLabels,
  speciesLabels,
} from "../utils/labels";
import { sortTimeline } from "../utils/storage";

type ShareCardPageProps = {
  animal: Animal;
  state: AppState;
  onBack: () => void;
};

export function ShareCardPage({ animal, state, onBack }: ShareCardPageProps) {
  const isStray = animal.animal_origin === "stray";
  const [template, setTemplate] = useState(isStray ? "adoption" : "growth");
  const [showArea, setShowArea] = useState(isStray);
  const location = state.locations.find((item) => item.animal_id === animal.id);
  const latest = sortTimeline(
    state.timeline.filter((item) => item.animal_id === animal.id),
  )[0];
  const publicArea =
    isStray && showArea
      ? sanitizeLocation(location?.location_name, location?.is_sensitive)
      : "";

  return (
    <AppShell
      title="分享卡预览"
      subtitle={animal.name}
      canGoBack
      onBack={onBack}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          {(isStray ? strayTemplates : petTemplates).map((item) => (
            <button
              key={item.value}
              className={`rounded-lg border px-3 py-3 text-sm font-semibold ${template === item.value ? "border-clay bg-orange-50 text-clay" : "border-sand bg-white text-stone-600"}`}
              onClick={() => setTemplate(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isStray ? (
          <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
            <div className="flex gap-2 font-bold">
              <ShieldCheck size={18} />
              分享前安全提示
            </div>
            为保护流浪动物安全，分享卡不会包含精确位置、固定出没时间、幼崽窝点或抓捕计划。
            <label className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                checked={showArea}
                onChange={(event) => setShowArea(event.target.checked)}
              />
              展示模糊区域
            </label>
          </div>
        ) : null}

        <div className="rounded-[28px] bg-white p-4 shadow-soft ring-1 ring-sand/80">
          <div
            className={`overflow-hidden rounded-[24px] ${isStray ? "bg-green-50" : "bg-orange-50"}`}
          >
            <div className="h-72 bg-sand">
              {animal.cover_image_url ? (
                <img
                  className="h-full w-full object-cover"
                  src={animal.cover_image_url}
                  alt={animal.name}
                />
              ) : null}
            </div>
            <div className="space-y-4 p-5">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge tone={isStray ? "green" : "orange"}>
                    {isStray
                      ? templateLabel(template, strayTemplates)
                      : templateLabel(template, petTemplates)}
                  </Badge>
                  {isStray ? <Badge tone="gray">位置已保护</Badge> : null}
                </div>
                <h2 className="text-3xl font-black">{animal.name}</h2>
                <p className="mt-1 text-sm text-stone-600">
                  {speciesLabels[animal.species]} /{" "}
                  {getAgeText(animal.birthday, animal.age_stage)}
                </p>
              </div>

              <div className="grid gap-2 text-sm">
                {animal.personality ? (
                  <CardLine label="性格" value={animal.personality} />
                ) : null}
                {animal.health_status ? (
                  <CardLine
                    label="健康"
                    value={healthLabels[animal.health_status]}
                  />
                ) : null}
                {isStray && animal.rescue_status ? (
                  <CardLine
                    label="救助状态"
                    value={rescueLabels[animal.rescue_status]}
                  />
                ) : null}
                {isStray && publicArea ? (
                  <CardLine label="模糊区域" value={publicArea} />
                ) : null}
                {!isStray && animal.home_date ? (
                  <CardLine label="到家纪念日" value={animal.home_date} />
                ) : null}
                {!isStray && latest ? (
                  <CardLine label="最近记录" value={latest.title} />
                ) : null}
              </div>

              <p className="rounded-lg bg-white/75 p-3 text-xs leading-5 text-stone-600">
                {isStray
                  ? "这张卡片已自动隐藏经纬度、门牌、固定出没时间和敏感救助信息。"
                  : "这张卡片适合分享成长照片、纪念日和陪伴瞬间。"}
              </p>
            </div>
          </div>
        </div>

        <button className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white">
          <span className="inline-flex items-center gap-2">
            <Download size={18} />
            生成分享卡
          </span>
        </button>
      </div>
    </AppShell>
  );
}

const petTemplates = [
  { value: "growth", label: "成长卡" },
  { value: "birthday", label: "生日卡" },
  { value: "daily", label: "今日萌照" },
  { value: "memory", label: "年度回忆" },
];

const strayTemplates = [
  { value: "adoption", label: "领养卡" },
  { value: "help", label: "救助求助" },
  { value: "missing", label: "寻找卡" },
  { value: "observe", label: "观察记录" },
];

function templateLabel(
  value: string,
  options: { value: string; label: string }[],
) {
  return options.find((item) => item.value === value)?.label || "分享卡";
}

function sanitizeLocation(name?: string, isSensitive?: boolean) {
  if (!name) return "附近区域";
  if (isSensitive) return "附近区域，精确位置已隐藏";
  return name.replace(
    /[0-9０-９]+号|[0-9０-９]+栋|[0-9０-９]+单元|[0-9０-９]+室/g,
    "附近",
  );
}

function CardLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-white/75 p-3">
      <span className="text-stone-500">{label}</span>
      <span className="max-w-[65%] text-right font-semibold">{value}</span>
    </div>
  );
}
