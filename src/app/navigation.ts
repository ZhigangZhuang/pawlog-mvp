import type { Dispatch, SetStateAction } from "react";
import type { BottomTab } from "../types";
import type { Route, RouteSource } from "./routes";

type GoTabs = (tab?: BottomTab) => void;

export function openAnimal(setRoute: Dispatch<SetStateAction<Route>>, animalId: string, source: RouteSource) {
  setRoute({ name: "detail", animalId, source });
}

export function openPost(setRoute: Dispatch<SetStateAction<Route>>, postId: string, source: RouteSource) {
  setRoute({ name: "post", postId, source });
}

export function goSource(setRoute: Dispatch<SetStateAction<Route>>, goTabs: GoTabs, source?: RouteSource, fallback: BottomTab = "home") {
  if (source?.from === "post" && source.postId) {
    setRoute({ name: "post", postId: source.postId, source: { from: "home" } });
    return;
  }

  if (source?.from === "animal" && source.animalId) {
    setRoute({ name: "detail", animalId: source.animalId, source: source.parent });
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
}
