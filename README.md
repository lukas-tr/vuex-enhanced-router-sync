# vuex-enhanced-router-sync

<div align="left">

[![Travis (.com) branch](https://img.shields.io/travis/com/lukas-tr/vuex-enhanced-router-sync/master.svg)](https://travis-ci.com/lukas-tr/vuex-enhanced-router-sync)
[![Codecov branch](https://img.shields.io/codecov/c/github/lukas-tr/vuex-enhanced-router-sync/master.svg)](https://codecov.io/gh/lukas-tr/vuex-enhanced-router-sync)
[![codebeat badge](https://codebeat.co/badges/ab47d01b-9a17-43e0-b235-ace83771923d)](https://codebeat.co/projects/github-com-lukas-tr-vuex-enhanced-router-sync-master)
[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/lukas-tr/vuex-enhanced-router-sync/blob/master/LICENSE)
![type definitions](https://img.shields.io/badge/types-TypeScript-blue.svg)
![npm](https://img.shields.io/npm/v/vuex-enhanced-router-sync.svg)

</div>

This package replaces `vuex-router-sync` and adds some useful features.

## Why this exists

I dislike the fact that `vuex-router-sync` replaces the store state instead of updating it. This leads to the recomputation of _all_ computed properties and getters related to the router state, even though it isn't really necessary.

Let's say you have a very expensive getter that depends on on the `?search=foo` query parameter and takes 1 second to complete. The user then clicks on a search result and `&open=1` is added to the query. `vuex-enhanced-router-sync` leaves `search` alone and updates `open` while `vuex-router-sync` would update both `search` and `open`, which leads to longer blocking of the UI.

## Installation

```bash
npm install vuex-enhanced-router-sync
# or
yarn add vuex-enhanced-router-sync
```

## Usage

See [vue-router-sync](https://github.com/vuejs/vuex-router-sync/blob/master/README.md)

```typescript
import { sync } from "vuex-enhanced-router-sync";

sync(store, router, { immutable: false, moduleName: "route" });
// or
sync(store, router, "route"); // only supply moduleName
// or
sync(store, router); // default options
```

You should not modify the store state. Instead, use `$router.push()` and `$router.go()` to update the current route.

### Parameters

- `store: Store<any>`
- `router: VueRouter`
- `options: string | options` (optional)

  - `immutable: boolean` (default `false`)

    Set this to true if you want vuex-enhanced-router-sync to treat the state like an immutable object.

  - `moduleName: string` (default `"route"`)

    The state can be accessed via `vm.$store.state.<module name>.path`. See below for all available properties. This can also be set by supplying a string to options.

### Available properties

From [vue-router](https://router.vuejs.org/api/#route-object-properties):

- `store.state.<module name>`
  - `name: string`: The name of the current route, if it has one.
  - `path: string`: A string that equals the path of the current route.
  - `hash: string`: The hash of the current route.
  - `fullPath: string`: The full resolved URL including query and hash.
  - `query: object`: An object that contains key/value pairs of the query string.
  - `params: object`: An object that contains key/value pairs of dynamic segments and star segments.
  - `meta: object`: The meta of the current route.
  - `from: object`: The previous route.
