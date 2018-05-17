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

  on(callback: Callback<R>, option?: { change: false } | false): GunClass<S>;
  on(
    callback: Callback<Partial<R>>,
    option?: { change: true } | true
  ): GunClass<S>;
}
type Callback = <S>(data: OneLevel<S>)=> void

//TODO: check Extract from TS 2.8

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
  [key in string]: any;
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

type AckCallback = (ack: Ack) => void;

declare namespace GunClass {
  // Types can be exported here
}
