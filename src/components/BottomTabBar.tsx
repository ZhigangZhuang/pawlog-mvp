import { BookOpen, Home, Map, Plus, UserRound } from "lucide-react";
import type React from "react";
import type { BottomTab } from "../types";

const tabs: Array<{ id: BottomTab; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: "home", label: "首页", icon: Home },
  { id: "catalog", label: "图鉴", icon: BookOpen },
  { id: "add", label: "添加", icon: Plus },
  { id: "map", label: "地图", icon: Map },
  { id: "profile", label: "我的", icon: UserRound },
];

export function BottomTabBar({ activeTab, onTabChange, onAdd }: { activeTab: BottomTab; onTabChange: (tab: BottomTab) => void; onAdd: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-sand/80 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(73,56,40,0.08)] backdrop-blur">
      <div className="grid grid-cols-5 items-end gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isAdd = tab.id === "add";
          const active = activeTab === tab.id;
          return (
	            <button
	              key={tab.id}
	              aria-label={isAdd ? "打开添加菜单" : tab.label}
	              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-xs font-semibold ${
                active ? "text-clay" : "text-stone-500"
              } ${isAdd ? "-mt-7" : ""}`}
              onClick={() => (isAdd ? onAdd() : onTabChange(tab.id))}
            >
              <span
                className={`grid place-items-center ${
                  isAdd
                    ? "h-14 w-14 rounded-full bg-clay text-white shadow-soft ring-4 ring-cream"
                    : `h-8 w-8 rounded-full ${active ? "bg-orange-50" : "bg-transparent"}`
                }`}
              >
                <Icon size={isAdd ? 26 : 20} />
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
