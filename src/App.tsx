import { useEffect, useMemo, useState } from "react";
import { AddActionSheet } from "./components/AddActionSheet";
import { BottomTabBar } from "./components/BottomTabBar";
import { NewAnimalToast } from "./components/NewAnimalToast";
import { AddRecordPage } from "./pages/AddRecordPage";
import { AnimalDetailPage } from "./pages/AnimalDetailPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CreateAnimalPage } from "./pages/CreateAnimalPage";
import { HomePage } from "./pages/HomePage";
import { InboxPhotosPage } from "./pages/InboxPhotosPage";
import { ImportSharePage } from "./pages/ImportSharePage";
import { MapPage } from "./pages/MapPage";
import { MergeAnimalPage } from "./pages/MergeAnimalPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SelectAnimalPage } from "./pages/SelectAnimalPage";
import { ShareCardPage } from "./pages/ShareCardPage";
import type { Animal, AppState, BottomTab, RecordType } from "./types";
import { activeAnimals, loadState, saveState, withChangeLog } from "./utils/storage";

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
  | { name: "inbox" };

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [route, setRoute] = useState<Route>({ name: "tabs" });
  const [activeTab, setActiveTab] = useState<BottomTab>("home");
  const [addOpen, setAddOpen] = useState(false);
  const [newAnimal, setNewAnimal] = useState<Animal | undefined>();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const selectedAnimal = useMemo(() => {
    if (["detail", "addRecord", "share", "merge"].includes(route.name)) {
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
        state={state}
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
    return (
      <AnimalDetailPage
        animal={selectedAnimal}
        state={state}
        onBack={() => goSource(route.source, "home")}
        onAddRecord={(type) => setRoute({ name: "addRecord", animalId: selectedAnimal.id, type, source: route.source })}
        onShare={() => setRoute({ name: "share", animalId: selectedAnimal.id })}
        onMerge={() => setRoute({ name: "merge", animalId: selectedAnimal.id })}
      />
    );
  }

  if (route.name === "addRecord" && selectedAnimal) {
    return (
      <AddRecordPage
        animal={selectedAnimal}
        state={state}
        initialType={route.type}
        onBack={() => setRoute({ name: "detail", animalId: selectedAnimal.id, source: route.source })}
        onSave={(nextState) =>
          saveAndReturnToDetail(
            withChangeLog(nextState, {
              animal_id: selectedAnimal.id,
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

  if (route.name === "inbox") {
    return <InboxPhotosPage state={state} onBack={() => goTabs("home")} onCreateAnimal={() => setRoute({ name: "create" })} onSave={(nextState) => setState(nextState)} />;
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
              count={activeAnimals(state).length}
              space={{ type: "personal", id: "personal", label: "个人空间" }}
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
