/*!
 * VanillaRouterJS v1.0.0 - developed by anoxxxy aka Anoxy
 * Inspired by RouterJS by Silvio Delgado (https://github.com/silviodelgado)
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 * https://github.com/anoxxxy/vanillajsrouter
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory(root));
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    root.Router = factory(root);
  }
})(typeof global !== "undefined" ? global : this.window || this.global, function(root) {
  'use strict';

  let internal = {
    current: null,
    routes: [],
    history: [],
    run_before: null,
    run_after: null
  };

  const run_before = (route) => {
    if (typeof internal.run_before == 'function') {
      internal.run_before.call(this);
    }
    if (route && route.run_before && typeof route.run_before == 'function') {
      route.run_before.call(this);
    }
  };

  const run_after = (route) => {
    if (route && route.run_after && typeof route.run_after == 'function') {
      route.run_after.call(this);
    }
    if (typeof internal.run_after == 'function') {
      internal.run_after.call(this);
    }
  };

  const router = {
    getFragment: () => {
      return window.location.hash.replace(/^#/, '').replace(/\/$/, '');
    },
    parseRoute: (route) => {
      if (typeof route === 'string' && route.includes(':')) {
        const paramNames = [];
        const regex = route.replace(/:[^/]+/g, (match) => {
          paramNames.push(match.substring(1));
          return '([^/]+)';
        });
        return {
          regex: new RegExp(`^${regex}$`),
          paramNames
        };
      }
      return {
        regex: route,
        paramNames: []
      };
    },
    add: (route, handler, run_before, run_after) => {
      if (typeof route === 'function') {
        handler = route;
        route = '';
      }

      const {
        regex,
        paramNames
      } = router.parseRoute(route);

      internal.routes.push({
        handler: handler,
        route: regex,
        paramNames: paramNames,
        run_before,
        run_after,
      });

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
      let fragment = frg || router.getFragment();
      if (internal.current) return router;

      for (let i = 0; i < internal.routes.length; i++) {
        const {
          route,
          handler,
          paramNames
        } = internal.routes[i];
        const matches = fragment.match(route);

        if (matches) {
          matches.shift();
          const params = {};

          if (paramNames.length > 0) {
            paramNames.forEach((name, index) => {
              params[name] = matches[index];
            });
          }

          internal.current = fragment;
          if (!internal.history[fragment]) internal.history.push(fragment);

          run_before(internal.routes[i]);
          handler.call({}, matches, params);
          run_after(internal.routes[i]);

          return router;
        }
      }
      return router;
    },
    start: () => {
      let current = router.getFragment();
      window.onhashchange = function() {
        let frg = router.getFragment();
        if (!frg) {
          internal.current = null;
          current = null;
        }
        if (internal.current != frg) {
          internal.current = null;
          router.apply(frg);
        }
      }
      if (current && !internal.current) {
        router.apply();
      }
      return router;
    },
    navigate: (path, title) => {
      document.title = title || document.title;
      path = path.replace(/##/g, '#') || '';
      window.location.hash = path ? '#' + path : '';
      return router;
    },
    clearHash: () => {
      window.location.hash = '#';
      history.pushState(null, document.title, window.location.pathname + window.location.search);
    },
    back: () => {
      internal.history.pop();
      let path = internal.history.pop();
      path = path || '';
      window.location.hash = path;
      return router;
    },
    checkFragment: (current) => {
      return router.getFragment().indexOf(current) >= 0;
    },
    routes: () => {
      return internal.routes;
    }
  };

  return router;
});