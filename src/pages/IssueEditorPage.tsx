import { useState } from "react";
import { AppShell } from "../components/AppShell";
import type { AnimalIssue, AppState, IssuePriority, IssueStatus, IssueType, SpaceContext } from "../types";
import { createId, withChangeLog } from "../utils/storage";

export function IssueEditorPage({ state, space, issueId, onBack, onSave }: { state: AppState; space: SpaceContext; issueId?: string; onBack: () => void; onSave: (state: AppState) => void }) {
  const issue = state.issues.find((item) => item.id === issueId);
  const [title, setTitle] = useState(issue?.title || "");
  const [description, setDescription] = useState(issue?.description || "");
  const [animalId, setAnimalId] = useState(issue?.animal_id || state.animals[0]?.id || "");
  const [status, setStatus] = useState<IssueStatus>(issue?.status || "open");
  const [priority, setPriority] = useState<IssuePriority>(issue?.priority || "P1");
  const [type, setType] = useState<IssueType>(issue?.type || "observe");
  const [assignee, setAssignee] = useState(issue?.assignee_id || "user_1");

  const save = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const nextIssue: AnimalIssue = {
      id: issue?.id || createId("issue"),
      group_id: space.type === "group" ? space.id : undefined,
      animal_id: animalId || undefined,
      title: title.trim(),
      description,
      type,
      status,
      priority,
      assignee_id: assignee,
      created_by: issue?.created_by || "user_1",
      label_ids: issue?.label_ids || [],
      due_date: issue?.due_date,
      created_at: issue?.created_at || now,
      updated_at: now,
      closed_at: status === "done" || status === "closed" ? now : undefined,
    };
    const nextState = {
      ...state,
      issues: issue ? state.issues.map((item) => (item.id === issue.id ? nextIssue : item)) : [nextIssue, ...state.issues],
    };
    onSave(
      withChangeLog(nextState, {
        group_id: nextIssue.group_id,
        animal_id: nextIssue.animal_id,
        issue_id: nextIssue.id,
        action: issue ? "updated_issue" : "created_issue",
        before: issue ? { status: issue.status, title: issue.title } : undefined,
        after: { status: nextIssue.status, title: nextIssue.title },
      }),
    );
  };

  return (
    <AppShell title={issue ? "编辑 Issue" : "新建 Issue"} subtitle="GitHub 式救助任务" canGoBack onBack={onBack}>
      <div className="space-y-5">
        <div className="space-y-4 rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <Field label="标题">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：大黄右后腿受伤待联系医院" />
          </Field>
          <Field label="描述">
            <textarea className="min-h-24" value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          <Field label="关联动物">
            <select value={animalId} onChange={(event) => setAnimalId(event.target.value)}>
              {state.animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.name}</option>)}
            </select>
          </Field>
          <Field label="类型">
            <select value={type} onChange={(event) => setType(event.target.value as IssueType)}>
              <option value="observe">待观察</option>
              <option value="feeding">待喂养</option>
              <option value="health">健康</option>
              <option value="neuter">待绝育</option>
              <option value="rescue">救助</option>
              <option value="adoption">领养</option>
              <option value="photo_confirm">拍照确认</option>
              <option value="merge_check">重复确认</option>
              <option value="pet_care">宠物护理</option>
            </select>
          </Field>
          <Field label="状态">
            <select value={status} onChange={(event) => setStatus(event.target.value as IssueStatus)}>
              <option value="open">待处理</option>
              <option value="in_progress">进行中</option>
              <option value="blocked">阻塞</option>
              <option value="done">已完成</option>
              <option value="closed">已关闭</option>
            </select>
          </Field>
          <Field label="优先级">
            <select value={priority} onChange={(event) => setPriority(event.target.value as IssuePriority)}>
              <option value="P0">P0 紧急</option>
              <option value="P1">P1 重要</option>
              <option value="P2">P2 普通</option>
              <option value="P3">P3 低</option>
            </select>
          </Field>
          <Field label="负责人">
            <select value={assignee} onChange={(event) => setAssignee(event.target.value)}>
              {state.groupMembers.map((member) => <option key={member.id} value={member.user_id}>{member.display_name}</option>)}
            </select>
          </Field>
        </div>
        <button className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white disabled:bg-stone-300" disabled={!title.trim()} onClick={save}>
          保存 Issue
        </button>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <div className="[&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-sand [&>input]:px-3 [&>input]:py-2 [&>input]:outline-none [&>input:focus]:border-clay [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-sand [&>select]:bg-white [&>select]:px-3 [&>select]:py-2 [&>select]:outline-none [&>select:focus]:border-clay [&>textarea]:w-full [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-sand [&>textarea]:px-3 [&>textarea]:py-2 [&>textarea]:outline-none [&>textarea:focus]:border-clay">
        {children}
      </div>
    </label>
  );
}
