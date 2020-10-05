const path = require('path');
const fs = require('fs-extra');

export async function loadFileSafe(pathName: string): Promise<string> {
  if (!fs.existsSync(pathName)) throw new Error(`Missing '${pathName}'.`);
  return (await fs.readFile(pathName)).toString();
}

export function parseJSONSafe(
  content: string,
  name: string
): Record<string, any> {
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new SyntaxError(`An error occurred while parsing '${name}':\n${err}`);
  }
}

export async function loadAndParseJSONSafe(
  pathName: string
): Promise<Record<string, any>> {
  const name = path.basename(pathName);

  const content = await loadFileSafe(pathName);

  return parseJSONSafe(content, name);
}
