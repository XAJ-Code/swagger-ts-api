#!/usr/bin/env node
const packageInfo = require('../package.json')
const init = require('../dist/init').default
const run = require('../dist/run').default
const _path = require('path')

const argv = process.argv.slice(2)
const arg0 = argv[0]

if (arg0 === '-v' || arg0 === '--version') {
  console.log(`当前版本号：${packageInfo.version}\n`)
} else if (arg0 === '-h' || arg0 === '--help') {
  console.log('请使用以下命令:\n')
  console.log('[初始化]  nswag init\n')
  console.log('[执行生成]  nswag run\n')
  console.log('[查看版本]  nswag -v\n')
} else {
  const isDev = argv[1]
  const basePath = _path.join(__dirname, isDev ? '../test' : '../../../')
  switch (arg0) {
    // 初始化配置
    case 'init':
      init(basePath)
      break
    // 默认执行生成
    case 'run':
      run(basePath)
      break
  }
}
