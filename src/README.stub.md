
# Wrongish: naughty util

Wrongish provides utlity functions with pleasing syntax by (ab)using ES6 features.

Example:

```js
const { W } = require('wrongish');
const items = new Set(1, 2, 3);
items[W.map](x => x * x);  // Set(1, 4, 9)
```

## The horror!

Wrongish works by extending native prototypes, which [is one if the cardinal sins of Javascript programming](https://stackoverflow.com/questions/14034180/why-is-extending-native-objects-a-bad-practice).

However, Wrongish is able to sidestep most of the dangers of extending native prototypes via ES6 features:

- Namespace conflicts are avoided by having each extension name (e.g. `$map`) be an ES6 `Symbol`
- All Wrongish extensions are non-enumerable properties, so behaviour of `for in` or `Object.keys` on prototypes will not change

# Reference

**Note**: Wrongish operations support two syntaxes: bound and unbound: Bound syntax uses `W`, for "Wrongish", and unbound uses `M`, an upside-down `W`.

```js
const { W, M } = require('wrongish');
const mySet = new Set([1, 2, 3]);
// These lines do the same thing:
mySet[W.filter](x => x % 2 === 0);
M.filter(mySet, x => x % 2 === 0);
```

Onto the methods!

***

<< %ENTRY >>
