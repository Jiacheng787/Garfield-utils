# Garfield-utils

本项目旨在通过编写一个工具函数库，实践 npm 包相关工程化规范。

## 1. 初始化项目结构

首先初始化一份 `package.json` ：

```bash
$ npm init -y
```

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
  /****** 可选字段 ******/
  // 使用 exports 字段指定入口文件
  "exports": "",
  // 指定模块规范
  "type": "commonjs" | "moudle",
  // 使用 bin 字段注册命令
  "bin": "",
}
```

> `files` 字段是用于约定在发包的时候 NPM 会发布包含的文件和文件夹

> 注意现在输出的内容都是平级的，即平铺在 `./dist` 目录下

### 1) 入口文件

`main` 指 npm package 的入口文件，当我们对某个 package 进行导入时，实际上导入的是 main 字段所指向的文件。

最初 `main` 字段实际上提供给 CommonJS 使用，随着 ESM 发展，许多 package 会打包 N 份模块化格式进行分发，如 antd 既支持 ES，也支持 umd，将会打包两份。如果使用 `import` 对该库进行导入，则首次寻找 `module` 字段引入，否则引入 `main` 字段。基于此，许多前端友好的库，都进行了以下分发操作:

1. 对代码进行两份格式打包: `commonjs` 与 `es module`
2. `module` 字段作为 `es module` 入口
3. `main` 字段作为 `commonjs` 入口

使用 Webpack 打包 `node_modules` 中的依赖时，Webpack 会根据 `resolve.mainFields` 配置解析 `package.json` 中配置的入口文件路径，默认配置如下：

```js
module.exports = {
  //...
  resolve: {
    mainFields: ['browser', 'module', 'main'],
  },
};
```

> 假如提供了 `module` 字段，Webpack 优先使用 `module` 字段对应的入口文件路径

从 node 14.x 版本开始，package.json 里支持了 `exports` 属性，当它存在时，它的优先级最高。

```json
{
  "exports": {
    "import": "es/index.js",
    "require": "cjs/index.js"
  }
}
```

:::tip

`exports` 可以更容易地控制子目录的访问路径，不在 `exports` 字段中的模块，即使直接访问路径，也无法引用！不过在很多开源项目中，会同时定义 `exports`、`main`、`module` 字段，很明显这是为了兼容处理，低版本 Node 会忽略 `exports` 字段。

此外，Webpack 打包的项目也支持 `exports` 字段。

[工程化知识卡片 014: 发包篇之 package.json 中 main、export、module 的区别何在](https://juejin.cn/post/7025809061660590087)

http://nodejs.cn/api/packages.html#main-entry-point-export

:::

### 2) 注册命令

很多 npm 包安装的时候，会注册命令便于使用，例如 Vue-cli、Webpack、ESLint 等等。我们只需要在 `package.json` 中添加一个 `bin` 字段，指定执行命令的脚本文件路径即可：

```js
{
  "bin": {
    "garfield-service": "./bin/garfield-service.js",
  }
}
```

使用 `npm i` 安装该包，会自动在 `node_modules/.bin` 路径下创建一个软链接，指向脚本文件。运行这个命令即可执行脚本。需要注意，该脚本文件必须是可执行文件，即文件头部需要添加 shebang 用于声明脚本解释程序：

```js
#!/usr/bin/env node
```

如果脚本比较复杂，想调试一下脚本，那么每次都要先发布 npm 包，然后 `npm i` 安装之后才能调试，这样比较麻烦，有没有方法可以直接运行脚本呢？这里就要用到 `npm link` 命令，作用是将调试的npm模块链接到对应的运行项目中去，我们也可以通过这个命令把模块链接到全局。

> 参考：
>
> https://docs.npmjs.com/cli/v8/commands/npm-link

### 3) 发布哪些文件

在 npm 包中，我们可以选择哪些文件发布到服务器中，比如只发布压缩后的代码，而过滤源代码；我们可以通过配置文件来进行指定，可以分为以下几种情况：

- 存在 `.npmignore` 文件，以 `.npmignore` 文件为准，在文件中的内容都会被忽略，不会上传；
- 不存在 `.npmignore` 文件，以 `.gitignore` 文件为准；
- `package.json` 中存在 `files` 字段，可以理解为白名单；

> ignore 相当于黑名单，files 字段就是白名单，当两者内容冲突时，以 files 为准，它的优先级最高

例如 `package.json` 配置如下：

```json
{
  "files": [
    "dist/*.js",
    "types/*.d.ts"
  ]
}
```

这样发包内容会包括 `files` 定义的文件和 `package.json`、`README.md` 这些文档类文件。

为什么有额外这些文档类呢，原因在于这些信息传递的文件，npm 是规定不允许忽略的，只要存在就会上传：

- package.json
- README (and its variants)
- CHANGELOG (and its variants)
- LICENSE / LICENCE

> 可以通过 `npm pack` 命令进行本地模拟打包测试，在项目根目录下就会生成一个 tgz 的压缩包，这就是将要上传的文件内容

### 4) 项目依赖

在前端项目或者 npm 包中，所有的依赖库都会通过 `dependencies` 和 `devDependencies` 字段进行配置管理。

- `dependencies`：表示生产环境下的依赖管理，例如 vue、react、axios 等生产环境运行所依赖的模块，默认不带参数，或者 `--save` 简写 `-S`；
- `devDependencies`：表示开发环境下的依赖管理，例如 Webpack、ESLint 等项目构建所需的依赖，`--save-dev` 简写 `-D`；

> 实际上这两个字段对于前端项目来说并没有太大区别，但是在以下场景中会有区别：
>
> - 前端项目安装一个第三方库，默认只安装该库 `dependencies` 节点下的依赖
> - 在 CI 环境中，运行 `npm install --production` 只安装 `dependencies` 节点下的依赖

除了以上两个字段，在 npm 包中还会用到 `peerDependencies` 这个字段，用于指定项目运行宿主环境要求。例如 Element-Plus 组件库本身无法单独运行，必须依赖 Vue3 环境才能运行，因此通过 `peerDependencies` 指定宿主环境依赖：

```js
"peerDependencies": {
  "vue": "^3.2.0"
},
```

:::tip

为什么需要 `peerDependencies`

例如开发一个 React 组件库的时候，有三个诉求：

- 该组件库开发的时候需要安装 React；
- 用户引入该组件库的时候不能重复安装 React；
- 组件库的 React 版本与目标环境不一致的时候需要被包管理器发现并打印警告；

如果安装到 `dependencies` 下，显然会导致重复安装；如果安装到 `devDependencies` 下虽然不会导致重复安装，但包管理器不会检查版本，当版本不一致的时候不会打印警告。所以 `peerDependencies` 是最优选择。

> 在老版本 React 项目中引入某些依赖库（例如 `antd`、`react-transition-group`），一般不能直接安装最新的版本（大概率会报错），此时应该根据依赖库的 package.json 中指定的 `peerDependencies` 字段选择合适的依赖库版本

:::

### 5) 版本号

每次发包的时候，都需要更新版本号。npm包的版本号也是有规范要求的，通用的就是遵循semver语义化版本规范。

`semver`，`Semantic Versioning` 语义化版本的缩写，文档可见 semver.org/，它由 `[major, minor, patch]` 三部分组成，其中

- `major`: 当你发了一个含有 Breaking Change 的 API
- `minor`:  当你新增了一个向后兼容的功能时
- `patch`: 当你修复了一个向后兼容的 Bug 时

此外修订号后面还可以加先行版本号，作为版本号的延伸；当要发行大版本或核心功能时，但不能保证这个版本完全正常，就要先发一个先行版本。

先行版本号的格式是在修订版本号后面加上一个连接号（-），再加上一连串以点（.）分割的标识符，标识符可以由英文、数字和连接号（[0-9A-Za-z-]）组成。常见的先行版本号有：

- `1.0.0-alpha`：不稳定版本，一般而言，该版本的Bug较多，需要继续修改，是测试版本
- `1.0.0-beta`：基本稳定，相对于Alpha版已经有了很大的进步，消除了严重错误
- `1.0.0-rc`：和正式版基本相同，基本上不存在导致错误的Bug
- `1.0.0-release`：最终版本

在 `package.json` 的一些依赖的版本号中，我们还会看到 `^`、`~` 这样的标识符，或者不带标识符：

- 不带标识符：完全百分百匹配，必须使用当前版本号
- 波浪符号 `~`：固定主版本号和次版本号，修订号可以随意更改。对于 `~1.2.3` 而言，它的版本号范围是 `>=1.2.3  <1.3.0`
- 插入符号 `^`：固定主版本号，次版本号和修订号可以随意更改。对于 `^1.2.3` 而言，它的版本号范围是 `>=1.2.3  <2.0.0`
- 任意版本 `*`：对版本没有限制，一般不用
- 或符号 `||`：可以用来设置多个版本号限制规则，例如 `>=3.0.0 || <=1.0.0`

当我们 `npm i` 时，**默认的版本号是 `^`，可最大限度地在向后兼容与新特性之间做取舍**，但是有些库有可能不遵循该规则，我们在项目时应当使用 `yarn.lock/package-lock.json` 锁定版本号。

### 6) 解决第三方库间接依赖不受控问题

npm 安装依赖默认添加 `^` 前缀，即 **默认锁定主版本号**，当再次执行 npm install 命令时，会自动安装这个包在此大版本下的最新版本。

#### lock file 解决了什么问题

在没有 lock file 的情况下，如果有些依赖未遵守 semver 规范，在小版本中引入 Breaking Change，则会在生产环境中引入 bug。

而当有了 lock file 时，每个依赖的版本都被锁定（包括依赖的依赖），每次依赖安装的版本号都从 lock file 中进行获取，确保生成稳定的依赖树，避免了不可测的依赖风险。

#### 如何锁死依赖版本

npm 安装依赖默认添加 `^` 前缀，如果想要修改这个功能，可以执行以下命令：

```bash
$ npm config set save-prefix='~'
```

> 执行完该命令之后，就会把 `^` 符号改为 `~` 符号，改为锁定次版本号。当再次安装新模块时，就从只允许小版本的升级变成了只允许补丁包的升级

如果想要彻底锁定当前的版本，可以使用下面的命令装包：

```bash
$ npm install --save --save-exact react-scripts@5.0.1
# or
$ yarn add --exact react-scripts@5.0.1
```

或者执行以下命令：

```bash
$ npm config set save-exact true
```

> 这样每次 `npm install xxx --save` 时就会锁定依赖的版本号，相当于加了 `--save-exact` 参数。建议线上的应用都采用这种锁定版本号的方式

#### 第三方库应该锁死 dependencies

对于前端项目来说，既然可以在 package.json 中锁定依赖版本，为什么还需要 lock file 呢？在 package.json 中锁定依赖只能锁定当前项目中的依赖版本，但是还存在间接依赖，即依赖还有依赖，直接锁定依赖版本无法解决间接依赖的问题，间接依赖版本还是不受控制，需要借助 lock-file 锁定间接依赖的版本。

实际上，lock file 只在前端项目发挥作用，第三方库的 lock file 无法锁定该库的间接依赖，即 dependencies。为什么这么说呢，例如你安装 `@vue/cli-shared-utils`，而 `@vue/cli-shared-utils` 依赖了 `node-ipc`，`@vue/cli-shared-utils` 的 package.json 内容如下：

```json
{
  "dependencies": {
    // ...
    "node-ipc": "^9.1.1",
  },
}
```

这种情况下，即使 `@vue/cli-shared-utils` 自己的 lock file 锁定的版本是 `9.1.1`，但是你首次 `npm i` 安装该包的时候，并不会按照 `@vue/cli-shared-utils` 的 lock file 锁定的版本安装，而是根据 package.json 中指定的 `^9.1.1` 规则进行安装。如果此时 `node-ipc` 发布了 `9.2.1` 版本，则会安装 `9.2.1` 版本，同时在你的前端项目的 lock file 中会记录该版本号，下次运行 `npm i` 安装依赖的时候，都会安装该版本的依赖。

这样显然会导致间接依赖不受控的问题，实际上，`node-ipc` 的作者在 `9.2.2` 版本中植入了恶意代码，恰好 `@vue/cli-shared-utils` 中 package.json 的依赖锁定规则是 `^9.1.1`，因此导致很多安装了 `vue-cli` 的用户中招。因此 Vue 官方紧急发布了更新，将 `node-ipc` 版本锁死为 `9.2.1`：

```json
{
  "dependencies": {
    // ...
    "node-ipc": "9.2.1",
  },
}
```

为避免前端项目中出现间接依赖不受控的问题，建议在第三方库的 package.json 中锁定 dependencies 版本。

#### 第三方库的 lock file 的作用

前面提到，安装第三方库的时候，实际上并不会根据第三方库的 lock file 锁定的版本进行安装，那第三方库的 lock file 作用是什么，第三方库是否应该提交 lock file？实际上，第三方库 lock file 的作用仅仅只是锁定 devDependencies，这样 Contributor 可根据 lock file 很容易将项目跑起来。

### 7) 包管理工具

使用 pnpm 作为包管理工具。

:::tip

前端包管理器简史：

**npm@v3 之前**

- 嵌套结构（nest），会出现大量重复装包的问题
- 因为是树型结构，`node_modules` 嵌套层级过深，导致文件路径过长
- 破坏单例模式，例如在两个不同包引入的 React 不是同一个模块实例

**npm@v3 / yarn**

- 分身依赖：npm@v3 使用扁平化（flat）的方式安装依赖，一定程度上解决了重复装包的问题，但是注意并没有完全解决。例如 A 依赖了 `lodash@3.0.0`，B 和 C 都依赖了 `lodash@4.0.0`，当 A 安装的时候，发现依赖了 `lodash@3.0.0`，于是会被装到顶层的 `node_modules` 下。当 B 安装的时候，发现依赖了 `lodash@4.0.0`，由于顶层 `node_modules` 已经安装了 `lodash@3.0.0`，于是 `lodash@4.0.0` 会被安装到 B 的 `node_modules` 下。再次安装 C 的时候，出于同样的原因 `lodash@4.0.0` 又会安装到 C 的 `node_modules` 下。于是 `lodash@4.0.0` 不可避免地被安装了两次。这里还有一个问题，相同依赖的不同版本，谁会安装到顶层 `node_modules` 完全取决于安装顺序，这就导致生成的依赖树不稳定，只能通过 lockfile 锁定依赖
- 幽灵依赖：由于使用扁平化方式安装，`package.json` 里并没有写入的包竟然也可以在项目中使用了
- 平铺减少安装没有减省时间，因为扁平化算法比较复杂，时间居然还增加了

**npm@v5 / yarn**

该版本引入了一个 `lock` 文件，以解决 `node_modules` 安装中的不确定因素。这使得无论你安装多少次，都能有一个一样结构的`node_modules`。

然而，平铺式的算法的复杂性，幽灵依赖之类的问题还是没有解决。

推荐阅读：为什么 npm@v3 改为平铺结构还是会重复装包

[看了9个开源的 Vue3 组件库，发现了这些前端的流行趋势](https://juejin.cn/post/7092766235380678687)

[深入浅出 tnpm rapid 模式 - 如何比 pnpm 快 10 秒](https://zhuanlan.zhihu.com/p/455809528)

[【第2506期】JavaScript 包管理器简史（npm/yarn/pnpm）](https://mp.weixin.qq.com/s/0Nx093GdMcYo5Mr5VRFDjw)

[工程化知识卡片 023：node_modules 版本重复的困境](https://juejin.cn/post/7030084290989948935)

:::

基本用法：

- `pnpm add <pkg>`：安装依赖
- `pnpm add -D <pkg>`：安装依赖到 devDependencies
- `pnpm install`：安装所有依赖
- `pnpm -r update`：递归更新每个包的依赖
- `pnpm -r update typescript@latest`：将每个包的 typescript 更新为最新版本
- `pnpm remove`：移除依赖

如何支持 monorepo 项目：https://pnpm.io/zh/workspaces

`pnpm -r` 带一个参数 `-r` 表示进行递归操作。

[pnpm 官方文档](https://pnpm.io/zh/)

[为什么 vue 源码以及生态仓库要迁移 pnpm?](https://juejin.cn/post/7038192011882528776)

[pnpm 源码结构及调试指南](https://mp.weixin.qq.com/s/grb2OlBYiwU3TOkEtNZReA)

如何设置 NPM Registry：

1\. Global registry

我们可以通过设置 npm 或者 pnpm 的 config 来设置 Global Registry，例如：

```bash
# npm
npm config set registry=https://registry.npmmirror.com/

# or pnpm
pnpm config set registry=https://registry.npmmirror.com/
```

2\. npmrc

无论是 `npm` 或 `pnpm` 默认都会从项目的 `.npmrc` 文件中读取配置，所以当我们需要包的发布要走私有 Registry 的时候，可以这样设置：

```bash
registry=https://registry.npmmirror.com/
```

3\. --registry

在执行 `npm publish` 或 `pnpm publish` 的时候，我们也可以通过带上 `--registry Option` 来告知对应的包管理工具要发布的 Registry，例如：

```bash
# npm
npm publish --registry=https://registry.npmmirror.com/

# or pnpm
pnpm publish --registry=https://registry.npmmirror.com/
```

4\. PublishConfig

PublishConfig 指的是我们可以在要执行 publish 命令的项目 `package.json` 中的 `publishConfig.registry` 来告知 npm 或 pnpm 要发布的 Registry，例如：

```json
{
  "publishConfig": {
    "registry": "https://registry.npmmirror.com/"
  }
}
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

Rollup 是一个基于 ESM 规范的打包器，打包产物比较干净，不含运行时代码、模板代码等等，而且较好地支持 Tree-Shaking，打包出来的体积较小，经常用于第三方库的打包：

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

使用 rollup 构建第三方库包括哪些过程

- 浏览器不兼容的语法转换
  - Vue 文件处理：`rollup-plugin-vue`
  - JSX、TS 语法编译：`rollup-plugin-babel`
  - 支持 CSS 加载、添加前缀、压缩、scss/less 预编译：`rollup-plugin-postcss`
- 编译兼容
  - 仅限语法转换，不建议 polyfill：`rollup-plugin-babel`
- 混淆压缩
  - 对应：`rollup-plugin-terser`
- 打包为一份文件（注意 `peerDependencies` 外部化），多种打包格式，生成类型声明文件等
- 工程质量保障，例如 ESLint、TS 类型检查、单元测试等

:::tip

注意：前面两步可以避免业务项目的 `babel-loader` 处理 `node_modules` 下的模块，提升构建效率。

:::

开发常用的 rollup 插件：

- `@rollup/plugin-node-resolve`：Rollup 默认不会打包第三方库，适合在 Node.js 环境下运行，使用这个插件可以将编写的源码和第三方库合并输出
- `@rollup/plugin-commonjs`：Rollup 只能处理 ES Module 规范的第三方库，对于使用 CommonJS 的第三方库，需要使用这个插件将 CommonJS 转为 ES Module
- `@rollup/plugin-babel`：支持 Babel 的插件
- `@rollup/plugin-typescript`：支持 TypeScript 的插件
- `@rollup/plugin-eslint`：支持 ESLint 的插件

> 官方插件：
>
> https://github.com/rollup/plugins

另外还有一些非官方插件：

- `rollup-plugin-terser`：支持 Terser 代码压缩的插件
- `rollup-plugin-serve`：起一个本地服务
- `rollup-plugin-vue`：打包 Vue 组件的时候，提前编译 Vue SFC

:::tip

推荐两个基于 rollup 的打包工具：

- [tsup](https://github.com/egoist/tsup)
- [unbuild](https://github.com/unjs/unbuild)

:::

## 5. Babel 配置

Babel 的作用是根据配置的 `browserslist` ，根据目标浏览器的兼容性，对代码中用到的 ES2015+ 语法进行转换，以及 API 的 polyfill。

无论前端业务工程还是 npm 包，语法转换基本都需要，区别主要在 polyfill 上。引入 polyfill 主要有两种方式：

- 一是通过 `@babel/preset-env` 引入，根据 `browserslist` 配置决定需要引入哪些 polyfill，根据 `useBuiltIns` 配置决定全量引入还是按需引入。这种引入方式是全局污染的（污染原型链，会跟其他第三方 polyfill 冲突），不适合第三方库，但是可以用于前端项目。

  ```js
  module.exports = {
    presets: [
      [
        "@babel/preset-env", // 负责语法转换，同时引入 polyfill
        {
          useBuiltIns: "usage", // 默认为 false，entry 全量引入，usage 按需引入
          corejs: 3
        }
      ]
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          // corejs: 3,
          helpers: true, // 提取 babel 中的 helper 函数减小打包体积
          regenerator: true,
          useESModules: true,
        },
      ],
    ]
  }
  ```

- 二是通过 `@babel/plugin-transform-runtime` 引入，配置 `corejs: 3` 选项，从 `@babel/runtime-corejs3` 引入 polyfill。这种方式不适合前端项目，因为无法根据 `browserslist` 配置动态调整 polyfill 内容（这是一个已知问题，会在 Babel8 修复）。但适合第三方库，因为提供了沙箱机制，polyfill 不会全局污染。

  ```js
  module.exports = {
    presets: [
      [
        "@babel/preset-env", // 只负责语法转换，不引入 polyfill
        // {
        //   useBuiltIns: "usage",
        //   corejs: 3
        // }
      ]
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          corejs: 3, // 从 @babel/runtime-corejs3 中引入 polyfill
          helpers: true, // 提取 babel 中的 helper 函数减小打包体积
          regenerator: true,
          useESModules: true,
        },
      ],
    ]
  }
  ```

  > 这边注意：配置 `corejs: 2` 只会对静态方法，例如 `Array.isArray` 进行 polyfill，但不会对实例方法，例如数组的 `includes` 和 `filter` 进行 polyfill，但是配置 `corejs: 3` 之后，实例方法就会被 polyfill

实际上，第三方库也可以只做语法转换，不进行 polyfill，由前端项目决定需要兼容的目标浏览器的版本。这种情况下，需要前端项目的 `babel-loader` 处理 `node_modules` 中的文件，但一般来说我们需要最小化 loader 作用范围，确保编译速度，我们可以配置 `useBuiltIns: entry` 在入口文件全量引入 polyfill，确保可以命中第三方库需要兼容的 API。例如 CRA 的 Babel 配置：

```js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        // 语法转换 && 引入 polyfill
        // 在入口文件处根据 browserlist 配置全量引入 polyfill
        useBuiltIns: 'entry',
        corejs: 3,
        exclude: ['transform-typeof-symbol'],
      },
    ]
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        // 这边仅负责提取 helper 函数，不引入 polyfill
        // polyfill 由 @babel/preset-env 引入
        corejs: false,
        helpers: areHelpersEnabled,
      },
    ]
  ]
}
```

> 第三方库确实可以不进行 polyfill，但是语法转换是必不可少的，例如 JSX、TS 语法转换、ES2015+ 语法编译兼容等，这样可以避免业务工程的 `babel-loader` 处理 `node_modules` 下的模块，最小化 loader 作用范围，提升业务工程构建效率

参考：

https://github.com/babel/babel/issues/10008

[你可能并没有理解的 babel 配置的原理](https://juejin.cn/post/7094296981001994277)

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

:::tip

这里推荐两个 ESLint 配置：

- [腾讯 alloyteam ESLint 配置](https://github.com/AlloyTeam/eslint-config-alloy)
- [antfu 大佬的 ESLint 配置](https://github.com/antfu/eslint-config)

:::

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

一般源码都会使用 ES2015+ 语法和 TypeScript 编写，这就需要 Jest 进行语法转换及编译 TypeScript。

对于语法转换，Jest 会读取项目根目录的 `babel.config.js` 调用 babel 进行编译，所以只要 babel 相关依赖都正常安装就没问题。

对于 TypeScript 需要安装额外的依赖：

```bash
$ yarn add typescript jest ts-jest @types/jest -D
```

然后在根目录创建 `jest.config.js` 内容如下：

```js
module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
```

编写 `index.test.ts` 文件如下：

```ts
import { LinkedList } from "../src/index";

describe('LinkedList', () => {
  it('add', () => {
    const list = new LinkedList<number>();
    list.add(1);
    list.add(2);
    list.add(3);
    list.add(4);
    expect(list.toString()).toBe("[ 1 2 3 4 ]");
  })
}
```

运行 `jest` 命令即可正常运行测试用例。

## 10. 发包流程

### 1) 手动发包

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

npm 发包之前应该 `npm publish --dry-run` 列出所有要发布的文件，确保在发包之前进行检查，防止包含敏感信息的文件被发布出去：

```bash
$ npm publish --dry-run

# 如果用 PNPM 可以执行下面命令
$ pnpm publish --dry-run
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

### 2) 使用构建发布脚本

也可以通过一个 **构建发布脚本** 来实现以上流程。先跑一遍单元测试，然后执行构建命令，修改 `package.json` 版本号，将 `package.json`、`README.md`、`LICENSE` 等文件复制到输出目录，生成 CHANGELOG，执行 git 提交操作（提交前会对源码进行 lint），生成 git tag，最后 `npm publish` 完成发包。

### 3) 使用 CLI 工具库配合 GitHub Action 实现发包

可以使用一些 CLI 工具库配合 GitHub Actions 实现自动发包：

- https://github.com/release-it/release-it
- https://github.com/JS-DevTools/version-bump-prompt

```yaml
name: Release

# 打 tag 之后执行发包流程
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - name: Install pnpm
        uses: pnpm/action-setup@v2.2.1

      - name: Use Node.js v16
        uses: actions/setup-node@v2
        with:
          node-version: v16
          registry-url: https://registry.npmjs.org/
          cache: pnpm

      - name: Install Dependencies
        run: pnpm install

      - name: PNPM build
        run: pnpm run build

      # 执行发包操作
      - name: Publish to NPM
        run: pnpm -r publish --access public --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

参考：

> https://github.com/unocss/unocss/blob/main/.github/workflows/release.yml

## 后续任务

- 使用构建发布脚本
- 使用文档网站
- 支持单仓多包 monorepo 项目
- 使用 yeoman 脚手架初始化一份项目模板

## 参考

https://rollupjs.org/guide/en/

[从零开始发布自己的NPM包](https://juejin.cn/post/7052307032971411463)

[前端组件/库打包利器rollup使用与配置实战](https://juejin.cn/post/6844903970469576718)

[手摸手学会搭建一个 TS+Rollup 的初始开发环境](https://juejin.cn/post/7029525775321661470)

[基于 Lerna 实现 Monorepo 项目管理](https://juejin.cn/post/7030207667457130527)

[从 ESLint 开启项目格式化](https://juejin.cn/post/7031506030068662285)

[「前端基建」探索不同项目场景下Babel最佳实践方案](https://juejin.cn/post/7051355444341637128#heading-16)

[前端工程化（7）：你所需要知道的最新的babel兼容性实现方案](https://juejin.cn/post/6976501655302832159)
