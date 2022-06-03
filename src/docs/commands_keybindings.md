---
title: Commands/Menus/Keybindings
---

# 命令、菜单以及快捷键

命令由 ID 和对应的执行函数组成（以及一些可选参数，如名称或图标）。命令可以通过命令面板触发，它们可以绑定到键绑定或菜单项，并且可以通过程序调用。命令触发的动作是与执行环境紧密相连的，因此它们只能在特定条件下调用（如：窗口被选中、当前项被选择等）。

以下部分介绍如何提供命令、快捷键绑定和菜单项的详细信息，将描述如何使用不同的贡献点以及如何使用相应的服务来管理这些选项。

如果你还不熟悉 Theia 中的贡献点或依赖注入的使用，请参考 [Services and Contributions 指南] (https://theia-ide.org/docs/services_and_contributions/)。

以下所有代码示例均来自 [Theia 扩展生成器](https://github.com/eclipse-theia/generator-theia-extension)。你可以用生成器生成通用的代码（“Hello World”示例）

## 创建命令

通过命令贡献点，你可以向 Theia 添加自定义操作。用户可以通过命令面板、快捷键绑定或菜单条目触发命令，同样也可以通过代码调用。

Theia 应用的所有命令都在 `CommandRegistry` 中管理。要向命令注册表中贡献命令，模块必须实现 `CommandContribution` 接口（参见下面的代码示例）。

命令是由一个包含 `id` 和一个用户可选的 `label` 对象组成（参见下面示例中的 HelloworldCommand）。 命令贡献接收 `registerCommands` 函数中的 `CommandRegistry` 作为参数。 然后以此调用 `registerCommand` 来注册该命令。除了命令之外，还需要提供一个回调，该回调在命令被触发时执行（`CommandHandler`）。 在示例中，该命令使用 MessageService 来实现 “say hello”。

**helloworld-contribution.ts**
```typescript
export const HelloworldCommand: Command = {
   id: 'Helloworld.command',
   label: "Say Hello"
};
 
@injectable()
export class HelloworldCommandContribution implements CommandContribution {
 
   constructor(
       @inject(MessageService) private readonly messageService: MessageService,
   ) { }
 
   registerCommands(registry: CommandRegistry): void {
       registry.registerCommand(HelloworldCommand, {
           execute: () => this.messageService.info('Hello World!')
       });
   }
}

```

为了使命令执行上下文更加可控，`CommandHandler` 可以选择实现 `isEnabled` 和 `isVisible`。您可以选择注册多个 `CommandHandler` 并让命令根据当前上下文执行其中一个。要为命令注册其他处理程序，请使用 `CommandRegistry` 上的 `registerHandler` 函数
执行命令时，命令注册表会检查所有已注册的处理程序。在 `isEnabled` 上返回 true 的第一个处理函数视为活跃状态，并将被执行，且同一时刻应该只有一个处理函数处于活跃状态（`isEnabled === true`）。 `isVisible` 控制连接到命令的菜单项和工具项是否可见，以及命令是否显示在命令面板中。如果行为处理函数返回 true，则菜单项将可见，反之亦然。
最后，通过实现 `isToggle`，处理函数可以选择绑定命令的菜单项是打开还是关闭。


### 绑定到 CommandContribution 贡献点

为了让我们的 `CommandContribution` 能够被 Theia 访问，我们需要将自定义的 `HelloworldCommandContribution` 与对应的贡献点标识符 `CommandContribution` 绑定。这是在 `helloworld-frontend-module` 中实现的，更多细节见 [Services and Contributions](https://theia-ide.org/docs/services_and_contributions/)。

**helloworld-frontend-module.ts**
```typescript
export default new ContainerModule(bind => {
   // add your contribution bindings here
   bind(CommandContribution).to(HelloworldCommandContribution);
...
});
```

上述用来注册命令的 `CommandRegistry` 也提供了与命令交互的 API。例如，你可以用代码方式执行命令，可以浏览所有注册的命令，可以访问最近执行的命令列表。更多细节请参考[TypeDoc for the CommandRegistry](https://eclipse-theia.github.io/theia/docs/next/classes/core.commandregistry-1.html)。要在贡献点之外使用 `CommandRegistry`，你可以通过依赖注入来访问它。

在下面的章节中，我们将阐述如何将命令与菜单项、快捷键绑定。

## 扩展菜单项

Theia允许扩展菜单项，这些菜单项将显示在 Theia 应用程序的特定菜单中。菜单项与命令绑定，用户可以此触发动作（请见上面关于命令的部分）。

下面所有的代码例子由 [Theia extension generator](https://github.com/eclipse-theia/generator-theia-extension) 产出，你可以通过安装生成器，选择"helloworld "作为名称来产出同样的代码，[here](https://github.com/eclipse-theia/generator-theia-extension)。

Theia 应用的所有菜单项都在 MenuModelRegistry 中管理。为了向注册表中贡献菜单项，模块必须实现 "MenuContribution"接口（见下面的代码示例）。

命令的注册可以在函数 registerMenus 中完成，它在 Theia 框架中调用，该函数以 MenuModelRegistry 作为参数，在这个注册表上，我们可以调用 registerMenuAction。它的参数有MenuPath 和 MenuAction，MenuPath 指定了要放置菜单项的菜单（和子菜单）。关于一些常见菜单的路径，[请点击这里](https://eclipse-theia.github.io/theia/docs/next/modules/core.commonmenus-1.html)。

MenuAction 包含一个命令 ID，和一个可选的 label 标签，分别用于指定要触发的命令和菜单项。

**helloworld-contribution.ts**
```typescript
@injectable()
export class HelloworldMenuContribution implements MenuContribution {
 
   registerMenus(menus: MenuModelRegistry): void {
       menus.registerMenuAction(CommonMenus.EDIT_FIND, {
           commandId: HelloworldCommand.id,
           label: HelloworldCommand.label
       });
   }
}
```

为了让 `MenuContribution` 能够被 Theia 访问，我们需要将自定义的 `HelloWorldMenuContribution` 与对应的贡献点标识符 `MenuContribution` 绑定。这是在`helloworld-frontend-module`中完成的，更多细节见[Services and Contributions](https://theia-ide.org/docs/services_and_contributions/)。

**helloworld-contribution.ts**
```typescript
export default new ContainerModule(bind => {
   bind(MenuContribution).to(HelloworldMenuContribution);
      ...
});

```

注意，你也可以创建没有命令的菜单项，这允许你创建自定义的顶层菜单和子菜单。要做到这一点，请先新建一个没有命令的菜单项，然后在其他贡献中引用这个菜单项的 id 作为 `MenuPath`。这将为你的自定义菜单添加菜单项。

## 实现快捷键绑定

快捷键绑定允许用户使用特定的按键组合来触发命令。快捷键绑定可以定义条件，指定它们何时被激活。比如：有一些快捷键，只有当文本编辑器被聚焦时才会激活。

需注意，下面的代码例子不是生成的模板的一部分，你需要手动编辑它们（见前面的章节）。

要开发一个快捷键绑定，需实现 `KeybindingContribution` 接口（见下面的代码例子），通过它可以访问 `KeybindingRegistry` 来实现快捷键注册。快捷键由以下部分组成。

* `keybinding`: 快捷键组合
* `command`: 要触发的命令ID
* `when`(可选): 快捷键被激活的条件

**helloworld-keybinding-contribution.ts**
```typescript
export class HelloworldKeybindingContribution implements KeybindingContribution {
    registerKeybindings(keybindings: KeybindingRegistry): void {
        keybindings.registerKeybinding({
            keybinding: "alt+enter",
            command: 'Helloworld.command',
            when: 'editorFocus && editorIsOpen'
        });
    }
}
```

上述 `when` 配置遵循 [VS Code terminology](https://code.visualstudio.com/docs/getstarted/keybindings#_when-clause-contexts)。键盘映射做到了平台兼容，在OS X上是Command，在Windows/Linux上是 CTRL。键值数据可以在[`Key` documentation](https://eclipse-theia.github.io/theia/docs/next/modules/core.key-2.html)中查看。

和之前的贡献点绑定方式一样，快捷键的贡献也需要绑定到 `KeybindingContribution` 上，以便让 Theia 能够访问到。

**editor-frontend-module.ts**
```typescript
export default new ContainerModule(bind => {
    bind(KeybindingContribution).to(HelloworldKeybindingContribution);
    ...
});

```
