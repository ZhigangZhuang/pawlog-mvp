import { AppShell } from "../components/AppShell";
import type { AppState, IssueStatus, SpaceContext } from "../types";
import { IssueCard } from "./IssuesPage";

const columns: Array<{ status: IssueStatus; title: string }> = [
  { status: "open", title: "待处理" },
  { status: "in_progress", title: "进行中" },
  { status: "blocked", title: "阻塞" },
  { status: "done", title: "已完成" },
];

export function BoardPage({ state, space, onBack, onOpenIssue }: { state: AppState; space: SpaceContext; onBack: () => void; onOpenIssue: (id: string) => void }) {
  return (
    <AppShell title="救助看板" subtitle={space.type === "group" ? space.label : "个人任务"} canGoBack onBack={onBack}>
      <div className="space-y-4">
        {columns.map((column) => {
          const issues = state.issues.filter((issue) => issue.status === column.status);
          return (
            <section key={column.status} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{column.title}</h2>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-stone-500 ring-1 ring-sand/70">{issues.length}</span>
              </div>
              <div className="space-y-3">
                {issues.length ? issues.map((issue) => <IssueCard key={issue.id} issue={issue} state={state} onOpen={() => onOpenIssue(issue.id)} />) : <div className="rounded-lg bg-white p-4 text-sm text-stone-500 ring-1 ring-sand/70">暂无任务</div>}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
