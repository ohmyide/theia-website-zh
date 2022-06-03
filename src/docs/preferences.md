---
title: Preferences
---

# 首选项（偏好设置）

Theia 带有首选项服务，它允许模块从中获取偏好设置、扩展默认偏好并监听其变化。

首选项可以保存在工作区的根目录下 `.theia/settings.json` 或 Linux 系统的 `$HOME/.theia/settings.json` 下。对于 Windows 系统，用户设置默认在 `%USERPROFILE%/.theia/settings.json`（类似于`C:\Users\epatpol\.theia/settings.json`）。

偏好设置是标准的 key、value 结构 JSON 文件（注意，以下偏好设置名称不是官方的，只是作为一个例子）。如果需要，你也可以在 settings.json 文件中添加注释，例如


```
{
    // Enable/Disable the line numbers in the monaco editor
	"monaco.lineNumbers": "off",
    // Tab width in the editor
	"monaco.tabWidth": 4,
	"fs.watcherExcludes": "path/to/file"
}
```

下面以文件系统为例，讲解偏好设置的使用。

## 用 inversify 将默认偏好作为模块贡献出来

如要添加偏好设置，模块必须提供一个有效的 json schema，该 schema 用来验证偏好值。一个模块必须像下面这样把 PreferenceContribution 绑定到一个值。

```typescript
export interface PreferenceSchema {
    [name: string]: Object,
    properties: {
        [name: string]: object
    }
}

export interface PreferenceContribution {
    readonly schema: PreferenceSchema;
}
```

作为示例，文件系统做如下绑定：

```typescript
export const filesystemPreferenceSchema: PreferenceSchema = {
    "type": "object",
    "properties": {
        "files.watcherExclude": {
            "description": "List of paths to exclude from the filesystem watcher",
            "additionalProperties": {
                "type": "boolean"
            }
        }
    }
};

bind(PreferenceContribution).toConstantValue(
{
    schema: filesystemPreferenceSchema
});
```

这里有一些辅助链接帮你创建有效的 schema:

* [JSON schema spec](http://json-schema.org/documentation.html)
* [Online JSON validator](https://jsonlint.com/)
* [Online JSON schema validator](http://www.jsonschemavalidator.net/)

## 通过偏好设置来监听首选项的变化

要获取首选项的值，只需从容器中获取注入的 PreferenceService 即可：

```typescript

const preferences = ctx.container.get(PreferenceService)

```


在文件系统的示例中，首选项服务是开始时加载获取的，这种情况下，你可以使用 onPreferenceChanged 方法来注册最及时响应的 change 回调。

```typescript

constructor(@inject(PreferenceService) protected readonly prefService: PreferenceService
	prefService.onPreferenceChanged(e => { callback }
```

回调将收到如下格式的事件响应 `e`:

```typescript
export interface PreferenceChangedEvent {
    readonly preferenceName: string;
    readonly newValue?: any;
    readonly oldValue?: any;
}
```

虽然向上述一样，可以直接在需要的类中使用，而文件系统也提供了一个专门针对文件系统偏好的代理服务（它在后台使用偏好设置服务）。这样可以更快更有效地搜索偏好（因为是在文件系统偏好服务范围内搜索偏好，而不是经通用的偏好服务在所有偏好上搜索），从而更加高效，因为只有监听特定偏好的模块会被通知。为了做到这一点，有一个文件系统配置的代理接口，像这样使用首选项代理接口进行绑定：


```typescript
export type PreferenceProxy<T> = Readonly<T> & Disposable & PreferenceEventEmitter<T>;
export function createPreferenceProxy<T extends Configuration>(preferences: PreferenceService, configuration: T): PreferenceProxy<T> {
    /* Register a client to the preference server
    When a preference is received, it is validated against the schema and then fired if valid, otherwise the default value is provided.

    This proxy is also in charge of calling the configured preference service when the proxy object is called i.e editorPrefs['preferenceName']

    It basically forwards methods to the real object, i.e dispose/ready etc.
}
```

要使用该代理，只需将其绑定到新的类型 X = PreferenceProxy<CONFIGURATION_INTERFACE>，然后用 bind(X) 绑定代理。

```typescript
export interface FileSystemConfiguration {
    'files.watcherExclude': { [globPattern: string]: boolean }
}

export const FileSystemPreferences = Symbol('FileSystemPreferences');
export type FileSystemPreferences = PreferenceProxy<FileSystemConfiguration>;

export function createFileSystemPreferences(preferences: PreferenceService): FileSystemPreferences {
    return createPreferenceProxy(preferences, defaultFileSystemConfiguration, filesystemPreferenceSchema);
}

export function bindFileSystemPreferences(bind: interfaces.Bind): void {

    bind(FileSystemPreferences).toDynamicValue(ctx => {
        const preferences = ctx.container.get(PreferenceService);
        return createFileSystemPreferences(preferences);
    });

    bind(PreferenceContribution).toConstantValue({ schema: filesystemPreferenceSchema });

}
```

最后，要使用文件系统的偏好配置，只需在需要的地方将它注入，你可以像这样访问偏好设置（仍以文件系统为例）：

```typescript
const patterns = this.preferences['files.watcherExclude'];
```

你也可以像这样注册对偏好设置的监听：

```typescript
this.toDispose.push(preferences.onPreferenceChanged(e => {
    if (e.preferenceName === 'files.watcherExclude') {
        this.toRestartAll.dispose();
    }
}));
```


```typescript
constructor(...,
        @inject(FileSystemPreferences) protected readonly preferences: FileSystemPreferences) {
	...
         this.toDispose.push(preferences.onPreferenceChanged(e => {
            if (e.preferenceName === 'files.watcherExclude') {
                this.toRestartAll.dispose();
            }
        }));
	...
}
```

## Preference flow when modifying a preference 修改首选项时的首选项流程

目前，当 ${workspace}/.theia/ 或 `os.homedir()`/.theia/ 中的 settings.json 被修改时，会触发偏好服务修改事件。目前，用 CompoundPreferenceServer 来管理不同服务（作用域），如 workspace/user/defaults（通过上述示例提供）。接下来，改用 PreferenceService 来管理，它上面添加了更方便的 api（如getBoolean、getString等）。它还允许客户端注册偏好设置的监听。PreferenceService 可直接在模块中注入使用，或通过更具体的代理（如上面的文件系统配置）。

当偏好设置修改时，流程如下：


```
.theia/settings.json -> JsonPreferenceServer -> CompoundPreferenceServer -> PreferenceService -> PreferenceProxy<FileSystemConfiguration> -> FileSystemWatcher
```

## 获取偏好设置

在文件系统的例子中，我们将使用与上述相同的代理配置来访问偏好设置：

```typescript
    if (this.prefService['preferenceName']) {
    ...
    }

    if (this.prefService['preferenceName2']) {
    ...
    }
})
```

这样做的原因是，如上所述，代理将直接调用 prefService.get('preferenceName')。

## 首选项 TODO/FIXME
* 在 CompoundPreferenceServer 中添加具有不同优先级的作用域
* 在 theia 内部修改 settings.json 时，增加自动补全

