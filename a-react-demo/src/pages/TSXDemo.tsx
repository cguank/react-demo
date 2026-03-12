type a<T, U> = T extends U ? never : T;
type b = a<'a' | 'b' | 'c', 'a' | 'b'>;

type MyCCC<T, K extends keyof T> = {
  [P in K]: T[P]
};
type MyOmit<T, K> = Pick<T, Exclude<keyof T, K>>;
type MyOmit2 = MyOmit<{ a: 1, b: 2, c: 3 }, 'aaa' | 'b' | string>;
type MyCCC2 = MyCCC<{ a: 1, b: 2, c: 3 }, 'a' | 'b'>;

export function TSXDemo() {
  const aa: b = 'c'
  return <div>TSXDemo { aa}</div>;
}