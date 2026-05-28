import type { BottomTab, RecordType } from "../types";

export type RouteSource = {
  from: Exclude<BottomTab, "add" | "profile"> | "post";
  postId?: string;
};

export type Route =
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

export function getRouteAnimalId(route: Route) {
  if (route.name === "detail" || route.name === "addRecord" || route.name === "share" || route.name === "merge") {
    return route.animalId;
  }

  return undefined;
}
