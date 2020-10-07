import IDevArgs from './IDevArgs';

export default interface DunyaPlugin {
  name: string;

  validate?(args: IDevArgs): Promise<void>;
  preSetup?(args: IDevArgs): Promise<void>;
  setup?(args: IDevArgs): Promise<void>;
  afterSetup?(args: IDevArgs): Promise<void>;
  watcherEvent?(args: IDevArgs, event: string, fileName: string): Promise<void>;

  pipeFile?(
    pipe: { filePath: string; fileContent: string },
    args: IDevArgs,
    onDelete: boolean
  ): Promise<{
    filePath: string;
    fileContent?: string;
  }>;
}
