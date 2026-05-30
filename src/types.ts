export type AnimalOrigin = "owned_pet" | "stray";
export type Species = "cat" | "dog" | "other";
export type Gender = "unknown" | "male" | "female";
export type HealthStatus =
  | "normal"
  | "watching"
  | "suspected_injured"
  | "injured"
  | "sick"
  | "suspected_pregnant"
  | "urgent";
export type NeuterStatus =
  | "unknown"
  | "not_neutered"
  | "suspected_neutered"
  | "scheduled"
  | "captured"
  | "in_surgery"
  | "recovering"
  | "returned"
  | "confirmed_neutered";
export type RescueStatus =
  | "none"
  | "observing"
  | "needs_help"
  | "contacted_rescue"
  | "temporary_home"
  | "hospital"
  | "recovering"
  | "released"
  | "adopted"
  | "missing"
  | "deceased";
export type RecordType =
  | "photo"
  | "feeding"
  | "health"
  | "weight"
  | "medical"
  | "anniversary"
  | "location"
  | "neuter_status"
  | "rescue_status"
  | "note";
export type BottomTab = "home" | "map" | "add" | "catalog" | "profile";
export type MapMode = "my_private_map" | "group_map" | "blurred_map";
export type LocationType =
  | "pet_photo_place"
  | "walk_place"
  | "vet"
  | "pet_store"
  | "park"
  | "stray_seen"
  | "feeding_spot"
  | "danger_zone"
  | "rescue_place"
  | "release_place"
  | "temporary_home";
export type MergeStatus = "pending" | "completed" | "cancelled" | "reverted";
export type AnimalArchiveStatus = "active" | "merged" | "archived" | "deleted";
export type GroupType =
  | "private_care_group"
  | "rescue_project"
  | "family_pet_group";
export type GroupRole = "owner" | "admin" | "member" | "viewer";
export type TagScope = "personal" | "group";
export type InboxPhotoStatus = "unassigned" | "assigned" | "ignored";
export type IssueStatus =
  | "open"
  | "in_progress"
  | "blocked"
  | "done"
  | "closed";
export type IssuePriority = "P0" | "P1" | "P2" | "P3";
export type IssueType =
  | "observe"
  | "feeding"
  | "health"
  | "neuter"
  | "rescue"
  | "adoption"
  | "photo_confirm"
  | "merge_check"
  | "pet_care"
  | "other";
export type WatchLevel = "none" | "important_only" | "all_updates";
export type AnimalVisibility =
  | "private"
  | "shared_readonly"
  | "shared_recordable"
  | "public_card";
export type AnimalSource =
  | "created_by_me"
  | "shared_to_me"
  | "imported"
  | "merged";
export type FeedRecordType =
  | "photo"
  | "note"
  | "feeding"
  | "health"
  | "location"
  | "weight"
  | "anniversary"
  | "adoption"
  | "shared_update";
export type AnimalOwnershipStatus =
  | "owned_by_me"
  | "shared_to_me"
  | "transferred_out"
  | "transferred_to_me"
  | "co_recording";
export type AnimalRelationType =
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
export type AnimalFamilyType =
  | "family"
  | "litter"
  | "feeding_group"
  | "friends"
  | "temporary_group";
export type AnimalTransferType =
  | "adoption"
  | "gift"
  | "temporary_care"
  | "foster"
  | "return";

export type RecordSource = {
  source_type: "self" | "imported" | "group_member" | "shared_link";
  source_user_id?: string;
  source_animal_id?: string;
  group_id?: string;
  imported_at?: string;
  created_at?: string;
};

export type Animal = {
  id: string;
  user_id: string;
  animal_origin: AnimalOrigin;
  name: string;
  species: Species;
  breed?: string;
  gender: Gender;
  birthday?: string;
  home_date?: string;
  age_stage?: "unknown" | "baby" | "young" | "adult" | "senior";
  color?: string;
  features?: string;
  personality?: string;
  is_friendly?: boolean;
  neuter_status?: NeuterStatus;
  health_status?: HealthStatus;
  rescue_status?: RescueStatus;
  adoption_status?: "unknown" | "not_available" | "available" | "adopted";
  danger_level?: "low" | "medium" | "high";
  cover_image_url?: string;
  aliases?: string[];
  visibility?: AnimalVisibility;
  animal_source?: AnimalSource;
  ownership_status?: AnimalOwnershipStatus;
  current_keeper_label?: string;
  transfer_note?: string;
  archive_status: AnimalArchiveStatus;
  merged_into_animal_id?: string;
  created_at: string;
  updated_at: string;
};

export type PostAnimal = {
  id: string;
  post_id: string;
  animal_id: string;
  role_in_post?: "main" | "appears_with" | "background" | "unknown";
  created_at: string;
};

export type AnimalRelationship = {
  id: string;
  from_animal_id: string;
  to_animal_id: string;
  relation_type: AnimalRelationType;
  note?: string;
  created_by: string;
  created_at: string;
};

export type AnimalFamily = {
  id: string;
  name: string;
  description?: string;
  member_animal_ids: string[];
  type: AnimalFamilyType;
  created_by: string;
  created_at: string;
};

export type AnimalTransfer = {
  id: string;
  animal_id: string;
  from_user_id: string;
  to_user_id: string;
  to_user_label?: string;
  transfer_type: AnimalTransferType;
  keep_view_permission: boolean;
  keep_record_permission: boolean;
  note?: string;
  created_at: string;
};

export type TimelineItem = {
  id: string;
  animal_id: string;
  type: RecordType | "status";
  title: string;
  description?: string;
  image_url?: string;
  source?: RecordSource;
  occurred_at: string;
  created_at: string;
};

export type AnimalPhoto = {
  id: string;
  animal_id: string;
  image_url: string;
  taken_at: string;
  note?: string;
  location_id?: string;
  is_cover?: boolean;
  source?: RecordSource;
  created_at: string;
};

export type FeedingRecord = {
  id: string;
  animal_id: string;
  fed_at: string;
  food_type: "cat_food" | "dog_food" | "wet_food" | "water" | "snack" | "other";
  amount: "small" | "normal" | "large" | "custom";
  appetite: "none" | "little" | "normal" | "hungry";
  note?: string;
  image_url?: string;
  source?: RecordSource;
  created_at: string;
};

export type HealthRecord = {
  id: string;
  animal_id: string;
  checked_at: string;
  health_status: HealthStatus;
  symptoms?: string;
  action_needed?: boolean;
  action_note?: string;
  image_url?: string;
  source?: RecordSource;
  created_at: string;
};

export type WeightRecord = {
  id: string;
  animal_id: string;
  weight_kg: number;
  measured_at: string;
  note?: string;
  source?: RecordSource;
  created_at: string;
};

export type MedicalReminder = {
  id: string;
  animal_id: string;
  type: "vaccine" | "deworming" | "checkup" | "medicine" | "other";
  title: string;
  date: string;
  next_due_date?: string;
  completed: boolean;
  note?: string;
  created_at: string;
};

export type Anniversary = {
  id: string;
  animal_id: string;
  title: string;
  date: string;
  type: "birthday" | "adoption_day" | "home_day" | "custom";
  repeat_yearly: boolean;
  note?: string;
  created_at: string;
};

export type StrayLocation = {
  id: string;
  animal_id: string;
  animal_origin: AnimalOrigin;
  type: LocationType;
  location_name: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  precision_level: "exact" | "blurred" | "text_only" | "none";
  address_text?: string;
  is_sensitive: boolean;
  visibility: "private" | "trusted_group" | "public_blurred";
  note?: string;
  seen_at?: string;
  created_by: string;
  source?: RecordSource;
  created_at: string;
  updated_at: string;
};

export type AnimalMergeLog = {
  id: string;
  primary_animal_id: string;
  merged_animal_id: string;
  initiated_by: string;
  status: MergeStatus;
  field_choices: Record<string, unknown>;
  imported_photo_ids: string[];
  imported_record_ids: string[];
  imported_location_ids: string[];
  created_at: string;
  completed_at?: string;
  reverted_at?: string;
};

export type SharedAnimalPackage = {
  id: string;
  animal: Animal;
  photos: AnimalPhoto[];
  timeline: TimelineItem[];
  locations: StrayLocation[];
  shared_by: string;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  visibility: "private";
  invite_code: string;
  allow_member_invite: boolean;
  default_location_privacy: "blurred_only" | "private_only";
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  display_name: string;
  role: GroupRole;
  joined_at: string;
};

export type GroupAnimal = {
  id: string;
  group_id: string;
  animal_id: string;
  shared_by: string;
  share_basic_info: boolean;
  share_photos: boolean;
  share_health_records: boolean;
  share_feeding_records: boolean;
  share_weight_records: boolean;
  share_neuter_status: boolean;
  share_rescue_status: boolean;
  share_blurred_location: boolean;
  share_exact_location: boolean;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  scope: TagScope;
  group_id?: string;
  created_by: string;
  created_at: string;
};

export type AnimalTag = {
  id: string;
  animal_id: string;
  tag_id: string;
  added_by: string;
  created_at: string;
};

export type InboxPhoto = {
  id: string;
  image_url: string;
  taken_at?: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  status: InboxPhotoStatus;
  assigned_animal_id?: string;
  created_at: string;
};

export type AnimalIssue = {
  id: string;
  group_id?: string;
  animal_id?: string;
  title: string;
  description?: string;
  type: IssueType;
  status: IssueStatus;
  priority: IssuePriority;
  assignee_id?: string;
  created_by: string;
  due_date?: string;
  label_ids: string[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
};

export type ChangeLog = {
  id: string;
  group_id?: string;
  animal_id?: string;
  issue_id?: string;
  change_request_id?: string;
  action:
    | "created_animal"
    | "updated_profile"
    | "added_photo"
    | "added_feeding_record"
    | "added_health_record"
    | "updated_status"
    | "added_tag"
    | "removed_tag"
    | "created_issue"
    | "updated_issue"
    | "merged_change_request"
    | "imported_records"
    | "assigned_inbox_photo"
    | "watched_animal";
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  created_by: string;
  created_at: string;
};

export type AnimalWatch = {
  id: string;
  user_id: string;
  animal_id: string;
  level: WatchLevel;
  created_at: string;
};

export type WikiPage = {
  id: string;
  group_id: string;
  title: string;
  content: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

export type AnimalRecord = {
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

export type AppState = {
  animals: Animal[];
  postAnimals: PostAnimal[];
  animalRelationships: AnimalRelationship[];
  animalFamilies: AnimalFamily[];
  animalTransfers: AnimalTransfer[];
  timeline: TimelineItem[];
  photos: AnimalPhoto[];
  locations: StrayLocation[];
  mergeLogs: AnimalMergeLog[];
  sharedPackages: SharedAnimalPackage[];
  groups: Group[];
  groupMembers: GroupMember[];
  groupAnimals: GroupAnimal[];
  tags: Tag[];
  animalTags: AnimalTag[];
  inboxPhotos: InboxPhoto[];
  issues: AnimalIssue[];
  changeLogs: ChangeLog[];
  watches: AnimalWatch[];
  wikiPages: WikiPage[];
  feedRecords: AnimalRecord[];
};
