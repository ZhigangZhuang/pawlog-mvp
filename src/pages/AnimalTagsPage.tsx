import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import type { Animal, AppState } from "../types";
import { createId, withChangeLog } from "../utils/storage";

export function AnimalTagsPage({ state, animal, groupId, onBack, onSave }: { state: AppState; animal: Animal; groupId: string; onBack: () => void; onSave: (state: AppState) => void }) {
  const group = state.groups.find((item) => item.id === groupId);
  const groupTags = state.tags.filter((tag) => tag.scope === "group" && tag.group_id === groupId);
  const selected = new Set(state.animalTags.filter((item) => item.animal_id === animal.id).map((item) => item.tag_id));
  const [newTag, setNewTag] = useState("");

  const toggle = (tagId: string) => {
    const exists = state.animalTags.find((item) => item.animal_id === animal.id && item.tag_id === tagId);
    if (exists) {
      onSave(withChangeLog({ ...state, animalTags: state.animalTags.filter((item) => item.id !== exists.id) }, { group_id: groupId, animal_id: animal.id, action: "removed_tag", before: { tag_id: tagId } }));
      return;
    }
    onSave(
      withChangeLog(
        {
          ...state,
          animalTags: [{ id: createId("at"), animal_id: animal.id, tag_id: tagId, added_by: "user_1", created_at: new Date().toISOString() }, ...state.animalTags],
        },
        { group_id: groupId, animal_id: animal.id, action: "added_tag", after: { tag_id: tagId } },
      ),
    );
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    const now = new Date().toISOString();
    const tagId = createId("tag");
    onSave(
      withChangeLog(
        {
          ...state,
          tags: [{ id: tagId, name: newTag.trim(), color: "#6A9B6B", scope: "group", group_id: groupId, created_by: "user_1", created_at: now }, ...state.tags],
          animalTags: [{ id: createId("at"), animal_id: animal.id, tag_id: tagId, added_by: "user_1", created_at: now }, ...state.animalTags],
        },
        { group_id: groupId, animal_id: animal.id, action: "added_tag", after: { tag: newTag.trim() } },
      ),
    );
    setNewTag("");
  };

  return (
    <AppShell title="小组标签" subtitle={`${animal.name} · ${group?.name || "小组"}`} canGoBack onBack={onBack}>
      <div className="space-y-5">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
          小组标签对组内成员可见，用来统一“待绝育、需救助、重点观察”等状态。
        </div>
        <div className="flex flex-wrap gap-2 rounded-lg bg-white p-4 ring-1 ring-sand/70">
          {groupTags.map((tag) => (
            <button
              key={tag.id}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${selected.has(tag.id) ? "text-white" : "bg-stone-100 text-stone-600"}`}
              style={selected.has(tag.id) ? { background: tag.color } : undefined}
              onClick={() => toggle(tag.id)}
            >
              {tag.name}
            </button>
          ))}
        </div>
        <div className="space-y-3 rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <div className="flex gap-2">
            <input className="min-w-0 flex-1 rounded-lg border border-sand px-3 py-2 outline-none focus:border-clay" value={newTag} onChange={(event) => setNewTag(event.target.value)} placeholder="新增小组标签" />
            <button className="rounded-full bg-clay px-4 font-bold text-white" onClick={addTag}>
              添加
            </button>
          </div>
          <Badge tone="gray">owner/admin 可管理标签，MVP 暂按本地用户处理</Badge>
        </div>
      </div>
    </AppShell>
  );
}
