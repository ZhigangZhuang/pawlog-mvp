import { Bookmark, MessageCircle, MoreHorizontal, Share2, ShieldCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import type { Animal, AnimalRecord, AppState } from "../types";
import { formatDate, recordTypeLabels, speciesLabels } from "../utils/labels";
import { animalIdsForRecord } from "../utils/storage";

type PostDetailPageProps = {
  post: AnimalRecord;
  animal: Animal;
  state: AppState;
  onBack: () => void;
  onOpenAnimal: (animalId: string) => void;
};

export function PostDetailPage({ post, animal, state, onBack, onOpenAnimal }: PostDetailPageProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const linkedAnimals = animalIdsForRecord(post).map((id) => state.animals.find((item) => item.id === id)).filter(Boolean) as Animal[];
  const displayedAnimals = linkedAnimals.length ? linkedAnimals : [animal];
  const tags = post.tag_ids.map((id) => state.tags.find((tag) => tag.id === id)?.name).filter(Boolean) as string[];
  const isStray = displayedAnimals.some((item) => item.animal_origin === "stray");
  const title = animalTitle(linkedAnimals.length ? linkedAnimals : [animal]);

  return (
    <AppShell
      title="动态"
      canGoBack
      onBack={onBack}
      actions={
        <div className="relative flex gap-1">
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-700 shadow-sm" onClick={() => setShareOpen((value) => !value)} aria-label="分享动态">
            <Share2 size={18} />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-700 shadow-sm" onClick={() => setMoreOpen((value) => !value)} aria-label="更多">
            <MoreHorizontal size={18} />
          </button>
          {moreOpen ? (
            <div className="absolute right-0 top-11 z-30 w-36 overflow-hidden rounded-xl bg-white text-sm font-semibold shadow-soft ring-1 ring-sand/70">
              <button className="block w-full px-3 py-2 text-left">保存动态</button>
              <button className="block w-full px-3 py-2 text-left">反馈</button>
            </div>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4 pb-24">
        <section className="rounded-[20px] bg-white ring-1 ring-sand/70">
          <button className="flex w-full items-start gap-3 p-4 text-left" onClick={() => onOpenAnimal(animal.id)}>
            <img className="h-12 w-12 rounded-full object-cover" src={animal.cover_image_url} alt={animal.name} />
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{title}</span>
              <span className="mt-0.5 block text-xs text-stone-500">
                {formatDate(post.occurred_at)}
                {post.location_text ? ` · ${safeLocationText(displayedAnimals, post)}` : ""}
              </span>
              <span className="mt-2 flex flex-wrap gap-1.5">
                {[isStray ? "流浪动物" : speciesLabels[animal.species], ...tags.slice(0, 2)].map((tag) => (
                  <TinyTag key={tag}>{tag}</TinyTag>
                ))}
              </span>
            </span>
          </button>

          <PostImages images={post.images.length ? post.images : animal.cover_image_url ? [animal.cover_image_url] : []} animalName={animal.name} />

          <div className="space-y-4 p-4">
            <p className="text-[16px] leading-7 text-stone-800">{post.content}</p>

            <div className="rounded-2xl bg-cream p-3 text-sm leading-6 text-stone-600">
              <p>类型：{recordTypeLabels[toRecordType(post.type)]}</p>
              {post.location_text ? <p>位置：{safeLocationText(displayedAnimals, post)}</p> : null}
              <p>来源：{sourceLabel(post, animal)}</p>
            </div>

            {isStray ? (
              <div className="flex gap-2 rounded-2xl border border-green-200 bg-green-50 p-3 text-xs leading-5 text-green-900">
                <ShieldCheck className="mt-0.5 shrink-0" size={16} />
                <p>为保护流浪动物安全，这条动态分享时会隐藏精确位置和敏感信息。</p>
              </div>
            ) : null}

            {linkedAnimals.length > 1 ? (
              <div className="rounded-2xl bg-white p-3 ring-1 ring-sand/70">
                <p className="mb-2 text-sm font-bold text-stone-600">这条动态里的毛孩</p>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {linkedAnimals.map((item) => (
                    <button key={item.id} className="w-16 shrink-0 text-center" onClick={() => onOpenAnimal(item.id)}>
                      <img className="mx-auto h-12 w-12 rounded-full object-cover" src={item.cover_image_url} alt={item.name} />
                      <span className="mt-1 block truncate text-xs font-bold text-stone-600">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button className="text-sm font-bold text-clay" onClick={() => onOpenAnimal(animal.id)}>
              查看 {animal.name} 的全部动态 →
            </button>
          </div>
        </section>

        <div className="flex items-center gap-6 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-stone-500 ring-1 ring-sand/70">
          <button className="inline-flex items-center gap-1.5">
            <Bookmark size={17} />
            保存
          </button>
          <button className="inline-flex items-center gap-1.5">
            <MessageCircle size={17} />
            备注
          </button>
          <button className="inline-flex items-center gap-1.5" onClick={() => setShareOpen(true)}>
            <Share2 size={17} />
            分享
          </button>
        </div>

        {shareOpen ? (
          <div className="rounded-[20px] bg-white p-4 ring-1 ring-sand/70">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-bold">分享这条动态</p>
              <button className="text-sm font-semibold text-stone-500" onClick={() => setShareOpen(false)}>关闭</button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
              <button className="rounded-full bg-stone-100 px-3 py-2">生成分享图</button>
              <button className="rounded-full bg-stone-100 px-3 py-2">复制链接</button>
              <button className="rounded-full bg-stone-100 px-3 py-2">发给联系人</button>
            </div>
            {isStray ? <p className="mt-3 text-xs leading-5 text-green-800">分享内容已隐藏精确位置、固定出没时间和敏感备注。</p> : null}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function animalTitle(animals: Animal[]) {
  if (animals.length <= 1) return animals[0]?.name || "毛孩";
  if (animals.length <= 3) return animals.map((item) => item.name).join("、");
  return `${animals[0].name}等 ${animals.length} 只毛孩`;
}

function PostImages({ images, animalName }: { images: string[]; animalName: string }) {
  if (!images.length) return null;
  if (images.length === 1) return <img className="aspect-[4/3] w-full object-cover" src={images[0]} alt={animalName} />;
  return (
    <div className="grid aspect-[4/3] grid-cols-2 gap-1 bg-sand">
      {images.slice(0, 4).map((image, index) => (
        <img key={`${image}_${index}`} className="h-full w-full object-cover" src={image} alt={`${animalName} ${index + 1}`} />
      ))}
    </div>
  );
}

function TinyTag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">#{children}</span>;
}

function safeLocationText(animals: Animal[], post: AnimalRecord) {
  if (animals.some((animal) => animal.animal_origin === "stray") && post.location_privacy !== "none") return "模糊地点";
  return post.location_text;
}

function sourceLabel(post: AnimalRecord, animal: Animal) {
  if (post.source === "shared_user") return animal.visibility === "shared_recordable" ? "分享给我的 · 允许我记录" : "分享给我的";
  if (animal.animal_source === "shared_to_me") return "来自分享给我的毛孩";
  return "我记录的";
}

function toRecordType(type: AnimalRecord["type"]) {
  if (type === "adoption" || type === "shared_update") return "note";
  return type;
}
