/**
 * 遍历对象，获取属性和属性值
 * @param {*} obj
 * @param {*} callback
 */
export const forEach = (obj = {}, callback) => {
  Object.keys(obj).forEach((key) => {
    callback(obj[key], key)
  })
}
