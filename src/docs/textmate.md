---
title: TextMate Coloring
---


# Theia 支持 TextMate

TextMate 语法使我们能够准确地为大多数代码文件高亮显示，即使它只是在语法层面（没有语言深度
理解）。语义着色可以由语言服务提供支持。

TextMate 语法主要有两种格式：`.plist` 和 `.tmLanguage.json`，Theia 两者都支持。

[点击这里](https://macromates.com/manual/en/language_grammars) 阅读有关 TextMate 语法的更多信息。

> 注意：特定语言的语法应该放在该语言专用的扩展中。 `@theia/textmate-grammars` 目前没有任何特定扩展名的语言注册表。

## 添加新语法支持

为新语言添加语法支持，通常的模式是在扩展的根目录下创建一个 `data` 文件夹，存储对应的语法文件：

```
extension/
    data/
        grammars go here
    lib/
        ...
    src/
        ...
    package.json
    ...
```

然后，在 `package.json` 中，分别为源文件和构建后的文件语法，添加以下配置：

```json
  "files": [
    "data",
    "lib",
    "src"
  ],
```

现在可以从扩展中，通过 `LanguageGrammarDefinitionContribution` 贡献能力。

```ts
@injectable()
export class YourContribution implements LanguageGrammarDefinitionContribution {

    readonly id = 'languageId';
    readonly scopeName = 'source.yourLanguage';

    registerTextmateLanguage(registry: TextmateRegisty) {
        registry.registerTextmateGrammarScope(this.scopeName, {
            async getGrammarDefinition() {
                return {
                    format: 'json',
                    content: require('../data/yourGrammar.tmLanguage.json'),
                }
            }
        });
        registry.mapLanguageIdToTextmateGrammar(this.id, this.scopeName);
    }
}
```

如果你使用 `.plist` 语法，则不能通过 `require` 直接获取内容，因为 Webpack 会改为从服务器获取的文件。在这种情况下，用下述方式可获取文件内容：

```ts
@injectable()
export class YourContribution implements LanguageGrammarDefinitionContribution {

    readonly id = 'languageId';
    readonly scopeName = 'source.yourLanguage';

    registerTextmateLanguage(registry: TextmateRegisty) {
        registry.registerTextmateGrammarScope(this.scopeName, {
            async getGrammarDefinition() {
                const response = await fetch(require('../data/yourGrammar.plist'));
                return {
                    format: 'plist',
                    content: await response.text(),
                }
            }
        });
        registry.mapLanguageIdToTextmateGrammar(this.id, this.scopeName);
    }
}
```