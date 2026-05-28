import { useState } from "react";
import { AppShell } from "../components/AppShell";
import type { AppState } from "../types";
import { createId } from "../utils/storage";

export function JoinGroupPage({ state, onBack, onSave }: { state: AppState; onBack: () => void; onSave: (state: AppState, groupId: string) => void }) {
  const [code, setCode] = useState("CAT2026");
  const [error, setError] = useState("");

  const join = () => {
    const group = state.groups.find((item) => item.invite_code.toLowerCase() === code.trim().toLowerCase());
    if (!group) {
      setError("没有找到这个邀请码。MVP 可试用 CAT2026。");
      return;
    }
    const already = state.groupMembers.some((member) => member.group_id === group.id && member.user_id === "user_1");
    if (already) {
      onSave(state, group.id);
      return;
    }
    onSave(
      {
        ...state,
        groupMembers: [
          {
            id: createId("gm"),
            group_id: group.id,
            user_id: "user_1",
            display_name: "你",
            role: "member",
            joined_at: new Date().toISOString(),
          },
          ...state.groupMembers,
        ],
      },
      group.id,
    );
  };

  return (
    <AppShell title="加入协作圈" subtitle="使用 mock 邀请码" canGoBack onBack={onBack}>
      <div className="space-y-5">
        <div className="space-y-3 rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <label className="block text-sm font-bold">邀请码</label>
          <input className="w-full rounded-lg border border-sand px-3 py-2 outline-none focus:border-clay" value={code} onChange={(event) => setCode(event.target.value)} />
          {error ? <p className="text-sm text-rose">{error}</p> : null}
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
          协作圈不可公开搜索，只有拿到邀请码的人才能加入。只有被允许记录的人才能新增动态。
        </div>
        <button className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white" onClick={join}>
          加入协作圈
        </button>
      </div>
    </AppShell>
  );
}
