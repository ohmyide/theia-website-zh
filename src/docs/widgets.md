---
title: Widgets
---

# Widgets

widget 是在 Theia 工作台面板上显示内容的部分，可能是一个视图或一个编辑器。Theia 中现有的 widget 例子是文件资源管理器、代码编辑器以及报错面板。通过扩展自定义的 widget，你可以在 Theia 应用中嵌入自定义 UI。你的自定义 UI 在窗口布局方面的行为与其他 widget 相同，包括标题标签、调整大小、拖动以及打开/关闭动作（见下面的截图）。


<img src="/widget-example.gif" alt="Widget Example" style="max-width: 525px">

此外，widget 能从周边工作台上接收事件，例如，在应用启动时、在调整大小时或在销毁时。不过，一个 widget 的实际的内容展示信息，完全由自己定义。作为一个例子，你可以在一个 widget 中使用 React 实现一些自定义的 UI。

简而言之，widget 是一个框架能力，用于将一些自定义（基于HTML的）UI 嵌入 Theia 工作台（见下图）。

<img src="/widget-architecture.png" alt="Widget Architecture" style="max-width: 525px">

本文档将介绍如何为 Theia 工作台扩展一个自定义的 Widget。我们将专注实现一个简单的视图组件（而非复杂的代码编辑器），并使用 React 来实现界面 UI。

如果你还不熟悉 Theia 的贡献点或依赖注入的使用机制，请参考 [Services and Contributions](https://theia-ide.org/docs/services_and_contributions/) 指南。

如果想看示例代码，请使用 [Theia extension generator](https://github.com/eclipse-theia/generator-theia-extension)。安装并选择 “Widget” 示例，输入 “MyWidget” 作为扩展名称。

## 实现一个 Widget（视图）。

在例子中，要实现一个 Widget 需要由三个部分组成：

<ul>
<li>一段完整的<b>widget</b>代码实现，包含：
    <ul>
    <li>基本参数，如 ID、label 和 icon图标</li>
    <li>具体的 UI 实现和它的操作行为</li>
    <li>处理生命周期事件，如 "onUpdateRequest" 或 "onResize"</li>
    </ul>
</li>
<li>一个<b> Widget 类</b>用于产出 widget 实例</li>
<li>一个<b> Widget 贡献点</b> 用于将视图与 Theia 工作台连接起来，以便可以从 Theia 工作台中打开 widget，比如通过视图菜单打开。</li>
</ul>

### 实现一个 Widget

为实现自定义 widgets，Theia 提供了几个基类来继承。这些基类已经实现了 widgets 所需的大部分功能，从而让开发者专注于创建自定义 UI。Theia 不依赖于特定的 UI 技术实现，用 React、Vue.js 或 Angular 都可实现。它们通过各自的基类来提供便捷的支持，如 React 模块。为避免纠结，使用 React 是目前实现自定义 widgets 的首选。下面是类的结构关系图。如果你想用 React 实现一个 widget，选择 `ReactWidget` 作为基类。如果你想实现一个树结构的 widget，请使用 `TreeWidget`。如果你不想使用 React，可以用 `BaseWidget`。查看 `BaseWidget` 的类结构关系，了解更多可用选项。

<ul>
<li>BaseWidget
    <ul>
    <li><b>ReactWidget</b>
        <ul>
        <li>TreeWidget</li>
        <li>…</li>
        </ul>
    </li>
    </ul>
</li>
</ul>

在代码案例中，我们用 `ReactWidget` 作为基类。如下图所示，先用一些基本参数来初始化 widget：


* `id`: 用于 widget 的唯一标识，比如用 WidgetManager 打开 widget 时用到。
* `label`: 用于 widget 打开时的标签显示。
* `caption`: 用于 widget 打开时，在标签上的悬停显示。
* `closable`: 配置用户是否可以关闭 widget（通过标签中的 "x" 或右键菜单）。
* `iconClass`: 用于 widget 打开时，在标签上的图标展示。

**mywidget-widget.ts**
```typescript
@injectable()
export class MyWidget extends ReactWidget {

static readonly ID = 'my:widget';
static readonly LABEL = 'My Widget';

@postConstruct()
protected async init(): Promise < void> {
    this.id = MyWidget.ID;
    this.title.label = MyWidget.LABEL;
    this.title.caption = MyWidget.LABEL;
    this.title.closable = true;
    this.title.iconClass = 'fa fa-window-maximize'; // example widget icon.
    this.update();
}
```

基类能让我们只专注于 widget 的自定义 UI 部分，做到了真正意义上的最小成本。在例子中，我们只实现了渲染函数，该函数将创建 UI 界面（使用JSX/React）。这个例子的 UI 包含一个按钮，用于触发 `displayMessage` 函数。

**mywidget-widget.ts**
```typescript
protected render(): React.ReactNode {
    const header = `This is a sample widget which simply calls the messageService in order to display an info message to end users.`;
    return <div id='widget-container'>
              <AlertMessage type='INFO' header={header} />
              <button className='theia-button secondary' title='Display Message' onClick={_a => this.displayMessage()}>Display Message</button>
           </div>
}

@inject(MessageService)
protected readonly messageService!: MessageService;
  
protected displayMessage(): void {
    this.messageService.info('Congratulations: My Widget Successfully Created!');
}
```

请注意，你也可以覆盖 `BaseWidget` 或 `ReactWidget` 来创建一个特定的 widget 生命周期钩子函数，如 `onUpdateRequest` 或 `onResize`。这些事件是由底层窗口管理框架 [Phosphor.js](https://phosphorjs.github.io/) 定义的，关于 `Widget` 类，请看 [这篇文档](http://phosphorjs.github.io/phosphor/api/widgets/classes/widget.html)。

除了编写 widget，你还需要用 Theia 工作台把它连接起来，这将在接下来的两节中介绍。

### 实现一个 Widget 工厂

Theia中的 Widget 由中央服务 `WidgetManager` 来实例化和管理。这使得应用可以持续管控所有创建的 widget。例如，`WidgetManager`支持 `getOrCreate` 函数，如果已经创建，它将返回一个现有的 widget，如果没有，则创建一个新。

为了使一个自定义的 widget 可以被 widget 管理器实例化，你需要注册 `WidgetFactory`。一个 widget 工厂由 ID 和创建 widget 的函数组成，widget 管理器将收集所有贡献的widget 工厂，并根据 ID 匹配各自的 widget。

在我们的例子中（见下面的代码），首先将 `MyWidget` 绑定到自己身上，这样就可以用依赖注入在我们的工厂中将它实例化，如果所有的 widget 内部没用依赖注入的话，则无需要这样做。我们在上面的例子中使用依赖注入来检索消息服务和 @postConstruct 事件。其次，我们绑定一个 `WidgetFactory`，定义 widget 的 ID 和 `createWidget` 函数。这个函数允许你控制 widget 的创建，例如，如果需要的话，可以将特定的参数传递给自定义 widget。在我们的简单例子中，我们只是使用依赖性注入上下文来实例化我们的 widget。

**mywidget-frontend-module.ts**
```typescript
bind(MyWidget).toSelf();
bind(WidgetFactory).toDynamicValue(ctx => ({
    id: MyWidget.ID,
    createWidget: () => ctx.container.get<MyWidget>(MyWidget)
})).inSingletonScope();
```

现在你可以通过 widget manager API 打开 widget。然而，大多数情况下，你需要在视图菜单中创建一个选项，并提供一个相应的命令。这可以通过使用 widget 扩展点来方便地完成，如下一节所述。

### Widget 扩展

widget 扩展允许你将 widget 接入 Theia 工作台，更确切地说，是将它们添加到视图菜单和快捷命令中。Theia提供了一个方便的基类 `AbstractViewContribution` 来继承，它已经实现了最常见的功能集（见下面的示例代码）。只需要指定以下参数即可初始化：

* `widgetID`: widget 的 ID，用于通过 widget 管理器打开它。
* `widgetName`: 显示在视图菜单中的名称，通常与 widget 标签使用的名称相同。
* `defaultWidgetOptions`: 影响 widget 打开时的位置选项，例如：在工作台面的左边区域。更多信息见[the typedoc](https://eclipse-theia.github.io/theia/docs/next/interfaces/core.applicationshell-2.widgetoptions.html)。
* `toggleCommandId`: 打开视图的命令，你可以使用超类提供的预实现函数：`openView`。
除了指定的基本参数，你还需要注册打开视图的命令。基类实现了相应的命令贡献接口，所以你只需要实现 `registerCommands` 就可以了（见下文）。


**mywidget-contribution.ts**
```typescript
export const MyWidgetCommand: Command = { id: 'widget:command' };
export class MyWidgetContribution extends AbstractViewContribution<MyWidget> {
   constructor() {
       super({
           widgetId: MyWidget.ID,
           widgetName: MyWidget.LABEL,
           defaultWidgetOptions: { area: 'left' },
           toggleCommandId: MyWidgetCommand.id
       });
   }

   registerCommands(commands: CommandRegistry): void {
       commands.registerCommand(WidgetCommand, {
           execute: () => super.openView({ activate: false, reveal: true })
       });
   }
}
```

有了上面的扩展，该视图将出现在 Theia 的标准"视图"菜单中，也可使用对应的"打开视图"命令将它打开。
