// const Path = require('path');
// import Dev from '../Dev';
// import DunyaPlugin from '../DunyaPlugin';
// function loadTemplate(dev: Dev): string {
//   return dev.read(Path.join(dev.args.inputDir, 'template.html'));
// }
// function evalTemplate(template: string, html: string): string {
//   const preCode = `const html = ${html};`;
//   const regex = /\{\{[^]+\}\}/gm;
//   let m: RegExpMatchArray;
//   while ((m = regex.exec(template)) !== null) {
//     if (m.index === regex.lastIndex) regex.lastIndex++;
//     const match = m[0];
//     const index = m.index;
//     let res: any;
//     try {
//       res = eval(preCode + match.substring(2, match.length - 2));
//     } catch (err) {
//       throw new Error(`An error occurred while compiling 'template.html':\n${err}`);
//     }
//     if (res === undefined) {
//       res = '';
//     }
//     if (typeof res === 'object') res = JSON.stringify(res);
//     template = template.substring(0, index) + res.toString() + template.substr(index + match.length);
//     regex.lastIndex += res.toString().length;
//   }
//   return template;
// }
// function compileTemplate(path: string, html: string, dev: Dev): { path: string; content: string } {
//   let template = loadTemplate(dev);
//   template = evalTemplate(template, html);
//   return { path, content: template };
// }
// const plugin: DunyaPlugin = {
//   name: 'template',
// };
// plugin.setup = function (dev: Dev) {
//   (dev as any).loadPlugin = function () {};
// };
// plugin.watcherEventPipe = function (
//   pipe: { path: string; content: string },
//   dev: Dev,
//   onDelete: boolean
// ): { path: string; content: string } {
//   if (onDelete) return pipe;
//   const ext = Path.extname(pipe.path);
//   console.log(pipe.path);
//   if (ext === '.html') return compileTemplate(pipe.path, pipe.content, dev);
//   return pipe;
// };
// export default plugin;
