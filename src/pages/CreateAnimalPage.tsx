import { Camera, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import type { Animal, AnimalOrigin, AppState, Gender, HealthStatus, NeuterStatus, Species } from "../types";
import { createId } from "../utils/storage";

type CreateAnimalPageProps = {
  onBack: () => void;
  onSave: (state: AppState) => void;
  state: AppState;
};

const nowIso = () => new Date().toISOString();

export function CreateAnimalPage({ onBack, onSave, state }: CreateAnimalPageProps) {
  const [origin, setOrigin] = useState<AnimalOrigin>("owned_pet");
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("cat");
  const [gender, setGender] = useState<Gender>("unknown");
  const [breed, setBreed] = useState("");
  const [birthday, setBirthday] = useState("");
  const [homeDate, setHomeDate] = useState("");
  const [ageStage, setAgeStage] = useState<Animal["age_stage"]>("unknown");
  const [color, setColor] = useState("");
  const [features, setFeatures] = useState("");
  const [personality, setPersonality] = useState("");
  const [isFriendly, setIsFriendly] = useState(true);
  const [neuterStatus, setNeuterStatus] = useState<NeuterStatus>("unknown");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("normal");
  const [locationName, setLocationName] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const save = () => {
    if (!name.trim()) return;
    const id = createId("animal");
    const createdAt = nowIso();
    const animal: Animal = {
      id,
      user_id: "user_1",
      animal_origin: origin,
      name: name.trim(),
      species,
      breed: origin === "owned_pet" ? breed || undefined : undefined,
      gender,
      birthday: origin === "owned_pet" ? birthday || undefined : undefined,
      home_date: origin === "owned_pet" ? homeDate || undefined : undefined,
      age_stage: origin === "stray" ? ageStage : undefined,
      color: color || undefined,
      features: origin === "stray" ? features || undefined : undefined,
      personality: personality || undefined,
      is_friendly: isFriendly,
      neuter_status: neuterStatus,
      health_status: healthStatus,
      rescue_status: origin === "stray" ? "observing" : undefined,
      adoption_status: origin === "stray" ? "unknown" : undefined,
      danger_level: origin === "stray" ? "low" : undefined,
      aliases: [],
      visibility: "private",
      animal_source: "created_by_me",
      archive_status: "active",
      cover_image_url:
        coverImage ||
        (species === "dog"
          ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80"
          : "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=900&q=80"),
      created_at: createdAt,
      updated_at: createdAt,
    };

    const nextState: AppState = {
      ...state,
      animals: [animal, ...state.animals],
      feedRecords: [
        {
          id: createId("feed"),
          animal_id: id,
          type: "note",
          images: animal.cover_image_url ? [animal.cover_image_url] : [],
          content: origin === "stray" ? `今日加新：${animal.name}，这只毛孩已经加入私密图鉴。` : `${animal.name} 的成长记录开始啦。`,
          occurred_at: createdAt,
          location_text: origin === "stray" && locationName ? locationName : undefined,
          location_privacy: origin === "stray" ? "blurred" : "none",
          tag_ids: [],
          created_by: "user_1",
          source: "me",
          visibility: "private",
          created_at: createdAt,
        },
        ...state.feedRecords,
      ],
      timeline: [
        {
          id: createId("tl"),
          animal_id: id,
          type: "note",
          title: "创建档案",
          description: origin === "stray" ? "地点默认仅自己可见，分享时自动过滤敏感信息" : "开始记录成长、健康和纪念日",
          source: { source_type: "self" },
          occurred_at: createdAt,
          created_at: createdAt,
        },
        ...state.timeline,
      ],
      photos: animal.cover_image_url
        ? [
            {
              id: createId("photo"),
              animal_id: id,
              image_url: animal.cover_image_url,
              taken_at: createdAt,
              note: "封面照片",
              is_cover: true,
              source: { source_type: "self" },
              created_at: createdAt,
            },
            ...state.photos,
          ]
        : state.photos,
      locations:
        origin === "stray" && locationName
          ? [
              {
                id: createId("loc"),
                animal_id: id,
                animal_origin: origin,
                type: origin === "stray" ? "stray_seen" : "pet_photo_place",
                location_name: locationName,
                name: locationName,
                precision_level: "text_only",
                address_text: locationName,
                is_sensitive: true,
                visibility: "private",
                created_by: "user_1",
                source: { source_type: "self" },
                seen_at: createdAt,
                created_at: createdAt,
                updated_at: createdAt,
              },
              ...state.locations,
            ]
          : state.locations,
    };
    onSave(nextState);
  };

  return (
    <AppShell title="新建档案" subtitle="先区分自家宠物或流浪动物" canGoBack onBack={onBack}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`rounded-lg border p-4 text-left ${origin === "owned_pet" ? "border-clay bg-orange-50 text-clay" : "border-sand bg-white"}`}
            onClick={() => setOrigin("owned_pet")}
          >
            <p className="font-bold">自家宠物</p>
            <p className="mt-1 text-sm text-stone-500">成长、健康、纪念日</p>
          </button>
          <button
            className={`rounded-lg border p-4 text-left ${origin === "stray" ? "border-moss bg-green-50 text-moss" : "border-sand bg-white"}`}
            onClick={() => setOrigin("stray")}
          >
            <p className="font-bold">流浪动物</p>
            <p className="mt-1 text-sm text-stone-500">出没、喂养、救助</p>
          </button>
        </div>

        {origin === "stray" ? (
          <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
            <ShieldCheck className="mt-0.5 shrink-0" size={18} />
            <p>为保护动物安全，地点默认仅自己可见，分享时不会包含精确位置。</p>
          </div>
        ) : null}

        <div className="rounded-lg bg-white p-4 ring-1 ring-sand/70">
          <label className="mb-2 block text-sm font-semibold">封面照片 URL，可留空</label>
          <div className="flex gap-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-sand text-stone-500">
              <Camera size={22} />
            </div>
            <input
              className="min-w-0 flex-1 rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-clay"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
              placeholder="粘贴图片地址或使用默认图"
            />
          </div>
        </div>

        <FormGrid>
          <Field label={origin === "owned_pet" ? "名字" : "昵称"}>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：奶盖" />
          </Field>
          <Field label="物种">
            <select value={species} onChange={(event) => setSpecies(event.target.value as Species)}>
              <option value="cat">猫</option>
              <option value="dog">狗</option>
              <option value="other">其他</option>
            </select>
          </Field>
          <Field label="性别">
            <select value={gender} onChange={(event) => setGender(event.target.value as Gender)}>
              <option value="unknown">未知</option>
              <option value="male">公</option>
              <option value="female">母</option>
            </select>
          </Field>
          {origin === "owned_pet" ? (
            <>
              <Field label="品种，可选">
                <input value={breed} onChange={(event) => setBreed(event.target.value)} placeholder="例如：英短" />
              </Field>
              <Field label="生日，可选">
                <input type="date" value={birthday} onChange={(event) => setBirthday(event.target.value)} />
              </Field>
              <Field label="到家日期，可选">
                <input type="date" value={homeDate} onChange={(event) => setHomeDate(event.target.value)} />
              </Field>
            </>
          ) : (
            <>
              <Field label="年龄阶段">
                <select value={ageStage} onChange={(event) => setAgeStage(event.target.value as Animal["age_stage"])}>
                  <option value="unknown">未知</option>
                  <option value="baby">幼崽</option>
                  <option value="young">青年</option>
                  <option value="adult">成年</option>
                  <option value="senior">老年</option>
                </select>
              </Field>
              <Field label="明显特征">
                <input value={features} onChange={(event) => setFeatures(event.target.value)} placeholder="剪耳、尾巴、伤痕等" />
              </Field>
              <Field label="初次发现地点，可选">
                <input value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="例如：东门附近" />
              </Field>
            </>
          )}
          <Field label="毛色">
            <input value={color} onChange={(event) => setColor(event.target.value)} placeholder="例如：橘白" />
          </Field>
          <Field label="性格">
            <input value={personality} onChange={(event) => setPersonality(event.target.value)} placeholder="例如：亲人但胆小" />
          </Field>
          <Field label="是否亲人">
            <select value={String(isFriendly)} onChange={(event) => setIsFriendly(event.target.value === "true")}>
              <option value="true">亲人</option>
              <option value="false">怕人</option>
            </select>
          </Field>
          <Field label="绝育状态">
            <select value={neuterStatus} onChange={(event) => setNeuterStatus(event.target.value as NeuterStatus)}>
              <option value="unknown">未知</option>
              <option value="not_neutered">未绝育</option>
              <option value="confirmed_neutered">已绝育</option>
              <option value="scheduled">已预约 TNR</option>
            </select>
          </Field>
          <Field label="健康状态">
            <select value={healthStatus} onChange={(event) => setHealthStatus(event.target.value as HealthStatus)}>
              <option value="normal">正常</option>
              <option value="watching">需要观察</option>
              <option value="suspected_injured">疑似受伤</option>
              <option value="sick">生病</option>
              <option value="urgent">紧急</option>
            </select>
          </Field>
        </FormGrid>

        <button
          className="w-full rounded-full bg-clay px-5 py-3 font-bold text-white disabled:bg-stone-300"
          disabled={!name.trim()}
          onClick={save}
        >
          保存档案
        </button>
      </div>
    </AppShell>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 rounded-lg bg-white p-4 ring-1 ring-sand/70">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <div className="[&>input]:w-full [&>input]:rounded-lg [&>input]:border [&>input]:border-sand [&>input]:px-3 [&>input]:py-2 [&>input]:outline-none [&>input:focus]:border-clay [&>select]:w-full [&>select]:rounded-lg [&>select]:border [&>select]:border-sand [&>select]:bg-white [&>select]:px-3 [&>select]:py-2 [&>select]:outline-none [&>select:focus]:border-clay">
        {children}
      </div>
    </label>
  );
}
