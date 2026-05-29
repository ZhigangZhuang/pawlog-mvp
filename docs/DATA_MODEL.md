# 数据模型

本文件记录核心数据模型和约束。代码实现以 `src/types.ts` 为准，本文用于产品和开发对齐。

## Animal

毛孩主页。

关键字段：

```ts
type Animal = {
  id: string;
  animal_origin: "owned_pet" | "stray";
  name: string;
  species: "cat" | "dog" | "other";
  cover_image_url?: string;

  visibility?: AnimalVisibility;
  animal_source?: AnimalSource;
  ownership_status?: AnimalOwnershipStatus;

  current_keeper_label?: string;
  transfer_note?: string;
};
```

含义：

- `owned_pet`：自家宠物
- `stray`：流浪动物
- `animal_source`：这只毛孩是我创建、别人分享给我、导入还是合并而来
- `ownership_status`：所有权和转交状态

## Post / AnimalRecord

图文动态。

当前代码中使用 `AnimalRecord` 表达 Feed Post。

```ts
type AnimalRecord = {
  id: string;

  animal_id: string;
  primary_animal_id?: string;
  animal_ids?: string[];

  type: FeedRecordType;
  images: string[];
  content: string;
  occurred_at: string;

  location_text?: string;
  location_privacy?: "none" | "blurred" | "exact_private";

  tag_ids: string[];
  created_by: string;
  source: "me" | "shared_user" | "imported";
  visibility: "private" | "shared" | "public_card";
  created_at: string;
};
```

规则：

- 一条 Post 可以关联多个 Animal
- `primary_animal_id` 是这条动态的主角
- `animal_ids` 是这条动态里出现的所有毛孩
- 旧字段 `animal_id` 兼容主角毛孩
- 一只 Animal 可以出现在多条 Post 中
- 动物主页展示所有关联了该 Animal 的 Post

## PostAnimal

动态和毛孩的关联表。

```ts
type PostAnimal = {
  id: string;
  post_id: string;
  animal_id: string;
  role_in_post?: "main" | "appears_with" | "background" | "unknown";
  created_at: string;
};
```

MVP 暂不做照片框选，只做关联动物列表。

## AnimalRelationship

动物之间的关系。

```ts
type AnimalRelationship = {
  id: string;
  from_animal_id: string;
  to_animal_id: string;
  relation_type: AnimalRelationType;
  note?: string;
  created_by: string;
  created_at: string;
};
```

关系类型：

```ts
type AnimalRelationType =
  | "parent"
  | "child"
  | "sibling"
  | "mate"
  | "same_litter"
  | "friend"
  | "often_seen_together"
  | "same_feeding_area"
  | "adopted_from"
  | "transferred_to"
  | "unknown";
```

示例：

- 猫妈妈 -> 小白崽：parent
- 小白崽 -> 小黑崽：same_litter
- 豆包 -> Lucky：friend

## AnimalFamily

轻量小群体。

```ts
type AnimalFamily = {
  id: string;
  name: string;
  description?: string;
  member_animal_ids: string[];
  type: "family" | "litter" | "feeding_group" | "friends" | "temporary_group";
  created_by: string;
  created_at: string;
};
```

用途：

- 一家三口
- 一窝小猫
- 同一喂养点
- 常一起出现的小群体

## AnimalTransfer

送养、转交、寄养、临时照顾。

```ts
type AnimalTransfer = {
  id: string;
  animal_id: string;
  from_user_id: string;
  to_user_id: string;
  to_user_label?: string;
  transfer_type: "adoption" | "gift" | "temporary_care" | "foster" | "return";
  keep_view_permission: boolean;
  keep_record_permission: boolean;
  note?: string;
  created_at: string;
};
```

规则：

- 送养不等于删除档案
- 原主人可以保留查看权限
- 原主人也可以在对方允许时保留记录权限
- 送养后的动物仍可出现在原主人的图鉴里

## AnimalRelation / 权限关系

主关系：

```ts
type AnimalRelation =
  | "owned"
  | "shared_view"
  | "shared_record";
```

扩展状态：

```ts
type AnimalOwnershipStatus =
  | "owned_by_me"
  | "shared_to_me"
  | "transferred_out"
  | "transferred_to_me"
  | "co_recording";
```

页面文案：

- 我的
- 分享给我的
- 允许我记录
- 已送养
- 转交给我的

## Share Scope

MVP 里的分享范围只表达可信对象授权，不是独立空间。

```ts
type AnimalSharePermission =
  | "view_only"
  | "can_post";
```

规则：

- `view_only`：只能查看
- `can_post`：可以新增动态
- 不能修改核心档案
- 不能修改或公开敏感位置

## Location

位置记录。

```ts
type StrayLocation = {
  animal_id: string;
  animal_origin: "owned_pet" | "stray";
  location_name: string;
  precision_level: "exact" | "blurred" | "text_only" | "none";
  is_sensitive: boolean;
  visibility: "private" | "trusted_group" | "public_blurred";
};
```

流浪动物位置默认模糊或仅文本。

## Photo

照片记录。

```ts
type AnimalPhoto = {
  id: string;
  animal_id: string;
  image_url: string;
  taken_at: string;
  note?: string;
  is_cover?: boolean;
};
```

当前 MVP 中，多动物动态会把同一张图片关联到多只毛孩，后续可升级为照片级框选标注。
