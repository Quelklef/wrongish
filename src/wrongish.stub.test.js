
const $ = require('./wrongish');

const expect = require('expect');

describe('wrongish', () => {

  describe('Supports 4 syntaxes', () => {

    const arr = [1, 2, 3];
    const set = new Set(arr);
    const size = x => x.length !== undefined ? x.length : x.size;

    it('Bound, unprefixed', () => {
      const { pipe } = require('./wrongish');
      expect(arr[pipe](size)).toBe(3);
      expect(set[pipe](size)).toBe(3);
    });

    it('Bound, prefixed', () => {
      const { $pipe } = require('./wrongish');
      expect(arr[$pipe](size)).toBe(3);
      expect(set[$pipe](size)).toBe(3);
    });

    it('Unbound, unprefixed', () => {
      const { unbound: { pipe } } = require('./wrongish');
      expect(pipe(arr, size)).toBe(3);
      expect(pipe(set, size)).toBe(3);
    });
    
    it('Unbound, prefixed', () => {
      const { unbound: { $pipe } } = require('./wrongish');
      expect($pipe(arr, size)).toBe(3);
      expect($pipe(set, size)).toBe(3);
    });
    
  });

  // %ENTRY
  
});



