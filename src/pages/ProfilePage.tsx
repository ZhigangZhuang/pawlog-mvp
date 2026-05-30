import {
  Archive,
  Database,
  Info,
  Lock,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type React from "react";
import { AppShell } from "../components/AppShell";
import type { AppState } from "../types";
import { activeAnimals } from "../utils/storage";

type ProfilePageProps = {
  state: AppState;
};

export function ProfilePage({ state }: ProfilePageProps) {
  const animals = activeAnimals(state);
  const strayCount = animals.filter((a) => a.animal_origin === "stray").length;
  const sharedToMe = animals.filter(
    (a) => a.animal_source === "shared_to_me",
  ).length;
  const recordable = animals.filter(
    (a) => a.visibility === "shared_recordable",
  ).length;
  const transferredOut = animals.filter(
    (a) => a.ownership_status === "transferred_out",
  ).length;

  return (
    <AppShell title="我的" subtitle="数据、共享与隐私">
      <div className="space-y-5 pb-24">
        {/* Profile card */}
        <div className="rounded-[20px] bg-white p-5 ring-1 ring-sand/70">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-orange-50 text-xl font-black text-clay">
              我
            </div>
            <div>
              <h2 className="text-lg font-bold">本地用户</h2>
              <p className="text-sm text-stone-500">
                无登录 MVP，数据保存在本机
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-stone-500">
            已记录 {strayCount} 只流浪毛孩 · {state.feedRecords.length} 条动态
          </p>
        </div>

        <Section title="我的数据">
          <Row
            icon={<Archive size={18} />}
            title="我的毛孩"
            text={`${animals.length} 只档案`}
          />
          <Row
            icon={<Database size={18} />}
            title="我的动态"
            text={`${state.feedRecords.length} 条图文记录`}
          />
        </Section>

        <Section title="共享与权限">
          <Row
            icon={<UsersRound size={18} />}
            title="分享给我的"
            text={`${sharedToMe} 只毛孩`}
          />
          <Row
            icon={<UsersRound size={18} />}
            title="允许我记录的"
            text={`${recordable} 只毛孩`}
          />
          <Row
            icon={<UsersRound size={18} />}
            title="我送养/转交的"
            text={`${transferredOut} 只，仍可查看成长`}
          />
        </Section>

        <Section title="设置">
          <Row
            icon={<Lock size={18} />}
            title="隐私与位置保护"
            text="流浪动物位置默认模糊，分享前过滤敏感信息"
          />
          <Row
            icon={<ShieldCheck size={18} />}
            title="档案默认私密"
            text="不公开，不推荐给陌生人"
          />
          <Row icon={<Info size={18} />} title="关于" text="毛孩档案 MVP" />
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-bold text-stone-500">{title}</h2>
      {children}
    </section>
  );
}

function Row({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-3.5 text-left ring-1 ring-sand/70">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-50 text-clay">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{title}</span>
        <span className="text-xs text-stone-500">{text}</span>
      </span>
    </div>
  );
}
