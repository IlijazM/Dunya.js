# Dunya.js

Dunya.js is a simple tool for setting up a better workflow.

## Installation

```bash
npm install --save dunya
```

### Setup

Add this script to your `package.json`:

```json
{
  "scripts": {
    "dev": "dunya dev"
  },
  ...
}
```

### Further installation option

Additionally you can install `dunya` globally:

```bash
npm install -g dunya
```

and run the cli directly:

```bash
dunya dev
```

## Getting started

Dunya is a tool you can use to build a custom workflow.
It works as following:

First you'll have a input directory.
Your source code will go in there.
If you run the dev script it will apply all changed of your code in a output directory.
Then it will run a live server by default in the output directory.
In the process of applying your changes however,
it will pipe your file changes through a so called `pipeline`.
This pipeline can be manipulated using `plugins`.

To get started, run this command:

```bash
npm run dev
# or
dunya dev
```

Whenever you make a change in you input directory the default pipeline will apply the change in the output directory.
So by default there is not much going on but it will quickly get more interesting when using [plugins](##Plugins).

A file called `dunya.config.json` should get created.
This is the file where you can configure dunya.js.
Additionally you can set some parameters by using command line arguments.
See more at [Configuration](##Configuration).

## Plugins

Let's start adding plugins in our project.
Go to your `dunya.config.json` and start add our first plugin.
You need to create an array called `plugins`:

```json
{
  "plugins": [...],
  ...
}
```

Dunya comes with a hand full of default plugins
(See more [default plugins](###Default-plugins)).
For example we can add `sass support` to our pipeline like following:

```json
{
  "plugins": ["#sass-support"],
  ...
}
```

Using the `#` we can import plugins that comes with dunya by default.

Note that plugins can overwrite each other when they have the same name
_(Not the name you entered in the `dunya.config.json`)_
This can be used to e.g. overwrite the default plugin
[more about the default plugin here](###default)

### Non-default plugins

You can also import plugins from external sources.
Let's say there is a plugin in the npm packages called `foo-bar-support` that you want to install.
Simple call

```bash
npm i --save foo-bar-support
```

and add this plugin like you would use the `require` function or the `import` statement in javascript / typescript:

```json
{
  "plugins": ["foo-bar-support"],
  ...
}
```

### Own plugins

If you want to create a own plugin simple create a javascript file in your directory.
Then you need to import the plugin using a `tilde`:

```json
{
  "plugins": ["~/path/to/plugins.js"],
  ...
}
```

[More about creating a plugin here.](##Creating-a-plugin)

### Default plugins

Here is a list of all default plugins that come with dunya:

#### sass-support:

| property | value        |
| -------- | ------------ |
| name     | sass-support |
| priority | 300          |

This will pipe all `.scss` files and compile them to regular `.css` files.
Note that you need to add the proper file name everywhere you want to link a stylesheet even though the file extension differs in the input directory.
For example:

```html
<!-- wrong -->
<link rel="stylesheet" href="styles/main.scss" />

<!-- right -->
<link rel="stylesheet" href="styles/main.css" />
```

#### template

| property | value    |
| -------- | -------- |
| name     | template |
| priority | 200      |

The template plugin will effect every `.html` file.
Your first have to create a `template.html` file directly in the input directory.
Now the `template.html` will replace all `.html` files.
Now let's see what the `template` plugin provides:

This template will wrap every `.html` file in this boilerplate html:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test</title>
  </head>
  <body>
    {{ html }}
  </body>
</html>
```

For example:

```html
<h1>Hello, world!</h1>
```

will get converted to:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
  </body>
</html>
```

Additionally you have the variable `relativePath` which points to the root directory of your html.
You can also use a `tilde` to go to the root directory automatically.
Note: Behind the `tilde` syntax is a regex that searches for the specific combination `"~/`.

For example:

```html
...
<link rel="stylesheet" href="~/styles/main.css" />

<script>
  var relativePath = '{{relativePath}}';
</script>
...
```

will get converted to:

```html
...
<link rel="stylesheet" href="../../styles/main.css" />

<script>
  var relativePath = '../..';
</script>
...
```

There is also a function called `load`.
This will load another file in your input directory.

Let's say you want to add a header to all your html files:

```html
...
<body>
  {{ load('components/header.html') }} {{ html }}
</body>
...
```

Additionally you'll have the variable `path` which is the path to the original html file.

#### enhancedRouting

| property | value           |
| -------- | --------------- |
| name     | enhancedRouting |
| priority | 240             |

This plugin will take all of your `.html` files and move them into their own directory.

So this input routing:

```
input
|- About.html
|- Contact.html
|- index.html
```

will get converted to:

```
output
|- About
|   |- index.html
|- Contact
|   |- index.html
|- index.html
```

This improves the routing of your website because now you can use `localhost:8080/About` instead of `localhost:8080/About.html`.

#### default

| property | value   |
| -------- | ------- |
| name     | default |
| priority | 100     |

The default plugin contains all necessary code for the scripts to work.
The idea behind having a default plugin is that you can overwrite it to your needs.
Let's say your unhappy how to default plugin handles the watcher.
Then you could create a new plugin with a higher priority than 100
or you could create a plugin called `default` and overwrite the `setupWatcher` function.

The default plugins sets the following functions [read more about all functions here](###plugin-functions):

_fsRead_: reads a file at `path` synced.

_fsWrite_: writes the file to `path` with the content `fileContent` synced.

It also called the `fsMkdirs` function so it wont fail when the path doesn't exist.

_fsMkdirs_: creates all directories at `dirs` synced.

_fsRemove_: removes a file or directory at `path`.

_fsEmpty_: creates and empties the directory `path`.

_fsIsDir_: returns true when `path` leads to a directory.

_fsExists_: return true when `path` exists.

_fsReadJSON_: calls `fsRead` and returns the content as JSON.
If the parsing fails it will throw an error.

_setupWatcher_: ensures that all directories exist,
initiates a watcher using the npm package [sane](https://www.npmjs.com/package/sane),
and makes sure that the event is called properly as well as all files are getting added when the watcher got setup.

_deleteEvent_: calls `fsRemove` at `path`.

_addDirEvent_: calls `fsMkdirs` at `path`.

_addFileEvent_: calls `fsWrite` at `path`.

_changeFileEvent_: calls `fsWrite` at `path`.

_startServer_: starts a live server using the npm package [live-server](https://www.npmjs.com/package/live-server).

## Configuration

Here is a list of all configuration options dunya provides per default:

| json      | cli        | default      | description                         |
| --------- | ---------- | ------------ | ----------------------------------- |
| plugins   | -          | ['#default'] | an array of the plugins             |
| inputDir  | -inputDir  | 'input'      | the path to the input directory     |
| outputDir | -outputDir | 'output'     | the path to the output directory    |
| ip        | -ip        | '127.0.0.1'  | the ip address of the server        |
| port      | -port      | 8080         | the port of the server              |
| noWatcher | -noWatcher | undefined    | starts the script without a watcher |
| noServer  | -noServer  | undefined    | starts the script without a server  |

## Creating a plugin

Dunya starts to get very powerful when adding personalized plugins.
Let's start by creating our own plugin.
Make sure dunya is installed in your project.
Then create a file e.g. `custom-plugin.js`.
We need to export an object that has at least the property `name` but it should also have a [priority](###Priority) and functionality:

```js
exports.default = {
  name: 'custom plugin', // the name must not be the same as the file name

  priority: 300,

  fileEvent(path, fileContent) {
    console.log(`'${path}' got changed`);
    return false;
  },
};
```

Now we just need to import our plugin in our `dunya.config.json`:

```json
{
  "plugins": ["~/custom-plugin.js"],
  ...
}
```

### Using typescript

If you want to have autocomplete consider using [typescript](https://www.typescriptlang.org/).
Keep in mind that you have to compile your typescript file as `commonjs`. Simply make sure that this property is in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    ...
  },
  ...
}
```

This typescript example implements the same features like the javascript variant but it's using the `DunyaPlugin` interface for autocomplete:

```typescript
// import the interface for autocomplete
import DunyaPlugin from 'dunya/scripts-ts/DunyaPlugin';

const plugin: DunyaPlugin = {
  name: 'custom plugin',
  priority: 300,
};

plugin.fileEvent = function (path: string, fileContent: string): boolean {
  console.log(`'${path}' got changed`);
  return false;
};

export default plugin;
```

### Priority

To set the right priority to your plugins is important for plugins to work together.
Here are some norms you can follow so your plugin does not interfere with other plugins:

| priority | when to use                                                                              |
| -------- | ---------------------------------------------------------------------------------------- |
| >400     | Only events that does not influence anything and does not stop any function              |
| >300     | When a file format gets converted e.g. scss -> css                                       |
| >200     | When a file gets moved or edited but not the file format it self e.g. a minimizer        |
| <100     | When another event gets appended that does not influence the content or path of the file |

### Converting files

Let's say we want to add a support for a language like [sass](https://sass-lang.com/).
This will give you a vague idea how to implement something like that.

First we want to est the `filePipe` function:

```typescript
plugin.filePipe = function (pipe: { path: string; fileContent: string }): { path: string; fileContent: string } {
  // First we check if the file ends with .scss
  if (filterExtensionName(pipe.path)) return;

  // Then we compile the content of the file
  pipe.fileContent = compile(pipe.path, pipe.fileContent);

  // We change the extension from .scss to .css
  pipe.path = convertPath(pipe.path);

  // And finally, we return the pipe
  return pipe;
};
```

But we should not forget to set the `deleteEventPipe` incase someone deletes a `.scss` file.

```typescript
plugin.deleteEventPipe = function (pipe: IOPaths): IOPaths {
  // First we check again if the file ends with .scss
  if (filterExtensionName(pipe.outputPath)) return;

  //Then we only have to change the extension from .scss to .css since there is no content because the file got deleted.
  pipe.outputPath = convertPath(pipe.outputPath);

  // And then we return the pipe
  return pipe;
};
```

### Calling methods

There are different types of method how a function of a plugin can be called:

| name          | description                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| PluginCaller  | Will call every plugin until one returns a truthy value                                                                            |
| PluginCallAll | Will call every plugin regardless of the return value                                                                              |
| PluginGetter  | Will call every plugin until one returns a value that is not undefined                                                             |
| PluginPipe    | Will call all plugins. Every plugin has to option to modify the argument 'pipe'. If one returns undefined the pipe will not change |

### Plugin functions

The best way to get an overview of all the possible ways to interact with dunya is to look at the [typescript template]('file://scripts-ts/DunyaPlugin.ts') itself.

Here is some definition of some terms:

#### iopath

`iopath` is an object with three entries:

```ts
export interface IOPaths {
  path: string;
  inputPath: string;
  outputPath: string;
}
```

E.g. we change a file called `foo/bar.js`:

| path       | inputPath        | outputPath        |
| ---------- | ---------------- | ----------------- |
| foo/bar.js | input/foo/bar.js | output/foo/bar.js |

Note that the input and output directories will differ when we configure it differently [read more about configuration.](##Configuration)
