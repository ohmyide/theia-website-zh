---
title: Frontend Application Contributions
---

# 前端扩展点

前端扩展点可对 Theia 前端生命周期事件做出响应，在前端启动或停止之前，或在前端布局初始化时执行对应的行为。
除了提供常规的的启动钩子，前端扩展点通常还用于打开和管理视图、注册监听、添加状态栏条目，或者在应用启动时自定义外观布局。
另一个使用场景是对做出响应，例如，在退出时存储某些数据，比如使用：`StorageService`。

和其他前端扩展一样，前端应用贡献也是通过绑定 `FrontendApplicationContribution` 接口的实现在前端模块中注册。

一个典型的场景是在启动时总是打开的某个视图。

因此，视图的实现不仅扩展了 `AbstractViewContribution<MyWidget>`，而且还被注册为 `FrontendApplicationContribution`，以便在应用外观布局初始化后打开扩展视图。


``` typescript
export default new ContainerModule(bind => {
   …
   bindViewContribution(bind, MyViewContribution);
   bind(FrontendApplicationContribution).toService(MyViewContribution);
}
```

除了视图实现本身，视图现在可以从 `FrontendApplicationContribution` 接口实现 `initializeLayout(app: FrontendApplication)` 方法，以便在布局初始化后打开。

注意，这个方法只在没有先前存储的工作台布局时才会调用，这使得它成为初始化工作台的理想选择，因为它不会覆盖用户在先前会话中已经手动应用的布局变化。

``` typescript
@injectable()
export class MyViewContribution extends AbstractViewContribution<MyViewWidget>
    implements FrontendApplicationContribution {
   …
   async initializeLayout(app: FrontendApplication): Promise<void> {
       await this.openView();
   }
   …
}
```

如果前端应用的扩展需要在每次应用启动时调用--而不仅仅是在初始布局后没有先前缓存的布局状态时--可以使用方法`configure(app: FrontendApplication)`和`onStart(app: FrontendApplication)`来代替。
由于这些方法甚至在应用 shell 被连接或菜单初始化之前调用，你或许想把这些方法与前端状态 service 结合起来使用，这取决于你的：

``` typescript
@injectable()
export class MyViewContribution extends AbstractViewContribution<MyViewWidget>
    implements FrontendApplicationContribution {
   …
   @inject(FrontendApplicationStateService)
   protected readonly stateService: FrontendApplicationStateService;
   …
   async onStart(app: FrontendApplication): Promise<void> {
       this.stateService.reachedState('ready').then(
           () => this.openView({ reveal: true })
       );
   }
}
```

前端应用贡献的另一个典型场景是增加监听器，例如：对偏好设置的变化做出响应，或者在 `configure(app: FrontendApplication)`和`onStart(app: FrontendApplication)` 中分别向应用 shell 添加自定义 widgets。
