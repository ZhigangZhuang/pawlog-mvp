import type { BottomTab, RecordType } from "../types";

export type RouteSource = {
  from: Exclude<BottomTab, "add" | "profile"> | "post" | "animal";
  postId?: string;
  animalId?: string;
  parent?: RouteSource;
};

export type Route =
  | { name: "tabs" }
  | { name: "post"; postId: string; source?: RouteSource }
  | { name: "create" }
  | { name: "detail"; animalId: string; source?: RouteSource }
  | {
      name: "addRecord";
      animalId: string;
      type?: RecordType;
      source?: RouteSource;
    }
  | { name: "share"; animalId: string }
  | { name: "merge"; animalId: string };

export function getRouteAnimalId(route: Route) {
  if (
    route.name === "detail" ||
    route.name === "addRecord" ||
    route.name === "share" ||
    route.name === "merge"
  ) {
    return route.animalId;
  }

  return undefined;
}
