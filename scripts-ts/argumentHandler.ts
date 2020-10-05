import fs from 'fs-extra';

import IConfig from './interfaces/config';

export default async function handleArgs(
  args: Record<string, any>,
  ...overwriteArguments: Array<Record<string, any>>
): Promise<void> {
  overwriteArguments.forEach((other) => {
    overwriteArgs(args, other);
  });
}

function overwriteArgs(
  args: Record<string, any>,
  other: Record<string, any>
): void {
  for (let [index, value] of Object.entries(args)) {
    if (other[index] === undefined) continue;

    if (typeof other[index] !== typeof args[index])
      throw new TypeError(
        `The argument '${index}' must be of type '${typeof args[index]}'.`
      );

    args[index] = other[index];
  }
}
