import fs, { stat } from 'fs'
import _path from 'path'

/**
 * 复制
 * @param src 源地址
 * @param dst 目标地址
 */
export function copy(src: string, dst: string) {
  //测试某个路径下文件是否存在
  if (!fs.existsSync(dst)) {
    //不存在
    fs.mkdir(dst, function () {
      //创建目录
      copy(src, dst)
    })
  }

  //读取目录
  fs.readdir(src, function (err, paths) {
    if (err) {
      throw err
    }
    paths.forEach(function (path) {
      var _src = src + '/' + path
      var _dst = dst + '/' + path
      var readable
      var writable
      stat(_src, function (err, st) {
        if (err) {
          throw err
        }
        if (st.isFile()) {
          readable = fs.createReadStream(_src) //创建读取流
          writable = fs.createWriteStream(_dst) //创建写入流
          readable.pipe(writable)
        } else if (st.isDirectory()) {
          //测试某个路径下文件是否存在
          if (fs.existsSync(_dst)) {
            //存在
            copy(_src, _dst)
          } else {
            //不存在
            fs.mkdir(_dst, function () {
              //创建目录
              copy(_src, _dst)
            })
          }
        }
      })
    })
  })
}

/**
 * 创建目录
 * @param path 目录
 */
export function markDirsSync(path: string) {
  try {
    if (!fs.existsSync(path)) {
      let pathtmp = ''
      path.split(/[/\\]/).forEach(dirname => {
        // 这里指用/ 或\ 都可以分隔目录  如  linux的/usr/local/services   和windows的 d:\temp\aaaa
        if (pathtmp) {
          pathtmp = _path.join(pathtmp, dirname)
        } else {
          pathtmp = dirname || '/'
        }
        if (!fs.existsSync(pathtmp)) {
          fs.mkdirSync(pathtmp)
        }
      })
    }
    return true
  } catch (e) {
    console.log('创建目录出错', e)
    return false
  }
}

/**
 * 删除文件夹
 * @param path 地址
 */
export function removeDirSync(path: string) {
  let files = []
  /**
   * 判断给定的路径是否存在
   */
  if (fs.existsSync(path)) {
    /**
     * 返回文件和子目录的数组
     */
    files = fs.readdirSync(path)
    files.forEach(function (file) {
      const curPath = _path.join(path, file)
      /**
       * fs.statSync同步读取文件夹文件，如果是文件夹，在重复触发函数
       */
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        removeDirSync(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    })
    /**
     * 清除文件夹
     */
    fs.rmdirSync(path)
  } else {
    console.log('给定的路径不存在，请给出正确的路径')
  }
}
