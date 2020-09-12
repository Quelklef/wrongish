
import './wrongish';
import * as Wrongish from './wrongish';
const { W, M } = Wrongish;

import expect from 'expect';

describe('wrongish', () => {

  describe('supports 2 syntaxes', () => {

    const arr = [1, 2, 3];
    const set = new Set(arr);

    function size<T>(x: Array<T> | Set<T>): number {
      return x instanceof Array ? x.length : x.size;
    }

    it('bound', () => {
      expect(arr[W.pipe](size)).toBe(3);
      expect(set[W.pipe](size)).toBe(3);
    });

    it('unbound', () => {
      expect(M.pipe(arr, size)).toBe(3);
      expect(M.pipe(set, size)).toBe(3);
    });

  });

  it('has no shadowed operations', () => {
    // Return supertypes of a type
    function protos(constructor: any): Array<object> {
      let proto = constructor.prototype?.__proto__;
      const protos = [];
      while (proto) {
        protos.push(proto);
        proto = proto.__proto__;
      }
      return protos;
    }

    const errs = [];
    for (const { host, symbols } of (Wrongish as any).__patches) {
      for (const symbol of symbols) {
        const shadowing = protos(host).filter((proto: object) => proto?.hasOwnProperty(symbol));
        const strSym = symbol.toString().slice(7, -1);
        errs.push(...shadowing.map((proto: object) =>
          `${host.name}[${strSym}] shadows ${proto.constructor.name}[${strSym}]`));
      }
    }
    expect(errs).toStrictEqual([]);
  });

  // %ENTRY //

});



