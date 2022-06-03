---
title: Authoring an Extension
---

# 开发 Theia 扩展

作为演示，我们将创建一个 Say hello 的菜单项，用来展示提示信息 “Hello world！”，本文将讲解所有步骤。

## Theia 的架构

Theia 的应用由扩展组成，扩展为一个特定功能，可以提供 widgets、命令、处理程序等。Theia 本身提供了许多扩展，例如 用于编辑器、终端、项目视图等。每个扩展都存放在自己的 npm 包中。

Theia 定义了大量可扩展的接口，允许扩展将它们的行为添加到应用的各个方面。 只需搜索名称为 `*Contribution` 的接口即可了解。 扩展实现属于它想要提供功能的接口。 在这个例子中，我们将实现一个 “CommandContribution” 和一个 “MenuContribution”。 扩展与 Theia 应用交互的其他方式是通过各种服务（services） 或管理器（managers）。

在 Theia 中，一切都由 [依赖注入](/docs/Services_and_Contributions#dependency-injection-di) 连接起来。 一个扩展定义了一个或多个依赖注入模块。这是它将其能力绑定到对应扩展接口的地方。 这些模块列在扩展包的 `package.json` 中。 扩展可以应用在前端，例如：提供 UI 的扩展，也可以用在后端，例如：提供一个语言服务的扩展。当应用启动时，这些模块的联合分别在前端和后端配置一个全局依赖注入容器。 然后，运行时将通过多重注入收集特定类型的扩展。

## 前置条件

关于前置条件信息可从 [Theia 存储库](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites) 中查看。

## 项目结构

我们将创建一个名为 `theia-hello-world-extension` 的 monorepo（包含多个 npm 包的存储库），其中包含三个包：`hello-world-extension`、`browser-app` 和 `electron-app`。第一个包含我们的扩展，后两个分别应用在浏览器和 Electron 模式下运行扩展。我们将使用 `yarn` 而不是 `npm`，因为它允许将这样的 monorepos 构建到工作区中。在我们的例子中，每个工作区都包含自己的 `npm` 包。这些包的公共依赖项被 `yarn` “提取”到它们的公共根目录。我们还将使用 lerna 跨工作区运行脚本。

为了简化此类仓库的配置，我们创建了 [代码生成器](https://www.npmjs.com/package/generator-theia-extension) 来为项目搭建脚手架。它将生成 `hello-world` 示例。运行命令为：

```bash
npm install -g yo generator-theia-extension
mkdir theia-hello-world-extension
cd theia-hello-world-extension
yo theia-extension # select the 'Hello World' option and complete the prompts
```

现在来看看生成的代码，根 `package.json` 定义了工作空间、对 `lerna` 的依赖，以及一些用于浏览器或 electron 构建本地包的脚本。

```json
{
  "private": true,
  "scripts": {
    "prepare": "lerna run prepare",
    "rebuild:browser": "theia rebuild:browser",
    "rebuild:electron": "theia rebuild:electron"
  },
  "devDependencies": {
    "lerna": "2.4.0"
  },
  "workspaces": [
    "hello-world-extension", "browser-app", "electron-app"
  ]
}
```

用一个 `lerna.json` 文件来配置 `lerna`：

```json
{
  "lerna": "2.4.0",
  "version": "0.1.0",
  "useWorkspaces": true,
  "npmClient": "yarn",
  "command": {
    "run": {
      "stream": true
    }
  }
}
```

## 实现扩展

接下来让我们看看 `hello-world-extension` 文件夹中为扩展生成的代码。 先从 `package.json` 开始。，它指定了包的元数据、它对（前沿）Theia 核心包的依赖项、一些脚本和开发依赖以及 theia 扩展。

关键字 `theia-extension` 很重要：它允许 Theia 应用程序从 `npm` 识别和安装 Theia 扩展。

```json
{
  "name": "hello-world-extension",
  "keywords": [
    "theia-extension"
  ],
  "version": "0.1.0",
  "files": [
    "lib",
    "src"
  ],
  "dependencies": {
    "@theia/core": "latest"
  },
  "devDependencies": {
    "rimraf": "latest",
    "typescript": "latest"
  },
  "scripts": {
    "prepare": "yarn run clean && yarn run build",
    "clean": "rimraf lib",
    "build": "tsc",
    "watch": "tsc -w"
  },
  "theiaExtensions": [
    {
      "frontend": "lib/browser/hello-world-frontend-module"
    }
  ]
}
```

最后一个属性 `theiaExtensions` 是我们列出导出依赖注入模块的 JavaScript 模块的地方，这些依赖注入模块定义了扩展的绑定。 在例子中，我们只提供了一个前端功能（一个命令和一个菜单项）。 同样，你还可以定义对后端的扩展，例如：语言服务的语言扩展。

在前端模块中，我们导出一个默认对象，即 [InversifyJS `ContainerModule`](https://github.com/inversify/InversifyJS/blob/master/wiki/container_modules.md)，其中包含命令和菜单的贡献点绑定。

```typescript
export default new ContainerModule(bind => {
    // add your contribution bindings here
    bind(CommandContribution).to(HelloWorldCommandContribution);
    bind(MenuContribution).to(HelloWorldMenuContribution);
});
```
命令是定义 ID 和标签的普通数据结构，命令的行为是通过在命令贡献点中，将处理程序注册到对应的 ID 上实现的。 生成器已经添加了一个命令和一个显示“Hello World！”的处理程序。

```typescript
export const HelloWorldCommand = {
    id: 'HelloWorld.command',
    label: "Shows a message"
};

@injectable()
export class HelloWorldCommandContribution implements CommandContribution {

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(HelloWorldCommand, {
            execute: () => this.messageService.info('Hello World!')
        });
    }
}
...
```

请注意我们是如何在构造函数中使用 `@inject` 来获取 `MessageService` 作为属性的，以及我们后续在处理程序的实现中如何使用它。这些就是依赖注入的优雅之处：作为需求方，我们既不关心这些依赖来自哪里，也不关心它们的生命周期是什么。

为了让 UI 可以访问它，我们实现了一个“MenuContribution”，将一个菜单添加到菜单栏中编辑菜单的搜索/替换部分。

```typescript
...
@injectable()
export class HelloWorldMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
                commandId: HelloWorldCommand.id,
                label: 'Say Hello'
            });
    }
}
```

## 浏览器中执行扩展

现在我们想看到扩展的运行。 为此，生成器在“browser-app”文件夹中创建了一个“package.json”。 它定义了一个带有几个静态扩展的 Theia 浏览器应用，包括我们的 `hello-world-extension`。 此目录中的其他文件均由 `yarn` 在构建期间调用 `theia-cli` 工具自动生成，具体见脚本中定义 cli 的命令。

```json
{
  "name": "browser-app",
  "version": "0.1.0",
  "dependencies": {
    "@theia/core": "latest",
    "@theia/filesystem": "latest",
    "@theia/workspace": "latest",
    "@theia/preferences": "latest",
    "@theia/navigator": "latest",
    "@theia/process": "latest",
    "@theia/terminal": "latest",
    "@theia/editor": "latest",
    "@theia/languages": "latest",
    "@theia/markers": "latest",
    "@theia/monaco": "latest",
    "@theia/messages": "latest",
    "hello-world-extension": "0.1.0"
  },
  "devDependencies": {
    "@theia/cli": "latest"
  },
  "scripts": {
    "prepare": "theia build",
    "start": "theia start",
    "watch": "theia build --watch"
  },
  "theia": {
    "target": "browser"
  }
}
```

现在我们将所有部分组合在一起来构建和运行应用，要运行浏览器应用程序，请执行：

```bash
cd browser-app
yarn start <path to workspace>
```

并在浏览器中访问 http://localhost:3000. 然后从菜单栏中选择 编辑 > Say Hello：一条 "Hello World!" 弹窗提示即可出现。

## 在 Electron 中执行扩展

Electron 应用的 `package.json` 除了 name 和 target 属性，其余看起来几乎相同。

```json
{
  "name": "electron-app",
  ...
  "theia": {
    "target": "electron"
  }
}
```

在运行 Electron 应用之前，你必须先构建一些原生模块：

```bash
yarn rebuild:electron
cd electron-app
yarn start <path to workspace>
```

## 发布扩展

如果你想让扩展公开可用，我们建议将其发布到 npm。 可通过从扩展包的目录中执行 `yarn publish` 实现。 当然，前提是你要有一个有效的 npm 帐户。
