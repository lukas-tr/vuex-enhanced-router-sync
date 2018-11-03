/**
 * Based on https://github.com/vuejs/vuex-router-sync/blob/master/src/index.js
 */

import Vue from "vue";
import VueRouter, { Route } from "vue-router";
import { Store } from "vuex";

export type IVuexEnhancedRouterSyncOptions =
  | string
  | {
      moduleName?: string;
      immutable?: boolean;
    };

export interface IVuexEnhancedRouterSyncState {
  name?: string;
  path: string;
  hash: string;
  query: { [index: string]: any };
  params: { [index: string]: any };
  fullPath: string;
  meta: { [index: string]: any };
  from?: IVuexEnhancedRouterSyncState;
}

export type IVuexEnhancedRouterSyncUnsyncFunction = () => void;

export const defaultOptions = {
  immutable: false,
  moduleName: "route"
};

export const sync = (
  store: Store<any>,
  router: VueRouter,
  options: IVuexEnhancedRouterSyncOptions = defaultOptions
): IVuexEnhancedRouterSyncUnsyncFunction => {
  const moduleName =
    (typeof options === "string" ? options : options.moduleName) ||
    defaultOptions.moduleName;
  const immutable =
    typeof options === "object" && typeof options.immutable === "boolean"
      ? options.immutable
      : defaultOptions.immutable;
  if (typeof moduleName !== "string" || typeof immutable !== "boolean") {
    throw new Error(
      "moduleName must be a string and immutable must be a boolean"
    );
  }

  store.registerModule(moduleName, {
    mutations: {
      ROUTE_CHANGED(state, transition) {
        const newState = cloneRoute(transition.to, transition.from);
        if (immutable) {
          store.state[moduleName] = newState;
        } else {
          updateState(store.state[moduleName], newState);
        }
      }
    },
    namespaced: true,
    state: cloneRoute(router.currentRoute)
  });

  let isTimeTraveling = false;
  let currentPath: string;

  // sync router on store change
  const storeUnwatch = store.watch(
    state => state[moduleName],
    route => {
      const { fullPath } = route;
      if (fullPath === currentPath) {
        return;
      }
      if (currentPath != null) {
        isTimeTraveling = true;
        router.push(route);
      }
      currentPath = fullPath;
    }
  );

  // sync store on router navigation
  const afterEachUnHook = router.afterEach((to, from) => {
    if (isTimeTraveling) {
      isTimeTraveling = false;
      return;
    }
    currentPath = to.fullPath;
    store.commit(moduleName + "/ROUTE_CHANGED", { to, from });
  });

  return () => {
    // On unsync, remove router hook
    if (afterEachUnHook != null) {
      afterEachUnHook();
    }

    // On unsync, remove store watch
    if (storeUnwatch != null) {
      storeUnwatch();
    }

    // On unsync, unregister Module with store
    store.unregisterModule(moduleName);
  };
};

const cloneRoute = (to: Route, from?: Route): IVuexEnhancedRouterSyncState => {
  const clone: IVuexEnhancedRouterSyncState = {
    fullPath: to.fullPath,
    hash: to.hash,
    meta: to.meta,
    name: to.name,
    params: to.params,
    path: to.path,
    query: to.query
  };
  if (from) {
    clone.from = cloneRoute(from);
  }
  return clone;
};

const updateState = (
  state: IVuexEnhancedRouterSyncState,
  newState: IVuexEnhancedRouterSyncState
) => {
  if (state.name !== newState.name) {
    Vue.set(state, "name", newState.name);
  }
  if (state.path !== newState.path) {
    Vue.set(state, "path", newState.path);
  }
  if (state.hash !== newState.hash) {
    Vue.set(state, "hash", newState.hash);
  }
  if (state.fullPath !== newState.fullPath) {
    Vue.set(state, "fullPath", newState.fullPath);
  }
  if (typeof state.query !== "object") {
    Vue.set(state, "query", {});
  }
  updateObject(state.query, newState.query || {});
  if (typeof state.params !== "object") {
    Vue.set(state, "params", {});
  }
  updateObject(state.params, newState.params || {});
  if (typeof state.meta !== "object") {
    Vue.set(state, "meta", {});
  }
  updateObject(state.meta, newState.meta || {});
  if (newState.from) {
    if (!state.from) {
      Vue.set(state, "from", {});
    }
    if (state.from) {
      updateState(state.from, newState.from);
    }
  }
};

const updateObject = (
  state: { [index: string]: any },
  newState: { [index: string]: any }
) => {
  for (const key in state) {
    if (state.hasOwnProperty(key)) {
      if (state[key] !== newState[key]) {
        Vue.set(state, key, newState[key]);
      }
      if (state[key] === undefined) {
        delete state[key];
      }
    }
  }
  for (const key in newState) {
    if (newState.hasOwnProperty(key)) {
      if (state[key] !== newState[key]) {
        Vue.set(state, key, newState[key]);
      }
      if (state[key] === undefined) {
        delete state[key];
      }
    }
  }
};
