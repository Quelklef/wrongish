
const $ = require('./wrongish');

const expect = require('expect');

describe('wrongish', () => {
  
  it('Object[$pipe]', () => {
    const obj = { x: 2, y: 4 };
    const result = obj[$.pipe](({ x, y }) => x * y);
    expect(result).toBe(8);
  });

  describe('Object[$to]', () => {

    it('Array -> Set', () => {
      const items = [1, 1, 2, 2, 3, 3];
      const set = items[$.to](Set);
      expect(set).toEqual(new Set([1, 2, 3]));
    });
    
    it('Set -> Array', () => {
      const items = new Set([1, 2, 3]);
      const array = items[$.to](Array);
      expect(array).toEqual([1, 2, 3]);
    });
    
  });

  it('Array[$mapfilter]', () => {
    const items = [1, 2, 3, 4, 5];
    const result = items[$.mapfilter](x => x % 2 === 0 && Math.pow(x, 2));
    expect(result).toEqual([4, 16]);
  });

  it('Set[$map]', () => {
    const items = new Set([1, 2, 3, 4, 5]);
    const result = items[$.map](x => Math.pow(x, 2));
    expect(result).toEqual(new Set([1, 4, 9, 16, 25]));
  });
  
  it('Set[$filter]', () => {
    const items = new Set([1, 2, 3, 4, 5]);
    const result = items[$.filter](x => x % 2 === 0);
    expect(result).toEqual(new Set([2, 4]));
  });
  
  it('Set[$mapfilter]', () => {
    const items = new Set([1, 2, 3, 4, 5]);
    const result = items[$.mapfilter](x => x % 2 === 0 && Math.pow(x, 2));
    expect(result).toEqual(new Set([4, 16]));
  });

  it('Set[$minus]', () => {
    const A = new Set(['A', 'both']);
    const B = new Set(['B', 'both']);
    expect(A[$.minus](B)).toEqual(new Set(['A']));
  });
  
  it('Set[$intersect]', () => {
    const A = new Set(['A', 'both']);
    const B = new Set(['B', 'both']);
    expect(A[$.intersect](B)).toEqual(new Set(['both']));
  });
  
  it('Set[$union]', () => {
    const A = new Set(['A', 'both']);
    const B = new Set(['B', 'both']);
    expect(A[$.union](B)).toEqual(new Set(['A', 'both', 'B']));
  });
  
  it('Set[$with]', () => {
    const S = new Set(['a']);
    expect(S[$.with]('b')).toEqual(new Set(['a', 'b']));
  });
  
  it('Set[$without]', () => {
    const S = new Set(['a', 'b']);
    expect(S[$.without]('b')).toEqual(new Set(['a']));
  });
  
  it('Set[$some]', () => {
    const A = new Set([1, 2, 3, 4, 5]);
    expect(A[$.some](x => x > 4)).toBe(true);
    expect(A[$.some](x => x > 5)).toBe(false);
  });
  
  it('Set[$every]', () => {
    const A = new Set([1, 2, 3, 4, 5]);
    expect(A[$.every](x => x > 1)).toBe(false);
    expect(A[$.every](x => x > 0)).toBe(true);
  });
  
});



