---
title: Tasks
---

# 任务

Theia 用户可以执行任务，以便让工作流程中的某些步骤自动化。

任务可以通过主菜单的 *Terminal* 或命令面板调用，每个任务都由任务配置来定义，其中指定了任务类型、标签、可选描述、是否为背景任务、是否为构建或测试任务、对其他任务的依赖性等属性。

Theia 中的任务在结构上与 Visual Studio Code 兼容。与 [Visual Studio Code](https://code.visualstudio.com/docs/editor/tasks) 类似，用户可以在工作区或用户自定义的一个名为 `tasks.json` 的文件中定义任务。

## TaskProviders, TaskResolvers and TaskRunners

在 Theia 中，任务也可以由自定义的扩展提供和执行。特别是，Theia 为任务提供了三个主要贡献点：`TaskProvider`、`TaskResolver` 和 `TaskRunner`。为更好地理解他们，我们看看当用户选择和执行一个任务时的流程，如下图所示：

<img src="/tasks.png" alt="Task flow overview" style="max-width: 915px">

除了用户定义的任务，Theia 还向用户提供从任务提供者那里收集的所有任务配置。当用户选择所提供的任务配置并执行时，该配置将被移交给任务服务，任务服务首先用所选的任务类型解析器解析所选任务配置。任务解析器可以在任务配置实际执行之前对其解析，这利于解析默认值和自定义变量。

一旦配置被解析，任务服务会请求已解析的任务配置，该服务器在后端运行。为了执行已解析的任务配置，任务服务器会查找为该配置的类型注册的任务运行器，最后，任务运行器负责根据指定的任务配置执行任务。

Theia 为 TaskProviders，TaskResolvers 和 TaskRunners 提供专门的贡献点。因此，Theia 扩展可以自定义任务类型扩展可用的任务列表，处理自定义任务的配置解析和执行。

## 举例：Task Providers 和 Task Resolvers

在下面的例子中，我们将贡献一个任务提供者，用来提供自定义任务。此外，我们还添加一个自定义任务解析器，它将在执行前解析任务配置。最后，我们将贡献一个自定义任务运行器，执行任务。

任务提供者和任务解析器是通过 `TaskContribution` 实现的，像其他贡献一样，必须被绑定在各自的前端模块中，如下所示：

如果你还不熟悉 Theia 的扩展点或依赖注入的使用，请参考 [服务和贡献] 指南（https://theia-ide.org/docs/services_and_contributions/）。

``` typescript
export default new ContainerModule(bind => {
   bind(TaskContribution).to(MyTaskContribution);
});
```

我们的 `TaskContribution` 贡献了一个任务提供者和一个任务解析器（见以下列表），它们的实现如下所示。通过在注册时指定任务类型，Theia 将为我们的自定义任务类型（`myTaskType`）选择合适的解析器和执行器。

``` typescript
@injectable()
export class MyTaskContribution implements TaskContribution {

   registerProviders(providers: TaskProviderRegistry): void {
       providers.register('myTaskType', new MyTaskProvider())
   }

   registerResolvers(resolvers: TaskResolverRegistry): void {
       resolvers.registerTaskResolver('myTaskType', new MyTaskResolver())
   }
}
```

示例中的任务提供者贡献了一个任务：

``` typescript
class MyTaskProvider implements TaskProvider {
   async provideTasks(): Promise<TaskConfiguration[]> {
       return [{
           label: 'My Custom Task',
           type: 'myTaskType',
           _scope: 'MyTaskProvider'
       }];
   }
}
```

示例任务解析器总是将属性 `myCustomValue` 设置为静态值 `42`，在实际情况下，它在 `taskConfig` 中被设置，如果没有设置，则使用默认，如果有则使用 `taskConfig` 中指定的变量：

``` typescript
class MyTaskResolver implements TaskResolver {
    async resolveTask(taskConfig: TaskConfiguration):Promise<TaskConfiguration> {
        return {...taskConfig, myCustomValue: 42 }
    }
}
```

## 案例：Task Runners

任务运行器是通过 `TaskRunnerContribution` 贡献的，由于使用依赖注入创建的任务运行器，需要我们在模块中绑定贡献和任务运行器：

``` typescript
export default new ContainerModule(bind => {
   bind(MyTaskRunner).toSelf().inSingletonScope();
   bind(TaskRunnerContribution).to(MyTaskRunnerContribution);
});
```

在 `TaskRunnerContribution` 中，我们在 `TaskRunnerRegistry` 注册了自定义任务运行器的实例，以及运行器负责的任务类型。

``` typescript
@injectable()
export class MyTaskRunnerContribution implements TaskRunnerContribution {

   @inject(MyTaskRunner)
   protected readonly myTaskRunner: MyTaskRunner;

   registerRunner(runners: TaskRunnerRegistry): void {
       runners.registerRunner('myTaskType', this.myTaskRunner);
   }
}
```

任务运行者需要实现 `TaskRunner` 接口，当任务被触发时，函数 `run` 接收 `TaskConfiguration`，并运行该操作。

在我们的例子中，实例化了 `Task` 的自定义实现，名为`MyTask`，并以当前配置执行。

使用现有的接口 `Task` 允许我们将任务连接到 `TaskManager`，在任务执行过程中会在工作台中显示进展（见下面的屏幕截图）：

``` typescript
@injectable()
export class MyTaskRunner implements TaskRunner {

   @inject(TaskManager)
   protected readonly taskManager: TaskManager;

   @inject(ILogger)
   protected readonly logger: ILogger;

   async run(config: TaskConfiguration, ctx?: string): Promise<Task> {
       const myTask = new MyTask(this.taskManager, this.logger,
                                   { config, label: 'My Custom Task' });
       myTask.execute(config.myCustomValue);
       return myTask;
   }
}
```

最后，自定义任务配置将等待 5000 毫秒打印出之前在任务解析器中添加的自定义值：

``` typescript
class MyTask extends Task {
   execute(myCustomValue: number) {
       this.logger.info(`Start running custom task: ${myCustomValue}`);
       setTimeout(() => {
           this.logger.info(`Finished running custom task: ${myCustomValue}`);
           this.fireTaskExited({ taskId: this.taskId, code: 0 });
       }, 5000);
   }
   …
}
```

如下图所示，自定义任务运行了 5000 毫秒（因为我们在 `MyTask` 中设置了超时），然后停止：

<img src="/running-custom-task.gif" alt="Running custom task" style="max-width: 702px">

在控制台中可以看到，该任务在 5000 毫秒后启动并完成，并打印了定义解析器添加的自定义变量。

```
root INFO Start running custom task: 42
root INFO Finished running custom task: 42
```

## 定义任务

扩展可以只提供运行器（以及可选的解析器）不提供任务提供者。

因此，自定义任务不会自动提供给用户，但用户仍然可以在 `tasks.json` 文件中配置任务，为了支持用户为自定义任务创建任务配置，Theia为 *task definitions* 提供了专门的扩展点。任务定义用 JSON schema，定义了可以或需要为某个自定义任务指定配置。
