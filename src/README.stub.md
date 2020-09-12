
# Wrongish: naughty util

Wrongish provides utlity functions with pleasing syntax by (ab)using ES6 features.

Example:

```js
const { W } = require('wrongish');
const items = new Set(1, 2, 3);
items[W.map](x => x * x);  // Set(1, 4, 9)
```

### The horror!

Wrongish works by extending native prototypes, which [is one if the cardinal sins of Javascript programming](https://stackoverflow.com/questions/14034180/why-is-extending-native-objects-a-bad-practice).

However, Wrongish is able to sidestep most of the dangers of extending native prototypes via ES6 features:

- Namespace conflicts are avoided by having each extension name (e.g. `$map`) be an ES6 `Symbol`
- All Wrongish extensions are non-enumerable properties, so behaviour of `for in` or `Object.keys` on prototypes will not change

## Syntaxes

Wrongish operations support two syntaxes: bound and unbound: Bound syntax uses `W`, for "Wrongish", and unbound uses `M`, an upside-down `W`.

```js
const { W, M } = require('wrongish');
const mySet = new Set([1, 2, 3]);
// These lines do the same thing:
mySet[W.filter](x => x % 2 === 0);
M.filter(mySet, x => x % 2 === 0);
```

## User-Defined Operations

One may define their own operation using `define`. User-defined operations live in the `WU` and `MU` namespaces rather than `W` and `M`:

User-defined operations have poor typescript support.

```js
const Wrongish = require('wrongish');
Wrongish.define(Array, 'sum', function() {
  return this.reduce((a, b) => a + b, 0);
});

const { WU, MU } = Wrongish;
const arr = [1, 2, 3];
arr[WU.sum]()  // 6
MU.sum(arr)  // 6
```

Wrongish will throw an error if you:
- try to redefine an existing operation; or
- define an operation that shadows an existing operation (same name, different types, one type is a subtype of the other)

## Built-In Operations

<< %ENTRY >>
