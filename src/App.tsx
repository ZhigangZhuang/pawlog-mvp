import { useState } from "react";
import { AppRouter } from "./app/AppRouter";
import type { Route } from "./app/routes";
import { useAppState } from "./app/useAppState";
import { AddActionSheet } from "./components/AddActionSheet";
import { BottomTabBar } from "./components/BottomTabBar";
import { NewAnimalToast } from "./components/NewAnimalToast";
import type { Animal, BottomTab, RecordType } from "./types";
import { activeAnimals } from "./utils/storage";

export default function App() {
  const [state, setState] = useAppState();
  const [route, setRoute] = useState<Route>({ name: "tabs" });
  const [activeTab, setActiveTab] = useState<BottomTab>("home");
  const [addOpen, setAddOpen] = useState(false);
  const [newAnimal, setNewAnimal] = useState<Animal | undefined>();

  const goTabs = (tab = activeTab) => {
    setActiveTab(tab);
    setRoute({ name: "tabs" });
  };

  const openRecordFlow = (type: RecordType) => {
    setAddOpen(false);
    const firstAnimal = activeAnimals(state)[0];
    if (firstAnimal) {
      setRoute({ name: "addRecord", animalId: firstAnimal.id, type });
    }
  };

  return (
    <>
      <AppRouter
        state={state}
        setState={setState}
        route={route}
        setRoute={setRoute}
        activeTab={activeTab}
        goTabs={goTabs}
        setNewAnimal={setNewAnimal}
      />
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={goTabs}
        onAdd={() => setAddOpen(true)}
      />
      <AddActionSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreateRecord={() => openRecordFlow("photo")}
        onCreateAnimal={() => {
          setAddOpen(false);
          setRoute({ name: "create" });
        }}
      />
      {newAnimal ? (
        <NewAnimalToast
          animal={newAnimal}
          count={activeAnimals(state).length}
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
