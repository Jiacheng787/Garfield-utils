module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: '> 0.5%, ie >= 11',
        },
        // 只进行语法转换，不进行 polyfill
        // 这里引入 core-js 是全局污染的
        useBuiltIns: false,
      }
    ]
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        // 从 @babel/runtime-corejs3 引入 polyfill，并提供沙箱机制
        // 注意这里无法根据 browserslist 配置动态调整 polyfill 内容
        corejs: 3,
        helpers: true,
        regenerator: true,
        useESModules: true,
      }
    ]
  ]
}
