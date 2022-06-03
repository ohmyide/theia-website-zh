---
title: Extensions
---

# 扩展和插件

Theia 采用充分的模块化和可扩展的方式设计，它支持三种方式来扩展适配你的具体要求。这些是互补的，针对不同的使用场景，选择最佳方案，甚至在同一个项目中混合使用。
在下文中，我们先讲解一个可用的扩展机制的概述，并在后续章节中提供更多细节。

- **VS Code 扩展**: 编写简单，可在运行时安装，与 VS Code 兼容，仅限于 VS Code 的扩展 API，受 API 的限制，有些场景无法实现，只能用于为现有工具增加功能。注意，你也可以在Theia 内使用现有的 VS Code 扩展。
- **Theia 扩展**: 在编译时安装，通过依赖注入的方式可完全访问 Theia 内部，在可访问的 API 方面几乎没有限制，用于构建自定义产品和 VS Code 扩展 API 未涵盖的功能。请注意，Theia项目（包括核心）是以模块化的方式完全使用 Theia 扩展构建的。
- **Theia插件**。像 VS Code 扩展，额外访问一些 Theia 特定 API 和前端（前端插件），特定的 Theia 部分与 VS Code 不兼容。

下图显示了所有三个选项的高层次架构。VS Code 扩展和 Theia 插件在一个专门的进程中运行，可以在运行时安装，仅能调用插件特定的 API。Theia 扩展在编译时被添加，并成为 Theia 应用程序的核心部分，它们可以访问 Theia 的全部 API。

<img src="/extensiontypes.png" alt="Theia Logo Blue" style="max-width: 525px">

想获取关于使用哪种机制的更多指导，请参考 [VS Code 扩展和 Theia 扩展之间的详细比较](https://eclipsesource.com/blogs/2021/03/24/vs-code-extensions-vs-theia-extensions/)。

## VS Code 扩展

VS Code 扩展是广泛的使用机制，可以通过新的语言支持和其他功能扩展 VS Code，其扩展的开发很简单，它们可以访问定义好的、受限的 API。VS Code 扩展可以预先安装（内置），但也可以在运行时安装（例如由用户安装）。Theia 提供了与 VS Code 相同的扩展 API，因此在扩展上是兼容的。如果要开发自己的扩展，请参考 [VS Code 扩展文档](https://code.visualstudio.com/api)，以及[覆盖报告](https://eclipse-theia.github.io/vscode-theia-comparator/status.html)，文档表明可 VS Code 的哪些 API 被 Theia 所覆盖。
也请注意，你也可以在 Theia 中使用现有的 VS Code 扩展。安装或下载扩展的好的来源是 [Open VSX registry](https://open-vsx.org/)。

## Theia 扩展

Theia 扩展是驻扎在 Theia 应用中的模块，直接与其他模块（Theia扩展）进行通信。Theia 项目本身也是由 Theia 扩展组成的，要创建 Theia 应用，你可以选择 Theia 项目默认提供的一些 Theia 扩展（核心扩展），添加你自己的自定义 Theia 扩展，然后编译和运行产品。你的自定义 Theia 扩展将可以访问与核心扩展相同的 API。这种模块化架构允许你根据自己的需求扩展、调整或删除 Theia 中的几乎任何东西。另外与 VS Code 扩展相比，在特定的场景下，如复杂的视图，用 Theia 扩展更容易开发。
从技术上讲，扩展是一个 npm 包，它暴露了大量 DI 模块（`ContainerModule'），有助于 DI 容器的创建。
扩展是通过在应用或扩展的 `package.json` 中作为依赖声明来消费的，并在编译时安装。
关于编写 Theia 扩展的更多细节，请参见 [本节](https://theia-ide.org/docs/authoring_extensions/)。

## Theia 插件

Theia 插件是一种特殊类型的 VS Code 扩展，只在 Eclipse Theia 中运行。它们共享 VS Code 扩展的架构和其他属性，它们也可以访问只在 Theia 而不是 VS Code 中可用的 API。最值得注意的是，Theia 插件还可以直接对前端做出扩展，而 VS Code 扩展则被限制在后端。因此，Theia 插件可以直接操作用户界面，而不需要通过 webview 抽象，从而简化了开发过程。关于 Theia 插件的更多细节，请参见[本节](https://theia-ide.org/docs/authoring_plugins/)。
