'use strict';

const __ex = module.exports;

const __nativeSymbols = __ex.W = {};  // Wrongish symbols : name => Symbol
const __nativeUnbound = __ex.M = {};  // Unbound syntax : name => Function

const __customSymbols = __ex.WU = {};  // User-defined symbols
const __customUnbound = __ex.MU = {};  // User-defined unbound syntax

// Patches: list of { host, syms, impl }
// Used in a test
const __patches = __ex.__patches = [];

function __registerSymbol(name, native) {

  const symbols = native ? __nativeSymbols : __customSymbols;
  const unbound = native ? __nativeUnbound : __customUnbound;

  const symbol = symbols[name] = Symbol(name);

  unbound[name] = function(thisArg, ...args) {
    const host =
      thisArg === null || thisArg === undefined ? Object
      : Object.getPrototypeOf(thisArg).constructor;
    const impl = host.prototype[symbol];  // Note that this does inheritance for us :)
    if (!impl)
      throw Error(`Operation [${name}] not supported on type ${host.name}`);
    return impl.apply(thisArg, args);
  }

  return symbol;

}

function __applyPatch(host, names, impl, native) {

  const symbols = native ? __nativeSymbols : __customSymbols;

  const patchSymbols = names.split(' ').map(name => symbols[name]);
  __patches.push({ host, symbols: patchSymbols, impl });

  for (const symbol of patchSymbols) {
    Object.defineProperty(host.prototype, symbol, {
      enumerable: false,
      writable: true,
      value: impl,
    });
  }

}


// User-defined operations
function define(host, name, impl) {
  const sym = __customSymbols[name] || __registerSymbol(name, false);
  __applyPatch(host, name, impl, false);
}
__ex.define = define;  // For some reaosn, Mocha seems to freak the fuck out if this assignment isn't on its own line


// Builtin wrongish operations
(function() {
'use strict';
// Strict mode is ABSOLUTELY REQUIRED at this point
// This is because strict mode allows passing non-object values as the value for 'this',
// which we need in cases of e.g. calling $some(null)
// See https://stackoverflow.com/a/38497834/4608364 and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global__Objects/Function/call#Parameters

// %ENTRY //

})();
