---
title: Label Provider
---

# 标签提供者

Theia 中的标签提供者负责元素/节点在用户界面中的显示方式。标签提供者决定显示在树、列表或其他位置（如视图标题）的元素图标和文本。一个很好的案例是文件资源管理器：文件和目录节点从标签提供者那里获取它们的图标和文本。另一个使用标签提供者的案例是编辑器的页眉。请看 [LabelProvider TypeDoc](https://eclipse-theia.github.io/theia/docs/next/classes/core.labelprovider-1.html)。

Theia 的默认标签提供者会先检索已注册的标签提供者，以确定最适合的元素/节点标签。标签提供者会将特定节点的调用委托给能够最好地处理该元素的贡献。Theia 为常见的类型提供了默认贡献，例如：文件类型。通过自己的贡献，可以根据特定的标准来扩展或调整节点的外观。

本篇，我们将介绍如何在 Theia 中定制自定义文件类型（.my）的标签和图标，如下图所示：

<img src="/custom-label-provider.png" alt="A custom label provider" style="max-width: 525px">

如果你还不熟悉 Theia 的贡献点或依赖注入的使用，请参考 [服务和贡献](https://theia-ide.org/docs/services_and_contributions/)指南。

下面所有的代码都来自 [Theia 扩展生成器](https://github.com/eclipse-theia/generator-theia-extension)。可以通过安装生成器，选择 "标签提供者" 的例子（[见这里](https://github.com/eclipse-theia/generator-theia-extension)）并选择 "labelProvider" 作为名称来获得同样的代码。

## 贡献一个标签提供者

要贡献自定义的标签提供者，你需要提供一个 `LabelProviderContribution`，即一个实现该接口的类。在这个例子中，我们没有直接实现这个接口，而是扩展了文件 `FileTreeLabelProvider` 的默认实现，这允许我们只重写我们想要重写的行为。

**labelprovider-contribution.ts**
```typescript
@injectable()
export class LabelproviderLabelProviderContribution extends FileTreeLabelProvider
```

函数 `canHandle` 决定了标签提供者是否为特定的节点（在我们的例子中为".my"文件），它可以检测文件的所有状态，比如：扩展名。该函数的返回值是一个代表标签提供者贡献的优先级的整数，具有最高优先级的将被使用，因此你可以通过返回更高的优先级来覆盖自定义文件上的默认标签提供者贡献。

`canHandle` 函数接收一个文件对象作为参数（对于文件树来说是 `FileStatNode`）。请看下面 canHandle 的实现例子，它将为文件扩展名".my"注册一个标签提供者贡献。

**labelprovider-contribution.ts**
```typescript
canHandle(element: object): number {
    if (FileStatNode.is(element)) {
        let uri = element.uri;
        if (uri.path.ext === '.my') {
            return super.canHandle(element)+1;
        }
    }
    return 0;
}
```

标签提供者注册自定义文件扩展名时，可以选择实现 `getName`、`getIcon`和`getLongName`，这些功能接收 URI 作为参数，并返回相应文件的自定义图标和名称。图标和名称在 Theia 的文件视图中使用，在编辑器打开的文件中，当悬停在文件上时，文件全名（在本例中没有定制）将作为 tooltip 显示。更多细节，请参见[`LabelProviderContribution` TypeDoc](https://eclipse-theia.github.io/theia/docs/next/interfaces/core.labelprovidercontribution-1.html)

**labelprovider-contribution.ts**
```typescript
getIcon(): string {
    return 'fa fa-star-o';
}

getName(fileStatNode: FileStatNode): string {
    return super.getName(fileStatNode) + ' (with my label)';
}
```

为了使我们的 `LabelProviderContribution` 能够被 Theia 访问，我们需要将自定义的 `LabelProviderLabelProviderContribution` 与各自的贡献符号 `LabelProviderContribution` 绑定。这是在 `Labelprovider-frontend-module` 中完成的，更多细节见[服务和贡献](https://theia-ide.org/docs/services_and_contributions/)。

**labelprovider-frontend-module.ts**
```typescript
export default new ContainerModule(bind => {
    // label binding
    bind(LabelProviderContribution).to(LabelProviderLabelProviderContribution);
});
```

## 通过 CSS 设定自定义图标

`getIcon` 函数返回 CSS 字符串，用于识别自定义文件类型的图标。在上面的例子中，我们使用了 Font Awesome 图标，如果你想用自定义图标，需要在 CSS 中进行设置。通常情况下，图标会有多个版本，这取决于当前风格（深色或浅色）。下面的例子演示如何添加一个自定义图标，要用这个例子，请将上面的 `getIcon` 中返回的字符串替换为 'my-icon'。

**example.css**
```css
.my-icon {
    background-repeat: no-repeat;
    background-size: 12px;
    width: 13px;
    height: 13px;
}
.light-plus .my-icon{
    background-image: url('./custom_icon_black_18dp.png');
}
.dark-plus .my-icon{
    background-image: url('./custom_icon_white_18dp.png');
}
```
