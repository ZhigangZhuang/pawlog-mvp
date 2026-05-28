import { Plus, Tag, Ticket, UsersRound } from "lucide-react";
import type React from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import type { AppState } from "../types";
import { getUserRoleForGroup } from "../utils/storage";

export function GroupManagementPage({
  state,
  onBack,
  onCreateGroup,
  onJoinGroup,
  onSelectGroup,
}: {
  state: AppState;
  onBack: () => void;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
  onSelectGroup: (groupId: string) => void;
}) {
  return (
    <AppShell title="协作圈" subtitle="把毛孩分享给可信的人" canGoBack onBack={onBack}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-lg bg-clay p-4 text-left font-bold text-white" onClick={onCreateGroup}>
            <Plus className="mb-2" size={22} />
            创建协作圈
          </button>
          <button className="rounded-lg bg-white p-4 text-left font-bold text-ink ring-1 ring-sand/70" onClick={onJoinGroup}>
            <Ticket className="mb-2 text-moss" size={22} />
            输入邀请码
          </button>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
          协作圈不会公开搜索。你可以把某只毛孩分享给家人、朋友或小区猫友，并控制对方是否能继续发动态。
        </div>

        <div className="space-y-3">
          {state.groups.map((group) => {
            const role = getUserRoleForGroup(state, group.id) || "viewer";
            const members = state.groupMembers.filter((member) => member.group_id === group.id);
            const animals = state.groupAnimals.filter((item) => item.group_id === group.id);
            const tags = state.tags.filter((tag) => tag.group_id === group.id);
            return (
              <button key={group.id} className="w-full rounded-[20px] bg-white p-4 text-left ring-1 ring-sand/70" onClick={() => onSelectGroup(group.id)}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{group.name}</h2>
                    <p className="mt-1 text-sm leading-6 text-stone-500">{group.description}</p>
                  </div>
                  <Badge tone="green">{role}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <Mini icon={<UsersRound size={16} />} value={members.length} label="成员" />
                  <Mini icon={<Tag size={16} />} value={tags.length} label="标签" />
                  <Mini icon={<UsersRound size={16} />} value={animals.length} label="动物" />
                </div>
                <p className="mt-3 text-xs text-stone-400">邀请码：{group.invite_code}</p>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function Mini({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-lg bg-stone-50 p-3">
      <div className="mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full bg-white text-clay">{icon}</div>
      <p className="font-bold">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}
