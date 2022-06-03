---
title: Advanced Tips
---

# 高阶技巧

这一节，我们讲解一些高阶技巧，以便从基于 Theia 的工具中获得最大收益。

## 在 Theia 中为 VS Code 扩展提供自定义 API

Theia 通过提供兼容的 API 允许运行 VS Code 扩展（详见[本章节](https://theia-ide.org/docs/extensions/)）。
可以对 API 进行扩展，让在 Theia 中运行的 VS Code 扩展，获得比在 VS Code 自身中运行时更多的功能。
它允许你将一个功能作为 VS Code 扩展同时提供给 VS Code 和 Theia。然而，当在 Theia 中运行时，该功能仅可以通过在 Theia 中支持自定义 API 来增强。

下面例子展示了自定义 API 的用法，只有在基于 Theia 的应用中才可调用，这是由应用的名称决定的。
API 是异步导入，以避免在 VS Code 中出现运行时错误。


```typescript
if (vscode.env.appName === MY_THEIA_APP_NAME) {
    // Implement Theia API
    const api = await import('@mytheiaextension/mycustomapi');
    // After importing the custom API, it can be used as any other API. The following lines are using an example API.
    api.host.getMessageHandler(() => getMessage());
    api.host.onRequestMessage((actor: string) => {
        const message = getMessage(actor);
        api.host.showMessage(message);
    });
}
```

另一个提供自定义 API 的方式是用自定义命令。同样，这些命令只有在 Theia 中运行 VS Code 扩展时才可用（见下面的代码例子）。

```typescript
if (vscode.env.appName === MY_THEIA_APP_NAME) {
    // Execute Theia custom command
    const commands = await vscode.commands.getCommands();
    if (commands.indexOf(MY_THEIA_CUSTOM_COMMAND) > -1) {
        vscode.commands.executeCommand(MY_THEIA_CUSTOM_COMMAND);
    }
}
```

这种方式的案例见：

https://github.com/thegecko/vscode-theia-extension
