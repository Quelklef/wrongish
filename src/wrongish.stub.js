const ex = module.exports;

function patch(type, syms, func) {
  for (const prop of syms)
    Object.defineProperty(type.prototype, prop, {
      enumerable: false,
      value: func,
    });
}

// %ENTRY
