import { useMemo, type Dispatch, type SetStateAction } from "react";
import { goSource as returnToSource, openAnimal as navigateToAnimal, openPost as navigateToPost } from "./navigation";
import type { Route, RouteSource } from "./routes";
import { getRouteAnimalId } from "./routes";
import { AddRecordPage } from "../pages/AddRecordPage";
import { AnimalDetailPage } from "../pages/AnimalDetailPage";
import { CatalogPage } from "../pages/CatalogPage";
import { CreateAnimalPage } from "../pages/CreateAnimalPage";
import { HomePage } from "../pages/HomePage";
import { InboxPhotosPage } from "../pages/InboxPhotosPage";
import { ImportSharePage } from "../pages/ImportSharePage";
import { MapPage } from "../pages/MapPage";
import { MergeAnimalPage } from "../pages/MergeAnimalPage";
import { PostDetailPage } from "../pages/PostDetailPage";
import { ProfilePage } from "../pages/ProfilePage";
import { SelectAnimalPage } from "../pages/SelectAnimalPage";
import { ShareCardPage } from "../pages/ShareCardPage";
import type { Animal, AppState, BottomTab } from "../types";
import { activeAnimals, primaryAnimalIdForRecord, withChangeLog } from "../utils/storage";

type AppRouterProps = {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  route: Route;
  setRoute: Dispatch<SetStateAction<Route>>;
  activeTab: BottomTab;
  goTabs: (tab?: BottomTab) => void;
  setNewAnimal: (animal: Animal | undefined) => void;
};

export function AppRouter({ state, setState, route, setRoute, activeTab, goTabs, setNewAnimal }: AppRouterProps) {
  const selectedAnimal = useMemo(() => {
    const animalId = getRouteAnimalId(route);
    return animalId ? state.animals.find((animal) => animal.id === animalId) : undefined;
  }, [route, state.animals]);

  const selectedPost = useMemo(() => {
    if (route.name === "post") return state.feedRecords.find((post) => post.id === route.postId);
    return undefined;
  }, [route, state.feedRecords]);

  const goSource = (source?: RouteSource, fallback: BottomTab = "home") => {
    returnToSource(setRoute, goTabs, source, fallback);
  };

  const openAnimal = (animalId: string, source: RouteSource) => {
    navigateToAnimal(setRoute, animalId, source);
  };

  const openPost = (postId: string, source: RouteSource) => {
    navigateToPost(setRoute, postId, source);
  };

  const saveAndReturnToDetail = (nextState: AppState, animalId?: string, source?: RouteSource) => {
    setState(nextState);
    setRoute({ name: "detail", animalId: animalId || selectedAnimal?.id || activeAnimals(nextState)[0]?.id || "", source });
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
    const animal = state.animals.find((item) => item.id === primaryAnimalIdForRecord(selectedPost));
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
        onOpenAnimal={(animalId) => openAnimal(animalId, { from: "animal", animalId: selectedAnimal.id, parent: route.source })}
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
        onSave={(nextState, primaryAnimalId) =>
          saveAndReturnToDetail(
            withChangeLog(nextState, {
              animal_id: primaryAnimalId,
              action: route.type === "photo" ? "added_photo" : route.type === "health" ? "added_health_record" : route.type === "feeding" ? "added_feeding_record" : "updated_status",
              after: { record_type: route.type || "record" },
            }),
            primaryAnimalId,
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

  if (activeTab === "home") {
    return <HomePage state={state} onOpenPost={(postId) => openPost(postId, { from: "home" })} onOpenAnimal={(animalId) => openAnimal(animalId, { from: "home" })} />;
  }

  if (activeTab === "map") {
    return <MapPage state={state} onOpenAnimal={(animalId) => openAnimal(animalId, { from: "map" })} onOpenPost={(postId) => openPost(postId, { from: "map" })} />;
  }

  if (activeTab === "catalog") {
    return <CatalogPage state={state} onOpenAnimal={(animalId) => openAnimal(animalId, { from: "catalog" })} />;
  }

  if (activeTab === "profile") {
    return <ProfilePage state={state} onImport={() => setRoute({ name: "importShare" })} onInbox={() => setRoute({ name: "inbox" })} />;
  }

  return null;
}
