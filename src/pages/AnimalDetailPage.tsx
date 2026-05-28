import { MapPin, MessageCircle, MoreHorizontal, PenLine, Plus, Share2, ShieldCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import type { Animal, AnimalRecord, AppState, RecordType } from "../types";
import { formatDate, formatShortDate, genderLabels, getAgeText, healthLabels, neuterLabels, recordTypeLabels, rescueLabels, speciesLabels } from "../utils/labels";
import { animalIdsForRecord } from "../utils/storage";

type AnimalDetailPageProps = {
  animal: Animal;
  state: AppState;
  onBack: () => void;
  onAddRecord: (type?: RecordType) => void;
  onShare: () => void;
  onMerge: () => void;
  onShareToGroup: () => void;
  onEditGroupTags?: () => void;
  currentGroupId?: string;
};

type DetailTab = "timeline" | "photos" | "places" | "profile";
type AnimalPermission = "owner" | "recordable" | "readonly";

export function AnimalDetailPage({ animal, state, onBack, onAddRecord, onShare, onMerge, onShareToGroup, onEditGroupTags, currentGroupId }: AnimalDetailPageProps) {
  const [tab, setTab] = useState<DetailTab>("timeline");
  const [moreOpen, setMoreOpen] = useState(false);
  const isStray = animal.animal_origin === "stray";
  const permission = getPermission(animal);
  const canPost = permission === "owner" || permission === "recordable";
  const canEdit = permission === "owner";
  const posts = [...state.feedRecords].filter((item) => animalIdsForRecord(item).includes(animal.id)).sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  const photos = state.photos.filter((photo) => photo.animal_id === animal.id);
  const locations = state.locations.filter((item) => item.animal_id === animal.id);
  const logs = state.changeLogs.filter((log) => log.animal_id === animal.id).slice(0, 6);
  const tagById = new Map(state.tags.map((tag) => [tag.id, tag.name]));
  const animalById = new Map(state.animals.map((item) => [item.id, item]));
  const relationships = state.animalRelationships.filter((item) => item.from_animal_id === animal.id || item.to_animal_id === animal.id);
  const families = state.animalFamilies.filter((family) => family.member_animal_ids.includes(animal.id));
  const transfers = state.animalTransfers.filter((transfer) => transfer.animal_id === animal.id);

  return (
    <AppShell
      title={animal.name}
      canGoBack
      onBack={onBack}
      actions={
        <div className="relative flex gap-1">
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-700 shadow-sm" onClick={onShare} aria-label="分享">
            <Share2 size={18} />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-700 shadow-sm" onClick={() => setMoreOpen((value) => !value)} aria-label="更多">
            <MoreHorizontal size={18} />
          </button>
          {moreOpen ? (
            <div className="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-xl bg-white text-sm font-semibold shadow-soft ring-1 ring-sand/70">
              {canEdit ? <button className="block w-full px-3 py-2 text-left" onClick={onShareToGroup}>共享权限</button> : null}
              {currentGroupId && onEditGroupTags ? <button className="block w-full px-3 py-2 text-left" onClick={onEditGroupTags}>编辑标签</button> : null}
              {canEdit ? <button className="block w-full px-3 py-2 text-left" onClick={onMerge}>合并档案</button> : null}
              {!canEdit ? <button className="block w-full px-3 py-2 text-left">保存到我的图鉴</button> : null}
            </div>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4 pb-24">
        <section className="rounded-[22px] bg-white px-4 py-5 text-center ring-1 ring-sand/70">
          <img className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-cream" src={animal.cover_image_url} alt={animal.name} />
          <h1 className="mt-3 text-2xl font-black">{animal.name}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {animal.color || speciesLabels[animal.species]}{isStray ? `流浪${speciesLabels[animal.species]}` : animal.breed ? ` · ${animal.breed}` : ` · ${speciesLabels[animal.species]}`}
            {animal.neuter_status ? ` · ${neuterLabels[animal.neuter_status]}` : ""}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            {firstLocationText(locations, isStray)} · {posts.length} 条动态 · {photos.length} 张照片
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <TinyTag>{isStray ? `流浪${speciesLabels[animal.species]}` : "自家宠物"}</TinyTag>
            {animal.health_status ? <TinyTag>{healthLabels[animal.health_status]}</TinyTag> : null}
            {isStray && animal.rescue_status ? <TinyTag>{rescueLabels[animal.rescue_status]}</TinyTag> : null}
            {permissionLabels(animal).map((tag) => <TinyTag key={tag}>{tag}</TinyTag>)}
          </div>
        </section>

        {isStray ? (
          <div className="flex gap-2 rounded-2xl border border-green-200 bg-green-50 p-3 text-xs leading-5 text-green-900">
            <ShieldCheck className="mt-0.5 shrink-0" size={16} />
            <p>流浪动物分享时会隐藏精确位置、固定出没时间、幼崽窝点和抓捕计划。</p>
          </div>
        ) : null}

        <div className="flex justify-around border-b border-sand/80 text-sm font-bold text-stone-500">
          {[
            ["timeline", "动态"],
            ["photos", "照片"],
            ["places", "地点"],
            ["profile", "档案"],
          ].map(([value, label]) => (
            <button key={value} className={`border-b-2 px-3 py-2 ${tab === value ? "border-clay text-clay" : "border-transparent"}`} onClick={() => setTab(value as DetailTab)}>
              {label}
            </button>
          ))}
        </div>

        {tab === "timeline" ? (
          <div className="space-y-4">
            {posts.length ? (
              posts.map((post) => <AnimalPost key={post.id} post={post} animal={animal} tags={post.tag_ids.map((id) => tagById.get(id)).filter(Boolean) as string[]} onShare={onShare} />)
            ) : (
              <div className="rounded-2xl bg-white p-5 text-sm text-stone-500 ring-1 ring-sand/70">还没有动态。</div>
            )}
          </div>
        ) : null}

        {tab === "photos" ? (
          <div className="grid grid-cols-3 gap-1.5">
            {photos.map((photo) => (
              <img key={photo.id} className="aspect-square rounded-lg object-cover" src={photo.image_url} alt={photo.note || animal.name} />
            ))}
          </div>
        ) : null}

        {tab === "places" ? (
          <div className="space-y-3">
            {locations.length ? (
              locations.map((location) => (
                <div key={location.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-sand/70">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-50 text-moss">
                    <MapPin size={17} />
                  </span>
                  <span>
                    <span className="block font-bold">{isStray || location.is_sensitive ? "模糊地点" : location.location_name}</span>
                    <span className="mt-1 block text-sm leading-6 text-stone-500">{location.seen_at ? formatDate(location.seen_at) : "未记录时间"} · {location.precision_level}</span>
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-white p-5 text-sm text-stone-500 ring-1 ring-sand/70">暂无地点记录。</div>
            )}
          </div>
        ) : null}

        {tab === "profile" ? (
          <div className="space-y-3">
            <details className="rounded-2xl bg-white p-4 ring-1 ring-sand/70" open>
              <summary className="cursor-pointer font-bold">基础信息</summary>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Info label="物种" value={speciesLabels[animal.species]} />
                <Info label="性别" value={genderLabels[animal.gender]} />
                <Info label="年龄" value={getAgeText(animal.birthday, animal.age_stage)} />
                <Info label="毛色" value={animal.color || "未记录"} />
                {!isStray ? <Info label="生日" value={formatShortDate(animal.birthday)} /> : null}
                {!isStray ? <Info label="到家日" value={formatShortDate(animal.home_date)} /> : null}
              </div>
            </details>
            <details className="rounded-2xl bg-white p-4 ring-1 ring-sand/70">
              <summary className="cursor-pointer font-bold">健康与绝育</summary>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Info label="健康" value={animal.health_status ? healthLabels[animal.health_status] : "未记录"} />
                <Info label="绝育" value={animal.neuter_status ? neuterLabels[animal.neuter_status] : "未记录"} />
              </div>
            </details>
            <details className="rounded-2xl bg-white p-4 ring-1 ring-sand/70">
              <summary className="cursor-pointer font-bold">共享权限</summary>
              <p className="mt-3 text-sm text-stone-600">{permissionLabels(animal).map((tag) => `#${tag}`).join(" ")}</p>
              {animal.ownership_status === "transferred_out" ? <p className="mt-2 text-sm leading-6 text-stone-600">{animal.transfer_note || `现在由${animal.current_keeper_label || "朋友"}记录。`}</p> : null}
              {transfers.map((transfer) => (
                <p key={transfer.id} className="mt-2 text-sm leading-6 text-stone-600">
                  已转交给{transfer.to_user_label || "朋友"} · {transfer.keep_record_permission ? "我仍可补充动态" : "我保留查看成长动态"}
                </p>
              ))}
            </details>
            <details className="rounded-2xl bg-white p-4 ring-1 ring-sand/70">
              <summary className="cursor-pointer font-bold">关系</summary>
              <div className="mt-3 space-y-3">
                {families.map((family) => (
                  <div key={family.id} className="rounded-2xl bg-cream p-3">
                    <p className="text-sm font-bold text-stone-700">{family.name}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      {family.member_animal_ids.map((id) => animalById.get(id)?.name).filter(Boolean).join("、")}
                    </p>
                  </div>
                ))}
                {relationships.length ? (
                  relationships.map((relation) => {
                    const otherId = relation.from_animal_id === animal.id ? relation.to_animal_id : relation.from_animal_id;
                    const other = animalById.get(otherId);
                    if (!other) return null;
                    return (
                      <div key={relation.id} className="flex items-center gap-3">
                        <img className="h-10 w-10 rounded-full object-cover" src={other.cover_image_url} alt={other.name} />
                        <span className="min-w-0">
                          <span className="block text-sm font-bold">{other.name}</span>
                          <span className="block text-xs text-stone-500">{relationLabel(relation.relation_type, relation.from_animal_id === animal.id)}{relation.note ? ` · ${relation.note}` : ""}</span>
                        </span>
                      </div>
                    );
                  })
                ) : families.length ? null : (
                  <p className="text-sm text-stone-500">暂未记录和其他毛孩的关系。</p>
                )}
              </div>
            </details>
            <details className="rounded-2xl bg-white p-4 ring-1 ring-sand/70">
              <summary className="cursor-pointer font-bold">最近变更</summary>
              <div className="mt-3 space-y-2">
                {logs.length ? logs.map((log) => <p key={log.id} className="text-sm text-stone-600">{logActionLabel(log.action)} · {formatDate(log.created_at)}</p>) : <p className="text-sm text-stone-500">暂无变更历史。</p>}
              </div>
            </details>
          </div>
        ) : null}

        {canPost ? (
          <button className="fixed bottom-24 right-[max(1rem,calc((100vw-28rem)/2+1rem))] z-20 grid h-12 w-12 place-items-center rounded-full bg-clay text-white shadow-soft" onClick={() => onAddRecord()} aria-label="发动态">
            <Plus size={24} />
          </button>
        ) : null}
      </div>
    </AppShell>
  );
}

function AnimalPost({ post, animal, tags, onShare }: { post: AnimalRecord; animal: Animal; tags: string[]; onShare: () => void }) {
  const images = post.images.length ? post.images : animal.cover_image_url ? [animal.cover_image_url] : [];
  return (
    <article className="overflow-hidden rounded-[20px] bg-white ring-1 ring-sand/70">
      <div className="px-4 pt-4">
        <p className="text-sm font-semibold text-stone-500">{formatDate(post.occurred_at)}</p>
        {post.location_text ? <p className="mt-0.5 text-xs text-stone-400">{animal.animal_origin === "stray" ? "模糊地点" : post.location_text}</p> : null}
      </div>
      <PostImages images={images} animalName={animal.name} />
      <div className="space-y-3 p-4">
        <p className="text-[15px] leading-6 text-stone-700">{post.content}</p>
        <div className="flex flex-wrap gap-1.5">
          <TinyTag>{recordTypeLabels[toRecordType(post.type)]}</TinyTag>
          {tags.slice(0, 4).map((tag) => <TinyTag key={tag}>{tag}</TinyTag>)}
        </div>
        <div className="flex items-center gap-5 pt-1 text-sm font-semibold text-stone-500">
          <button className="inline-flex items-center gap-1.5"><MessageCircle size={17} /> 备注</button>
          <button className="inline-flex items-center gap-1.5" onClick={onShare}><Share2 size={17} /> 分享</button>
        </div>
      </div>
    </article>
  );
}

function PostImages({ images, animalName }: { images: string[]; animalName: string }) {
  if (!images.length) return null;
  if (images.length === 1) return <img className="mt-3 aspect-[4/3] w-full object-cover" src={images[0]} alt={animalName} />;
  return (
    <div className="mt-3 grid aspect-[4/3] grid-cols-2 gap-1 bg-sand">
      {images.slice(0, 4).map((image, index) => (
        <img key={`${image}_${index}`} className="h-full w-full object-cover" src={image} alt={`${animalName} ${index + 1}`} />
      ))}
    </div>
  );
}

function TinyTag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600">#{children}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-1 font-semibold text-stone-700">{value}</p>
    </div>
  );
}

function getPermission(animal: Animal): AnimalPermission {
  if (animal.animal_source !== "shared_to_me") return "owner";
  if (animal.visibility === "shared_recordable") return "recordable";
  return "readonly";
}

function permissionLabels(animal: Animal) {
  const labels: string[] = [];
  if (animal.animal_source === "created_by_me") labels.push("我的");
  if (animal.animal_source === "shared_to_me") labels.push("分享给我的");
  if (animal.visibility === "shared_recordable") labels.push("允许我记录");
  if (animal.ownership_status === "transferred_out") labels.push("已送养");
  if (animal.ownership_status === "transferred_to_me") labels.push("转交给我的");
  return labels;
}

function firstLocationText(locations: Array<{ location_name: string; is_sensitive: boolean }>, isStray: boolean) {
  const first = locations[0];
  if (!first) return isStray ? "地点已保护" : "暂无地点";
  return isStray || first.is_sensitive ? "模糊地点" : first.location_name;
}

function toRecordType(type: AnimalRecord["type"]) {
  if (type === "adoption" || type === "shared_update") return "note";
  return type;
}

function logActionLabel(action: string) {
  const labels: Record<string, string> = {
    created_animal: "创建主页",
    updated_profile: "更新档案",
    added_photo: "发布照片",
    added_feeding_record: "发布喂养动态",
    added_health_record: "发布健康观察",
    updated_status: "更新状态",
    added_tag: "添加标签",
    removed_tag: "移除标签",
    imported_records: "导入动态",
    assigned_inbox_photo: "归档照片",
  };
  return labels[action] || "记录变更";
}

function relationLabel(type: string, outgoing: boolean) {
  const labels: Record<string, string> = {
    parent: outgoing ? "孩子" : "父母",
    child: outgoing ? "父母" : "孩子",
    sibling: "兄弟姐妹",
    mate: "伴侣",
    same_litter: "同窝",
    friend: "朋友",
    often_seen_together: "常一起出现",
    same_feeding_area: "同一喂养点",
    adopted_from: outgoing ? "送养来源" : "由它送养",
    transferred_to: outgoing ? "转交给" : "由它转交",
    unknown: "关系待确认",
  };
  return labels[type] || "相关毛孩";
}
