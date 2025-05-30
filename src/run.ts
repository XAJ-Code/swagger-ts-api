import _path from 'path'
// import fs from 'fs'
import { NswagOptions } from './type'
import readline from 'readline'
import { Swagger } from './swagger'
import https from 'https'
import axios from 'axios'
/**
 * 生成代码
 * @param basePath 是否调试模式
 */
export default async (basePath: string) => {
  // 根据配置文件路径获取配置对象
  const configPath = _path.join(basePath, 'nswag/config.js')
  const nswagOptions = require(configPath) as NswagOptions
  renderProgress(`你的配置文件路径为: ${configPath}`)
  nswagOptions.Apis.forEach((apiConfig) => {
    renderProgress(`正在生成 ${apiConfig.ApiName}`)
    getSwaggerData(apiConfig.SwaggerUrl).then((r) => {
      // console.log('r: ', r);
      //将r 写入文件中
      // fs.writeFileSync(_path.join(basePath, 'swagger.json'), JSON.stringify(r, null, 2))
      const swagger = new Swagger(basePath, apiConfig, r, nswagOptions.prettier)
      swagger.generate()
    })
    renderProgress(`${apiConfig.ApiName} 生成成功`)
  })
}

/**
 * 生成进度
 * @param text 文字
 * @param step 进度
 * @param isOk 完成
 */
function renderProgress(text: string) {
  readline.cursorTo(process.stdout, 0, 1)
  readline.clearScreenDown(process.stdout)
  process.stdout.write(`${text}`)
}

/**
 * 获取Swagger的JSON数据
 * @param swaggerUrl
 */
function getSwaggerData(swaggerUrl: string): Promise<any> {
  const agent = new https.Agent({
    rejectUnauthorized: false
  })
  return new Promise((resolve, reject) => {
    axios.get(swaggerUrl, { httpsAgent: agent })
      .then((response) => {
        if (response.status === 200) {
          const d = response.data
          try {
            const result = typeof d === 'string' ? JSON.parse(d) : d
            resolve(result)
          } catch (error) {
            reject(new Error('Swagger数据解析失败'))
          }
        } else {
          reject(new Error('获取swagger数据失败'))
        }
      })
      .catch((error) => {
        reject(new Error(`获取swagger数据失败: ${error.message}`))
      })
  })
}
