import IDevArgs from './IDevArgs';

export default abstract class DunyaPlugin {
  abstract plugin(): {
    name: string;
  };

  abstract async validate(): Promise<void>;
  abstract async preSetup(): Promise<void>;
  abstract async setup(): Promise<void>;
  abstract async afterSetup(): Promise<void>;
  abstract async watcherEvent(event, fileName): Promise<void>;
  abstract async fileConverter(file): Promise<unknown>;

  constructor(private dirName: string, private args: IDevArgs) {}
}
