'use strict';

const __ex = module.exports;

const W = __ex.W = {};
const M = __ex.M = {};

// Symbols: object, name => symbol
const __symbols = {};

// Patches: list of { host, syms, impl }
// Used in a test
const __patches = __ex.__patches = [];

function __symbol(name) {

  const symbol = __symbols[name] = W[name] = Symbol(name);

  M[name] = function(thisArg, ...args) {
    const host =
      thisArg === null || thisArg === undefined ? Object
      : Object.getPrototypeOf(thisArg).constructor;
    const impl = host.prototype[symbol];  // Note that this does inheritance for us :)
    if (!impl)
      throw Error(`Operation [${name}] not supported on type ${host.name}`);
    return impl.apply(thisArg, args);
  }

}

// Apply a patch
function __patch(host, names, impl) {
  const symbols = names.split(' ').map(name => __symbols[name]);
  __patches.push({ host, symbols, impl });
  for (const symbol of symbols) {
    Object.defineProperty(host.prototype, symbol, {
      enumerable: false,
      writable: true,
      value: impl,
    });
  }
}


// Patches
(function() {
'use strict';
// Strict mode is ABSOLUTELY REQUIRED at this point
// This is because strict mode allows passing non-object values as the value for 'this',
// which we need in cases of e.g. calling $some(null)
// See https://stackoverflow.com/a/38497834/4608364 and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call#Parameters

// %ENTRY //

})();
