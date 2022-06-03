---
title: Backend Application Contributions
---

# 后台扩展点

后台扩展点允许 Theia 扩展与后台的生命周期相连接，它在后台启动后立即被实例化，因此是初始化后台服务的首选位置，这些服务在后台的整个生命周期都是需要的。

要注册后台扩展点，扩展需要在后端模块中绑定接口 `BackendApplicationContribution` 的实现。

``` typescript
export default new ContainerModule(bind => {
   bind(MemoryTracker).toSelf().inSingletonScope();
   bind(BackendApplicationContribution).toService(MemoryTracker);
});
```

接口 `BackendApplicationContribution` 提供可选的钩子函数，因此实现者可以自由的按需实现钩子，而非实现所有。
对于后端服务的初始化，最常见的是 `initialize()` 钩子函数，Theia 后端初始化会立即调用。

作为例子，我们实现一个后台服务，该服务将在 Theia 后台的整个生命周期内运行，以跟踪其内存使用情况。
为了简单起见，只要内存的变化超过一定的阈值，它就会把内存打印到日志中。

因此，一个名为 `MemoryTracker` 的 `BackendApplicationContribution` 被绑定在依赖注入上下文中，如上面的代码所示。
`MemoryTracker` 的实现对钩子 `initialize()` 做出响应，每两秒执行 `logMemory()` 方法。
该方法获取当前使用的内存，与之前的内存进行比较，一旦与之前的内存相差超过 0.1MB，就会向日志打印一条信息。


``` typescript
@injectable()
export class MemoryTracker implements BackendApplicationContribution {

   @inject(ILogger)
   protected readonly logger: ILogger;
   protected logTimer: NodeJS.Timer;
   protected memoryUsed = 0;

   initialize(): MaybePromise<void> {
       this.logTimer = setInterval(() => this.logMemory(), 2000);
   }

   protected logMemory(): void {
       const currentMemoryUsed = this.currentRoundedMemoryUsage();
       const diff = currentMemoryUsed - this.memoryUsed;
       if (Math.abs(diff) > 0.1) {
           const timestamp = new Date().toUTCString();
           this.logger.info(
               `[${timestamp}] PID ${process.pid} uses ${currentMemoryUsed} MB (${diff > 0 ? '+' : ''}${diff.toFixed(2)})`
           );
           this.memoryUsed = currentMemoryUsed;
       }
   }

   protected currentRoundedMemoryUsage() {
       return Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
   }

   onStop(): void {
       if (this.logTimer) {
           clearInterval(this.logTimer);
       }
   }
}
```

一旦后端应用的贡献被注册，且后端启动，就开始打印输出，类似于以下内容：

```
root INFO Theia app listening on http://localhost:3000.
root INFO Configuration directory URI: 'file:///home/foobar/.theia'
root INFO [Fri, 20 Aug 2021 12:20:43 GMT] PID 46590 uses 18.14 MB (+18.14)
root INFO [Fri, 20 Aug 2021 12:20:47 GMT] PID 46590 uses 18.94 MB (+0.80)
root INFO [Fri, 20 Aug 2021 12:20:51 GMT] PID 46590 uses 15.25 MB (-3.69)
root INFO [Fri, 20 Aug 2021 12:21:07 GMT] PID 46590 uses 15.36 MB (+0.11)
root INFO [Fri, 20 Aug 2021 12:21:21 GMT] PID 46590 uses 15.47 MB (+0.11)
root INFO [Fri, 20 Aug 2021 12:21:41 GMT] PID 46590 uses 15.6 MB (+0.13)
root INFO [Fri, 20 Aug 2021 12:21:59 GMT] PID 46590 uses 15.71 MB (+0.11)
```

通常这样的后台扩展点也提供了可以被其他后端服务调用的方法，例如：启动需要在应用启动后立即达到可用状态的外部进程，如：数据库连接、REST服务等。

除了在后端启动时初始化后端服务外，后台扩展点还可以配置和扩展 Theia 后端使用的 HTTP 服务器。
因此 `BackendApplicationContribution` 接口提供了三个方法 `configure(app: express.Application)`、`onStart(app: express.Application)` 和 `onStop(app: express.Application)`。
因此，HTTP 服务器可以通过自定义设置进行配置，甚至可以通过额外的终端进行扩展，这些终端需要对相应的 Theia 应用可用。

下面给出了一个配置名为 `/myendpoint` 的终端例子：

``` typescript
import { injectable } from '@theia/core/shared/inversify';
import { json } from 'body-parser';
import { Application, Router } from '@theia/core/shared/express';
import { BackendApplicationContribution } from '@theia/core/lib/node/backend-application';

@injectable()
export class MyCustomEndpoint implements BackendApplicationContribution {
   configure(app: Application): void {
       app.get('/myendpoint', (request, response) => {
           …
       });
   }
}
```

关于如何配置 HTTP 端点和处理事件请求的更多信息，请参阅 [Express API](https://expressjs.com/en/4x/api.html).
