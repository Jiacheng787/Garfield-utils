# My-Promisify

本项目旨在通过编写一个 `promisify` 工具函数，实践 npm 包相关工程化规范。

## 1. 初始化项目结构

首先初始化一份 `package.json` ：

```bash
$ npm init -y
```

## 2. 初始化 TypeScript

安装 `typescript` 编译器：

```bash
$ yarn add typescript -D
```

初始化一份 `tsconfig.json` ：

```bash
$ tsc --init
```

修改默认的 `tsconfig.json` 如下：

```js
{
  "compilerOptions": {
    "target": "esnext",
    "useDefineForClassFields": true,
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    // 生成 TS 声明文件
    "declaration": true,
    // 声明文件输出目录
    "declarationDir": "./dist",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "lib": [
      "esnext",
      "dom"
    ]
  },
  "include": [
    "src/",
    "types/"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

> 这边重点就是注释的两个配置，Typescript 在编译过程中会向 `./dist` 目录输出 `index.d.ts` 的类型声明文件

同时将 `package.json` 文件修改如下：

```js
{
  // 应用主入口文件；CommonJS 入口文件
  "main": "./dist/index.cjs.js",
  // ES Module 入口文件
  "module": "./dist/index.esm.js",
  // TS 声明文件
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
}
```

> `files` 字段是用于约定在发包的时候 NPM 会发布包含的文件和文件夹

> 注意现在输出的内容都是平级的，即平铺在 `./dist` 目录下

## 3. Git 初始化

首先初始化 `git` ：

```bash
$ git init
```

在项目根目录建一个 `.gitignore` ，写入规则如下：

```bash
node_modules/
dist/
.DS_Store
.yarn-error.log
```

## 4. 初始化 Rollup 打包环境

选用 Rollup 作为 NPM 包的构建工具，较好地支持 Tree-Shaking ，使得打包出来的体积较小。

```bash
$ yarn add rollup -D
$ yarn add @rollup/plugin-typescript -D
$ yarn add @rollup/plugin-node-resolve -D
$ yarn add @rollup/plugin-commonjs -D
```

> 安装 `rollup` 、支持 TS 、处理路径和 CommonJS 的插件

在项目根目录创建 `rollup.config.js` 如下：

```js
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs.js',
    },
    plugins: [resolve(), commonjs(), typescript()],
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].esm.js',
    },
    plugins: [resolve(), commonjs(), typescript()],
  },
];
```

> 可以同时生成支持 CommonJS 和 ESModule 的文件，在前面 `tsconfig.json` 配置下还会生成 `index.d.ts` 文件用于指明类型声明

> `format` 也可以使用 `umd` ，umd 是兼容 amd/cjs/iife 的通用打包格式，适合浏览器

> Rollup 默认情况下不会将第三方库打包进我们的代码中，适用于在 Node.js 环境下运行，如果需要将我们编写的源码与第三方库合并输出，可以使用 `@rollup/plugin-node-resolve`

最后在 `package.json` 中添加两个 npm script 如下：

```js
"scripts": {
+  "dev": "rollup -w -c",
+  "build": "rollup -c"
},
```

> 在开发时通过 `yarn dev` 可以实时编译打包，在打包时通过 `yarn build` 即可完成打包

## 5. Babel 配置

Babel 的作用是根据配置的 `browserslist` ，根据目标浏览器的兼容性，对代码中用到的 ES2015+ 语法进行转换，以及 API 的 polyfill。

无论第三方库还是 npm 包，语法转换基本都需要，区别主要在 polyfill 上。引入 polyfill 主要有两种方式，一是通过 `@babel/preset-env` 引入，根据 `browserslist` 配置决定需要引入哪些 polyfill，根据 `useBuiltIns` 配置决定全量引入还是按需引入，这种引入方式是全局污染的，不适合第三方库；二是通过 `@babel/plugin-transform-runtime` 引入，配置 `corejs: 3` 选项，从 `@babel/runtime-corejs3` 引入 polyfill，这种方式不适合前端项目，因为无法根据 `browserslist` 配置动态调整 polyfill 内容，但适合第三方库，因为提供了沙箱机制，polyfill 不会全局污染。

实际上，第三方库也可以只做语法转换，不进行 polyfill，由前端项目决定需要兼容的目标浏览器的版本。这种情况下，需要前端项目的 `babel-loader` 处理 `node_modules` 中的文件，但一般来说我们需要最小化 loader 作用范围，确保编译速度，我们可以配置 `useBuiltIns: entry` 在入口文件全量引入 polyfill，确保可以命中第三方库需要兼容的 API。

## 6. ESLint 配置

如果是开源的项目，有人提 PR 的时候，我们会希望他的代码风格是比较符合我们一些预期的，因此在项目中引入 ESLint 。

> 注意 ESLint 只能进行语法检查，将问题打印到控制台，但不能自动格式化，需要手动一条一条去改，很不方便。下面我们会引入 Prettier 实现代码格式化

先安装 eslint 开发环境依赖：

```bash
$ yarn add eslint -D
```

初始化一份 `.eslintrc.js` 配置：

```bash
$ npx eslint --init
```

> 根据命令行提示进行操作即可

然后可以根据自己的需要去修改 ESlint 的一些规则：

```js
{
  "env": {
    "browser": true,
    "commonjs": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 8
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars":  [
      "error",
      {
        "varsIgnorePattern": "^_"
      }
    ],
    "no-unused-vars": "off",
    "no-console": "warn",
    "space-before-function-paren": "warn",
    "semi": "warn",
    "quotes": ["warn", "single"]
  }
}
```

我们希望 ESLint 只对 `src` 目录下的文件进行检查，因此添加 `.eslintignore` 如下：

```bash
**/dist/**
**/node_modules/**
**/test/**
**/scripts/**
.eslintrc.js
.prettierrc.js
```

在 `package.json` 中添加一个 npm script 如下：

```js
"scripts": {
  "dev": "rollup -w -c",
  "build": "rollup -c",
+  "lint": "eslint src/**",
},
```

> 这样通过 `yarn lint` 就可以对代码进行检查

## 7. Prettier 配置

上面我们配置 ESLint 进行代码规范检查，而 ESLint 不具备代码格式化的功能，这边配置 Prettier 进行代码风格校验以及代码格式化。前端开发项目中会涉及到一些代码格式问题，比如代码缩进空格、字符串是单引号还是双引号、是否使用尾分号、单行长度等等，可以使用 Prettier 实现团队代码风格统一。

首先安装 Prettier ：

```bash
$ yarn add prettier -D
```

然后新建一个 `.prettierrc.js` 的配置文件，内容如下：

```js
{
  "printWidth": 100, // 单行长度
  "tabWidth": 2, // 缩进长度
  "useTabs": false, // 使用空格代替tab缩进
  "semi": true, // 句末使用分号
  "singleQuote": true, // 使用单引号
  "bracketSpacing": true, // 在对象前后添加空格-eg: { foo: bar }
  "arrowParens": "avoid" // 单参数箭头函数参数周围使用圆括号-eg: (x) => x
}
```

在开发的时候可以通过 `Shift + Command + F` 对当前文件进行格式化，或者使用 VS Code 配置:

```js
{
  "editor.formatOnPaste": true,
  "editor.formatOnSave": true,
}
```

## 8. Husky 配置

如果开发者在没有格式化的情况下提交代码怎么办，为此，引入 Husky 在 Git commit 提交前自动格式化暂存区中的文件，以及校验是否符号 ESLint 规则。

此外，还可以校验用户的 commit message 格式是否符合规范。

首先安装依赖：

```bash
$ yarn add husky lint-staged -D
```

> 需要注意，`husky` 和 `lint-staged` 是两个互不相干的包，只不过经常在一起用。`husky` 用来提供 Git hooks ，`lint-staged` 在安装后会有一个命令，通过这个命令可以根据 `package.json` 中配置的规则，对暂存区中的文件进行处理

> 有同学问为啥要用 `lint-staged` ，试想一下，如果每次都检查 `src` 下的所有文件，可能不是必要的，特别是对于有历史包袱的老项目而言，可能无法一次性修复不符合规则的写法。所以我们需要使用 `lint-staged` 工具只针对当前修改的部分进行检测

> 这边说一下，husky 在 v6.0.0 之后进行了破坏性更新，修改了原有配置方式，原先是在 `package.json` 中配置，现在改用命令的方式添加 hook 。具体配置方式可以参考文档：https://typicode.github.io/husky

在 `package.json` 中添加一个 npm script 如下：

```js
"scripts": {
  "dev": "rollup -w -c",
  "build": "rollup -c",
  "lint": "eslint src/**",
+  "prepare": "husky install"
},
```

> 注意 yarn 2 不支持 prepare hook ，具体配置方式参考官网

然后再执行一下这个 script ：

```bash
$ yarn prepare
```

> 实际上就是执行了 `husky install` ，在本地初始化一个 `.husky/_/husky.sh` 脚本。开发者在安装依赖的时候会触发 prepare hook ，也会在本地生成相应的 shell 脚本

添加 hook ：

```bash
# 使用 lint-staged 对暂存区的文件进行校验
$ npx husky add .husky/pre-commit "npx lint-staged"

# 使用自定义脚本检查 commit message
$ npx husky add .husky/commit-msg "node scripts/verifyCommit.js"
```

执行命令之后，会在 `.husky` 目录下生成两个 shell 脚本，但是脚本做的事情还没有定义。首先 `lint-staged` 只需要在 `package.json` 中添加如下内容即可：

```js
"lint-staged": {
  "*.js": [
    "prettier --write"
  ],
  "*.ts?(x)": [
    "eslint",
    "prettier --parser=typescript --write"
  ]
},
```

> 注意这里 `eslint` 和 `prettier` 只对暂存区中的文件进行处理，因此无需添加 `src/**`

对于 commit message 校验，我们创建一个 `scripts/verifyCommit.js` 如下：

```js
const chalk = require('chalk');
const msgPath = process.env.HUSKY_GIT_PARAMS;
const msg = require('fs').readFileSync(msgPath, 'utf-8').trim();

const commitRE =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/;

if (!commitRE.test(msg)) {
  console.log();
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(`invalid commit message format.`)}\n\n` +
      chalk.red(
        `  Proper commit message format is required for automated changelog generation. Examples:\n\n`
      ) +
      `    ${chalk.green(`feat(compiler): add 'comments' option`)}\n` +
      `    ${chalk.green(`fix(v-model): handle events on blur (close #28)`)}\n\n` +
      chalk.red(`  See .github/commit-convention.md for more details.\n`)
  );
  process.exit(1);
}
```

然后我们可以测试提交一份文件试试：

```bash
$ git add -A
$ git commit -m "initial commit"
```

发现 `lint-staged` 执行正常，但是 `verifyCommit.js` 中的 `process.env.HUSKY_GIT_PARAMS` 获取失败，导致执行出错了。查了下只需要在 shell 脚本中加一句：

```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

+ export HUSKY_GIT_PARAMS="$*"
node scripts/verifyCommit.js
```

> `$*` 参数就是 commit message 文件路径，顺便说下 `$0` 还可以拿到当前的 hook 名

## 9. 添加单元测试

首先安装 Jest ：

```bash
$ yarn add jest -D
```

在 `package.json` 中添加一个 npm script ：

```js
"scripts": {
  "dev": "rollup -w -c",
  "build": "rollup -c",
+  "test": "jest",
  "lint": "eslint",
  "prepare": "husky install"
},
```

编写单元测试的目录通常命名为 `test` 或者 `__test__` ，对应的文件命名为 `xxx.test.js` 或者 `xxx.spec.js` 。这里创建 `test/index.test.js` 文件如下：

```js
descript('Test suit I', () => {
  it('test case 1', () => {
    // 基本类型使用 .toBe 断言
    expect(1 + 1).toBe(2);
  });

  it('test case 2', () => {
    // 对象、数组使用 .toEqual 断言
    expect([1, 2, 3, 4].map(n => n + 1)).toEqual([2, 3, 4, 5]);
  });
});
```

执行一下测试脚本：

```bash
$ yarn test
```

> Jest 会自动去项目目录下查找 `xxx.test.js` 或者 `xxx.spec.js` 文件

TODO: Jest 支持 TypeScript

## 10. 发包流程

在本地执行以下命令进行登录：

```bash
$ npm login
```

发布一个 npm 包之前，填写 `package.json` 中三个最重要的字段：

```js
{
  "name": "@garfield/promisify",
  "version": "1.0.0",
  "main": "index.js"
}
```

之后执行发包命令即可：

```bash
$ npm publish
```

一旦发布完成，在任意地方通过 `npm i` 均可依赖该包。

该包进行更新后，可通过修改 `package.json` 中的版本号，再次发包进行升级。注意需要遵守 `semver` 规范，npm 的版本号为 `semver` 规范，由 `[major, minor, patch]` 三部分组成，其中：

- major: 当你发了一个含有 Breaking Change 的 API
- minor: 当你新增了一个向后兼容的功能时
- patch: 当你修复了一个向后兼容的 Bug 时

在 npm 发包时，实际发包内容为 `package.json` 中 `files` 字段，一般只需将构建后资源(如果需要构建)进行发包，源文件可发可不发。

`npm publish` 将自动走过以下生命周期：

- prepublishOnly: 如果发包之前需要构建，可以放在这里执行
- prepack
- prepare: 如果发包之前需要构建，可以放在这里执行 (该周期也会在 npm i 后自动执行)
- postpack
- publish
- postpublish

发包实际上是将本地 package 中的所有资源进行打包，并上传到 npm 的一个过程。

也可以通过一个 **构建发布脚本** 来实现以上流程。先跑一遍单元测试，然后执行构建命令，修改 `package.json` 版本号，将 `package.json`、`README.md`、`LICENSE` 等文件复制到输出目录，生成 CHANGELOG，执行 git 提交操作（提交前会对源码进行 lint），生成 git tag，最后 `npm publish` 完成发包。

## 后续任务

- 使用构建发布脚本
- 使用文档网站
- 支持单仓多包 monorepo 项目
- 使用 yeoman 脚手架初始化一份项目模板

## 参考

[手摸手学会搭建一个 TS+Rollup 的初始开发环境](https://juejin.cn/post/7029525775321661470)

[基于 Lerna 实现 Monorepo 项目管理](https://juejin.cn/post/7030207667457130527)

[从 ESLint 开启项目格式化](https://juejin.cn/post/7031506030068662285)

[「前端基建」探索不同项目场景下Babel最佳实践方案](https://juejin.cn/post/7051355444341637128#heading-16)
