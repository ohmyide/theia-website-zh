---
title: Property View
---

# 属性视图

很多 IDE（例如传统的 Eclipse IDE）都具有全局、可扩展属性视图的概念，它显示 IDE 当前选中元素的附加信息，属性视图在这些 IDE 中大量使用，用于在图表编辑器、复杂树编辑器或文件浏览器中显示元素的详细信息。我们的想法是在 IDE 中拥有一个全局的、通用的属性视图，也允许扩展全局属性视图的内容，并为某些元素类型的选择提供特定的附加信息展示。

`@theia/property-view extension` 是 Theia 内置的通用全局属性视图，属性视图 widget 可以通过菜单 `View->Properties` 或快捷键 <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>P</kbd> 触发。它默认位于底部停靠区，此扩展中实现了以下两个默认内容的 widget：

- `EmptyPropertyViewWidget`: 如果没有可用的 widget，会提示 (`No properties available`)。
- `ResourcePropertyViewWidget`: 显示在文件资源管理器或当前 Monaco 编辑器选中文件的额外信息（如位置、名称、最后修改）。

## 贡献自定义属性视图

为贡献特定的属性视图，需要实现 `PropertyViewDataService`，它收集供选择的属性数据，以及`PropertyViewWidgetProvider`，它提供合适的 widget 来显示属性视图内所选的属性数据。

下面的案例将简单的演示基于 ReactWidget 的自定义视图，其功能是根据文件资源管理器的当前选择，显示对应的名称以及它是一个文件还是目录（当然，这里假设没有`ResourcePropertyViewWidget`）。

`FileInfoPropertyDataService` 收集文件信息并提供一个自定义对象。

`custom-data-service.ts`:

```typescript
export interface FileInfoPropertyObject {
    name: string;
    isDirectory: boolean;
}

@injectable()
export class FileInfoPropertyDataService implements PropertyDataService {

    readonly id = 'fileinfo';
    readonly label = 'FileInfoPropertyDataService';

    @inject(LabelProvider) protected readonly labelProvider: LabelProvider;

    canHandleSelection(selection: Object | undefined): number {
        return this.isFileSelection(selection) ? 1 : 0;
    }

    private isFileSelection(selection: Object | undefined): boolean {
        return !!selection && Array.isArray(selection) && FileSelection.is(selection[0]);
    }

    async providePropertyData(selection: Object | undefined): Promise<FileInfoPropertyObject | undefined> {
        if (this.isFileSelection(selection) && Array.isArray(selection)) {
            return {
                name: this.labelProvider.getName(selection[0].fileStat.resource),
                isDirectory: (selection[0].fileStat as FileStat).isDirectory
            };
        }
        return Promise.reject();
    }
}
```

`FileInfoPropertyWidget` 是个简单的 `ReactWidget` 用于显示所选节点以及它是一个文件还是目录：

`custom-content-widget.tsx`：

```typescript
export class FileInfoPropertyViewWidget extends ReactWidget implements PropertyViewContentWidget {

    static readonly ID = 'file-info-property-view';
    static readonly LABEL = 'File Information';

    protected currentFileInfo: FileInfoPropertyObject;

    constructor() {
        super();
        this.id = FileInfoPropertyViewWidget.ID;
        this.title.label = FileInfoPropertyViewWidget.LABEL;
        this.title.caption = FileInfoPropertyViewWidget.LABEL;
        this.title.closable = false;
        this.node.tabIndex = 0;
    }

    updatePropertyViewContent(propertyDataService?: PropertyDataService, selection?: Object | undefined): void {
        if (propertyDataService) {
            propertyDataService.providePropertyData(selection).then((fileInfo: FileInfoPropertyObject) => this.currentFileInfo = fileInfo);
        }
        this.update();
    }

    protected render(): React.ReactNode {
        return (<div>
            {`Selected node in explorer: ${this.currentFileInfo.name} ${this.currentFileInfo.isDirectory ? '(Directory)' : '(File)'}`
    }
        </div>);
    }
}
```

`FileInfoPropertyViewWidgetProvider` 负责根据选择提供正确的 `PropertyViewContentWidget`。

`custom-widget-provider.ts`：

```typescript
@injectable()
export class FileInfoPropertyViewWidgetProvider extends DefaultPropertyViewWidgetProvider {

    override readonly id = 'fileinfo';
    override readonly label = 'FileInfoPropertyViewWidgetProvider';

    private fileInfoWidget: FileInfoPropertyViewWidget;

    constructor() {
        super();
        this.fileInfoWidget = new FileInfoPropertyViewWidget();
    }

    override canHandle(selection: Object | undefined): number {
        return this.isFileSelection(selection) ? 1 : 0;
    }

    private isFileSelection(selection: Object | undefined): boolean {
        return !!selection && Array.isArray(selection) && FileSelection.is(selection[0]);
    }

    override provideWidget(selection: Object | undefined): Promise<FileInfoPropertyViewWidget> {
        return Promise.resolve(this.fileInfoWidget);
    }

    override updateContentWidget(selection: Object | undefined): void {
        this.getPropertyDataService(selection).then(service => this.fileInfoWidget.updatePropertyViewContent(service, selection));
    }
}
```

在应用的前端模块中，`FileInfoPropertyDataService` 以及 `FileInfoPropertyViewWidgetProvider` 按如下方式注册：


```typescript
bind(PropertyDataService).to(FileInfoPropertyDataService).inSingletonScope();
bind(PropertyViewWidgetProvider).to(FileInfoPropertyViewWidgetProvider).inSingletonScope();
```

根据这几个步骤，读者应该知道如何实现自定义属性视图，本质是由特定的 `PropertyViewWidgetProvider` 和 `PropertyViewDataService` 组成。

最终属性视图运行效果如下：

<img src="/custom-property-view.gif" alt="Property View - custom widget" style="max-width: 690px">
