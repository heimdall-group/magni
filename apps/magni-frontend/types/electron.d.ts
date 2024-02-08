import type { BrowserWindow } from "electron";

declare global {
  interface LocalStorageRef<T> extends Ref<T> {}
  interface ElectronBrowserWindow extends BrowserWindow {}
}

export {}
