
import * as $ from './wrongish';
import expect from 'expect';

describe('wrongish', () => {

  describe('supports 4 syntaxes', () => {

    const arr = [1, 2, 3];
    const set = new Set(arr);
    const size = x => x.length !== undefined ? x.length : x.size;

    it('bound, unprefixed', () => {
      const { pipe } = require('./wrongish');
      // @ts-ignore
      expect(arr[pipe](size)).toBe(3);
      expect(set[pipe](size)).toBe(3);
    });

    it('bound, prefixed', () => {
      const { $pipe } = require('./wrongish');
      // @ts-ignore
      expect(arr[$pipe](size)).toBe(3);
      expect(set[$pipe](size)).toBe(3);
    });

    it('unbound, unprefixed', () => {
      const { unbound: { pipe } } = require('./wrongish');
      expect(pipe(arr, size)).toBe(3);
      expect(pipe(set, size)).toBe(3);
    });
    
    it('unbound, prefixed', () => {
      const { unbound: { $pipe } } = require('./wrongish');
      expect($pipe(arr, size)).toBe(3);
      expect($pipe(set, size)).toBe(3);
    });
    
  });

  it('has no shadowed operations', () => {
    // Return supertypes of a type
    function protos(constructor) {
      let proto = constructor.prototype.__proto__;
      const protos = [];
      while (proto) {
        protos.push(proto);
        proto = proto.__proto__;
      }
      return protos;
    }
    
    const errs = [];
    for (const { host, symbols } of ($ as any).__patches) {
      for (const symbol of symbols) {
        const shadowing = protos(host).filter(proto => proto.hasOwnProperty(symbol));
        const strSym = symbol.toString().slice(7, -1);
        errs.push(...shadowing.map(proto =>
          `${host.name}[${strSym}] shadows ${proto.constructor.name}[${strSym}]`));
      }
    }
    expect(errs).toStrictEqual([]);
  });

  // %ENTRY
  
});



