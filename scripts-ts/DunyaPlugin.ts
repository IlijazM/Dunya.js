import Dev from './Dev';
import IDevArgs from './IDevArgs';

export default interface DunyaPlugin {
  name: string;

  validate?(dev: Dev): Promise<void>;
  preSetup?(dev: Dev): Promise<void>;
  setup?(dev: Dev): Promise<void>;
  afterSetup?(dev: Dev): Promise<void>;
  watcherEvent?(dev: Dev, event: string, fileName: string): Promise<void>;

  beforeWatchEventHalter?(
    dev: Dev,
    event: string,
    filePath: string
  ): Promise<boolean>;
  afterWatchEventHalter?(
    dev: Dev,
    event: string,
    filePath: string
  ): Promise<boolean>;

  pipeFile?(
    pipe: { filePath: string; fileContent: string },
    args: IDevArgs,
    onDelete: boolean
  ): Promise<{
    filePath: string;
    fileContent?: string;
  }>;
  reversePipeFile?(args: IDevArgs, filePath: string): Promise<string>;
}
