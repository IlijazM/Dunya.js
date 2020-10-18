export default interface Args {
  config?: string; // The path to the config file
  noAutoInit?: boolean; // If true the dev script will not initiate automatically
  noWatcher?: boolean; // If true it turns off the default watcher
  noServer?: boolean; // If true it turns off the default server
  plugins?: Array<string>; // A array of all plugin names

  ip: string; // The ip address of the server
  port: number; // The port of the server

  inputDir: string; // The input directory path that will be watched
  outputDir: string; // The output directory where the server will be

  [key: string]: any;
}
