
# Wrongish: naughty util

Wrongish provides utlity functions with pleasing syntax by (ab)using ES6 features.

Example:

```js
const { $map } = require('wrongish');
const items = new Set(1, 2, 3);
items[$map](x => x * x);  // Set(1, 4, 9)
```

## The horror!

Wrongish works by extending native prototypes, which [is one if the cardinal sins of Javascript programming](https://stackoverflow.com/questions/14034180/why-is-extending-native-objects-a-bad-practice).

However, Wrongish is able to sidestep most of the dangers of extending native prototypes via ES6 features:

- Namespace conflicts are avoided by having each extension name (e.g. `$map`) be an ES6 `Symbol`
- All Wrongish extensions are non-enumerable properties, so behaviour of `for in` or `Object.keys` on prototypes will not change

# Reference

**Note**: names are exported both with and without a dollar sign, and methods are exported both bound and unbound (See below)

```js
const W = require('wrongish');
// All of the following are the same
obj[W.pipe](func);
obj[W.$pipe](func);
W.unbound.pipe(obj, func);
W.unbound.$pipe(obj, func);
```

Onto the methods!

***

### `Array[$mapfilter]`

Type: `Array<T>[$mapfilter]<S>(func: (x: T) => false | S) => Array<S>`

Map by the given function, and then filter out all values equal to false.

```js
const words = ['Hey', '@es6', '@tc39', 'quick', 'question'];
const ats = words[$mapfilter](word => word.startsWith('@') && word.slice(1));
console.log(ats);  // ['es6', 'tc39']
```

Falsy values which are not equal to the value false are kept.

***

### `Object[$pipe]`

Type: `Object[$pipe]<R>(func: (me: Object) => R) => R`

Pass the object into a function: `obj[$pipe](func)` is the same as `func(object)`.

This is useful e.g. in FP chains:

```js
const sentence = "At the beach #beachlife #livelaughlove";
const tags = sentence.split(' ')
  .map(word => word.strim())
  .filter(word => word.startsWith('#'))
  [$pipe](tags => new Set(tags));
```

### `Object[$to]`

Aliases: `$as` 


Type: `Object[$to]<T>(targetConstructor: Function) => T`

Converts an object of one type to another type.

Supported conversions:
- `Set` -> `Array`
- `Array` -> `Set`

```js
const items = [1, 1, 2, 2, 3, 3];
const uniq = items[$to](Set)[$to](Array);
console.log(uniq);  // [1, 2, 3]
```

***

### `Set[$every]`

Aliases: `$all` 


Type: `Set<T>[$every](pred: (item: T) => boolean) => boolean`

Like `Array#every`, but for `Set`.

### `Set[$filter]`

Type: `Set<T>[$filter](pred: (item: T) => boolean) => Set<T>`

Like `Array$filter`, but for `Set`.

### `Set[$intersect]`

Aliases: `$and` 


Type: `Set<T>[$intersect](other: Set<T>) => Set<T>`

Set intersection.

### `Set[$map]`

Type: `Set<T>[$map]<S>(mapper: (item: T) => S) => Set<S>`

Like `Array#map`, but for `Set`

### `Set[$minus]`

Type: `Set<T>[$minus](other: Set<T>) => Set<T>`

Set subtraction.

### `Set[$some]`

Aliases: `$any` 


Type: `Set<T>[$some](pred: (item: T) => boolean) => boolean`

Like `Array#some`, but for `Set`

### `Set[$union]`

Aliases: `$or` 


Type: `Set<T>[$union](other: Set<T>) => Set<T>`

Set union

### `Set[$with]`

Type: `Set<T>[$with](item: T) => Set<T>`

Add an item to a set.

### `Set[$without]`

Type: `Set<T>[$without](item: T) => Set<T>`

Remove an item from a set.
