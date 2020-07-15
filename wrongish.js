
const ex = module.exports;

const $to        = ex.$to        = ex.to        = Symbol('$to');
const $as        = ex.$as        = ex.as        = Symbol('$as');
const $or        = ex.$or        = ex.or        = Symbol('$or');
const $and       = ex.$and       = ex.and       = Symbol('$and');
const $map       = ex.$map       = ex.map       = Symbol('$map');
const $pipe      = ex.$pipe      = ex.pipe      = Symbol('$pipe');
const $with      = ex.$with      = ex.with      = Symbol('$with');
const $some      = ex.$some      = ex.some      = Symbol('$some');
const $minus     = ex.$minus     = ex.minus     = Symbol('$minus');
const $union     = ex.$union     = ex.union     = Symbol('$union');
const $every     = ex.$every     = ex.every     = Symbol('$every');
const $filter    = ex.$filter    = ex.filter    = Symbol('$filter');
const $extend    = ex.$extend    = ex.extend    = Symbol('$extend');
const $without   = ex.$without   = ex.without   = Symbol('$without');
const $intersect = ex.$intersect = ex.intersect = Symbol('$intersect');
const $mapfilter = ex.$mapfilter = ex.mapfilter = Symbol('$mapfilter');

function patch(type, name, aliases, func) {
  const props = [name, ...aliases];
  for (const prop of props)
    Object.defineProperty(type.prototype, prop, {
      enumerable: false,
      value: func,
    });
}




// == Object == //

patch(Object, $pipe, [], function(func) {
  return func(this);
});

patch(Object, $to, [$as], function(toType) {

  const fromType = Object.getPrototypeOf(this).constructor;

  if (fromType === Array && toType === Set)
    return new Set(this);

  if (fromType === Set && toType === Array)
    return Array.from(this);

  throw Error(`Unknown conversion ${fromType.name} to ${toType.name}.`);

});


// == Array == //

patch(Array, $mapfilter, [], function(mapper) {
  return this.map(mapper).filter(v => v !== false);
});

patch(Array, $extend, [], function(other) {
  this.push(...other);
});


// == Set == //

patch(Set, $map, [], function(mapper) {
  return new Set([...this].map(mapper));
});

patch(Set, $filter, [], function(pred) {
  return new Set([...this].filter(pred));
});

patch(Set, $mapfilter, [], function(mapper) {
  return this[$map](mapper)[$filter](v => v !== false);
});

patch(Set, $minus, [], function(other) {
  return this[$filter](x => !other.has(x));
});

patch(Set, $intersect, [$and], function(other) {
  if (this.size >= other.size)
    return this[$filter](x => other.has(x));
  else
    return other[$filter](x => this.has(x));
});

patch(Set, $union, [$or], function(other) {
  return new Set([...this, ...other]);
});

patch(Set, $with, [], function(item) {
  return new Set([...this, item]);
});

patch(Set, $without, [], function(item) {
  return this[$filter](x => x !== item);
});

patch(Set, $some, [], function(pred) {
  return [...this].some(pred);
});

patch(Set, $every, [], function(pred) {
  return [...this].every(pred);
});
