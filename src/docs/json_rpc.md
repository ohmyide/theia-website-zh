---
title: Communication via JSON-RPC
---

# 用 JSON-RPC 通信

本节我将解释如何创建后端服务，并通过 JSON-RPC 连接到它。

我将使用调试日志系统作为例子。

## 概述

这由 express 框架创建的服务，并用 websocket 连接到它。

## 服务注册

要做的第一件事就是开放你的服务，以便前端可以连接到它。

你需要创建与此下述后端服务类似的文件 (logger-server-module.ts)：


``` typescript

import { ContainerModule } from 'inversify';
import { ConnectionHandler, JsonRpcConnectionHandler } from "../../messaging/common";
import { ILoggerServer, ILoggerClient } from '../../application/common/logger-protocol';

export const loggerServerModule = new ContainerModule(bind => {
    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler<ILoggerClient>("/services/logger", client => {
            const loggerServer = ctx.container.get<ILoggerServer>(ILoggerServer);
            loggerServer.setClient(client);
            return loggerServer;
        })
    ).inSingletonScope()
});
```

来详细了解一下：

``` typescript
import { ConnectionHandler, JsonRpcConnectionHandler } from "../../messaging/common";
```

这里导入了 `JsonRpcConnectionHandler`，这个工厂使你能够创建连接处理程序，onConnection 用 JSON-RPC 在后端调用的对象创建代理，并将本地对象公开给 JSON-RPC。

跟着我们的步骤，将看到这是如何一步步完成。

`ConnectionHandler` 是一个简单的接口，它指定了连接的路径以及创建连接的情况。

像这样：

``` typescript
import { MessageConnection } from "vscode-jsonrpc";

export const ConnectionHandler = Symbol('ConnectionHandler');

export interface ConnectionHandler {
    readonly path: string;
    onConnection(connection: MessageConnection): void;
}
```

``` typescript
import { ILoggerServer, ILoggerClient } from '../../application/common/logger-protocol';
```

logger-protocol.ts 文件包含服务器和客户端需要实现的接口。

这里的服务器指的是将通过 JSON-RPC 调用的后端对象，而客户端是一个可以接收来自后台通知的对象。

我将在后面详细介绍。

``` typescript
    bind<ConnectionHandler>(ConnectionHandler).toDynamicValue(ctx => {
```

这里发生了一些神奇的事情，乍一看，我们只是说这里实现的ConnectionHandler。

这里的神奇之处在于，在 messaging-module.ts 中， ConnectionHandler 类型被绑定到 ContributionProvider 。

所以当 MessagingContribution 启动时（onStart被调用），它会为所有绑定的 ConnectionHandler 创建websocket连接。

像这样（来自messaging-module.ts）：

``` typescript
constructor( @inject(ContributionProvider) @named(ConnectionHandler) protected readonly handlers: ContributionProvider<ConnectionHandler>) {
    }

    onStart(server: http.Server): void {
        for (const handler of this.handlers.getContributions()) {
            const path = handler.path;
            try {
                createServerWebSocketConnection({
                    server,
                    path
                }, connection => handler.onConnection(connection));
            } catch (error) {
                console.error(error)
            }
        }
    }
```

想进一步了解 ContributionProvider，[请看这里](Services_and_Contributions#contribution-providers).

因此现在：

``` typescript
new JsonRpcConnectionHandler<ILoggerClient>("/services/logger", client => {
```

我们看一下这个类的实现，这里做了这么几件事：

``` typescript
export class JsonRpcConnectionHandler<T extends object> implements ConnectionHandler {
    constructor(
        readonly path: string,
        readonly targetFactory: (proxy: JsonRpcProxy<T>) => any
    ) { }

    onConnection(connection: MessageConnection): void {
        const factory = new JsonRpcProxyFactory<T>(this.path);
        const proxy = factory.createProxy();
        factory.target = this.targetFactory(proxy);
        factory.listen(connection);
    }
}
```

我们看到，websocket 连接是通过 ConnectionHandler 类的扩展，在 "logger" 路径上创建的，路径属性被设置为 "logger"。

现在看看 onConnection 是什么：

``` typescript
    onConnection(connection: MessageConnection): void {
        const factory = new JsonRpcProxyFactory<T>(this.path);
        const proxy = factory.createProxy();
        factory.target = this.targetFactory(proxy);
        factory.listen(connection);
```


我们一行行的看下去：

``` typescript
    const factory = new JsonRpcProxyFactory<T>(this.path);
```

这里在 "logger" 路径上创建 JsonRpcProxy：

``` typescript
    const proxy = factory.createProxy();
```

这里我们从工厂创建代理对象，它被用来调用使用 ILoggerClient 接口连接 JSON-RPC 的另一端。

``` typescript
    factory.target = this.targetFactory(proxy);
```

这将调用我们在参数中传递的函数：

``` typescript
        client => {
            const loggerServer = ctx.container.get<ILoggerServer>(ILoggerServer);
            loggerServer.setClient(client);
            return loggerServer;
        }
```

这设置了与 loggerServer 对应的客户端，它被用于向前台发送关于日志级别变化的通知，并将 loggerServer 作为对象返回，该对象将通过 JSON-RPC 公开。

``` typescript
 factory.listen(connection);
```

这将工厂连接起来。

带有 `services/*` 路径的终端由 webpack dev server 提供，见 `webpack.config.js`：

``` javascript
    '/services/*': {
        target: 'ws://localhost:3000',
        ws: true
    },
```

## Connecting to a service

So now that we have a backend service let's see how to connect to it from
the frontend.

To do that you will need something like this:

(From logger-frontend-module.ts)

``` typescript
import { ContainerModule, Container } from 'inversify';
import { WebSocketConnectionProvider } from '../../messaging/browser/connection';
import { ILogger, LoggerFactory, LoggerOptions, Logger } from '../common/logger';
import { ILoggerServer } from '../common/logger-protocol';
import { LoggerWatcher } from '../common/logger-watcher';

export const loggerFrontendModule = new ContainerModule(bind => {
    bind(ILogger).to(Logger).inSingletonScope();
    bind(LoggerWatcher).toSelf().inSingletonScope();
    bind(ILoggerServer).toDynamicValue(ctx => {
        const loggerWatcher = ctx.container.get(LoggerWatcher);
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<ILoggerServer>("/services/logger", loggerWatcher.getLoggerClient());
    }).inSingletonScope();
});
```

The important bit here are those lines:

``` typescript
    bind(ILoggerServer).toDynamicValue(ctx => {
        const loggerWatcher = ctx.container.get(LoggerWatcher);
        const connection = ctx.container.get(WebSocketConnectionProvider);
        return connection.createProxy<ILoggerServer>("/services/logger", loggerWatcher.getLoggerClient());
    }).inSingletonScope();

```

Let's go line by line:

``` typescript
        const loggerWatcher = ctx.container.get(LoggerWatcher);
```

Here we're creating a watcher, this is used to get notified about events
from the backend by using the loggerWatcher client
(loggerWatcher.getLoggerClient())

See more information about how events work in theia [here](/docs/Events#events).

``` typescript
        const connection = ctx.container.get(WebSocketConnectionProvider);
```

Here we're getting the websocket connection, this will be used to create a proxy from.

``` typescript
        return connection.createProxy<ILoggerServer>("/services/logger", loggerWatcher.getLoggerClient());
```

作为第二个参数，我们传递一个本地对象来处理来自远端的 JSON-RPC 消息。

有时本地对象依赖代理，并且不能在代理实例化之前实例化，在这种情况下，代理接口应该实现 `JsonRpcServer`，本地对象应该作为客户端。

```ts
export type JsonRpcServer<Client> = Disposable & {
    setClient(client: Client | undefined): void;
};

export interface ILoggerServer extends JsonRpcServery<ILoggerClient> {
    // ...
}

const serverProxy = connection.createProxy<ILoggerServer>("/services/logger");
const client = loggerWatcher.getLoggerClient();
serverProxy.setClient(client);
```

So here at the last line we're binding the ILoggerServer interface to a
JsonRpc proxy.

Note that his under the hood calls:

``` typescript
 createProxy<T extends object>(path: string, target?: object, options?: WebSocketOptions): T {
        const factory = new JsonRpcProxyFactory<T>(path, target);
        this.listen(factory, options);
        return factory.createProxy();
    }
```

So it's very similar to the backend example.

Maybe you've noticed too but as far as the connection is concerned the frontend
is the server and the backend is the client. But that doesn't really
matter in our logic.

So again there's multiple things going on here what this does is that:
 - it creates a JsonRpc Proxy on path "logger".
 - it exposes the loggerWatcher.getLoggerClient() object.
 - it returns a proxy of type ILoggerServer.

So now instances of ILoggerServer are proxied over JSON-RPC to the
backend's LoggerServer object.

## 加载案例的前后端模块

现在我们有了这些模块，需要把它们连接到案例中。

我们将使用浏览器的场景来做演示，注意，这和 Electron 场景下的代码是一样的。

### 后端

在 examples/browser/src/backend/main.ts 中需要：

``` typescript
import { loggerServerModule } from 'theia-core/lib/application/node/logger-server-module';
```

并且加载到 main container 之中：

``` typescript
container.load(loggerServerModule);
```

### 前端

在 examples/browser/src/frontend/main.ts 中需要：

``` typescript
import { loggerFrontendModule } from 'theia-core/lib/application/browser/logger-frontend-module';
```

``` typescript
container.load(frontendLanguagesModule);
```

## 完整案例

如果想看本文档中提到的完整实现，[请看这个 commit](https://github.com/eclipse-theia/theia/commit/99d191f19bd2a3e93098470ca1bb7b320ab344a1)。
