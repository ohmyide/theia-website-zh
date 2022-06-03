---
title: Packaging Theia as a Desktop Product
---

# 打包 Theia 桌面应用

将Theia打包成一个桌面产品

Eclipse Theia Blueprint 作为产品案例，用于演示如何在 Theia 上构建桌面 IDE 产品，它集合了现有 Theia 功能和优秀扩展，我们提供 Theia Blueprint 的安装程序供下载（见以下链接）。在 git 仓库中，也可以找到 Theia Blueprint 及其安装包的源码。

本文档将用此代码演示如何定制模板，以便你可以构建自己的 Theia 产品，包括安装程序和打包，从而在主流操作系统上安装桌面版产品。

## 构建产品和安装包

Theia Blueprint 用 [electron-builder](https://www.electron.build/)打包的桌面应用，用 [yarn](https://yarnpkg.com/) 作为命令工具。
需注意，通常只能用执行构建的操作系统上打包对应操作系统的产品，更多信息请参见 [electron-builder的多平台构建文档](https://www.electron.build/multi-platform-build)。

以下命令可以从版本库的根目录中运行。

安装依赖和构建，只需执行 `yarn`。

也可以直接运行未打包的应用程序，例如：在开发过程中尝试用 `yarn electron start` 启动运行。

用 `yarn electron package`，可以打包适用于当前操作系统的可执行文件。

打包后的应用位于 `applications/electron/dist` 文件夹中。

`applications/electron/dist/<OS>-unpackaged` 文件夹包含对应操作系统的可执行文件。

对于 Linux 来说，这是一个可执行的 `.AppImage`，对于Windows来说是一个 `.exe` 安装程序，而对 macOS 来说是一个 `.dmg` 安装包。

也可以通过运行 `yarn electron package:preview` 避免打包过程，这方便查看 bundle 文件，与完整的打包流程相比，更加节省时间。

可以用 `yarn electron deploy` 命令发布当前版本。

关于发布的更多信息，请参见 "配置发布和更新" 小节。

## 应用包签名

[Electron-builder](https://www.electron.build/) 支持在 Windows 和 macOS 上对打包的应用进行签名。
Theia Blueprint 的当前签名脚本位于 `applications/electron/scripts` 中的 `after-pack.js`，也是 Eclipse 默认配置签名的入口。

但是，由于签名高度依赖于你的设定，请参阅 [electron builder 的签名文档](https://www.electron.build/code-signing)，了解如何正确设置自己的签名。

## Updating Bundled VS Code Extensions

包含在产品中的 VS Code 扩展都在 `applications/electron/package.json` 中定义，它们以 K-V 键值对的形式配置在 `theiaPlugins` 中。

可以自由选择扩展路径，只要是有效的文件夹名称并在 `theiaPlugins` 配置中是唯一的即可，我们建议使用扩展程序的唯一标识符，该值是扩展的下载 URL，它在应用构建过程中自动下载，后续执行以下 npm 脚本之一时，都会自动下载新插件：

- `install` (等同于 `yarn`)
- `prepare`
- `download:plugins`

要从产品中删除扩展，只需删除其条目即可，如果尚未下载插件，则不需要进一步操作，因为下载的插件会被 gitignore 忽略，但以前下载的插件不会自动删除，需要从 `applications/electron/plugins` 文件夹中手动删除整个文件夹。或者，可以删除整个 `applications/electron/plugins` 文件夹并执行 `yarn electron download:plugins` 下载所有插件。

### 扩展之源

我们使用 Eclipse Foundation 的 [Open VSX Registry](https://open-vsx.org/) 来安装扩展，它是由开源社区驱动的 VS Code 扩展市场，更多信息在 [eclipse.org](https://www.eclipse.org/legal/open-vsx-registry-faq/) 上找到。


## 自定义 Theia 扩展

Eclipse Theia 扩展可以通过 `applications/electron/package.json` 中的 `dependencies` 添加，像其他依赖一样，用 yarn 来安装和删除，对于已经在 npm（或你的私有 npm 注册表）上发布的扩展，除了这些操作再无其他。

另一种方法是在 Theia Blueprint 的 monorepo 中开发自己的扩展，这样的好处是不需要发布扩展，并且可以使用本地版本的扩展构建产品，Theia Blueprint 的仓库的 lerna 配置有助于实现这一点，它在构建期间将产品和仓库中的扩展链接在一起。

创建新扩展的最简单方法是使用 Theia 的 [official yeoman generator](https://www.npmjs.com/package/generator-theia-extension)，假设你的系统上全局安装了 [yeoman](https://yeoman.io/)，只需使用 `yo theia-extension --standalone` 即可在仓库根目录中创建新扩展。`--standalone` 标志仅用于创建扩展而不是整个 Theia 应用框架，因为它已由 Theia 蓝图提供。扩展生成后，将文件夹名称添加到 Theia Blueprint 根 `package.json` 的 workspaces 配置中，如上所述将扩展添加到 `applications/electron/package.json` 中的依赖后，新扩展将成为构建产品的一部分。

## 品牌推广

你还可以自定义应用的图标、标题、欢迎页和 About 对话框，将自己的品牌添加到产品中，此外，安装程序的其他部分也可以自定义。

### 自定义应用

#### 应用窗口标题

如果没有打开工作区，窗口标题默认是应用的名称，如果打开了工作区，则是`<工作区名称> - <应用程序名称>`，应用的名称可以在 `applications/electron/package.json` 中调整，打开该文件，将属性 `theia.frontend.config.applicationName` 的值改为理性的名称即可。

#### 应用 Icon

应用的图标位于 `applications/electron/resources/` 中，可用自己的图标将其替换，由于每个操作系统处理图标的方式不同，它们都应该被替换以确保正确使用，它们的对应关系如下：

- macOS: icons.icns
- Windows: icon.ico
- Linux: icons subfolder

### 自定义欢迎页

欢迎页可以通过 `GettingStartedWidget` 绑定一个自定义的 `WidgetFactory` 来定制，在 Theia Blueprint 中是用 Theia-Blueprint-product 扩展实现的。

定制欢迎页面的最简单的方法是更改 `theia-extensions/theia-blueprint-product/src/browser/theia-blueprint-getting-started-widget.tsx` 中的`TheiaBlueprintGettingStartedWidget` 类。

此 widget 在 `theia-extensions/theia-blueprint-product/src/browser/theia-blueprint-frontend-module.ts` 中被绑定，像这样：

```typescript
    bind(TheiaBlueprintGettingStartedWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(context => ({
        id: GettingStartedWidget.ID,
        createWidget: () => context.container.get<TheiaBlueprintGettingStartedWidget>(TheiaBlueprintGettingStartedWidget),
    })).inSingletonScope();
```

要使用自己的 widget，请删除此代码并绑定自己的即可。

### 定制 About 弹框

通过绑定 `AboutDialog` 类的自定义子类可以定制 Theia 的 About 弹框，在 Theia Blueprint中，这是用 Theia-blue-product 扩展实现的。

定制 About 弹框的最简单的方法是更改 `theia-extensions/theia-blueprint-product/src/browser/theia-blueprint-about-dialog.tsx` 中的`TheiaBlueprintAboutDialog` 类。

该 widget 在 `theia-extensions/theia-blueprint-product/src/browser/theia-blueprint-frontend-module.ts`中像这样绑定：

```typescript
isBound(AboutDialog) ? rebind(AboutDialog).to(TheiaBlueprintAboutDialog).inSingletonScope() : bind(AboutDialog).to(TheiaBlueprintAboutDialog).inSingletonScope();
```

要用自定义的About 弹框 widget，请删除这段代码，扩展 Theia 的 AboutDialog 类，并像上面那样（重新）绑定。

### 自定义安装程序

安装器是用 [electron-builder](https://www.electron.build/) 创建的，相应的配置文件位于 `applications/electron/electron-builder.yml`。

#### 安装包名称

安装文件的名称由 `applications/electron/electron-builder.yml` 中的 `productName` 属性定义。

#### Windows Installer

和 Windows 的应用安装一样，Theia Blueprint 的 Windows 版本也有一个安装向导，是在配置文件的 nsis 部分配置的，可定制以下设置：

- Icons
- Sidebar image
- License
- One click installation
- Automatic application start after installation
- Whether users can change the installation directory

关于更多可配置选项以及如何定制这些选项，可以在[官方 electron builder 文档](https://www.electron.build/configuration/nsis) 中找到，该文档还包括其他高级功能，如自定义 NSIS 脚本。

## 配置发布和更新

Theia Blueprint 使用 [electron-builder](https://www.electron.build/)，它还使用由 electron-builder 组织开发的 [electron-updater](https://www.npmjs.com/package/electron-updater) 提供应用的自动更新。

部署方式，可在`applications/electron/package.json` 和 `applications/electron/electron-builder.yml` 中配置，在 Electron Builder [文档中](https://www.electron.build/configuration/publish)有说明。

还可以配置多个发布配置，第一个配置会被更新器自动使用，以寻找可用的更新，目前使用的默认发布方法不会自动发布到指定的服务器上，只是作为更新器的查找地址。
