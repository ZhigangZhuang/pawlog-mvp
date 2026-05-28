import { useState } from "react";
import { AppShell } from "../components/AppShell";
import type { AppState, SpaceContext, WikiPage as WikiPageType } from "../types";
import { createId } from "../utils/storage";

export function WikiPage({ state, space, onBack, onSave }: { state: AppState; space: SpaceContext; onBack: () => void; onSave: (state: AppState) => void }) {
  const [selectedId, setSelectedId] = useState(state.wikiPages[0]?.id || "");
  const selected = state.wikiPages.find((page) => page.id === selectedId);
  const [title, setTitle] = useState(selected?.title || "");
  const [content, setContent] = useState(selected?.content || "");

  const select = (page: WikiPageType) => {
    setSelectedId(page.id);
    setTitle(page.title);
    setContent(page.content);
  };

  const save = () => {
    if (space.type !== "group" || !title.trim()) return;
    const now = new Date().toISOString();
    const page: WikiPageType = {
      id: selected?.id || createId("wiki"),
      group_id: space.id,
      title: title.trim(),
      content,
      created_by: selected?.created_by || "user_1",
      updated_by: "user_1",
      created_at: selected?.created_at || now,
      updated_at: now,
    };
    onSave({
      ...state,
      wikiPages: selected ? state.wikiPages.map((item) => (item.id === selected.id ? page : item)) : [page, ...state.wikiPages],
    });
    setSelectedId(page.id);
  };

  const createNew = () => {
    setSelectedId("");
    setTitle("");
    setContent("");
  };

  return (
    <AppShell title="小组 Wiki" subtitle="规则、医院、流程和联系人" canGoBack onBack={onBack}>
      <div className="space-y-5">
        {space.type !== "group" ? <div className="rounded-lg bg-white p-4 text-sm text-stone-500 ring-1 ring-sand/70">Wiki 仅在小组空间中使用。</div> : null}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button className="shrink-0 rounded-full bg-clay px-3 py-2 text-sm font-bold text-white" onClick={createNew}>新页面</button>
          {state.wikiPages.map((page) => (
            <button key={page.id} className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold ${selectedId === page.id ? "bg-moss text-white" : "bg-white text-stone-600 ring-1 ring-sand/70"}`} onClick={() => select(page)}>
              {page.title}
            </button>
          ))}
        </div>
        <div className="space-y-4 rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <input className="w-full rounded-lg border border-sand px-3 py-2 text-lg font-bold outline-none focus:border-clay" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="页面标题" />
          <textarea className="min-h-64 w-full rounded-lg border border-sand px-3 py-2 leading-6 outline-none focus:border-clay" value={content} onChange={(event) => setContent(event.target.value)} placeholder="支持纯文本/Markdown 风格内容" />
        </div>
        <button className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white disabled:bg-stone-300" disabled={space.type !== "group" || !title.trim()} onClick={save}>
          保存 Wiki
        </button>
      </div>
    </AppShell>
  );
}
