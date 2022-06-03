---
title: Events
---

## 事件

Theia 的事件可能比较混乱，希望我们能澄清它的逻辑。

先看这段代码：

(来自 logger-watcher.ts)

``` typescript
@injectable()
export class LoggerWatcher {

    getLoggerClient(): ILoggerClient {
        const emitter = this.onLogLevelChangedEmitter
        return {
            onLogLevelChanged(event: ILogLevelChangedEvent) {
                emitter.fire(event)
            }
        }
    }

    private onLogLevelChangedEmitter = new Emitter<ILogLevelChangedEvent>();

    get onLogLevelChanged(): Event<ILogLevelChangedEvent> {
        return this.onLogLevelChangedEmitter.event;
    }
}
```

先看这里：

``` typescript
    private onLogLevelChangedEmitter = new Emitter<ILogLevelChangedEvent>();
```

首先什么是 `Emitter`？

Emitter 是一个事件处理容器，它允许事件处理程序在其上注册，并通过 X 类型的事件触发，本例中是：ILogLevelChangedEvent。

这里我们只是创建了一个 `Emitter`，它将拥有 ILogLevelChangedEvent 类型的事件。

接下来我们希望能在这个 `Emitter` 上注册一个事件处理程序，像这样：

``` typescript
    get onLogLevelChanged(): Event<ILogLevelChangedEvent> {
        return this.onLogLevelChangedEmitter.event;
    }
```

它实际上返回一个函数，注册一个事件处理程序，所以你只要把你的事件处理程序函数传给它，即可完成注册，当事件发生时它会被调用。

所以你可以这么调用：

(From logger.ts)
``` typescript
 /* Update the root logger log level if it changes in the backend. */
        loggerWatcher.onLogLevelChanged(event => {
            this.id.then(id => {
                if (id === this.rootLoggerId) {
                    this._logLevel = Promise.resolve(event.newLogLevel);
                }
            });
        });
```

这就在 emitter 上注册了作为参数传递的匿名函数。接下来，我们通过触发一个事件，来调用事件处理程序：

``` typescript
 onLogLevelChanged(event: ILogLevelChangedEvent) {
                emitter.fire(event)
            }
```

当调用这个函数时，emitter 会启动，所有的事件处理程序都会被调用。

小结一下，想要在 Theia 中触发事件，你需要：

 - 创建一个发射器
 - 用 emitter.event 函数注册事件
 - 用 emitter.fire(event) 触发事件
