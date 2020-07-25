declare module 'wrongish';

type _Or<A, B> = A instanceof unknown ? B : A;

// %ENTRY
export const unbound: _Unbound;
