# use-short-key

[![version](https://img.shields.io/npm/v/use-short-key.svg?style=flat-square)](http://npm.im/use-short-key)
[![npm downloads](https://img.shields.io/npm/dm/use-short-key.svg?style=flat-square)](https://www.npmjs.com/package/use-short-key)
[![codecov](https://img.shields.io/codecov/c/gh/dancerphil/use-short-key)](https://codecov.io/gh/dancerphil/use-short-key)
[![MIT License](https://img.shields.io/npm/l/use-short-key.svg?style=flat-square)](http://opensource.org/licenses/MIT)

`use-short-key` helps register short keys for your application.

English | [中文](https://github.com/dancerphil/use-short-key/blob/master/docs/README-zh_CN.md)

## Get Started

- install

```bash
npm i use-short-key
```

- register a short key

```typescript jsx
const Component = () => {
    // register on `⌘C`
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

## Example

[Online Example](https://k83fb.csb.app)
