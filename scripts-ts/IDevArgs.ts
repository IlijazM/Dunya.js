export default interface IDevArgs {
  config?: string;

  ip?: string;
  port?: number;

  in?: string;
  out?: string;

  plugins?: Array<string>;

  watcherConfig?: Record<string, any>;
  props?: Record<string, any>;
}
