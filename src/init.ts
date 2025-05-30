import _path from 'path'
import { copy } from './fs'

/**
 * 初始化配置
 * @param basePath 系统根目录
 */
export default (basePath: string) => {
  const srcPath = _path.join(__dirname, '../def')
  const savePath = _path.join(basePath, 'nswag')
  copy(srcPath, savePath)
  console.log('初始化成功!')
  console.log('请修改nswag文件夹下的config.js配置文件')
  console.log('请修改nswag/tpl文件夹下的模板文件')
  console.log('初始化配置路径：' + savePath)
}
