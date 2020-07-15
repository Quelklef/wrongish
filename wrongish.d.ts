
declare module 'wrongish';

export const $to        : unique symbol; export const to        : typeof $to;
export const $as        : unique symbol;
export const $or        : unique symbol; export const or        : typeof $or;
export const $and       : unique symbol; export const and       : typeof $and;
export const $map       : unique symbol; export const map       : typeof $map;
export const $pipe      : unique symbol; export const pipe      : typeof $pipe;
export const $with      : unique symbol;
export const $some      : unique symbol; export const some      : typeof $some;
export const $minus     : unique symbol; export const minus     : typeof $minus;
export const $union     : unique symbol; export const union     : typeof $union;
export const $every     : unique symbol; export const every     : typeof $every;
export const $filter    : unique symbol; export const filter    : typeof $filter;
export const $extend    : unique symbol; export const extend    : typeof $extend;
export const $without   : unique symbol; export const without   : typeof $without;
export const $intersect : unique symbol; export const intersect : typeof $intersect;
export const $mapfilter : unique symbol; export const mapfilter : typeof $mapfilter;

interface Object {
  [$pipe]<R>(func: (me: this) => R): R;
}

interface Array<T> {
  [$mapfilter]<S>(func: (x: T) => false | S): Array<S>;
  [$extend](other: Array<T>): void;
}

interface Set<T> {
  [$map]<S>(func: (x: T) => S): Set<S>;
  [$filter](func: (x: T) => boolean): Set<T>;
  [$mapfilter]<S>(func: (x: T) => false | S): Set<S>;
  [$minus](other: Set<T>): Set<T>;
  [$intersect](other: Set<T>): Set<T>;
  [$and](other: Set<T>): Set<T>;
  [$union](other: Set<T>): Set<T>;
  [$or](other: Set<T>): Set<T>;
  [$with](item: T): Set<T>;
  [$without](item: T): Set<T>;
  [$some](pred: (x: T) => boolean): boolean;
  [$every](pred: (x: T) => boolean): boolean;
}

