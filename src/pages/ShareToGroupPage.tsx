import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import type { Animal, AppState } from "../types";
import { createId } from "../utils/storage";

export function ShareToGroupPage({ state, animal, onBack, onSave }: { state: AppState; animal: Animal; onBack: () => void; onSave: (state: AppState, groupId: string) => void }) {
  const [groupId, setGroupId] = useState(state.groups[0]?.id || "");
  const [sharePhotos, setSharePhotos] = useState(true);
  const [shareHealth, setShareHealth] = useState(true);
  const [shareFeeding, setShareFeeding] = useState(true);
  const [shareBlurredLocation, setShareBlurredLocation] = useState(animal.animal_origin === "stray");
  const [shareExactLocation, setShareExactLocation] = useState(false);
  const isStray = animal.animal_origin === "stray";

  const save = () => {
    if (!groupId) return;
    const now = new Date().toISOString();
    const exists = state.groupAnimals.find((item) => item.group_id === groupId && item.animal_id === animal.id);
    const share = {
      id: exists?.id || createId("ga"),
      group_id: groupId,
      animal_id: animal.id,
      shared_by: "user_1",
      share_basic_info: true,
      share_photos: sharePhotos,
      share_health_records: shareHealth,
      share_feeding_records: shareFeeding,
      share_weight_records: animal.animal_origin === "owned_pet",
      share_neuter_status: true,
      share_rescue_status: animal.animal_origin === "stray",
      share_blurred_location: shareBlurredLocation,
      share_exact_location: isStray ? false : shareExactLocation,
      created_at: exists?.created_at || now,
      updated_at: now,
    };
    onSave(
      {
        ...state,
        groupAnimals: exists ? state.groupAnimals.map((item) => (item.id === exists.id ? share : item)) : [share, ...state.groupAnimals],
      },
      groupId,
    );
  };

  return (
    <AppShell title="共享记录权限" subtitle={animal.name} canGoBack onBack={onBack}>
      <div className="space-y-5">
        <div className="rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <label className="mb-2 block text-sm font-bold">分享给</label>
          <select className="w-full rounded-lg border border-sand bg-white px-3 py-2" value={groupId} onChange={(event) => setGroupId(event.target.value)}>
            {state.groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {isStray ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
            <div className="mb-1 flex items-center gap-2 font-bold">
              <ShieldCheck size={18} />
              流浪动物分享规则
            </div>
            精确位置默认关闭，敏感地点不会出现在分享内容里。
          </div>
        ) : null}

        <div className="space-y-3 rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <p className="font-bold">分享内容</p>
          <Check label="基础信息" checked disabled />
          <Check label="照片" checked={sharePhotos} onChange={setSharePhotos} />
          <Check label="健康记录" checked={shareHealth} onChange={setShareHealth} />
          <Check label="喂养记录" checked={shareFeeding} onChange={setShareFeeding} />
          <Check label="模糊位置" checked={shareBlurredLocation} onChange={setShareBlurredLocation} />
          <Check label="精确位置" checked={shareExactLocation} onChange={setShareExactLocation} disabled={isStray} />
        </div>

        <button className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white" onClick={save}>
          保存分享权限
        </button>
      </div>
    </AppShell>
  );
}

function Check({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange?: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex items-center gap-3 text-sm ${disabled ? "text-stone-400" : "text-ink"}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange?.(event.target.checked)} />
      {label}
    </label>
  );
}
