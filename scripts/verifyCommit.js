const chalk = require('chalk')
// HUSKY_GIT_PARAMS 在默认情况下可能获取不到
// 只需要在 commit-msg 这个 shell 脚本中加一句
// export HUSKY_GIT_PARAMS="$*"
// $* 参数就是 commit message 文件路径
// 顺便说下 $0 还可以拿到当前的 hook 名
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