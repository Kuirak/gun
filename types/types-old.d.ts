// Type definitions for gun 0.9
// Project: https://github.com/amark/gun#readme
// Definitions by: Jonas Kugelmann <https://github.com/Kuirak>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/*~ Note that ES6 modules cannot directly export class objects.
 *~ This file should be imported using the CommonJS-style:
 *~   import x = require('someLibrary');
 *~
 *~ Refer to the documentation to understand common
 *~ workarounds for this limitation of ES6 modules.
 */

/*~ If this module is a UMD module that exposes a global variable 'myClassLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
export as namespace Gun;

/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */
export = GunConstructor;

// TODO: add extends to D
// This would be something like the root schema
declare function GunConstructor<D>(options?: Gun.ConstructorOptions): Gun.Gun<D>;

/*~ If you want to expose types from your module as well, you can
 *~ place them in this block.
 */
declare namespace Gun {

  interface Gun<D> {
    get<K extends keyof D>(key: keyof D): GunChain<D[K]>;
    put<T extends Record<string, Data>>(
      data: T,
      callback?: AckCallback
    ): GunChain<T>; // TODO: check if object is correct
    opt(options: ConstructorOptions): void;
  }

  type OnOrValData<D> = Partial<Record<keyof D, Primitives | Soul>>

  interface Callback<D extends OnOrValData<D>> {
    // TODO: D is not correct because it is only one level deep
    (data: D, key: keyof D): void;
  }

  interface GunChain<D> extends GunMain<D>{
    // TODO: derive Data from D[K]
    put(data: D, callback?: AckCallback): GunChain<D>;
    get<K extends keyof D>(key: K): GunChain<D[K]>

    // TODO: find a way to do the tree traversal
    back<T = any>(amount?: number): GunChain<T>
  }

  interface Context {
    previous: Context
  }

  interface GunMain<D> {
    on<R extends OnOrValData<D>>(callback: Callback<R>, option?: { change: false } | false): GunChain<D>
    on<R extends OnOrValData<D>>(callback: Callback<Partial<R>>,option?: { change: true } | true): GunChain<D>
    val<R extends OnOrValData<D>>(callback: Callback<R>, option?: { wait: number }): GunChain<D>
    set(data: object | GunChain<D>, callback?:AckCallback): GunChain<D>
  }
  interface Ack {
    err?: any;
    ok?: string;
  }

  type AckCallback = (ack: Ack) => void;

  interface S3Options {
    key: string;
    secret: string;
    bucket: string;
  }

  // TODO: replace object with better type
  type Peers = Record<string, object>;

  interface ConstructorOptions {
    s3?: S3Options;
    file?: string;
    peers?: Peers;
    uuid?: () => string;
  }

  type Url = string | string[];
  type Key = string;
  type Data = null | Primitives | object;
  type Primitives = string | number | boolean;

  type Soul = {'#': string}
  interface DataFormat<D> {
    _: Soul & {

      '>': Record<keyof D, number>
    };
    // TODO: index type not working
  }
}


