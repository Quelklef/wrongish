'use strict';

const __ex = module.exports;

// Unbound versions of the impls
const __unbound = __ex.unbound = {};

// Symbols: object, name => symbol
const __symbols = {};

function __symbol(name, symbol) {
  __symbols[name] = symbol;
  const unbound = function(thisArg, ...args) {
    const host =
      thisArg === null || thisArg === undefined ? Object
      : Object.getPrototypeOf(thisArg).constructor;
    const impl = host.prototype[symbol];  // Note that this does inheritance for us :)
    if (!impl)
      throw Error(`Operation $${name} not supported on type ${host.name}`);
    return impl.apply(thisArg, args);
  }
  __unbound[name] = unbound;
  __unbound['$' + name] = unbound;
}

// Apply a patch
function __patch(host, names, impl) {
  for (const name of names) {
    const symbol = __symbols[name];
    Object.defineProperty(host.prototype, symbol, {
      enumerable: false,
      writable: true,
      value: impl,
    });
  }
}


(function() {
'use strict';
// Strict mode is ABSOLUTELY REQUIRED at this point
// This is because strict mode allows passing non-object values as the value for 'this',
// which we need in cases of e.g. calling $some(null)
// See https://stackoverflow.com/a/38497834/4608364 and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call#Parameters
  
// %ENTRY //
  
})();
