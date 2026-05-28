import { useEffect, useMemo, useState } from "react";
import { AddActionSheet } from "./components/AddActionSheet";
import { BottomTabBar } from "./components/BottomTabBar";
import { NewAnimalToast } from "./components/NewAnimalToast";
import { AddRecordPage } from "./pages/AddRecordPage";
import { AnimalDetailPage } from "./pages/AnimalDetailPage";
import { AnimalTagsPage } from "./pages/AnimalTagsPage";
import { BoardPage } from "./pages/BoardPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CreateAnimalPage } from "./pages/CreateAnimalPage";
import { CreateGroupPage } from "./pages/CreateGroupPage";
import { GroupManagementPage } from "./pages/GroupManagementPage";
import { HomePage } from "./pages/HomePage";
import { InboxPhotosPage } from "./pages/InboxPhotosPage";
import { ImportSharePage } from "./pages/ImportSharePage";
import { IssueEditorPage } from "./pages/IssueEditorPage";
import { IssuesPage } from "./pages/IssuesPage";
import { JoinGroupPage } from "./pages/JoinGroupPage";
import { MapPage } from "./pages/MapPage";
import { MergeAnimalPage } from "./pages/MergeAnimalPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SelectAnimalPage } from "./pages/SelectAnimalPage";
import { ShareToGroupPage } from "./pages/ShareToGroupPage";
import { ShareCardPage } from "./pages/ShareCardPage";
import { WikiPage } from "./pages/WikiPage";
import type { Animal, AppState, BottomTab, RecordType } from "./types";
import { activeAnimals, getSpaceContext, loadState, saveState, scopedState, withChangeLog } from "./utils/storage";

type RouteSource = { from: "home" | "catalog" | "post" | "map"; postId?: string };

type Route =
  | { name: "tabs" }
  | { name: "post"; postId: string; source?: RouteSource }
  | { name: "create" }
  | { name: "detail"; animalId: string; source?: RouteSource }
  | { name: "selectAnimal"; type: RecordType }
  | { name: "addRecord"; animalId: string; type?: RecordType; source?: RouteSource }
  | { name: "share"; animalId: string }
  | { name: "merge"; animalId: string }
  | { name: "importShare" }
  | { name: "groups" }
  | { name: "createGroup" }
  | { name: "joinGroup" }
  | { name: "shareToGroup"; animalId: string }
  | { name: "animalTags"; animalId: string; groupId: string }
  | { name: "inbox" }
  | { name: "issues" }
  | { name: "issueEditor"; issueId?: string }
  | { name: "board" }
  | { name: "wiki" };

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [route, setRoute] = useState<Route>({ name: "tabs" });
  const [activeTab, setActiveTab] = useState<BottomTab>("home");
  const [addOpen, setAddOpen] = useState(false);
  const [spaceId, setSpaceId] = useState("personal");
  const [newAnimal, setNewAnimal] = useState<Animal | undefined>();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const space = getSpaceContext(state, spaceId);
  const visibleState = scopedState(state, space);

  const selectedAnimal = useMemo(() => {
    if (["detail", "addRecord", "share", "merge", "shareToGroup", "animalTags"].includes(route.name)) {
      return state.animals.find((animal) => animal.id === (route as { animalId: string }).animalId);
    }
    return undefined;
  }, [route, state.animals]);

  const selectedPost = useMemo(() => {
    if (route.name === "post") return state.feedRecords.find((post) => post.id === route.postId);
    return undefined;
  }, [route, state.feedRecords]);

  const goTabs = (tab = activeTab) => {
    setActiveTab(tab);
    setRoute({ name: "tabs" });
  };

  const openAnimal = (animalId: string, source: RouteSource) => {
    setRoute({ name: "detail", animalId, source });
  };

  const openPost = (postId: string, source: RouteSource) => {
    setRoute({ name: "post", postId, source });
  };

  const goSource = (source?: RouteSource, fallback: BottomTab = "home") => {
    if (source?.from === "post" && source.postId) {
      setRoute({ name: "post", postId: source.postId, source: { from: "home" } });
      return;
    }
    if (source?.from === "catalog") {
      goTabs("catalog");
      return;
    }
    if (source?.from === "map") {
      goTabs("map");
      return;
    }
    goTabs(source?.from === "home" ? "home" : fallback);
  };

  const saveAndReturnToDetail = (nextState: AppState, animalId?: string, source?: RouteSource) => {
    setState(nextState);
    setRoute({ name: "detail", animalId: animalId || selectedAnimal?.id || activeAnimals(nextState)[0]?.id || "", source });
  };

  const openRecordFlow = (type: RecordType) => {
    setAddOpen(false);
    setRoute({ name: "selectAnimal", type });
  };

  const tabPage = () => {
    if (activeTab === "home") {
      return <HomePage state={state} onOpenPost={(postId) => openPost(postId, { from: "home" })} />;
    }
    if (activeTab === "map") {
      return <MapPage state={state} onOpenAnimal={(animalId) => openAnimal(animalId, { from: "map" })} onOpenPost={(postId) => openPost(postId, { from: "map" })} />;
    }
    if (activeTab === "catalog") {
      return <CatalogPage state={state} onOpenAnimal={(animalId) => openAnimal(animalId, { from: "catalog" })} />;
    }
    if (activeTab === "profile") {
      return (
        <ProfilePage
          state={state}
          onImport={() => setRoute({ name: "importShare" })}
          onInbox={() => setRoute({ name: "inbox" })}
          onGroups={() => setRoute({ name: "groups" })}
        />
      );
    }
    return null;
  };

  if (route.name === "create") {
    return (
      <CreateAnimalPage
        state={state}
        onBack={() => goTabs("catalog")}
        onSave={(nextState) => {
          const animal = nextState.animals[0];
          const withLog = withChangeLog(nextState, {
            animal_id: animal.id,
            group_id: space.type === "group" ? space.id : undefined,
            action: "created_animal",
            after: { name: animal.name, animal_origin: animal.animal_origin },
          });
          setState(withLog);
          setNewAnimal(animal);
          setRoute({ name: "tabs" });
        }}
      />
    );
  }

  if (route.name === "selectAnimal") {
    return (
      <SelectAnimalPage
        state={visibleState}
        recordType={route.type}
        onBack={() => goTabs()}
        onSelect={(animalId) => setRoute({ name: "addRecord", animalId, type: route.type })}
      />
    );
  }

  if (route.name === "post" && selectedPost) {
    const animal = state.animals.find((item) => item.id === selectedPost.animal_id);
    if (animal) {
      return (
        <PostDetailPage
          post={selectedPost}
          animal={animal}
          state={state}
          onBack={() => goSource(route.source, "home")}
          onOpenAnimal={(animalId) => openAnimal(animalId, { from: "post", postId: selectedPost.id })}
        />
      );
    }
  }

  if (route.name === "detail" && selectedAnimal) {
    const detailState = space.type === "group" ? visibleState : state;
    return (
      <AnimalDetailPage
        animal={selectedAnimal}
        state={detailState}
        onBack={() => goSource(route.source, "home")}
        onAddRecord={(type) => setRoute({ name: "addRecord", animalId: selectedAnimal.id, type, source: route.source })}
        onShare={() => setRoute({ name: "share", animalId: selectedAnimal.id })}
        onMerge={() => setRoute({ name: "merge", animalId: selectedAnimal.id })}
        onShareToGroup={() => setRoute({ name: "shareToGroup", animalId: selectedAnimal.id })}
        onEditGroupTags={space.type === "group" ? () => setRoute({ name: "animalTags", animalId: selectedAnimal.id, groupId: space.id }) : undefined}
        currentGroupId={space.type === "group" ? space.id : undefined}
      />
    );
  }

  if (route.name === "addRecord" && selectedAnimal) {
    return (
      <AddRecordPage
        animal={selectedAnimal}
        state={state}
        initialType={route.type}
        groupId={space.type === "group" ? space.id : undefined}
        onBack={() => setRoute({ name: "detail", animalId: selectedAnimal.id, source: route.source })}
        onSave={(nextState) =>
          saveAndReturnToDetail(
            withChangeLog(nextState, {
              animal_id: selectedAnimal.id,
              group_id: space.type === "group" ? space.id : undefined,
              action: route.type === "photo" ? "added_photo" : route.type === "health" ? "added_health_record" : route.type === "feeding" ? "added_feeding_record" : "updated_status",
              after: { record_type: route.type || "record" },
            }),
            selectedAnimal.id,
            route.source,
          )
        }
      />
    );
  }

  if (route.name === "share" && selectedAnimal) {
    return <ShareCardPage animal={selectedAnimal} state={state} onBack={() => setRoute({ name: "detail", animalId: selectedAnimal.id })} />;
  }

  if (route.name === "merge" && selectedAnimal) {
    return <MergeAnimalPage animal={selectedAnimal} state={state} onBack={() => setRoute({ name: "detail", animalId: selectedAnimal.id })} onSave={saveAndReturnToDetail} />;
  }

  if (route.name === "importShare") {
    return <ImportSharePage state={state} onBack={() => goTabs("profile")} onSave={saveAndReturnToDetail} />;
  }

  if (route.name === "groups") {
    return (
      <GroupManagementPage
        state={state}
        onBack={() => goTabs("profile")}
        onCreateGroup={() => setRoute({ name: "createGroup" })}
        onJoinGroup={() => setRoute({ name: "joinGroup" })}
        onSelectGroup={() => goTabs("profile")}
      />
    );
  }

  if (route.name === "createGroup") {
    return (
      <CreateGroupPage
        state={state}
        onBack={() => setRoute({ name: "groups" })}
        onSave={(nextState, groupId) => {
          setState(nextState);
          void groupId;
          goTabs("profile");
        }}
      />
    );
  }

  if (route.name === "joinGroup") {
    return (
      <JoinGroupPage
        state={state}
        onBack={() => setRoute({ name: "groups" })}
        onSave={(nextState, groupId) => {
          setState(nextState);
          void groupId;
          goTabs("profile");
        }}
      />
    );
  }

  if (route.name === "shareToGroup" && selectedAnimal) {
    return (
      <ShareToGroupPage
        state={state}
        animal={selectedAnimal}
        onBack={() => setRoute({ name: "detail", animalId: selectedAnimal.id })}
        onSave={(nextState, groupId) => {
          setState(nextState);
          void groupId;
          setRoute({ name: "detail", animalId: selectedAnimal.id });
        }}
      />
    );
  }

  if (route.name === "animalTags" && selectedAnimal) {
    return (
      <AnimalTagsPage
        state={state}
        animal={selectedAnimal}
        groupId={route.groupId}
        onBack={() => setRoute({ name: "detail", animalId: selectedAnimal.id })}
        onSave={(nextState) => setState(nextState)}
      />
    );
  }

  if (route.name === "inbox") {
    return <InboxPhotosPage state={state} onBack={() => goTabs("home")} onCreateAnimal={() => setRoute({ name: "create" })} onSave={(nextState) => setState(nextState)} />;
  }

  if (route.name === "issues") {
    return <IssuesPage state={visibleState} space={space} onBack={() => goTabs("home")} onCreate={() => setRoute({ name: "issueEditor" })} onOpenIssue={(issueId) => setRoute({ name: "issueEditor", issueId })} />;
  }

  if (route.name === "issueEditor") {
    return (
      <IssueEditorPage
        state={visibleState}
        space={space}
        issueId={route.issueId}
        onBack={() => setRoute({ name: "issues" })}
        onSave={(nextVisibleState) => {
          setState({ ...state, issues: mergeById(state.issues, nextVisibleState.issues), changeLogs: mergeById(state.changeLogs, nextVisibleState.changeLogs) });
          setRoute({ name: "issues" });
        }}
      />
    );
  }

  if (route.name === "board") {
    return <BoardPage state={visibleState} space={space} onBack={() => goTabs("home")} onOpenIssue={(issueId) => setRoute({ name: "issueEditor", issueId })} />;
  }

  if (route.name === "wiki") {
    return (
      <WikiPage
        state={visibleState}
        space={space}
        onBack={() => goTabs("home")}
        onSave={(nextVisibleState) => {
          setState({ ...state, wikiPages: mergeById(state.wikiPages, nextVisibleState.wikiPages) });
        }}
      />
    );
  }

  return (
    <>
      {tabPage()}
      <BottomTabBar activeTab={activeTab} onTabChange={goTabs} onAdd={() => setAddOpen(true)} />
      <AddActionSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreateRecord={() => openRecordFlow("photo")}
        onCreateAnimal={() => {
          setAddOpen(false);
          setRoute({ name: "create" });
        }}
        onImportPhotos={() => {
          setAddOpen(false);
          setRoute({ name: "inbox" });
        }}
      />
      {newAnimal ? (
        <NewAnimalToast
          animal={newAnimal}
          count={activeAnimals(visibleState).length}
          space={space}
          onClose={() => setNewAnimal(undefined)}
          onOpen={() => {
            const id = newAnimal.id;
            setNewAnimal(undefined);
            setRoute({ name: "detail", animalId: id });
          }}
        />
      ) : null}
    </>
  );
}

function mergeById<T extends { id: string }>(base: T[], incoming: T[]) {
  const byId = new Map(base.map((item) => [item.id, item]));
  incoming.forEach((item) => byId.set(item.id, item));
  return [...byId.values()];
}
