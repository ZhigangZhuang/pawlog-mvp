import { Archive, Database, FileInput, Images, Info, Lock, Recycle, ShieldCheck, UsersRound } from "lucide-react";
import type React from "react";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/Badge";
import type { AppState } from "../types";
import { activeAnimals } from "../utils/storage";

type ProfilePageProps = {
  state: AppState;
  onImport: () => void;
  onInbox: () => void;
  onGroups: () => void;
};

export function ProfilePage({ state, onImport, onInbox, onGroups }: ProfilePageProps) {
  const animals = activeAnimals(state);
  const sharedToMe = animals.filter((animal) => animal.animal_source === "shared_to_me").length;
  const recordable = animals.filter((animal) => animal.visibility === "shared_recordable").length;
  const transferredOut = animals.filter((animal) => animal.ownership_status === "transferred_out").length;
  const transferredToMe = animals.filter((animal) => animal.ownership_status === "transferred_to_me").length;
  const mergedCount = state.animals.filter((animal) => animal.archive_status === "merged").length;
  const unassignedPhotos = state.inboxPhotos.filter((photo) => photo.status === "unassigned").length;

  return (
    <AppShell title="我的" subtitle="数据、共享与隐私">
      <div className="space-y-5 pb-24">
        <div className="rounded-[20px] bg-white p-5 ring-1 ring-sand/70">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-orange-50 text-2xl font-black text-clay">我</div>
            <div>
              <h2 className="text-xl font-bold">本地用户</h2>
              <p className="text-sm text-stone-500">无登录 MVP，数据保存在本机</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="gray">档案默认私密</Badge>
            <Badge tone="green">位置保护开启</Badge>
            <Badge tone="orange">允许我记录 {recordable} 只</Badge>
          </div>
        </div>

        <Section title="我的数据">
          <Row icon={<Archive size={19} />} title="我的毛孩" text={`${animals.length} 只档案`} />
          <Row icon={<Database size={19} />} title="我的记录" text={`${state.feedRecords.length} 条图文记录`} />
          <button className="w-full" onClick={onInbox}>
            <Row icon={<Images size={19} />} title="待归档照片" text={`${unassignedPhotos} 张照片待整理`} />
          </button>
          <Row icon={<FileInput size={19} />} title="草稿箱" text="MVP 暂无未发布草稿" />
        </Section>

        <Section title="共享与权限">
          <Row icon={<UsersRound size={19} />} title="分享给我的" text={`${sharedToMe} 只毛孩在统一图鉴中显示`} />
          <Row icon={<UsersRound size={19} />} title="我送养/转交出去的" text={`${transferredOut} 只仍可查看成长动态`} />
          <Row icon={<UsersRound size={19} />} title="别人转交给我的" text={`${transferredToMe} 只由我继续记录`} />
          <Row icon={<ShieldCheck size={19} />} title="我分享出去的" text="公开卡片默认不含流浪动物精确位置" />
          <button className="w-full" onClick={onGroups}>
            <Row icon={<UsersRound size={19} />} title="协作圈" text="家人、朋友、小区猫友的分享范围" />
          </button>
          <button className="w-full" onClick={onImport}>
            <Row icon={<FileInput size={19} />} title="导入分享档案" text="保存为新档案或合并到已有档案" />
          </button>
        </Section>

        <Section title="工具">
          <button className="w-full" onClick={onInbox}>
            <Row icon={<Images size={19} />} title="导入照片" text="先放进待归档照片箱，再手动归档" />
          </button>
          <Row icon={<Database size={19} />} title="数据导出" text="后续支持 JSON / 相册包导出" />
          <Row icon={<Recycle size={19} />} title="回收站" text={`已合并 ${mergedCount} 个档案，不会直接删除`} />
        </Section>

        <Section title="设置">
          <Row icon={<Lock size={19} />} title="隐私设置" text="默认私密，分享前过滤敏感信息" />
          <Row icon={<ShieldCheck size={19} />} title="位置保护" text="流浪动物位置默认模糊或仅文字显示" />
          <Row icon={<Info size={19} />} title="关于 App" text="毛孩档案 MVP" />
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-bold text-stone-500">{title}</h2>
      {children}
    </section>
  );
}

function Row({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-4 text-left ring-1 ring-sand/70">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-50 text-clay">{icon}</span>
      <span className="min-w-0">
        <span className="block font-bold">{title}</span>
        <span className="text-sm text-stone-500">{text}</span>
      </span>
    </div>
  );
}
