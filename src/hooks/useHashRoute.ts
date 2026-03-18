import { useSyncExternalStore } from "react";

export type Route = "widget" | "overview" | "technical";

function parseHash(hash: string): Route {
  const normalized = hash.replace(/^#\/?/, "").toLowerCase();
  if (normalized === "overview") return "overview";
  if (normalized === "technical") return "technical";
  return "widget";
}

function getSnapshot(): Route {
  return parseHash(window.location.hash);
}

function getServerSnapshot(): Route {
  return "widget";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function navigateTo(route: Route): void {
  switch (route) {
    case "widget":
      window.location.hash = "#/";
      break;
    case "overview":
      window.location.hash = "#/overview";
      break;
    case "technical":
      window.location.hash = "#/technical";
      break;
  }
}
