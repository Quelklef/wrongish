
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

**Note**: for each extension name `$name` that Wrongish exports, it also exports a name without the dollar sign.
This way, one can `import * as $ from 'wrongish'`.

***

### `Object[$pipe]`

Pass the object into a function: `obj[$pipe](func)` is the same as `func(object)`.

This is useful e.g. in FP chains:

```js
const sentence = "At the beach #beachlife #livelaughlove";
const tags = sentence.split(' ')
  .map(word => word.trim())
  .filter(word => word.startsWith('#')
  [$pipe](tags => new Set(tags));
```

### `Object[$to]`

**Aliases**: `$as`

Converts an object of one type to another type.

Supported conversions:
- `Set` -> `Array`
- `Array` -> `Set`

```js
const items = [1, 1, 2, 2, 3, 3];
const deduplicated = items[$to](Set)[$to](Array);
console.log(items);  // [1, 2, 3]
```

***

### `Array[$mapfilter]`

Map by the given function, and then filter out all values equal to `false`.

```js
const words = ['Hey', '@es6', '@tc39', 'quick', 'question'];
const ats = words[$mapfilter](word => word.startsWith('@') && word.slice(1));
console.log(ats);  // ['es6', 'tc39']
```

Falsy values which are not equal to the value `false` are kept.

***

### `Set[$map]`

Like `Array#map`, but for `Set`. 

### `Set[$filter]`

Like `Array#filter`, but for `Set`.

### `Set[$mapfilter]`

Like `Array#[$mapfilter]`, but for `Set`.

### `Set[$minus]`

Find this set minus another set.

### `Set[$intersect]`

**Aliases**: `$and`

Find the intersection of this set with another set.

### `Set[$union]`

**Aliases**: `$or`

Find the union of this set with another set.

### `Set[$with]`

Add an item to a set.

```js
const words = new Set(['beneath']);
console.log(words[$with]('above'));  // Set(['beneath', 'above'])
```

### `Set[$without]`

Remove an item from a set.

```js
const words = new Set(['beneath', 'above']);
console.log(words[$without]('above'));  // Set(['beneath'])
```

### `Set[$some]`

Like `Array#some`, but for `Set`.

### `Set[$every]`

Like `Array#every`, but for `Set`.
