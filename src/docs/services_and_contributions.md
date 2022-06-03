---
title: Services and Contributions
---

# 服务和贡献

本节我们讲述如何使用平台和 [Theia 扩展](https://theia-ide.org/docs/extensions#theia-extensions) 提供的服务，以及如何通过扩展点为 Theia 工作台扩展能力。

**服务**是为消费者提供功能的对象。服务和消费者之间由接口约定描述。任何服务的实现都必须根据接口来实现。Theia 的任何扩展都可以提供和/或消费服务。Theia 内部的扩展提供了一套默认服务，如，[`MessageService`](https://theia-ide.org/docs/message_service/)。当然你也可以提供和消费自己自定义的扩展服务。

**扩展点**通过自定义钩子对外提供扩展能力。扩展点是由贡献者需要实现的接口定义的，例如：`CommandContribution`。定义扩展点的扩展将挂载该贡献，例如，将扩展的命令添加到 Theia 工作台上。

扩展点像服务一样，可以被任意扩展贡献和定义。Theia 定义了一组默认的扩展点，例如，可将命令或菜单添加到 Theia 工作台中，你也可以定义自己的扩展点。

服务和扩展点的使用需要扩展之间的约定，为了避免对实现类的直接依赖，Theia 使用了依赖性注入。

<img src="/dependency-injection.png" alt="Dependency Injection Overview" style="max-width: 525px">

在下面的章节中，我们将对依赖性注入、服务、贡献以及如何定义扩展点进行简要概述。

## 依赖注入 (DI)

Theia 用依赖注入框架[InversifyJS]（http://inversify.io/）来连接不同的服务和扩展点。

依赖注入将服务的消费者--即这些消费者的依赖关系--与服务的实际创建和引用进行解耦。举例来说，如果你想使用一个服务，你既不需要实例化它，也不需要从某个地方手动引用它。相反，依赖注入容器会在组件创建时注入服务。依赖注入容器为你解决依赖性问题，如果有必要，甚至可以在运行中实例化它。这样一来，服务的消费者就不需要担心它们来自哪里，可以在后续轻松更改服务的实际实现，而不需要改变消费者。依赖注入容器基于启动时容器模块提供的配置运行。

我们将在下面的"服务"和"扩展点"部分给出依赖注入的使用案例。

依赖注入是 Theia 的重要组成部分，我们强烈建议学习 [InversifyJS]（http://inversify.io/）的基础知识。更多细节请参考[这篇文章：依赖注入在 Theia 中的工作原理](https://eclipsesource.com/blogs/2018/11/28/how-to-inversify-in-eclipse-theia/)

## 使用服务

要在 Theia 中使用服务，可以用依赖注入的方式，将其作为一个依赖关系进行注入。依赖关系通常由所需服务的接口来指定，你甚至可以不依赖任何实现，调用者只需知道接口。这使提供实现的组件可以无缝地更改服务。你甚至可以覆盖一个服务的现有默认实现而不破坏任何服务消费者。

为了从依赖注入容器中获得参数，需要用标识符（一个字符串）来注解。另外，服务提供者也会用标识符来发布可用的服务。当用依赖注入请求具有特定标识符的参数时，依赖注入上下文将查找并返回相应服务的实例。为方便起见，服务提供者通常使用 Symbol 作为标识符，它的名称与各自的服务接口本身完全相同。下面的例子中，'@inject(MessageService)'是一个符号（服务标识符），而 'private readonly messageService: MessageService' 是指服务的接口。

服务或者说依赖关系可以作为一个字段，在构造函数或初始化函数中被注入（见下面的代码例子）：

```typescript
// Injection in the constructor.
constructor(@inject(MessageService) private readonly messageService: MessageService) { }
 
// Injection as a field.
@inject(MessageService)
protected readonly messageService!: MessageService;
 
// Injection in an initialization function (will be called after the constructor and after injecting fields.
@postConstruct()
protected async init(@inject(MessageService) private readonly messageService: MessageService) { }
```

需注意，注入只对依赖注入容器创建的组件有效，它们必须用 `@injectable` 标记（见下面的代码示例）。此外，它们必须在依赖注入上下文中注册（例子见下一节）。


```typescript
@injectable()
export class MyContribution implements SomeContributionInterface
```

## 实现扩展点

Theia 的扩展点定义了需要实现的接口，例如"CommandContribution"。扩展必须提供这个接口的实现，并以 "@injectable" 标记，例如：

**mycommand-contribution.ts**
```typescript
@injectable()
export class MyCommandContribution implements CommandContribution
```

此外，贡献必须被绑定在依赖注入容器中，这样扩展点提供者就可以获得我们的贡献，确切地说，是获取它的注入。绑定是在扩展的容器（container module）中完成的，它将实现与扩展接口绑定，或者从技术上讲，与代表该接口的符号绑定（见下面的例子）。

**helloworld-frontend-module.ts**
```typescript
export default new ContainerModule(bind => {
   // add your contribution bindings here
   bind(CommandContribution).to(HelloworldCommandContribution);
...
});
```

关于服务和扩展点的使用，请参见[命令/菜单/快捷键绑定](https://theia-ide.org/docs/commands_keybindings/)中的例子。

## 定义扩展点

如果扩展想提供钩子让别人来贡献，他们应该定义一个 _扩展点_，_扩展点_ 只是一个接口，供其他人实现，扩展将在需要时委托给他们。

例如，"OpenerService" 定义了一个扩展点，允许其他人注册 "OpenHandler"。可参考 [这里的代码](https://github.com/eclipse-theia/theia/blob/master/packages/core/src/browser/opener-service.ts)。

Theia 已经内置了很多扩展点，可以通过 "bindContributionProvider" 来查看有哪些已存在的扩展点。

## 贡献提供者

贡献提供者基本上可视为贡献的容器，而贡献是一个绑定类型的实例。

要把一个类型绑定到贡献提供者，通用的方式，可以这样做：

(From messaging-module.ts)

``` typescript
export const messagingModule = new ContainerModule(bind => {
    bind<BackendApplicationContribution>(BackendApplicationContribution).to(MessagingContribution);
    bindContributionProvider(bind, ConnectionHandler)
});
```

最后一行，把贡献提供者绑定到一个包含所有 ConnectionHandler 的绑定实例。

它是这样使用的：

(From messaging-module.ts)

``` typescript
    constructor( @inject(ContributionProvider) @named(ConnectionHandler) protected readonly handlers: ContributionProvider<ConnectionHandler>) {
    }

```

这里我们注入一个用之前 `bindContributionProvider` 绑定的，名称为 ConnectionHandler 的贡献提供者。

这使得任何人都可以绑定 ConnectionHandler，现在当消息传递模块启动时，所有的 ConnectionHandler 都将被启动。
