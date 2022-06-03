---
title: Authoring Plug-ins
---

#  开发 Theia 插件

让我们创建第一个 Theia 插件。 演示：注册一个 Hello World 命令，弹出提示通知“Hello world！”。 本文将指导你完成所需步骤。

## Theia 的架构


### 插件 vs 扩展

Theia 是一个可充分扩展的 IDE。 你可能已经听说过扩展是一种自定义 IDE 功能的方式。插件是最近添加到 Theia 中的一种新的可扩展性途径。 以下是插件和扩展的主要区别：

#### 插件

优点:
 + 代码隔离：作为独立进程运行的插件，不会阻塞Theia核心进程。
 + 可以在运行时加载，无需重新编译集成到 IDE 中。
 + 减少编译时长。
 + 自给自足： 插件可以打包成一个文件直接加载，无需从 npm 等资源中获取依赖。
 + 利于上手的 API
   + 无需学习 inversify 或任何框架。
   + 可通过代码补全来查看可调用的功能 API
 + 升级友好：可轻松从一个 Theia 版本升级到另一个版本，因为 API 向后兼容。

不足:
- 需要绑定预定义的 API，如果没有 API 提供扩展点，则无法扩展某些功能。注意，可以扩展当前 API 以支持更多能力；-)



### 设计

Theia 应用由一个核心，以及该核心串起各功能方向的 widget、命令、处理回调等。

Theia 定义了一个运行时 API，允许插件自定义 IDE 并将其行为添加到应用的各个方面。

在 Theia 中，插件可以通过名为 `theia` 的模块获得开发插件所需 API，该模块在所有插件中都可用。
[点击这里查看 API 详情](https://github.com/eclipse-theia/theia/blob/master/packages/plugin/README.md).

插件分为两种：
 - 后端插件：如果你熟悉 VS Code 扩展，那就非常清晰了。插件的代码在服务器端的进程中运行。 API 被调用，API 将在用户的浏览器/UI 上发送操作以注册新命令等。所有回调都在服务器端的专用进程上执行。
 - 前端插件：在这种情况下，回调在 UI/浏览器上的工作线程中执行。这些插件仅被授权使用“浏览器范围”的模块。因此，打开或写入文件是不可能的，因为插件的所有代码都在浏览器端运行。但是如果你真的想在客户端有一些操作来避免网络操作，这种方法会很有帮助。

## 前置条件

需要有一个可运行的 Theia IDE 实例。 (v0.3.12+)
获取 Theia 的使用说明可从 [Theia 仓库](https://github.com/eclipse-theia/theia#getting-started) 获得。

## 项目结构

我们将创建一个新项目，为此我们将创建一个名为 `theia-hello-world-plugin` 的文件夹，其中包含项目源码。

这个新文件夹可以在任何目录中创建，它独立于 Theia 源码。

为了简化操作过程，可用 [Yeoman code generator](https://www.npmjs.com/package/@theia/generator-plugin) 脚手架创建项目。

可以使用以下命令安装和执行生成器。 请注意，可以从正在运行的 Theia 实例中的新终端输入这些命令：

```bash
npm install -g yo @theia/generator-plugin
mkdir theia-hello-world-plugin
cd theia-hello-world-plugin
yo @theia/plugin
```

在前面的命令中:
- `npm install -g yo @theia/generator-plugin` 用来全局安装 Theia 生成器。
- `yo @theia/plugin` 命令调用 yeoman 生成器，产出插件开发模板。

这是生成器运行的示例：

<img src="/yeoman-plugin.gif" class="doc-image" alt="Yeoman plugin output">

为每一个选项选择默认值。

到这一步，在 `theia-hello-world-plugin` 文件夹中已经成功产出插件开发模板代码。


## 实现插件

来看一下产出代码：

```json
{
      "name": "theia-hello-world-plugin",
      "publisher": "theia",
      "keywords": [
        "theia-plugin"
      ],
      "version": "0.0.1",
      "files": [
        "src"
      ],
      "devDependencies": {
        "@theia/plugin": "latest", <-- 1. Theia API dependency
        "rimraf": "^2.6.2",
        "typescript": "^2.9.2"
      },
      "scripts": {
        "prepare": "yarn run clean && yarn run build",
        "clean": "rimraf lib",
        "build": "tsc"
      },
      "engines": {
        "theiaPlugin": "latest"  <-- 2. this plug-in requires Theia runtime
      },
      "theiaPlugin": {
        "backend": "lib/theia-hello-world-plugin-backend-plugin.js" 3. <-- entrypoint
      }
}
```

这个 `package.json` 中有三个重要部分：

1. 首先，在`devDependencies`中，有对`@theia/plugin`的依赖。 该包将在插件代码中用于调用 Theia API（如添加新命令和显示新信息消息）。

2. 其次，`engines` 部分包含`theiaPlugin`。 它用于配置插件允许执行的 Theia 版本。

3. 第三，`theiaPlugin` 用来配置插件的入口。 对于后端插件用 `backend` 为键，值为插件的 javascript 路径的路径。

让我们看一下已经生成的源代码文件，路径是 `src/theia-hello-world-plugin-backend-plugin.ts`。 它是 TypeScript 代码。


```typescript
import * as theia from '@theia/plugin';

export function start() {
    const informationMessageTestCommand = {
        id: 'hello-world-example-generated',
        label: "Hello World"
    };
    theia.commands.registerCommand(informationMessageTestCommand, (...args: any[]) => {
        theia.window.showInformationMessage('Hello World!');
    });

}

export function stop() {

}
```

如你所见，只需几行代码即可注册命令并显示通知消息。

第一个重要的行是 API 的导入： `import * as theia from '@theia/plugin';` 开发 Theia 插件的所有 API 都可从中获取。

在代码中，有 `start()` 和 `stop()` 两个方法。

加载插件时调用`start()`方法。 在此方法中，有一个动作：注册 hello world 命令和回调：将 `Hello World` 显示为信息消息。命令对象有`id` 和 `label`，它们将显示在命令面板中。

有一个空的 `stop()` 方法可用于插件停止时执行某些操作。此方法是可选的，不用可删除。

## 执行插件

现在来看下插件执行效果，Theia 中有一种称为 `hosted mode` 的模式。 使用这种模式时，可以在 Theia 实例中开发插件，然后在另一个 Theia 实例中部署插件。 从而很方便的开发插件并测试。

首先，请确保你已经打开了插件所在的文件夹。 （它需要成为工作区的一部分）
然后，在命令面板（例如按 F1 键）中搜索 `Hosted mode: start instance`，选择此命令：

<img class="doc-image" src="/hosted-plugin-start-instance.png" alt="Hosted mode: start instance" style="max-width: 800px">

浏览工作区并选择插件的文件夹（包含 `package.json` 文件）。

<img class="doc-image" src="/hosted-plugin-start-instance-select-path.png" alt="Hosted mode: start instance: select path" style="max-width: 500px">

它将在 `3030` 端口上生成一个新的 theia 实例。并打开一个新选项卡（也许需要你的验证），并且有一个新实例作为 `Development host` 运行（在状态栏中，您可以检查该名称）

<img class="doc-image" src="/hosted-plugin-development-host.png" alt="Hosted mode: development host" style="max-width: 300px">

在 `Development Host` 实例中，唤起命令面板（F1 键），然后搜索 `Hello World` 命令。

<img class="doc-image" src="/command-palette-hello-world.png" alt="Command Palette" style="max-width: 700px">

选择它，你将在屏幕上看到通知 “Hello World”。

<img class="doc-image" src="/hello-world-notification.png" alt="Hello World notification" style="max-width: 600px">


## 开发过程

如上所述，Theia API 使用的是 TypeScript，在开发时有对应的代码补全和代码提示可用。

## 升级插件

假如要将消息从 “Hello World” 更改为 “Hello Theia”。 则需进入 `Hosted Plugin: running` 实例（状态栏），编辑 TypeScript 文件 `src/theia-hello-world-plugin-backend-plugin.ts` 并执行以下更改：
将 `theia.window.showInformationMessage('Hello World!');` 替换为 `theia.window.showInformationMessage('Hello Theia!');`

从插件的根目录运行命令 `yarn build`，以便重新编译源代码。然后只需刷新 `Development Host`  实例，插件将再次重新加载。

注意：也可以使用 watch 模式。
## 插件 API
[Browse typedoc of plug-ins](https://eclipse-theia.github.io/theia/docs/next/modules/plugin._plugin_-1.html)

## VS Code implementation
Theia 正在兼容 VS Code API。 通过以下链接获取当前进展：
[Compare Theia vs VS Code API](https://eclipse-theia.github.io/vscode-theia-comparator/status.html)

