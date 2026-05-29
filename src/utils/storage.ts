import {
  mockAnimalTags,
  mockAnimals,
  mockChangeLogs,
  mockGroupAnimals,
  mockGroupMembers,
  mockGroups,
  mockInboxPhotos,
  mockIssues,
  mockLocations,
  mockPhotos,
  mockSharedPackages,
  mockTags,
  mockTimeline,
  mockWatches,
  mockWikiPages,
} from "../data/mockData";
import type { Animal, AnimalFamily, AnimalPhoto, AnimalRecord, AnimalRelationship, AnimalTransfer, AppState, ChangeLog, FeedRecordType, PostAnimal, StrayLocation, TimelineItem } from "../types";

const STORAGE_KEY = "pawlog_app_state_v5_clean_feed";

export const createInitialState = (): AppState => buildDemoState();

export const loadState = (): AppState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialState();
  try {
    return normalizeState(JSON.parse(raw) as Partial<AppState>);
  } catch {
    return createInitialState();
  }
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export const upsertAnimalUpdatedAt = (animal: Animal): Animal => ({
  ...animal,
  updated_at: new Date().toISOString(),
});

export const sortTimeline = (items: TimelineItem[]) =>
  [...items].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

export const activeAnimals = (state: AppState) => state.animals.filter((animal) => animal.archive_status !== "merged" && animal.archive_status !== "deleted");

const normalizeState = (state: Partial<AppState>): AppState => {
  const fallback = createInitialState();
  const animals = (state.animals || fallback.animals).map((animal) => ({
    ...animal,
    aliases: animal.aliases || [],
    visibility: animal.visibility || "private",
    animal_source: animal.animal_source || "created_by_me",
    ownership_status: animal.ownership_status || (animal.animal_source === "shared_to_me" ? "shared_to_me" : "owned_by_me"),
    archive_status: animal.archive_status || "active",
  }));
  const animalById = new Map(animals.map((animal) => [animal.id, animal]));
  const locations = (state.locations || fallback.locations).map((location) => normalizeLocation(location, animalById));
  const feedRecords = (state.feedRecords || fallback.feedRecords).map(normalizeRecordAnimals);

  return {
    animals,
    postAnimals: state.postAnimals || postAnimalsFromRecords(feedRecords),
    animalRelationships: state.animalRelationships || fallback.animalRelationships,
    animalFamilies: state.animalFamilies || fallback.animalFamilies,
    animalTransfers: state.animalTransfers || fallback.animalTransfers,
    timeline: (state.timeline || fallback.timeline).map((item) => ({ ...item, source: item.source || { source_type: "self" } })),
    photos: (state.photos || fallback.photos).map((photo) => ({ ...photo, source: photo.source || { source_type: "self" } })),
    locations,
    mergeLogs: state.mergeLogs || [],
    sharedPackages: state.sharedPackages || fallback.sharedPackages,
    groups: state.groups || fallback.groups,
    groupMembers: state.groupMembers || fallback.groupMembers,
    groupAnimals: state.groupAnimals || fallback.groupAnimals,
    tags: state.tags || fallback.tags,
    animalTags: state.animalTags || fallback.animalTags,
    inboxPhotos: state.inboxPhotos || fallback.inboxPhotos,
    issues: state.issues || fallback.issues,
    changeLogs: state.changeLogs || fallback.changeLogs,
    watches: state.watches || fallback.watches,
    wikiPages: state.wikiPages || fallback.wikiPages,
    feedRecords,
  };
};

const normalizeLocation = (location: StrayLocation, animalById: Map<string, Animal>): StrayLocation => {
  const animal = animalById.get(location.animal_id);
  const animalOrigin = location.animal_origin || animal?.animal_origin || "stray";
  const isSensitive = animalOrigin === "stray" && (location.is_sensitive || location.precision_level === "exact");
  return {
    ...location,
    animal_origin: animalOrigin,
    type: location.type || (animalOrigin === "stray" ? "stray_seen" : "pet_photo_place"),
    name: location.name || location.location_name,
    precision_level: isSensitive ? "text_only" : location.precision_level || "blurred",
    is_sensitive: isSensitive,
    visibility: location.visibility || "private",
    created_by: location.created_by || "user_1",
    updated_at: location.updated_at || location.created_at,
    source: location.source || { source_type: "self" },
  };
};

export const animalIdsForRecord = (record: AnimalRecord) => {
  const ids = record.animal_ids?.length ? record.animal_ids : [record.primary_animal_id || record.animal_id];
  return Array.from(new Set(ids.filter(Boolean)));
};

export const primaryAnimalIdForRecord = (record: AnimalRecord) => record.primary_animal_id || record.animal_id || animalIdsForRecord(record)[0];

const normalizeRecordAnimals = (record: AnimalRecord): AnimalRecord => {
  const primary = record.primary_animal_id || record.animal_id;
  const animalIds = record.animal_ids?.length ? record.animal_ids : [primary];
  return {
    ...record,
    animal_id: primary,
    primary_animal_id: primary,
    animal_ids: Array.from(new Set(animalIds.filter(Boolean))),
  };
};

const postAnimalsFromRecords = (records: AnimalRecord[]): PostAnimal[] =>
  records.flatMap((record) =>
    animalIdsForRecord(record).map((animalId) => ({
      id: `pa_${record.id}_${animalId}`,
      post_id: record.id,
      animal_id: animalId,
      role_in_post: animalId === primaryAnimalIdForRecord(record) ? "main" : "appears_with",
      created_at: record.created_at,
    })),
  );

export const withChangeLog = (state: AppState, log: Omit<ChangeLog, "id" | "created_at" | "created_by"> & { created_by?: string; created_at?: string }): AppState => ({
  ...state,
  changeLogs: [
    {
      id: createId("cl"),
      created_by: log.created_by || "user_1",
      created_at: log.created_at || new Date().toISOString(),
      ...log,
    },
    ...state.changeLogs,
  ],
});

const petSeeds = [
  ["奶盖", "cat", "银渐层", "英短", "黏人，爱睡觉"],
  ["豆包", "dog", "黄白", "柯基", "活泼，贪吃"],
  ["芝麻", "cat", "黑色", "田园猫", "胆小，爱躲纸箱"],
  ["布丁", "dog", "金色", "金毛", "温顺，爱叼球"],
  ["桃子", "cat", "海豹双色", "布偶", "粘人，爱撒娇"],
  ["可乐", "dog", "黑白", "边牧", "聪明，精力旺盛"],
  ["糯米", "cat", "橘白", "田园猫", "活泼，爱追逗猫棒"],
  ["栗子", "dog", "赤色", "柴犬", "倔强，爱散步"],
] as const;

const strayCatSeeds = [
  ["小橘", "橘白", "已绝育，常在北门附近"],
  ["黑豆", "黑色", "怕人，停车场附近"],
  ["三花姨", "三花", "疑似已绝育，花坛附近"],
  ["奶牛", "黑白", "亲人，食堂后门"],
  ["灰灰", "狸花", "警惕，垃圾房附近"],
  ["短尾", "橘色", "尾巴短，操场边"],
  ["白袜", "狸花白脚", "常在便利店门口"],
  ["大脸", "橘色", "胖，已绝育"],
  ["小虎", "狸花", "未绝育"],
  ["花卷", "白橘", "亲人，可领养"],
  ["阿花", "三花", "带过幼崽"],
  ["煤球", "黑色", "夜间出现"],
  ["老白", "白色", "老年，需要观察"],
  ["小豹", "豹纹狸花", "跑得快"],
  ["胖橘", "橘色", "很亲人"],
  ["耳朵", "剪耳猫", "已绝育"],
  ["小灰", "灰色", "胆小"],
  ["点点", "白底黑点", "常在车棚附近"],
] as const;

const strayDogSeeds = [
  ["大黄", "黄色", "右后腿跛，需观察"],
  ["小黑", "黑色", "怕人"],
  ["花花", "花色", "市场附近"],
  ["旺财", "黄白", "亲人"],
  ["阿狼", "灰色", "警惕"],
  ["白脚", "黑狗白脚", "夜间出现"],
] as const;

const sharedSeeds = [
  ["团子", "cat", "分享给我的朋友家猫", "shared_readonly"],
  ["Lucky", "dog", "朋友家的狗，允许我记录", "shared_recordable"],
  ["雪球", "cat", "分享给我的邻居家猫", "shared_readonly"],
  ["包子", "cat", "家庭共享宠物，允许我记录", "shared_recordable"],
  ["小狸", "cat", "小区共享流浪猫，允许我记录", "shared_recordable"],
  ["咖啡", "dog", "分享给我的同学家狗", "shared_readonly"],
  ["七七", "cat", "分享给我的朋友家布偶", "shared_readonly"],
  ["阿福", "dog", "小区共享流浪狗，允许我记录", "shared_recordable"],
] as const;

function specialRelationshipAnimals(): Animal[] {
  const baseTime = "2026-05-20T10:00:00";
  return [
    {
      id: "family_mama",
      user_id: "user_1",
      animal_origin: "stray",
      name: "猫妈妈",
      species: "cat",
      gender: "female",
      age_stage: "adult",
      color: "三花",
      features: "亲人，会护着两只幼崽",
      personality: "温柔但警惕",
      is_friendly: true,
      neuter_status: "suspected_neutered",
      health_status: "normal",
      rescue_status: "observing",
      adoption_status: "not_available",
      danger_level: "medium",
      cover_image_url: imageFor("cat", 2),
      aliases: [],
      visibility: "private",
      animal_source: "created_by_me",
      ownership_status: "owned_by_me",
      archive_status: "active",
      created_at: baseTime,
      updated_at: "2026-05-27T18:30:00",
    },
    {
      id: "family_white_kitten",
      user_id: "user_1",
      animal_origin: "stray",
      name: "小白崽",
      species: "cat",
      gender: "unknown",
      age_stage: "baby",
      color: "白橘",
      features: "跟着猫妈妈活动",
      personality: "好奇，怕人",
      is_friendly: false,
      neuter_status: "unknown",
      health_status: "normal",
      rescue_status: "observing",
      adoption_status: "unknown",
      danger_level: "medium",
      cover_image_url: imageFor("cat", 3),
      aliases: [],
      visibility: "private",
      animal_source: "created_by_me",
      ownership_status: "owned_by_me",
      archive_status: "active",
      created_at: baseTime,
      updated_at: "2026-05-27T18:30:00",
    },
    {
      id: "family_black_kitten",
      user_id: "user_1",
      animal_origin: "stray",
      name: "小黑崽",
      species: "cat",
      gender: "unknown",
      age_stage: "baby",
      color: "黑色",
      features: "胆子最小，经常躲在猫妈妈身后",
      personality: "胆小",
      is_friendly: false,
      neuter_status: "unknown",
      health_status: "normal",
      rescue_status: "observing",
      adoption_status: "unknown",
      danger_level: "medium",
      cover_image_url: imageFor("cat", 4),
      aliases: [],
      visibility: "private",
      animal_source: "created_by_me",
      ownership_status: "owned_by_me",
      archive_status: "active",
      created_at: baseTime,
      updated_at: "2026-05-27T18:30:00",
    },
    {
      id: "kitten_zhima",
      user_id: "user_friend_a",
      animal_origin: "owned_pet",
      name: "芝麻崽",
      species: "cat",
      breed: "田园猫",
      gender: "female",
      birthday: "2026-04-28",
      home_date: "2026-05-20",
      color: "黑色",
      personality: "到了新家后慢慢敢出来探索",
      is_friendly: true,
      neuter_status: "unknown",
      health_status: "normal",
      cover_image_url: imageFor("cat", 0),
      aliases: ["芝麻"],
      visibility: "shared_readonly",
      animal_source: "shared_to_me",
      ownership_status: "transferred_out",
      current_keeper_label: "朋友 A",
      transfer_note: "现在住在朋友 A 家，我保留查看成长动态。",
      archive_status: "active",
      created_at: "2026-04-28T09:00:00",
      updated_at: "2026-05-27T16:00:00",
    },
    {
      id: "kitten_huajuan",
      user_id: "user_friend_b",
      animal_origin: "owned_pet",
      name: "花卷崽",
      species: "cat",
      breed: "田园猫",
      gender: "male",
      birthday: "2026-04-28",
      home_date: "2026-05-21",
      color: "白橘",
      personality: "很亲人，爱踩奶",
      is_friendly: true,
      neuter_status: "unknown",
      health_status: "normal",
      cover_image_url: imageFor("cat", 1),
      aliases: ["花卷"],
      visibility: "shared_recordable",
      animal_source: "shared_to_me",
      ownership_status: "transferred_out",
      current_keeper_label: "朋友 B",
      transfer_note: "现在住在朋友 B 家，对方允许我继续补充旧照片。",
      archive_status: "active",
      created_at: "2026-04-28T09:00:00",
      updated_at: "2026-05-27T16:30:00",
    },
  ];
}

const catImages = [
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?auto=format&fit=crop&w=900&q=80",
];

const dogImages = [
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
];

const buildDemoState = (): AppState => {
  const now = new Date("2026-05-27T20:00:00");
  const animals: Animal[] = [
    ...petSeeds.map(([name, species, color, breed, personality], index) =>
      animalOf({
        id: `pet_${index + 1}`,
        name,
        species,
        color,
        breed,
        personality,
        origin: "owned_pet",
        image: imageFor(species, index),
        index,
      }),
    ),
    ...strayCatSeeds.map(([name, color, features], index) =>
      animalOf({
        id: `stray_cat_${index + 1}`,
        name,
        species: "cat",
        color,
        features,
        origin: "stray",
        image: imageFor("cat", index + 1),
        index,
      }),
    ),
    ...strayDogSeeds.map(([name, color, features], index) =>
      animalOf({
        id: `stray_dog_${index + 1}`,
        name,
        species: "dog",
        color,
        features,
        origin: "stray",
        image: imageFor("dog", index + 1),
        index,
      }),
    ),
    ...sharedSeeds.map(([name, species, personality, visibility], index) =>
      animalOf({
        id: `shared_${index + 1}`,
        name,
        species,
        color: species === "cat" ? "共享猫咪" : "共享狗狗",
        personality,
        origin: species === "cat" && name === "小狸" ? "stray" : "owned_pet",
        image: imageFor(species, index + 2),
        visibility: visibility as Animal["visibility"],
        source: "shared_to_me",
        index,
      }),
    ),
    ...specialRelationshipAnimals(),
  ];

  const feedRecords = makeFeedRecords(animals, now);
  const photos: AnimalPhoto[] = [
    ...animals.map((animal) => ({
      id: `photo_cover_${animal.id}`,
      animal_id: animal.id,
      image_url: animal.cover_image_url || "",
      taken_at: animal.updated_at,
      note: "封面照片",
      is_cover: true,
      created_at: animal.updated_at,
      source: { source_type: animal.animal_source === "shared_to_me" ? "shared_link" : "self" } as const,
    })),
    ...feedRecords.flatMap((record) =>
      animalIdsForRecord(record).flatMap((animalId) =>
        record.images.map((image, index) => ({
          id: `photo_${record.id}_${animalId}_${index}`,
          animal_id: animalId,
          image_url: image,
          taken_at: record.occurred_at,
          note: record.content,
          created_at: record.created_at,
          source: { source_type: record.source === "me" ? "self" : "shared_link" } as const,
        })),
      ),
    ),
  ];

  const timeline: TimelineItem[] = feedRecords.flatMap((record) =>
    animalIdsForRecord(record).map((animalId) => ({
      id: `tl_${record.id}_${animalId}`,
      animal_id: animalId,
      type: record.type === "shared_update" || record.type === "adoption" ? "note" : record.type,
      title: recordTitle(record.type),
      description: record.content,
      image_url: record.images[0],
      occurred_at: record.occurred_at,
      created_at: record.created_at,
      source: { source_type: record.source === "me" ? "self" : "shared_link" },
    })),
  );

  const locations: StrayLocation[] = feedRecords
    .filter((record) => record.location_text)
    .slice(0, 36)
    .map((record, index) => {
      const animal = animals.find((item) => item.id === primaryAnimalIdForRecord(record))!;
      return {
        id: `loc_demo_${index}`,
        animal_id: animal.id,
        animal_origin: animal.animal_origin,
        type: animal.animal_origin === "stray" ? "stray_seen" : "pet_photo_place",
        location_name: record.location_text || "未命名地点",
        name: record.location_text,
        latitude: animal.animal_origin === "stray" ? undefined : 31.22 + index * 0.001,
        longitude: animal.animal_origin === "stray" ? undefined : 121.47 + index * 0.001,
        precision_level: animal.animal_origin === "stray" ? "text_only" : "blurred",
        address_text: animal.animal_origin === "stray" ? "流浪动物位置已模糊" : record.location_text,
        is_sensitive: animal.animal_origin === "stray" && index % 4 === 0,
        visibility: "private",
        seen_at: record.occurred_at,
        created_by: record.source === "me" ? "user_1" : "shared_user",
        created_at: record.created_at,
        updated_at: record.created_at,
        source: { source_type: record.source === "me" ? "self" : "shared_link" },
      };
    });

  return {
    animals,
    postAnimals: postAnimalsFromRecords(feedRecords),
    animalRelationships: makeAnimalRelationships(),
    animalFamilies: makeAnimalFamilies(),
    animalTransfers: makeAnimalTransfers(),
    timeline,
    photos,
    locations,
    mergeLogs: [],
    sharedPackages: mockSharedPackages,
    groups: mockGroups,
    groupMembers: mockGroupMembers,
    groupAnimals: mockGroupAnimals,
    tags: mockTags,
    animalTags: makeAnimalTags(animals),
    inboxPhotos: mockInboxPhotos,
    issues: mockIssues,
    changeLogs: mockChangeLogs,
    watches: makeWatches(animals),
    wikiPages: mockWikiPages,
    feedRecords,
  };
};

function animalOf({
  id,
  name,
  species,
  color,
  breed,
  personality,
  features,
  origin,
  image,
  visibility = "private",
  source = "created_by_me",
  index,
}: {
  id: string;
  name: string;
  species: "cat" | "dog";
  color: string;
  breed?: string;
  personality?: string;
  features?: string;
  origin: "owned_pet" | "stray";
  image: string;
  visibility?: Animal["visibility"];
  source?: Animal["animal_source"];
  index: number;
}): Animal {
  const created = `2026-05-${String(1 + (index % 24)).padStart(2, "0")}T10:00:00`;
  return {
    id,
    user_id: source === "created_by_me" ? "user_1" : `user_shared_${index}`,
    animal_origin: origin,
    name,
    species,
    breed,
    gender: index % 3 === 0 ? "female" : index % 3 === 1 ? "male" : "unknown",
    birthday: origin === "owned_pet" ? `202${index % 5}-0${(index % 8) + 1}-12` : undefined,
    home_date: origin === "owned_pet" ? `202${index % 5}-0${(index % 8) + 1}-20` : undefined,
    age_stage: origin === "stray" ? (index % 6 === 0 ? "senior" : index % 5 === 0 ? "young" : "adult") : undefined,
    color,
    features,
    personality,
    is_friendly: index % 4 !== 1,
    neuter_status: origin === "stray" ? (index % 3 === 0 ? "confirmed_neutered" : index % 3 === 1 ? "not_neutered" : "unknown") : index % 2 ? "not_neutered" : "confirmed_neutered",
    health_status: index % 13 === 0 ? "watching" : index % 17 === 0 ? "suspected_injured" : "normal",
    rescue_status: origin === "stray" ? (index % 7 === 0 ? "needs_help" : index % 5 === 0 ? "observing" : "none") : undefined,
    adoption_status: origin === "stray" && index % 9 === 0 ? "available" : origin === "stray" ? "not_available" : undefined,
    danger_level: origin === "stray" && index % 7 === 0 ? "high" : "low",
    cover_image_url: image,
    aliases: [],
    visibility,
    animal_source: source,
    archive_status: "active",
    created_at: created,
    updated_at: "2026-05-27T10:00:00",
  };
}

function makeFeedRecords(animals: Animal[], now: Date): AnimalRecord[] {
  const contents = [
    "今天状态很好，拍到一张很清楚的正脸。",
    "吃了正常分量，精神不错。",
    "在熟悉的位置出现，远远看了一眼就躲起来了。",
    "晒太阳睡了一下午，像一块融化的年糕。",
    "今天有点警惕，只记录了远景照片。",
    "健康看起来正常，毛色比上次亮了一点。",
    "分享给我的新动态，状态稳定。",
    "今天又见到了，图鉴记录 +1。",
  ];
  const places = ["家里", "北门附近", "河边公园", "食堂后门", "停车场", "花坛附近", "便利店门口", "小区东门"];
  const byId = new Map(animals.map((animal) => [animal.id, animal]));
  const scenarioRecords: AnimalRecord[] = [
    multiRecord({
      id: "feed_family_park",
      primaryAnimalId: "family_mama",
      animalIds: ["family_mama", "family_white_kitten", "family_black_kitten"],
      animals: byId,
      type: "family",
      content: "今天在公园草地看到猫猫一家三口，猫妈妈一直护着两只小猫，两个小家伙精神都不错。",
      occurredAt: "2026-05-27T18:30:00",
      locationText: "公园草地附近",
      tagIds: ["tag_group_watch", "tag_group_private"],
      images: [imageFor("cat", 2), imageFor("cat", 3)],
    }),
    multiRecord({
      id: "feed_naigai_kittens",
      primaryAnimalId: "pet_1",
      animalIds: ["pet_1", "pet_7", "kitten_zhima", "kitten_huajuan"],
      animals: byId,
      type: "family",
      content: "奶盖今天终于生了三只小猫，糯米、芝麻崽和花卷崽都很精神，先一起收进家庭记录里。",
      occurredAt: "2026-05-26T10:20:00",
      locationText: "家里",
      tagIds: ["tag_personal_fav"],
      images: [imageFor("cat", 0), imageFor("cat", 1)],
    }),
    multiRecord({
      id: "feed_zhima_new_home",
      primaryAnimalId: "kitten_zhima",
      animalIds: ["kitten_zhima", "pet_1"],
      animals: byId,
      type: "adoption",
      content: "芝麻崽到新家第一天，已经敢从航空箱里出来探索了。朋友发来了照片，我还能继续看到它长大。",
      occurredAt: "2026-05-27T16:00:00",
      locationText: "朋友 A 家",
      tagIds: ["tag_personal_fav"],
      images: [imageFor("cat", 4)],
      source: "shared_user",
      visibility: "shared",
    }),
    multiRecord({
      id: "feed_doubao_lucky",
      primaryAnimalId: "pet_2",
      animalIds: ["pet_2", "shared_2"],
      animals: byId,
      type: "photo",
      content: "今天豆包和 Lucky 一起在公园跑了半小时，两个都累趴了。",
      occurredAt: "2026-05-27T17:10:00",
      locationText: "河边公园",
      tagIds: ["tag_personal_fav"],
      images: [imageFor("dog", 0), imageFor("dog", 1)],
    }),
  ];

  const regularRecords = Array.from({ length: 128 }, (_, index) => {
    const animal = animals[index % animals.length];
    const date = new Date(now.getTime() - index * 1000 * 60 * 60 * 5);
    const image = imageFor(animal.species, index);
    const type = (["photo", "feeding", "health", "location", "note", "weight", "anniversary", "shared_update"] as const)[index % 8];
    const source: AnimalRecord["source"] = animal.animal_source === "shared_to_me" ? "shared_user" : "me";
    const tags = tagsForAnimal(animal);
    const visibility: AnimalRecord["visibility"] = animal.visibility === "public_card" ? "public_card" : animal.visibility === "private" ? "private" : "shared";
    return {
      id: `feed_${index + 1}`,
      animal_id: animal.id,
      primary_animal_id: animal.id,
      animal_ids: [animal.id],
      type,
      images: index % 6 === 0 ? [image, imageFor(animal.species, index + 1)] : [image],
      content: contents[index % contents.length],
      occurred_at: date.toISOString(),
      location_text: places[index % places.length],
      location_privacy: animal.animal_origin === "stray" ? ("blurred" as const) : ("exact_private" as const),
      tag_ids: tags,
      created_by: source === "me" ? "user_1" : "shared_user",
      source,
      visibility,
      created_at: date.toISOString(),
    };
  });

  return [...scenarioRecords, ...regularRecords];
}

function multiRecord({
  id,
  primaryAnimalId,
  animalIds,
  animals,
  type,
  content,
  occurredAt,
  locationText,
  tagIds,
  images,
  source = "me",
  visibility,
}: {
  id: string;
  primaryAnimalId: string;
  animalIds: string[];
  animals: Map<string, Animal>;
  type: FeedRecordType | "family";
  content: string;
  occurredAt: string;
  locationText: string;
  tagIds: string[];
  images: string[];
  source?: AnimalRecord["source"];
  visibility?: AnimalRecord["visibility"];
}): AnimalRecord {
  const containsStray = animalIds.some((animalId) => animals.get(animalId)?.animal_origin === "stray");
  return {
    id,
    animal_id: primaryAnimalId,
    primary_animal_id: primaryAnimalId,
    animal_ids: Array.from(new Set(animalIds)),
    type: type === "family" ? "note" : type,
    images,
    content,
    occurred_at: occurredAt,
    location_text: locationText,
    location_privacy: containsStray ? "blurred" : "exact_private",
    tag_ids: tagIds,
    created_by: source === "me" ? "user_1" : "shared_user",
    source,
    visibility: visibility || "private",
    created_at: occurredAt,
  };
}

function makeAnimalTags(animals: Animal[]) {
  return animals.flatMap((animal, index) => {
    const ids = tagsForAnimal(animal);
    return ids.map((tagId) => ({
      id: `at_demo_${animal.id}_${tagId}`,
      animal_id: animal.id,
      tag_id: tagId,
      added_by: index % 5 === 0 ? "shared_user" : "user_1",
      created_at: "2026-05-27T10:00:00",
    }));
  });
}

function makeWatches(animals: Animal[]) {
  return animals
    .filter((_, index) => index % 6 === 0)
    .map((animal, index) => ({
      id: `watch_demo_${animal.id}`,
      user_id: "user_1",
      animal_id: animal.id,
      level: index % 2 === 0 ? ("important_only" as const) : ("all_updates" as const),
      created_at: "2026-05-27T10:00:00",
    }));
}

function makeAnimalRelationships(): AnimalRelationship[] {
  const now = "2026-05-27T18:30:00";
  return [
    relationship("rel_mama_white", "family_mama", "family_white_kitten", "parent", "猫妈妈的孩子", now),
    relationship("rel_mama_black", "family_mama", "family_black_kitten", "parent", "猫妈妈的孩子", now),
    relationship("rel_white_black", "family_white_kitten", "family_black_kitten", "same_litter", "同窝小猫", now),
    relationship("rel_naigai_nuomi", "pet_1", "pet_7", "parent", "奶盖的孩子，留在家里", "2026-05-26T10:20:00"),
    relationship("rel_naigai_zhima", "pet_1", "kitten_zhima", "parent", "奶盖的孩子，已送养给朋友 A", "2026-05-26T10:20:00"),
    relationship("rel_naigai_huajuan", "pet_1", "kitten_huajuan", "parent", "奶盖的孩子，已送养给朋友 B", "2026-05-26T10:20:00"),
    relationship("rel_nuomi_zhima", "pet_7", "kitten_zhima", "same_litter", "同窝兄妹", "2026-05-26T10:20:00"),
    relationship("rel_nuomi_huajuan", "pet_7", "kitten_huajuan", "same_litter", "同窝兄妹", "2026-05-26T10:20:00"),
    relationship("rel_zhima_huajuan", "kitten_zhima", "kitten_huajuan", "same_litter", "同窝兄妹", "2026-05-26T10:20:00"),
    relationship("rel_doubao_lucky", "pet_2", "shared_2", "friend", "经常一起在公园散步", "2026-05-27T17:10:00"),
  ];
}

function relationship(id: string, from: string, to: string, relation: AnimalRelationship["relation_type"], note: string, createdAt: string): AnimalRelationship {
  return {
    id,
    from_animal_id: from,
    to_animal_id: to,
    relation_type: relation,
    note,
    created_by: "user_1",
    created_at: createdAt,
  };
}

function makeAnimalFamilies(): AnimalFamily[] {
  return [
    {
      id: "family_park_cats",
      name: "公园猫猫一家三口",
      description: "猫妈妈和两只幼崽，经常在公园草地附近出现。",
      member_animal_ids: ["family_mama", "family_white_kitten", "family_black_kitten"],
      type: "family",
      created_by: "user_1",
      created_at: "2026-05-27T18:30:00",
    },
    {
      id: "family_naigai_kittens",
      name: "奶盖的小猫们",
      description: "奶盖和三只小猫，送养后仍然保留成长记录。",
      member_animal_ids: ["pet_1", "pet_7", "kitten_zhima", "kitten_huajuan"],
      type: "litter",
      created_by: "user_1",
      created_at: "2026-05-26T10:20:00",
    },
  ];
}

function makeAnimalTransfers(): AnimalTransfer[] {
  return [
    {
      id: "transfer_zhima",
      animal_id: "kitten_zhima",
      from_user_id: "user_1",
      to_user_id: "user_friend_a",
      to_user_label: "朋友 A",
      transfer_type: "adoption",
      keep_view_permission: true,
      keep_record_permission: false,
      note: "芝麻崽已送养给朋友 A，我保留查看成长动态。",
      created_at: "2026-05-20T12:00:00",
    },
    {
      id: "transfer_huajuan",
      animal_id: "kitten_huajuan",
      from_user_id: "user_1",
      to_user_id: "user_friend_b",
      to_user_label: "朋友 B",
      transfer_type: "adoption",
      keep_view_permission: true,
      keep_record_permission: true,
      note: "花卷崽已送养给朋友 B，对方允许我继续补充动态。",
      created_at: "2026-05-21T12:00:00",
    },
  ];
}

function tagsForAnimal(animal: Animal) {
  const tags = [];
  if (animal.animal_origin === "owned_pet") tags.push("tag_personal_fav");
  if (animal.neuter_status === "confirmed_neutered") tags.push("tag_group_done");
  if (animal.neuter_status === "not_neutered") tags.push("tag_group_tnr");
  if (animal.rescue_status === "needs_help") tags.push("tag_group_help");
  if (animal.health_status && animal.health_status !== "normal") tags.push("tag_group_watch");
  if (animal.animal_origin === "stray") tags.push("tag_group_private");
  return tags.length ? tags : ["tag_personal_fav"];
}

function imageFor(species: string, index: number) {
  const list = species === "dog" ? dogImages : catImages;
  return list[index % list.length];
}

function recordTitle(type: AnimalRecord["type"]) {
  const titles: Record<AnimalRecord["type"], string> = {
    photo: "添加照片",
    note: "记录日常",
    feeding: "喂养记录",
    health: "健康观察",
    location: "出现记录",
    weight: "体重记录",
    anniversary: "纪念日",
    adoption: "领养动态",
    shared_update: "分享动态",
  };
  return titles[type];
}
