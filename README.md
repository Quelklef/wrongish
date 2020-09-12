
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
const M = W.unbound;  // an upside-down W
// All of the following are the same
obj[W.pipe](func);
obj[W.$pipe](func);
M.pipe(obj, func);
M.$pipe(obj, func);
```

Onto the methods!

***

### `Array#[filterIsA, filterIsAn, filterIs, filterOf, filterInstanceOf, filterTypeof]`

- type: `Array<T>[filterIsA]: <K>(kind: K) => K extends { new(...args: any): any } ? InstanceType<K>[] : K extends 'string' ? string[] : K extends 'number' ? number[] : K extends 'bigint' ? bigint[] : K extends 'boolean' ? boolean[] : K extends 'symbol' ? symbol[] : never`

This method has two different funcionalities:

1. If given a constructor function, filter to instances of the constructor
2. If given a string, filter to elements whos `typeof` returns the string

Useful because Typescript doesn't realize that `xs.filter(x => x instanceof Y)` is an `Array<Y>` or that `[1, 's'].filter(x => typeof x === 'number')` is an `Array<number>`. Calls to this method will be correctly typed.

### `Array#[includes2]`

- type: `Array<T>[includes2]: (item: any) => item is T`

Identical to `Array#includes` in every way except for its type.

While `Array<T>#includes` only accepts values of the `T` type, `Array<T>#[includes2]` accepts values of any type and, if the check passes, tells typescript that the checked vlaue is of type `T`.

```ts
const JsKeyword = 'let' | 'in' | 'function' | ...;
const jsKeywords: Array<JsKeyword> = ['let', 'in', 'function', ...];

// later

const text = getTextFromSomewhere();
const keywords: Array<JsKeyword> = text.split(' ').filter(word => jsKeywords[W.includes2](word));
```

**Note**: The choice of the name `includes2` is intentionally obtuse in order not to suggest different semantics from `Array#includes`, which a more meaingful name like `includesAny`, `includesOther`, or `includesForeign` may have done. If you feel there is a better name for `includes2`, please let me know.

### `Array#[mapfilter]`

- type: `Array<T>[mapfilter]: <S>(func: (x: T) => false | S) => Array<S>`

Map by the given function, and then filter out all values equal to false.

```js
const words = ['Hey', '@es6', '@tc39', 'quick', 'question'];
const ats = words[W.mapfilter](word => word.startsWith('@') && word.slice(1));
console.log(ats);  // ['es6', 'tc39']
```

Falsy values which are not equal to the value false are kept.

### `Array#[sortBy]`

- type: `Array<T>[sortBy]: (key: (item: T) => number) => Array<T>`

Sort an array by a particular key. Creates a new array.

```js
const items = ['am', 'I', 'wrong'];
const sorted = items[W.sortBy](word => word.length);
console.log(sorted.join(' ') + '.');  // "I am wrong."
```

### `Array#[uniq, dedup, deduplicated]`

- type: `Array<T>[uniq]: () => Array<T>`

Return an array equivalent to this array wherin only the first instance of each element is kept.

```js
const letters = Array.from('Mississippi');
const uniqd = letters[W.uniq]().join('');
console.log(uniqd); // 'Misp'
```

### `Array#[unwrap, only]`

- type: `Array<T>[unwrap]: () => T`

Return the only item in the array, if there is exactly one; else, throw an error.

***

### `Function#[debounce]`

- type: `Function[debounce]: <F extends (...args: any[]) => void>(this: F, delay: number) => F`

Collapses calls within `delay` milliseconds of each other into a single call.

### `Function#[invoke, call]`

- type: `Function[invoke]: <F extends (...args: any[]) => any>(this: F) => ReturnType<F>`

Call a function and return the result

I personally like to use this to run some async code within a sync block, like:
```js
M.invoke(async () => {
  const thing = await getThing();
  await do(stuff).with(thing);
}):
```

### `Function#[throttle]`

- type: `Function[throttle]: <F extends (...args: any[]) => void>(this: F, delay: number) => F`

Restrict a function to only run once every `delay` milliseconds.

***

### `Map#[getOr]`

- type: `Map<K, V>[getOr]: <Alt>(key: K, alt: () => Alt) => V | Alt`

Return a value from a map, if it exists, or an alternative value

### `Map#[getOrSet]`

- type: `Map<K, V>[getOrSet]: (key: K, alt: () => V) => V`

Get a value from a map, or create a new one if it doesn't exist.

### `Map#[setIfAbsent, default, initial, init]`

- type: `Map<K, V>[setIfAbsent]: (key: K, alt: () => V) => this`

If the given key isn't in the map already, set it to the given value

***

### `Number#[clamp]`

- type: `Number[clamp]: <Args extends [[number, number]] | [number, number]>(this: number | Number, ...args: Args) => number`

Return the nearest number within the specified range.
```ts
M.clamp(-20, [0, 100])  // 0
M.clamp(33, [0, 100])  // 33
M.clamp(115, [0, 100])  // 100
```

Works with `Ininity` and `-Infinity`:
```ts
M.clamp(-20, [0, Infinity])  // 0
M.clamp(1e6, [0, Infinity])  // 1e6
M.clamp(1e10, [0, Infinity])  // 1e10
// etc; similar with M.clamp(x, [-Infinity, hi])
```

You can either supply the range as a two-item array or as two arguments:
```ts
M.clamp(number, [lo, hi])
M.clamp(number, lo, hi)
number[W.clamp]([lo, hi])
number[W.clamp](lo, hi)
```

### `Number#[mod, modulo]`

- type: `Number[mod]: (this: number | Number, by: number) => number`

Modulo by a number.

```js
M.mod(-2, 3) === 1;
M.mod(-1, 3) === 2;
M.mod(0, 3) === 0;
M.mod(1, 3) === 1;
M.mod(2, 3) === 2;
M.mod(3, 3) === 0;
```

***

### `Object#[a, an]`

- type: `Object[a]: <T>(this: T | null | undefined, err?: string) => T`

Assert that a value is non-nully.

If the supplied value is `null` or `undefined`, throw an error. Else, return the argument.

### `Object#[chain]`

- type: `Object[chain]: <Arg, Param, Ret>(this: Arg, func: (me: Param) => Ret) => Arg extends null ? null : Arg extends undefined ? undefined : Ret`

Like `Object#[pipe]`, unless the input is `null` or `undefined`, in which case it returns the input.

### `Object#[pipe, letIn]`

- type: `Object[pipe]: <T, R>(this: T, func: (me: T) => R) => R`

Pass the object into a function: `obj[W.pipe](func)` is the same as `func(object)`.

This is useful e.g. in FP chains:

```js
const sentence = "At the beach #beachlife #livelaughlove";
const tags = sentence.split(' ')
  .map(word => word.strim())
  .filter(word => word.startsWith('#'))
  [W.pipe](tags => new Set(tags));
```

### `Object#[to, as]`

- type: `Object[to]: <T>(targetConstructor: Function) => T`

Converts an object of one type to another type.

Supported conversions:
- `Iterable` -> `Array`
- `Iterable` -> `Set`

```js
const items = [1, 1, 2, 2, 3, 3];
const uniq = items[W.to](Set)[W.to](Array);
console.log(uniq);  // [1, 2, 3]
```

***

### `Set#[every, all]`

- type: `Set<T>[every]: (pred: (item: T) => boolean) => boolean`

Like `Array#every`, but for `Set`.

### `Set#[filter]`

- type: `Set<T>[filter]: (pred: (item: T) => boolean) => Set<T>`

Like `Array#filter`, but for `Set`.

### `Set#[has2]`

- type: `Set<T>[has2]: (item: any) => item is T`

Identical to `Set#has` in every way except for its type.

While `Set<T>#has` only accepts values of the `T` type, `Set<T>#[has2]` accepts values of any type and, if the check passes, tells typescript that the checked vlaue is of type `T`.

```ts
const JsKeyword = 'let' | 'in' | 'function' | ...;
const jsKeywords: Set<JsKeyword> = new Set(['let', 'in', 'function', ...]);

// later

const text = getTextFromSomewhere();
const keywords: Set<JsKeyword> = text.split(' ').filter(word => jsKeywords[W.has2](word));
```

**Note**: The choice of the name `has2` is intentionally obtuse in order not to suggest different semantics from `Set#has`, which a more meaingful name like `hasAny`, `hasOther`, or `hasForeign` may have done. If you feel there is a better name for `has2`, please let me know.

### `Set#[intersect, and]`

- type: `Set<T>[intersect]: (other: Set<T>) => Set<T>`

Set intersection.

### `Set#[map]`

- type: `Set<T>[map]: <S>(mapper: (item: T) => S) => Set<S>`

Like `Array#map`, but for `Set`

### `Set#[mapfilter]`

- type: `Set<T>[mapfilter]: <S>(func: (x: T) => false | S) => Array<S>`

Like `Array#[mapfilter]`, but for `Set`

### `Set#[minus]`

- type: `Set<T>[minus]: (other: Set<T>) => Set<T>`

Set subtraction.

### `Set#[some, any]`

- type: `Set<T>[some]: (pred: (item: T) => boolean) => boolean`

Like `Array#some`, but for `Set`

### `Set#[subset, lt]`

- type: `Set<T>[subset]: (other: Set<T>) => boolean`

Is this set `<` another set?

### `Set#[subsetEq, subseteq, le, leq]`

- type: `Set<T>[subsetEq]: (other: Set<T>) => boolean`

Is this set `<=` another set?

### `Set#[superset, supset, gt]`

- type: `Set<T>[superset]: (other: Set<T>) => boolean`

Is this set `>` another set?

### `Set#[supersetEq, supsetEq, supseteq, ge, geq]`

- type: `Set<T>[supersetEq]: (other: Set<T>) => boolean`

Is this set `>=` another set?

### `Set#[union, or]`

- type: `Set<T>[union]: (other: Set<T>) => Set<T>`

Set union

### `Set#[with]`

- type: `Set<T>[with]: (item: T) => Set<T>`

Add an item to a set.

### `Set#[without]`

- type: `Set<T>[without]: (item: T) => Set<T>`

Remove an item from a set.

***

### `WeakMap#[getOr]`

- type: `WeakMap<K extends object, V>[getOr]: <Alt>(key: K, alt: () => Alt) => V | Alt`

Return a value from a weak map, if it exists, or an alternative value

### `WeakMap#[getOrSet]`

- type: `WeakMap<K extends object, V>[getOrSet]: (key: K, alt: () => V) => V`

Get a value from a weak map, or create a new one if it doesn't exist.

### `WeakMap#[setIfAbsent, default, initial, init]`

- type: `WeakMap<K extends object, V>[setIfAbsent]: (key: K, alt: () => V) => this`

If the given key isn't in the map already, set it to the given value

***

### `WeakSet#[has2]`

- type: `WeakSet<T extends object>[has2]: (item: any) => item is T`

Like `Set#[has2]`, but for `WeakSet`.
