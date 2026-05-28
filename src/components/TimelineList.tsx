import { CalendarDays, Camera, ClipboardList, HeartPulse, MapPin, NotebookPen, Scale, Utensils } from "lucide-react";
import type { TimelineItem } from "../types";
import { formatDate, recordTypeLabels } from "../utils/labels";

const iconByType = {
  photo: Camera,
  feeding: Utensils,
  health: HeartPulse,
  weight: Scale,
  medical: ClipboardList,
  anniversary: CalendarDays,
  location: MapPin,
  neuter_status: ClipboardList,
  rescue_status: HeartPulse,
  note: NotebookPen,
  status: ClipboardList,
};

export function TimelineList({ items, emptyText = "还没有记录" }: { items: TimelineItem[]; emptyText?: string }) {
  if (items.length === 0) {
    return <div className="rounded-lg bg-white p-5 text-center text-sm text-stone-500 ring-1 ring-sand/70">{emptyText}</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = iconByType[item.type] || NotebookPen;
        return (
          <div key={item.id} className="flex gap-3 rounded-lg bg-white p-4 ring-1 ring-sand/70">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-50 text-clay">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-[11px] text-stone-600">
                  {item.type === "status" ? "状态" : recordTypeLabels[item.type]}
                </span>
              </div>
              {item.description ? <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p> : null}
              {item.image_url ? <img className="mt-3 h-32 w-full rounded-lg object-cover" src={item.image_url} alt={item.title} /> : null}
              <p className="mt-2 text-xs text-stone-400">
                {formatDate(item.occurred_at)}
                {item.source ? ` · 来源：${sourceLabel(item.source.source_type)}` : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function sourceLabel(sourceType: string) {
  if (sourceType === "group_member") return "小组成员";
  if (sourceType === "imported") return "合并导入";
  if (sourceType === "shared_link") return "分享导入";
  return "自己";
}
