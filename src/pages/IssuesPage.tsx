import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import type { AnimalIssue, AppState, IssueStatus, SpaceContext } from "../types";
import { formatShortDate } from "../utils/labels";

const statusLabels: Record<IssueStatus, string> = {
  open: "待处理",
  in_progress: "进行中",
  blocked: "阻塞",
  done: "已完成",
  closed: "已关闭",
};

export function IssuesPage({ state, space, onBack, onCreate, onOpenIssue }: { state: AppState; space: SpaceContext; onBack: () => void; onCreate: () => void; onOpenIssue: (id: string) => void }) {
  const [status, setStatus] = useState<IssueStatus | "all">("all");
  const [query, setQuery] = useState("");
  const issues = state.issues.filter((issue) => (status === "all" || issue.status === status) && issue.title.includes(query));

  return (
    <AppShell title="Issue" subtitle={space.type === "group" ? `${space.label} 的任务` : "护理与救助任务"} canGoBack onBack={onBack}>
      <div className="space-y-5">
        <button className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white" onClick={onCreate}>
          <Plus className="inline" size={18} /> 新建 Issue
        </button>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm text-stone-500 ring-1 ring-sand/80">
          <Search size={18} />
          <input className="min-w-0 flex-1 bg-transparent outline-none" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索任务" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "open", "in_progress", "blocked", "done"] as const).map((item) => (
            <button key={item} className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold ${status === item ? "bg-clay text-white" : "bg-white text-stone-600 ring-1 ring-sand/70"}`} onClick={() => setStatus(item)}>
              {item === "all" ? "全部" : statusLabels[item]}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {issues.map((issue) => <IssueCard key={issue.id} issue={issue} state={state} onOpen={() => onOpenIssue(issue.id)} />)}
        </div>
      </div>
    </AppShell>
  );
}

export function IssueCard({ issue, state, onOpen }: { issue: AnimalIssue; state: AppState; onOpen: () => void }) {
  const animal = state.animals.find((item) => item.id === issue.animal_id);
  const assignee = state.groupMembers.find((item) => item.user_id === issue.assignee_id);
  const tags = issue.label_ids.map((tagId) => state.tags.find((tag) => tag.id === tagId)).filter(Boolean);
  return (
    <button className="w-full rounded-[20px] bg-white p-4 text-left ring-1 ring-sand/70" onClick={onOpen}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold">{issue.title}</h2>
          <p className="mt-1 text-sm text-stone-500">{animal ? `关联：${animal.name}` : "未关联动物"} · {assignee?.display_name || "未指派"}</p>
        </div>
        <Badge tone={issue.priority === "P0" ? "red" : issue.priority === "P1" ? "orange" : "gray"}>{issue.priority}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone={issue.status === "done" ? "green" : issue.status === "blocked" ? "red" : "yellow"}>{statusLabels[issue.status]}</Badge>
        {tags.map((tag) => (
          <span key={tag!.id} className="rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ background: tag!.color }}>
            {tag!.name}
          </span>
        ))}
      </div>
      {issue.due_date ? <p className="mt-3 text-xs text-stone-400">截止：{formatShortDate(issue.due_date)}</p> : null}
    </button>
  );
}
