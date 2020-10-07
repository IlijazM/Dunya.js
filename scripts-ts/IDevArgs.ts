export default interface IDevArgs {
  config?: string;

  ip?: string;
  port?: number;

  in?: string;
  out?: string;

  mainPath?: string;
  modulePath?: string;

  plugins?: Array<string>;

  watcherConfig?: Record<string, any>;
  props?: Record<string, any>;
}
