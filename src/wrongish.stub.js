const __ex = module.exports;

// Unbound versions of the patches
const __unbound = __ex.unbound = {};

// Symbols, name => symbol
const __symbols = {};

// Patches, type => symbol => method
const __patches = {};

function __symbol(name, symbol) {
  __symbols[name] = symbol;
  const unbound = function(thisArg, ...args) {
    const type = Object.getPrototypeOf(thisArg).constructor;
    if (!(type in __patches))
      throw new Error(`Operation $${name} not supported for type ${type.name}`);
    const patch = __patches[type][symbol];
    return patch.apply(thisArg, args);
  }
  __unbound[name] = unbound;
  __unbound['$' + name] = unbound;
}

// Apply a patch
function __patch(type, names, func) {
  for (const name of names) {
    const symbol = __symbols[name];

    if (!__patches[type]) __patches[type] = {};
    __patches[type][symbol] = func;

    Object.defineProperty(type.prototype, symbol, {
      enumerable: false,
      value: func,
    });
  }
}



// %ENTRY
