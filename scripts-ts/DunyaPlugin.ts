import IDevArgs from './IDevArgs';

export default interface DunyaPlugin {
  name: string;

  validate(args: IDevArgs): Promise<void>;
  preSetup(args: IDevArgs): Promise<void>;
  setup(args: IDevArgs): Promise<void>;
  afterSetup(args: IDevArgs): Promise<void>;
  watcherEvent(args: IDevArgs, event: string, fileName: string): Promise<void>;
  fileConverter(args: IDevArgs, file: string): Promise<unknown>;
}
