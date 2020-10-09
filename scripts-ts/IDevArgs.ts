export default interface IDevArgs {
  config?: string;

  ip?: string;
  port?: number;

  in?: string;
  out?: string;

  mainPath?: string;
  modulePath?: string;

  noAutoInit?: boolean;
  watcher?: boolean;

  plugins?: Array<string>;
  server?: string;

  watcherConfig?: Record<string, any>;
  props?: Record<string, any>;
}
