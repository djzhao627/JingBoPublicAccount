/*
* 工具函数包
* */

// 引入xml解析包
const {parseString} = require('xml2js');

module.exports = {
  /**
   * 获取用户发送过来的数据
   * @param req 请求
   * @returns {Promise<unknown>}
   */
  getUserDataAsync(req) {
    return new Promise((resolve, reject) => {
      let xmlData = '';
      req// 绑定流事件,可能触发多次
        .on('data', data => {
          xmlData += data;
        })
        // 绑定数据接收完毕事件
        .on('end', () => {
          resolve(xmlData);
        });
    });
  },
  /**
   * 解析xml数据为JS对象
   * @param xmlData xml数据
   * @returns {Promise<unknown>}
   */
  parseXMLAsync(xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, {trim: true}, (err, data) => {
        if (!err) {
          resolve(data);
        } else {
          reject('XML文件解析失败: ' + err);
        }
      })
    })
  },
  formatMessage(jsData) {
    let message = {};
    jsData = jsData.xml;
    if (typeof jsData === 'object') {
      // 遍历
      for (let key in jsData) {
        // 获取属性值
        let value = jsData[key];
        // 过滤掉空数据
        if (Array.isArray(value) && value.length > 0) {
          // 对象赋值
          message[key] = value[0];
        }
      }
    }
    return message;
  }
};
