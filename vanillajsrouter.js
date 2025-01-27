/*
 * VanillaRouterJS v1.0.1 - developed by anoxxxy aka Anoxy
 * Inspired by RouterJS by Silvio Delgado (https://github.com/silviodelgado)
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 * https://github.com/anoxxxy/vanillajsrouter
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory(root));
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    root.Router = factory(root);
  }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {
  'use strict';

  const HASH_PREFIX = '^#';
  const SLASH_SUFFIX = /\/$/;

  const internal = {
    current: null,
    routes: [],
    history: [],
    preventBackHashes: new Set(),
    onBackAttempt: null,
    run_before: null,
    run_after: null,
  };

  const normalizeHash = (hash) => hash.replace(new RegExp(HASH_PREFIX), '').replace(SLASH_SUFFIX, '');
  const isFunction = (fn) => typeof fn === 'function';
  const runHook = (hook, route) => isFunction(hook) && hook.call(null, route);

  const router = {
    getFragment: () => normalizeHash(window.location.hash),

    parseRoute: (route) => {
		  if (typeof route !== 'string' || !route.includes(':')) {
		    return { regex: route, paramNames: [] };
		  }
		  const paramNames = [];
		  const regex = route.replace(/:[^/]+/g, (match) => {
		    paramNames.push(match.slice(1));
		    return '([^/]+)';
		  });
		  return { regex: new RegExp(`^${regex}$`), paramNames };
		},

    setPreventBackHashes: (hashes, options = {}) => {
      internal.preventBackHashes = new Set(hashes.map(normalizeHash));
      if (options.onBackAttempt) internal.onBackAttempt = options.onBackAttempt;
      return router;
    },

    isCheckpoint: (hash) => internal.preventBackHashes.has(normalizeHash(hash || router.getFragment())),

    add: (route, handler, run_before, run_after) => {
      const { regex, paramNames } = router.parseRoute(route);
      internal.routes.push({ originalRoute: route, handler, route: regex, paramNames, run_before, run_after });
      return router;
    },

    beforeAll: (handler) => {
      internal.run_before = handler;
      return router;
    },

    afterAll: (handler) => {
      internal.run_after = handler;
      return router;
    },

    apply: (frg) => {
      const fragment = frg || router.getFragment();
      if (internal.current) return router;

      for (const routeObj of internal.routes) {
        const matches = fragment.match(routeObj.route);
        if (matches) {
          matches.shift();
          const params = Object.fromEntries(routeObj.paramNames.map((name, i) => [name, matches[i]]));
          internal.current = fragment;
          if (!internal.history.includes(fragment)) internal.history.push(fragment);

          runHook(internal.run_before, routeObj);
          routeObj.handler.call({}, matches, params, routeObj.originalRoute);
          runHook(internal.run_after, routeObj);
          return router;
        }
      }
      return router;
    },

    start: () => {
      const handlePopState = (e) => {
        const currentHash = router.getFragment();
        if (router.isCheckpoint(currentHash)) {
          e.preventDefault();
          history.pushState(null, document.title, window.location.href);
          if (isFunction(internal.onBackAttempt)) {
            internal.onBackAttempt({ currentHash, message: `Navigation prevented: Cannot go back from ${currentHash}` });
          }
        }
      };

      const handleHashChange = () => {
        const fragment = router.getFragment();
        if (internal.current !== fragment) {
          internal.current = null;
          router.apply(fragment);
        }
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('hashchange', handleHashChange);

      history.replaceState(null, document.title, window.location.href);
      if (!internal.current) router.apply();
      return router;
    },

    navigate: (path, title) => {
      document.title = title || document.title;
      window.location.hash = path ? `#${path.replace(/##/g, '#')}` : '';
      return router;
    },

    clearHash: () => {
      window.location.hash = '#';
      history.pushState(null, document.title, window.location.pathname + window.location.search);
    },

    back: () => {
      const currentHash = router.getFragment();
      if (router.isCheckpoint(currentHash)) {
        if (isFunction(internal.onBackAttempt)) {
          internal.onBackAttempt({ currentHash, message: `Navigation prevented: Cannot go back from ${currentHash}` });
        }
        return router;
      }
      internal.history.pop();
      const path = internal.history.pop() || '';
      window.location.hash = path;
      return router;
    },

    checkFragment: (current) => router.getFragment().includes(current),

    routes: () => internal.routes,
  };

  return router;
});