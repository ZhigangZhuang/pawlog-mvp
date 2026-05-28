import { useState } from "react";
import type React from "react";
import { AppShell } from "../components/AppShell";
import type { AppState, Group } from "../types";
import { createId } from "../utils/storage";

export function CreateGroupPage({ state, onBack, onSave }: { state: AppState; onBack: () => void; onSave: (state: AppState, groupId: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allowInvite, setAllowInvite] = useState(false);

  const save = () => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    const groupId = createId("group");
    const group: Group = {
      id: groupId,
      name: name.trim(),
      description: description || "邀请制协作圈",
      type: "private_care_group",
      visibility: "private",
      invite_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      allow_member_invite: allowInvite,
      default_location_privacy: "blurred_only",
      created_by: "user_1",
      created_at: now,
      updated_at: now,
    };
    onSave(
      {
        ...state,
        groups: [group, ...state.groups],
        groupMembers: [
          {
            id: createId("gm"),
            group_id: groupId,
            user_id: "user_1",
            display_name: "你",
            role: "owner",
            joined_at: now,
          },
          ...state.groupMembers,
        ],
        tags: [
          ...["待绝育", "已绝育", "需救助", "重点观察", "不公开位置"].map((tagName, index) => ({
            id: createId("tag"),
            name: tagName,
            color: ["#EAB308", "#6A9B6B", "#D96060", "#7C83FD", "#57534E"][index],
            scope: "group" as const,
            group_id: groupId,
            created_by: "user_1",
            created_at: now,
          })),
          ...state.tags,
        ],
      },
      groupId,
    );
  };

  return (
    <AppShell title="创建协作圈" subtitle="用于分享毛孩和记录权限" canGoBack onBack={onBack}>
      <div className="space-y-5">
        <div className="space-y-4 rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <Field label="协作圈名称">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：小区猫友圈" />
          </Field>
          <Field label="协作圈简介">
            <textarea className="min-h-24" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="简单说明分享范围和记录规则" />
          </Field>
          <label className="flex items-center gap-3 rounded-lg bg-green-50 p-3 text-sm text-green-900">
            <input type="checkbox" checked={allowInvite} onChange={(event) => setAllowInvite(event.target.checked)} />
            允许成员邀请别人
          </label>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
          默认位置隐私规则：流浪动物只共享模糊位置，敏感位置不会出现在分享内容里。
        </div>
        <button className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white disabled:bg-stone-300" disabled={!name.trim()} onClick={save}>
          创建协作圈
        </button>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <div className="[&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-sand [&>input]:px-3 [&>input]:py-2 [&>input]:outline-none [&>input:focus]:border-clay [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-sand [&>textarea]:px-3 [&>textarea]:py-2 [&>textarea]:outline-none [&>textarea:focus]:border-clay">
        {children}
      </div>
    </label>
  );
}
