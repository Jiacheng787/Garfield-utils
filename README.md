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
  }, {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].esm.js',
    },
    plugins: [resolve(), commonjs(), typescript()],
  }
];
```

> 可以同时生成支持 CommonJS 和 ESModule 的文件，在前面 `tsconfig.json` 配置下还会生成 `index.d.ts` 文件用于指明类型声明

> `format` 也可以使用 `umd` ，umd 是兼容 amd/cjs/iife 的通用打包格式，适合浏览器

最后在 `package.json` 中添加两个 npm script 如下：

```js
"scripts": {
+  "dev": "rollup -w -c",
+  "build": "rollup -c"
},
```

> 在开发时通过 `yarn dev` 可以实时编译打包，在打包时通过 `yarn build` 即可完成打包

## 5. ESLint 配置

如果是开源的项目，有人提 PR 的时候，我们会希望他的代码风格是比较符合我们一些预期的，因此在项目中引入 ESLint 。

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
+  "lint": "eslint",
},
```

> 这样通过 `yarn lint` 就可以对代码进行检查

## 6. Prettier 配置

上面我们配置 ESLint 进行代码规范检查，这边配置 Prettier 进行代码风格校验。前端开发项目中会涉及到一些代码格式问题，比如代码缩进空格、字符串是单引号还是双引号、是否使用尾分号、单行长度等等，可以使用 Prettier 实现团队代码风格统一。

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

## 7. Husky 配置

如果开发者在没有格式化的情况下提交代码怎么办，为此，引入 Husky 在 Git commit 提交前自动格式化暂存区中的文件，以及校验是否符号 ESLint 规则。

此外，还可以校验用户的 commit message 格式是否符合规范。

首先安装依赖：

```bash
$ yarn add husky lint-staged -D
```

> 需要注意，`husky` 和 `lint-staged` 是两个互不相干的包，只不过经常在一起用。`husky` 用来提供 Git hooks ，`lint-staged` 在安装后会有一个命令，通过这个命令可以根据 `package.json` 中配置的规则，对暂存区中的文件进行处理

> 这边说一下，husky 在 v6.0.0 之后进行了破坏性更新，修改了原有配置方式，具体配置方式可以参考文档：https://typicode.github.io/husky

在 `package.json` 中添加一个 npm script 如下：

```js
"scripts": {
  "dev": "rollup -w -c",
  "build": "rollup -c",
  "lint": "eslint",
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

对于 commit message 校验，我们创建一个 `scripts/verifyCommit.js` 如下：

```js
const chalk = require('chalk')
const msgPath = process.env.HUSKY_GIT_PARAMS
const msg = require('fs')
  .readFileSync(msgPath, 'utf-8')
  .trim()

const commitRE = /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.log()
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
      `invalid commit message format.`
    )}\n\n` +
    chalk.red(
      `  Proper commit message format is required for automated changelog generation. Examples:\n\n`
    ) +
    `    ${chalk.green(`feat(compiler): add 'comments' option`)}\n` +
    `    ${chalk.green(
      `fix(v-model): handle events on blur (close #28)`
    )}\n\n` +
    chalk.red(`  See .github/commit-convention.md for more details.\n`)
  )
  process.exit(1)
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

## 8. 添加单元测试

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
descript("Test suit I", () => {
  it("test case 1", () => {
    // 基本类型使用 .toBe 断言
    expect(1 + 1).toBe(2);
  })

  it("test case 2", () => {
    // 对象、数组使用 .toEqual 断言
    expect([1, 2, 3, 4].map(n => n + 1)).toEqual([2, 3, 4, 5]);
  })
})
```

执行一下测试脚本：

```bash
$ yarn test
```

> Jest 会自动去项目目录下查找 `xxx.test.js` 或者 `xxx.spec.js` 文件

TODO: Jest 支持 TypeScript

## 后续任务

- 使用构建发布脚本
- 使用文档网站
- 支持单仓多包 monorepo 项目

