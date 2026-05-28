import type { AnimalOrigin, Gender, HealthStatus, LocationType, NeuterStatus, RecordType, RescueStatus, Species } from "../types";

export const speciesLabels: Record<Species, string> = {
  cat: "猫",
  dog: "狗",
  other: "其他",
};

export const genderLabels: Record<Gender, string> = {
  unknown: "未知",
  male: "公",
  female: "母",
};

export const originLabels: Record<AnimalOrigin, string> = {
  owned_pet: "自家宠物",
  stray: "流浪动物",
};

export const healthLabels: Record<HealthStatus, string> = {
  normal: "健康正常",
  watching: "需要观察",
  suspected_injured: "疑似受伤",
  injured: "受伤",
  sick: "生病",
  suspected_pregnant: "疑似怀孕",
  urgent: "紧急",
};

export const neuterLabels: Record<NeuterStatus, string> = {
  unknown: "绝育未知",
  not_neutered: "未绝育",
  suspected_neutered: "疑似已绝育",
  scheduled: "已预约 TNR",
  captured: "已捕获",
  in_surgery: "手术中",
  recovering: "恢复中",
  returned: "已放归",
  confirmed_neutered: "已绝育",
};

export const rescueLabels: Record<RescueStatus, string> = {
  none: "无需救助",
  observing: "观察中",
  needs_help: "需要救助",
  contacted_rescue: "已联系救助",
  temporary_home: "临时安置",
  hospital: "医院中",
  recovering: "恢复中",
  released: "已放归",
  adopted: "已领养",
  missing: "失踪",
  deceased: "已离世",
};

export const recordTypeLabels: Record<RecordType, string> = {
  photo: "照片",
  feeding: "喂养",
  health: "健康",
  weight: "体重",
  medical: "疫苗/驱虫",
  anniversary: "纪念日",
  location: "出没",
  neuter_status: "绝育/TNR",
  rescue_status: "救助进度",
  note: "备注",
};

export const locationTypeLabels: Record<LocationType, string> = {
  pet_photo_place: "拍照地点",
  walk_place: "遛狗地点",
  vet: "宠物医院",
  pet_store: "宠物店",
  park: "公园",
  stray_seen: "出没区域",
  feeding_spot: "喂食点",
  danger_zone: "危险区域",
  rescue_place: "救助地点",
  release_place: "放归地点",
  temporary_home: "临时安置",
};

export const formatDate = (value?: string) => {
  if (!value) return "未记录";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const formatShortDate = (value?: string) => {
  if (!value) return "未记录";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
};

export const getAgeText = (birthday?: string, ageStage?: string) => {
  if (!birthday) {
    const ageStageLabels: Record<string, string> = {
      unknown: "年龄未知",
      baby: "幼崽",
      young: "青年",
      adult: "成年",
      senior: "老年",
    };
    return ageStage ? ageStageLabels[ageStage] : "年龄未记录";
  }
  const birth = new Date(birthday);
  const now = new Date("2026-05-27T12:00:00");
  const months = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth());
  if (months < 12) return `${months} 个月`;
  return `${Math.floor(months / 12)} 岁 ${months % 12} 个月`;
};
