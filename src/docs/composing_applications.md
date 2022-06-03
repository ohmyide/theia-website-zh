---
title: Build your own IDE/Tool
---


# 构建自己的 IDE 工具

本教程将带你了解如何基于 Theia 构建自己的应用。内容将演示如何在应用中配置已有或新的 Theia 扩展，以及你想默认集成进去的 VS Code 扩展。如果还不熟悉 [Theia 的扩展机制](https://theia-ide.org/docs/extensions/) ，请先熟悉一下。

本教程讲述了构建基于 Theia 的手动步骤，有以下两种方式可以跳过手动设置：
- [Theia Extension Yeoman generator](https://github.com/eclipse-theia/generator-theia-extension): 用于生成基于 Theia 的扩展示例。
- [Theia Blueprint](https://theia-ide.org/docs/blueprint_download/): 用于创建基于 Theia 的桌面应用的仓库模板。

我们仍然建议你先阅读 Theia 教程，它可以让你了解基于 Theia 的项目的结构。
 
## 要求

前提条件的详细列表位于 Theia 仓库中：
- [前提条件](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites)

## 步骤
创建空文件夹，并进入：
    mkdir my-app
    cd my-app

文件夹中创建 `package.json`:

```json
{
  "private": true,
  "dependencies": {
    "@theia/callhierarchy": "next",
    "@theia/file-search": "next",
    "@theia/git": "next",
    "@theia/markers": "next",
    "@theia/messages": "next",
    "@theia/mini-browser": "next",
    "@theia/navigator": "next",
    "@theia/outline-view": "next",
    "@theia/plugin-ext-vscode": "next",
    "@theia/preferences": "next",
    "@theia/preview": "next",
    "@theia/search-in-workspace": "next",
    "@theia/terminal": "next"
  },
  "devDependencies": {
    "@theia/cli": "next"
  }
}
```

总之，Theia 应用和扩展是一个个 [Node.js 包](https://nodesource.com/blog/the-basics-of-package-json-in-node-js-and-npm/)。 每个包都有“package.json”文件，用于显示包的元信息，如`name`、`version`、运行时和构建时间依赖等等。

来看一下创建好的包：
- 它的 `name` 和 `version` 被省略，因为我们不需要将它用作依赖项，并且它被标记为 `private`，因为它不会单独作为 Node.js 包发布。
  - 我们已将所需的扩展列为运行时依赖项，比如： `@theia/navigator`。
    - 有的扩展需要安装额外的工具，比如： [@theia/python](https://www.npmjs.com/package/@theia/python) 它需要安装
    [the Python Language Server](https://github.com/palantir/python-language-server)。在这种情况下，需要查阅相应的扩展文档。
    - [点击这里](https://www.npmjs.com/search?q=keywords:theia-extension) 查看所有已发布扩展。
  - 我们已将 [@theia/cli](https://www.npmjs.com/package/@theia/cli) 作为构建依赖。它作为构建和运行应用的脚本命令。

## 使用 VS Code 扩展
作为应用的一部分，还可以使用（和打包）VS Code 扩展。
[这里提供](https://github.com/eclipse-theia/theia/wiki/Consuming-Builtin-and-External-VS-Code-Extensions) 提供一个教程，用于指导
如何在 `package.json` 中配置VS Code 扩展。

以下面 `package.json` 为例:

```json
{
  "private": true,
  "dependencies": {
    "@theia/callhierarchy": "next",
    "@theia/file-search": "next",
    "@theia/git": "next",
    "@theia/markers": "next",
    "@theia/messages": "next",
    "@theia/navigator": "next",
    "@theia/outline-view": "next",
    "@theia/plugin-ext-vscode": "next",
    "@theia/preferences": "next",
    "@theia/preview": "next",
    "@theia/search-in-workspace": "next",
    "@theia/terminal": "next",
    "@theia/vsx-registry": "next"
  },
  "devDependencies": {
    "@theia/cli": "next"
  },
  "scripts": {
    "prepare": "yarn run clean && yarn build && yarn run download:plugins",
    "clean": "theia clean",
    "build": "theia build --mode development",
    "start": "theia start --plugins=local-dir:plugins",
    "download:plugins": "theia download:plugins"
  },
  "theiaPluginsDir": "plugins",
  "theiaPlugins": {
    "vscode-builtin-extensions-pack": "https://open-vsx.org/api/eclipse-theia/builtin-extension-pack/1.50.1/file/eclipse-theia.builtin-extension-pack-1.50.1.vsix"
  },
  "theiaPluginsExcludeIds": [
    "vscode.extension-editing",
    "vscode.git",
    "vscode.git-ui",
    "vscode.github",
    "vscode.markdown-language-features",
    "vscode.microsoft-authentication"
  ]
}
```

以下属性用于配置内置插件（集成扩展）：
- `theiaPluginsDir`：配置插件的相对路径
- `theiaPlugins`：配置要下载的插件集合（单个插件或扩展包），可以指向任何有效的下载地址（如：Open VSX、Github Releases 等）
- `theiaPluginsExcludeIds`：解析扩展包时要排除的插件`ids`列表

## 构建

首先，安装依赖：

    yarn

然后，使用 Theia CLI 构建应用：

    yarn theia build

`yarn` 作为 `theia` 的执行入口由 `@theia/cli` 提供，然后调用 `build` 命令。
这可能需要一点时间，因为默认情况下应用是在生产模式下构建的，要执行混淆和压缩。

## 启动

构建完成后，启动应用：

    yarn theia start --plugins=local-dir:plugins

也可使用 `package.json` 中的 `start` 命令：

    yarn start

你可以指定一个工作区的路径作为第一个参数，其中 `--hostname`、`--port` 选项用于在指定的网络和端口上部署应用。
例如 在所有网段和端口`8080`上打开`/workspace`：

    yarn start /my-workspace --hostname 0.0.0.0 --port 8080

在终端中，你应该能看到 Theia 应用已启动监听：

<img class="doc-image" src="/docs-terminal.png" alt="Terminal" style="max-width: 750px">

即可在浏览器中输入终端打印的地址来打开应用程序。

## 常见问题

### 插件未找到

如果没有可用的插件地址，可以通过配置高速 Theia 在哪里可以获取到已下载的插件。
上面的示例，在 `start` 命令中设置了 `--plugins` 参数的作用即是如此。
如果要直接运行 `theia start`，你可以设置一个环境变量来实现相同的目的：

    export THEIA_DEFAULT_PLUGINS=local-dir:plugins

### 由代理构建本地依赖

如果你用代理执行 `yarn` 命令，可能会在构建后期遇到构建本地依赖项（如 `oniguruma`）的问题，并有以下报错信息：

    [4/4] Building fresh packages...
    [1/9]  XXXXX
    [2/9]  XXXXX
    [3/9]  XXXXX
    [4/9]  XXXXX
    error /theiaide/node_modules/XXXXX: Command failed.
    Exit code: 1
    Command: node-gyp rebuild
    Arguments:
    Directory: /theiaide/node_modules/XXXXX
    Output:
    gyp info it worked if it ends with ok
    gyp info using node-gyp@3.8.0
    gyp info using node@8.15.0 | linux | x64
    gyp http GET https://nodejs.org/download/release/v8.15.0/node-v8.15.0-headers.tar.gz
    gyp WARN install got an error, rolling back install
    gyp ERR! configure error
    gyp ERR! stack Error: read ECONNRESET
    gyp ERR! stack at TLSWrap.onread (net.js:622:25)
    gyp ERR! System Linux 3.10.0-862.11.6.el7.x86_64
    gyp ERR! command "/usr/bin/node" "/usr/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js" "rebuild"
    gyp ERR! cwd /theiaide/node_modules/XXXXX
    gyp ERR! node -v v8.15.0

这是因为 node-gyp 不依赖系统的 NPM 代理设置。在这种情况下，需使用错误堆栈中的链接下载`node-headers`文件。
（如上面的示例中的 `https://nodejs.org/download/release/v8.15.0/node-v8.15.0-headers.tar.gz`）并使用以下命令运行构建：

     npm_config_tarball=/path/to/node-v8.15.0-headers.tar.gz yarn install

