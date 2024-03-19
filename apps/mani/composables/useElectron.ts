import type { CookieRef } from "nuxt/app";

export const isElectron = () => {
  if (import.meta.client) {
    return window.navigator.userAgent.includes('Electron')
  } else {
    return false
  }
}

export const useInternalFetch = async (url: string, options: {[key: string]: any} = {method: 'GET'}, remove: Array<string> = []):Promise<any> => {
  if (options.method === undefined) {
    options.method = 'GET';
  }

  if (options.method !== 'GET') {
    if (!options.body) {
      options.body = {};
    }
    options.body = Object.assign(options.body, {remove})
  }
  const { API_URL } = useRuntimeConfig().public;
  options.headers = {
    'Access-Control-Allow-Origin': API_URL,
  }
  const result = await $fetch(`${API_URL}${url}`, options);
  return result;
}

export const useInternalCookie = (name: string, options = {}):CookieRef<T> | LocalStorageRef<T> => {
  return isElectron() ? useElectronStorage(name, options) : useCookie(name, options)
}

export const useElectronStorage = (name: string, options = {}): LocalStorageRef<T> => {
  let value: string | null = getElectronItem(name);
  const item = computed({
    get() {
      return value
    },
    set(newValue) {
      value = newValue;
      if (newValue !== null) {
        setElectronItem(name, newValue);
      }
    }
  });
  return item;
}

const getElectronItem = (name: string):string | null => {
  return window.localStorage.getItem(name);
}

const setElectronItem = (name: string, value: string):void => {
  window.localStorage.setItem(name, value);
}
