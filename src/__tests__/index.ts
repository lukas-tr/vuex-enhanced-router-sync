/**
 * Based on https://github.com/vuejs/vuex-router-sync/blob/master/test/test.js
 */

import Vue, { CreateElement } from "vue";
import VueRouter from "vue-router";
import Vuex, { mapState, Store } from "vuex";

import {
  defaultOptions,
  IVuexEnhancedRouterSyncOptions,
  IVuexEnhancedRouterSyncState,
  sync
} from "../index";

Vue.use(Vuex);
Vue.use(VueRouter);

const run = (
  options: IVuexEnhancedRouterSyncOptions,
  done: jest.DoneCallback
) => {
  const moduleName = (options as any).moduleName || defaultOptions.moduleName;

  const store = new Store({
    state: { msg: "foo" }
  }) as any;

  const Home = {
    computed: mapState(moduleName, {
      bar: (state: IVuexEnhancedRouterSyncState) => state.params.bar,
      foo: (state: IVuexEnhancedRouterSyncState) => state.params.foo,
      path: (state: IVuexEnhancedRouterSyncState) => state.fullPath
    }),
    render(this: any, h: CreateElement) {
      return h("div", [this.path, " ", this.foo, " ", this.bar]);
    }
  };

  const router = new VueRouter({
    mode: "abstract",
    routes: [{ path: "/:foo/:bar", component: Home }]
  });

  sync(store, router, options);

  router.push("/a/b");
  expect(store.state[moduleName].fullPath).toBe("/a/b");
  expect(store.state[moduleName].params).toEqual({ foo: "a", bar: "b" });

  const app = new Vue({
    render: h => h("router-view"),
    router,
    store
  }).$mount();

  expect(app.$el.textContent).toBe("/a/b a b");

  router.push("/c/d?n=1#hello");
  expect(store.state[moduleName].fullPath).toBe("/c/d?n=1#hello");
  expect(store.state[moduleName].params).toEqual({ foo: "c", bar: "d" });
  expect(store.state[moduleName].query).toEqual({ n: "1" });
  expect(store.state[moduleName].hash).toEqual("#hello");

  Vue.nextTick(() => {
    expect(app.$el.textContent).toBe("/c/d?n=1#hello c d");

    router.push("/");

    expect(store.state[moduleName].fullPath).toBe("/");
    expect(store.state[moduleName].from).toMatchObject({
      fullPath: "/c/d?n=1#hello",
      hash: "#hello",
      params: { bar: "d", foo: "c" },
      query: { n: "1" }
    });
    expect(store.state[moduleName].from).not.toHaveProperty("from");

    done();
  });
};

test("invalid usage", () => {
  const store = new Store({}) as any;
  const router = new VueRouter() as any;
  expect(() => {
    sync(store, router, { moduleName: {}, immutable: {} } as any);
  }).toThrowError(Error);
});

test("default usage", done => {
  run(defaultOptions, done);
});

test("with custom moduleName", done => {
  run({ moduleName: "customModuleName" }, done);
});

test("with immutable state", done => {
  run({ immutable: true }, done);
});

test("unsync", done => {
  const store = new Store({}) as any;
  spyOn(store, "watch").and.callThrough();

  const router = new VueRouter() as any;

  const moduleName = "testDesync";
  const unsync = sync(store, router, {
    moduleName
  });

  expect(unsync).toBeInstanceOf(Function);

  // Test module registered, store watched, router hooked
  expect(store.state[moduleName]).toBeDefined();
  expect(store.watch).toHaveBeenCalled();
  expect(store._watcherVM).toBeDefined();
  expect(store._watcherVM._watchers).toBeDefined();
  expect(store._watcherVM._watchers.length).toBe(1);
  expect(router.afterHooks).toBeDefined();
  expect(router.afterHooks.length).toBe(1);

  // Now unsync vuex-router-sync
  unsync();

  // Ensure router unhooked, store-unwatched, module unregistered
  expect(router.afterHooks.length).toBe(0);
  expect(store._watcherVm).toBeUndefined();
  expect(store.state[moduleName]).toBeUndefined();

  done();
});
