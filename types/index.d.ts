// Type definitions for gun 0.9.996
// Project: gun
// Definitions by: Jonas Kugelmann <https://kumans.net>

export as namespace Gun;

export = GunClass;

// TODO: introduce GunRootClass

declare class GunClass<S = any> {
  /**
   * Creates a local datastore using the default persistence layer, either localStorage or a JSON file
   */
  constructor();
  constructor(peer: string);
  constructor(peers: string[]);
  constructor(options: GunBrowserOptions);
  constructor(options: GunServerOptions);

  // TODO: implement GetAckCallback (ack: {err: any} | {put?: PartialGunData<S> }) => voic
  get<K extends keyof S>(key: K): GunClass<S[K]>;
  // TODO: check if need a GunSchema wrapper around S
  put(data: S, callback?: AckCallback): GunClass<S>;
  put(data: GunClass<S>, callback?: AckCallback): GunClass<S>;
  put(data: Partial<S>, callback?: AckCallback): GunClass<S>;

  // TODO: find out if peers are really Record<string,{}>
  opt(options: GunOptions): GunClass<S>;

  // TODO: Find a better way
  back<P>(amount?: number): GunClass<P>;

  on(callback: OneLevelCallback<S>, options?: { change: false } | false): GunClass<S>;
  on(
    callback: OneLevelCallback<Partial<S>>,
    options: { change: true } | true
  ): GunClass<S>;
  off();

  once(callback: OneLevelCallback<S>, options?: OnceOptions): GunClass<S>;
  // TODO: Introduce GunOnceClass if necessary
  once(): GunClass<S>;
  // TODO: set should only be available when S is a GunSet
  //set(key: keyof S): GunSetClass

  // TODO: map should only be available on non Primitives
  map(): GunMapClass<S>;
}

declare class GunMapClass<S> {
  on(callback: MapCallback<S>, options?: { change: false } | false): GunClass<S>;
  on(callback: MapCallback<Partial<S>>, options: { change: true } | true): GunClass<S>;
  once(callback: MapCallback<S>, options?: OnceOptions): GunClass<S>;
}

interface OnceOptions  { wait: number }

// TODO: find a way to type data combined with key e.g. zip: number => key: 'zip', data: number
type MapCallback<S> = (data: S[keyof S], key: keyof S) => void;

// TODO: Find out type of key
type OneLevelCallback<S> = (data: OneLevelOrPrimitives<S>, key: string) => void;

type OneLevelOrPrimitives<S> = S extends Primitives ? S : OneLevel<S>;
type Data = null | Primitives | object;
type Primitives = string | number | boolean;

type Peers = Record<string, {}>;

interface S3Options {
  key: string;
  secret: string;
  bucket: string;
}

interface GunOptions {
  peers?: Peers;
  uuid?: () => string;
  [key: string]: any;
}

interface GunServerOptions extends GunOptions {
  radisk?: boolean;
  file?: string;
  s3?: S3Options;
}

interface GunBrowserOptions extends GunOptions {
  localStorage?: boolean;
}

interface Ack {
  err?: any;
  ok?: string;
}

type Soul = { "#": string };

type AckCallback = (ack: Ack) => void;

declare namespace GunClass {
  // Types can be exported here
}

// TYPE HELPERS

type NonNeverKeys<T> = keyof T &
  { [K in keyof T]: T[K] extends never ? never : K }[keyof T];

type ExcludeNever<T> = Pick<T, NonNeverKeys<T>>;

type OnlyType<T, P> = ExcludeNever<{ [K in keyof T]: Extract<T[K], P> }>;

type OneLevel<T> = OnlyType<T, Primitives>;
