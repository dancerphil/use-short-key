# use-short-key

[![version](https://img.shields.io/npm/v/use-short-key.svg?style=flat-square)](http://npm.im/use-short-key)
[![npm downloads](https://img.shields.io/npm/dm/use-short-key.svg?style=flat-square)](https://www.npmjs.com/package/use-short-key)
[![codecov](https://img.shields.io/codecov/c/gh/dancerphil/use-short-key)](https://codecov.io/gh/dancerphil/use-short-key)
[![MIT License](https://img.shields.io/npm/l/use-short-key.svg?style=flat-square)](http://opensource.org/licenses/MIT)

`use-short-key` 可以帮助你注册快捷键。

[English](https://github.com/dancerphil/use-short-key/blob/master/README.md) | 中文

## Get Started

- 安装

```bash
npm i use-short-key
```

- 注册快捷键

```typescript jsx
const Component = () => {
    // 注册 `⌘C` 的快捷键
    useShortKey({
        metaKey: true,
        code: 'KeyC',
        keydown: (e: KeyboardEvent) => {
            // ...
        },
    });
    
    // ...
};
```

## 示例

[在线示例](https://codesandbox.io/s/usehotkey-k83fb)
