export default interface IDevArgs {
  config?: string;

  ip?: string;
  port?: number;

  in?: string;
  out?: string;

  props?: Record<string, any>;
}
