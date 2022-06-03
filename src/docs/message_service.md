---
title: Message Service
---

# 消息服务

消息服务允许你向用户弹出提示消息、对话框和进度信息，你可以获得 `MessageService` 的注入，并调用 `info`、`warn` 或 `error` 来展示消息（见下面的代码例子）。

```typescript
@inject(MessageService) private readonly messageService: MessageService
this.messageService.info('Hello World!')
```

默认情况下，Theia 会在右下角以浮窗的形式显示消息，下面是不同消息类型（info, warn and error）的截图。注意，你可以通过实现自定义的 `MessageClient` 来轻松地控制 Theia 不同行为的消息。

Info

<img src="/message-service-info.png" alt="Message Service - info" style="max-width: 525px">

Warn

<img src="/message-service-warn.png" alt="Message Service - warning" style="max-width: 525px">

Error

<img src="/message-service-error.png" alt="Message Service - error" style="max-width: 525px">

默认情况下，提示会一直展示，直到用户关闭它们，也可以选择定义的时间，超时后消息自动关闭。

```typescript
this.messageService.info('Say Hello with timeout',{timeout: 3000})
```

另外，还可以添加用户可执行的选项操作，如果用户选择了某个操作，执行了一个动作，消息将展示用户所选的操作。

在下面的例子中，我们提供了两个动作 “Say Hello again!” 和 “Cancel”，我们对 “Say Hello again!” 这个操作的是发布另一条消息，“Cancel” 则是忽略。

```typescript
@inject(MessageService) private readonly messageService: MessageService

this.messageService
 .error("Hello World!", "Say Hello again!", "Cancel")
 .then((action) => {
   if (action === "Say Hello again!")
     this.messageService.info("Hello again!");
   })
```

警示通知像这样：

<img src="/message-service-user-action.png" alt="Message Service - user action" style="max-width: 525px">

当用户选择 “Say Hello again” 时，将显示另一个警示通知：

<img src="/message-service-hello-again.png" alt="Message Service - after user action" style="max-width: 525px">

## 进度提示

消息服务也允许提示正在进行的操作的进度，你可以逐步更新进度条和消息，并让通知保持可见，直到操作完成。下面的例子打开了一个进度条，并在完成前三次更新状态。更多信息请参考 [TypeDoc of `MessageService`](https://eclipse-theia.github.io/theia/docs/next/classes/core.messageservice-1.html#showprogress)。

```typescript
this.messageService
 .showProgress({
   text: `Doing something`,
 })
 .then((progress) => {
   // Do something
   progress.report({
     message: "First step completed",
     work: { done: 10, total: 100 },
   });
   // Do something
   progress.report({
     message: "Next step completed",
     work: { done: 80, total: 100 },
   });
   // Do something
   progress.report({
     message: "Complete",
     work: { done: 100, total: 100 },
   });
   progress.cancel();
 })
```

需注意，`progress.cancel` 也会表示进度任务已经完成，上面的例子运行效果为：

<img src="/message-service-progress-reporting.gif" alt="Message Service - progress reporting" style="max-width: 525px">
