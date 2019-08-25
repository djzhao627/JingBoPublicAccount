/*
* 工具函数包
* */

// 引入xml解析包
const {parseString} = require('xml2js');

// 引入fs模块
const {writeFile, readFile} = require('fs');

// 引入path模块
const {resolve} = require('path');

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
  /**
   * 用户发送的json对象处理
   * @param jsData
   */
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
  },
  /**
   * 文件保存
   * @param data 要保存的对象
   * @param fileName 文件名称
   */
  writeFileAsync(data, fileName) {
    // 将对象转为JSON
    data = JSON.stringify(data);
    // 设置保存路径
    const filePath = resolve(__dirname, fileName);
    // 存储到文件中
    return new Promise((resolve, reject) => {
      // 这是一个异步方法，所以使用Promise进行包裹
      writeFile(filePath, data, err => {
        if (!err) {
          console.log('文件保存成功');
          resolve();
        } else {
          console.log('文件保存失败');
          reject('文件保存失败: ' + err);
        }
      });
    });
  },
  /**
   * 文件读取
   * @param fileName 文件名称
   */
  readFileAsync(fileName) {
    // 设置保存路径
    const filePath = resolve(__dirname, fileName);
    // 从文件中读取ticket
    return new Promise((resolve, reject) => {
      // 这是一个异步方法，所以使用Promise进行包裹
      readFile(filePath, (err, data) => {
        if (!err) {
          console.log('文件读取成功');
          data = JSON.parse(data);
          resolve(data);
        } else {
          console.log('文件读取失败');
          reject('文件读取失败: ' + err);
        }
      });
    });
  },
  /**
   * 判断是否是同一天
   * @param timestamp1 时间戳1
   * @param timestamp2 时间戳2
   * @returns {boolean}
   */
  isTheSameDay(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return date1.getMonth() === date2.getMonth() && date1.getDay() === date2.getDay();
  }
};
