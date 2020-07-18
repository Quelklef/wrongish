
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
const { pipe } = require('wrongish');
["hello", "world"][pipe](console.log.bind(console));

// is the same as

const { $pipe } = require('wrongish');
["hello", "world"][$pipe](console.log.bind(console));

// is the same as

const { unbound: { pipe } } = require('wrongish');
pipe(["hello", "world"], console.log.bind(console));

// is the same as

const { unbound: { $pipe } } = require('wrongish');
$pipe(["hello", "world"], console.log.bind(console));
```

Onto the methods!

***

<< %ENTRY >>
