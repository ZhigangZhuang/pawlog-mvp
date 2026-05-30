import {
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Share2,
  ShieldCheck,
} from "lucide-react";
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

export function PostDetailPage({
  post,
  animal,
  state,
  onBack,
  onOpenAnimal,
}: PostDetailPageProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const postAnimalLinks = state.postAnimals.filter(
    (item) => item.post_id === post.id,
  );
  const linkedAnimalIds = Array.from(
    new Set([
      ...animalIdsForRecord(post),
      ...postAnimalLinks.map((item) => item.animal_id),
    ]),
  );
  const primaryAnimalId =
    post.primary_animal_id || post.animal_id || linkedAnimalIds[0];
  const roleByAnimalId = new Map(
    postAnimalLinks.map((item) => [
      item.animal_id,
      item.role_in_post || "unknown",
    ]),
  );
  const linkedAnimals = linkedAnimalIds
    .map((id) => state.animals.find((item) => item.id === id))
    .filter(Boolean) as Animal[];
  const displayedAnimals = linkedAnimals.length ? linkedAnimals : [animal];
  const primaryAnimal =
    displayedAnimals.find((item) => item.id === primaryAnimalId) ||
    displayedAnimals[0] ||
    animal;
  const tags = post.tag_ids
    .map((id) => state.tags.find((tag) => tag.id === id)?.name)
    .filter(Boolean) as string[];
  const isStray = displayedAnimals.some(
    (item) => item.animal_origin === "stray",
  );
  const title = animalTitle(displayedAnimals);

  return (
    <AppShell
      title="动态"
      canGoBack
      onBack={onBack}
      actions={
        <div className="flex gap-1">
          <button
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-700 shadow-sm"
            onClick={() => setShareOpen(true)}
            aria-label="分享动态"
          >
            <Share2 size={18} />
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-700 shadow-sm"
            onClick={() => setMoreOpen(true)}
            aria-label="更多"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      }
    >
      <div className="space-y-4 pb-24">
        <section className="rounded-[20px] bg-white ring-1 ring-sand/70">
          <div className="flex items-start gap-3 p-4">
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={primaryAnimal.cover_image_url}
              alt={primaryAnimal.name}
            />
            <div className="min-w-0 flex-1">
              <span className="block font-bold">{title}</span>
              <span className="mt-0.5 block text-xs text-stone-500">
                {formatDate(post.occurred_at)}
                {post.location_text
                  ? ` · ${safeLocationText(displayedAnimals, post)}`
                  : ""}
              </span>
              <span className="mt-2 flex flex-wrap gap-1.5">
                {[
                  isStray ? "流浪动物" : speciesLabels[primaryAnimal.species],
                  ...tags.slice(0, 2),
                ].map((tag) => (
                  <TinyTag key={tag}>{tag}</TinyTag>
                ))}
              </span>
              <button
                className="mt-2 text-xs font-semibold text-clay"
                onClick={() => onOpenAnimal(primaryAnimal.id)}
              >
                查看毛孩主页 →
              </button>
            </div>
          </div>

          <PostImages
            images={
              post.images.length
                ? post.images
                : primaryAnimal.cover_image_url
                  ? [primaryAnimal.cover_image_url]
                  : []
            }
            animalName={primaryAnimal.name}
          />

          <div className="space-y-4 p-4">
            <p className="text-[16px] leading-7 text-stone-800">
              {post.content}
            </p>

            <div className="rounded-2xl bg-cream p-3 text-sm leading-6 text-stone-600">
              <p>类型：{recordTypeLabels[toRecordType(post.type)]}</p>
              {post.location_text ? (
                <p>位置：{safeLocationText(displayedAnimals, post)}</p>
              ) : null}
              <p>来源：{sourceLabel(post, primaryAnimal)}</p>
            </div>

            {isStray ? (
              <div className="flex gap-2 rounded-2xl border border-green-200 bg-green-50 p-3 text-xs leading-5 text-green-900">
                <ShieldCheck className="mt-0.5 shrink-0" size={16} />
                <p>
                  为保护流浪动物安全，这条动态分享时会隐藏精确位置和敏感信息。
                </p>
              </div>
            ) : null}

            {displayedAnimals.length >= 2 && (
              <div className="rounded-2xl bg-white p-3 ring-1 ring-sand/70">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-stone-600">
                    这条动态里的毛孩
                  </p>
                  <span className="shrink-0 rounded-full bg-orange-50 px-2 py-1 text-xs font-bold text-clay">
                    {displayedAnimals.length} 只
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {displayedAnimals.map((item) => {
                    const role =
                      item.id === primaryAnimal.id
                        ? "main"
                        : roleByAnimalId.get(item.id);
                    return (
                      <button
                        key={item.id}
                        className="w-20 shrink-0 text-center"
                        onClick={() => onOpenAnimal(item.id)}
                      >
                        <span className="relative mx-auto block h-14 w-14">
                          <img
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
                            src={item.cover_image_url}
                            alt={item.name}
                          />
                          {role === "main" ? (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-clay px-1.5 py-0.5 text-[10px] font-bold text-white">
                              主角
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-2 block truncate text-xs font-bold text-stone-700">
                          {item.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-stone-500">
                          {roleLabel(role)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
          <button
            className="inline-flex items-center gap-1.5"
            onClick={() => setShareOpen(true)}
          >
            <Share2 size={17} />
            分享
          </button>
        </div>
      </div>

      {/* Share bottom sheet */}
      {shareOpen && (
        <BottomSheet onClose={() => setShareOpen(false)}>
          <p className="mb-3 font-bold">分享这条动态</p>
          {isStray && (
            <p className="mb-3 text-xs leading-5 text-green-800">
              分享时将自动隐藏精确位置和敏感信息
            </p>
          )}
          <div className="space-y-1">
            <SheetAction
              label="生成分享图"
              onClick={() => setShareOpen(false)}
            />
            <SheetAction label="复制链接" onClick={() => setShareOpen(false)} />
            <SheetAction
              label="发给联系人"
              onClick={() => setShareOpen(false)}
            />
          </div>
          <button
            className="mt-3 w-full rounded-xl bg-stone-100 py-2.5 text-sm font-semibold text-stone-500"
            onClick={() => setShareOpen(false)}
          >
            取消
          </button>
        </BottomSheet>
      )}

      {/* More bottom sheet */}
      {moreOpen && (
        <BottomSheet onClose={() => setMoreOpen(false)}>
          <p className="mb-3 font-bold">更多操作</p>
          <div className="space-y-1">
            <SheetAction
              icon={<Bookmark size={16} />}
              label="保存动态"
              onClick={() => setMoreOpen(false)}
            />
            <SheetAction
              icon={<MessageCircle size={16} />}
              label="编辑动态"
              onClick={() => setMoreOpen(false)}
            />
            <SheetAction
              icon={<Share2 size={16} />}
              label="分享"
              onClick={() => {
                setMoreOpen(false);
                setShareOpen(true);
              }}
            />
            <SheetAction label="设为私密" onClick={() => setMoreOpen(false)} />
            <SheetAction
              label="删除"
              onClick={() => setMoreOpen(false)}
              danger
            />
          </div>
          <button
            className="mt-3 w-full rounded-xl bg-stone-100 py-2.5 text-sm font-semibold text-stone-500"
            onClick={() => setMoreOpen(false)}
          >
            取消
          </button>
        </BottomSheet>
      )}
    </AppShell>
  );
}

function animalTitle(animals: Animal[]) {
  if (animals.length <= 1) return animals[0]?.name || "毛孩";
  if (animals.length <= 3) return animals.map((item) => item.name).join("、");
  return `${animals[0].name}等 ${animals.length} 只毛孩`;
}

function roleLabel(role?: "main" | "appears_with" | "background" | "unknown") {
  if (role === "main") return "主角";
  if (role === "appears_with") return "一起出现";
  if (role === "background") return "同框";
  return "关联";
}

function PostImages({
  images,
  animalName,
}: {
  images: string[];
  animalName: string;
}) {
  if (!images.length) return null;
  if (images.length === 1)
    return (
      <img
        className="aspect-[4/3] w-full object-cover"
        src={images[0]}
        alt={animalName}
      />
    );
  return (
    <div className="grid aspect-[4/3] grid-cols-2 gap-1 bg-sand">
      {images.slice(0, 4).map((image, index) => (
        <img
          key={`${image}_${index}`}
          className="h-full w-full object-cover"
          src={image}
          alt={`${animalName} ${index + 1}`}
        />
      ))}
    </div>
  );
}

function TinyTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">
      #{children}
    </span>
  );
}

function safeLocationText(animals: Animal[], post: AnimalRecord) {
  if (
    animals.some((animal) => animal.animal_origin === "stray") &&
    post.location_privacy !== "none"
  )
    return "模糊地点";
  return post.location_text;
}

function sourceLabel(post: AnimalRecord, animal: Animal) {
  if (post.source === "shared_user")
    return animal.visibility === "shared_recordable"
      ? "分享给我的 · 允许我记录"
      : "分享给我的";
  if (animal.animal_source === "shared_to_me")
    return animal.visibility === "shared_recordable"
      ? "分享给我的 · 允许我记录"
      : "分享给我的 · 只读";
  return "我记录的";
}

function toRecordType(type: AnimalRecord["type"]) {
  if (type === "adoption" || type === "shared_update") return "note";
  return type;
}

function BottomSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[24px] bg-white p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-300" />
        {children}
      </div>
    </div>
  );
}

function SheetAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold active:bg-stone-50 ${danger ? "text-rose" : "text-ink"}`}
      onClick={onClick}
    >
      {icon && <span className="text-stone-400">{icon}</span>}
      {label}
    </button>
  );
}
