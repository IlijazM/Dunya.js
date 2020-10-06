const path = require('path');
const fs = require('fs-extra');

export default class DunyaWrapper {
  //#region Loading & Parsing
  async loadFileSafe(pathName: string): Promise<string> {
    if (!fs.existsSync(pathName)) throw new Error(`Missing '${pathName}'.`);
    return (await fs.readFile(pathName)).toString();
  }

  parseJSONSafe(content: string, name: string): Record<string, any> {
    try {
      return JSON.parse(content);
    } catch (err) {
      throw new SyntaxError(
        `An error occurred while parsing '${name}':\n${err}`
      );
    }
  }

  async loadAndParseJSONSafe(pathName: string): Promise<Record<string, any>> {
    const name = path.basename(pathName);

    const content = await this.loadFileSafe(pathName);

    return this.parseJSONSafe(content, name);
  }
  //#endregion

  handleArgs(
    args: Record<string, any>,
    ...overwriteArguments: Array<Record<string, any>>
  ): void {
    overwriteArguments.forEach((other) => {
      this.overwriteArgs(args, other);
    });
  }

  overwriteArgs(args: Record<string, any>, other: Record<string, any>): void {
    for (let [index, value] of Object.entries(args)) {
      if (other[index] === undefined) continue;

      const type = this.validateTypes(args[index], other[index], index);

      if (type === 'object') {
        args[index] = { ...args[index], ...other[index] };
        continue;
      }

      if (type === 'array') {
        args[index] = [...args[index], ...other[index]];
        continue;
      }

      args[index] = other[index];
    }
  }

  validateTypes(main: any, other: any, name: string = ''): string {
    const mainType = this.typeOf(main);
    const otherType = this.typeOf(other);

    if (mainType !== otherType)
      throw new TypeError(
        `The argument '${name}' must be of type '${mainType}'.`
      );

    return mainType;
  }

  typeOf(object: any): string {
    if (object === null) return 'null';
    if (typeof object === 'object') {
      if (object instanceof Array) return 'array';
      if (object instanceof RegExp) return 'regex';
    }
    return typeof object;
  }

  constructor(private dirName: string) {}
}
