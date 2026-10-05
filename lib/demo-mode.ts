export const DEMO_SESSION_KEY = "pearly_demo_session";
export const DEMO_DATA_MODE_KEY = "pearly_demo_data_mode";
const DEMO_SESSION_EVENT = "pearly-demo-session";

export type DemoDataMode = "sample" | "empty";

export function subscribeToDemoSession(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", onChange);
  window.addEventListener(DEMO_SESSION_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(DEMO_SESSION_EVENT, onChange);
  };
}

export function getDemoDataMode(): DemoDataMode {
  if (typeof window === "undefined") return "sample";
  return window.localStorage.getItem(DEMO_DATA_MODE_KEY) === "empty"
    ? "empty"
    : "sample";
}

export function setDemoDataMode(mode: DemoDataMode): void {
  window.localStorage.setItem(DEMO_DATA_MODE_KEY, mode);
  window.dispatchEvent(new Event(DEMO_SESSION_EVENT));
}

export function isDemoSession(): boolean {
  return (
    typeof window !== "undefined" &&
    window.localStorage.getItem(DEMO_SESSION_KEY) === "true"
  );
}

export function startDemoSession(): void {
  window.localStorage.setItem(DEMO_SESSION_KEY, "true");
  window.dispatchEvent(new Event(DEMO_SESSION_EVENT));
}

export function clearDemoSession(): void {
  window.localStorage.removeItem(DEMO_SESSION_KEY);
  window.dispatchEvent(new Event(DEMO_SESSION_EVENT));
}
