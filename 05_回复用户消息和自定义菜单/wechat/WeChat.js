/**
 * 获取access_token
 *    微信接口调用的全局唯一凭证
 *    特点：
 *      1. 唯一的
 *      2. 有效期为2小时（7200秒），一般提前5分钟进行重新请求
 *
 *    https请求方式: GET
 *    https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 *
 *    整体思路：
 *      读取本地文件(readAccessToken)
 *        - 本地已存有access_token文件
 *           -是否过期(isValidAccessToken)
 *              - 过期了
 *                - 重新请求access_token(getAccessToken)，并保存下来(saveAccessToken)（覆盖之前的文件）
 *              - 没有过期
 *                - 直接使用
 *        - 本地没有access_token文件
 *           - 发送请求获取access_token(getAccessToken)，保存下来(saveAccessToken)，并直接使用
 */

// 引入网络请求框架
const request = require('request-promise-native');

// 引入fs模块
const {writeFile, readFile} = require('fs');

// 引入常量
const {appID, appsecret} = require('../config');

// 引入菜单模块
const menu = require('./menu');

class WeChat {
  constructor() {
  }

  /**
   * 用来向微信服务器请求access_token
   * @returns {Promise<unknown>}
   */
  getAccessToken() {
    // 请求的地址
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
    //发送请求 request-promise-native的返回值是一个promise对象
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        url,
        json: true
      })
        .then(res => {
          // djzhao-请求access_token的结构:  { access_token: '24_1jXY1cTSmNvJqDSq1kC0HzhTl9NJHECkPUqWGYgRrXoVJEUJvTdNKSdt568d83IKDEuH9UGmgqbrnzHTAR8Ct7dwc2LTz7oRCRaaiAUlyFLPoE2FBj-YhXNa_vsFBJiAJAPLT', expires_in: 7200 }
          console.log("djzhao-请求access_token的结构: ", res);
          // 设置access_token的过期时间（提前5分钟，秒转毫秒）
          res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
          // 将promise的状态改为成功
          resolve(res);
        })
        .catch(err => {
          console.log("djzhao-请求access_token出错: ", err);
          // 将promise的状态改为失败
          reject('getAccessToken出错：' + err);
        })
    });
  }

  /**
   * 检测accessToken是否有效
   *
   * @param token 需要检测的accessToken
   */
  isValidAccessToken(token) {
    if (!token || !token.access_token || !token.expires_in) {
      return false;
    }
    // 检测是否在有效期内
    return token.expires_in > Date.now();
  }

  /**
   * 保存accessToken
   * @param accessToken 要保存的accessToken
   */
  saveAccessToken(accessToken) {
    // 将对象转为JSON
    const access_token = JSON.stringify(accessToken);
    // 存储到文件中
    return new Promise((resolve, reject) => {
      // 这是一个异步方法，所以使用Promise进行包裹
      writeFile('./accessToken.txt', access_token, err => {
        if (!err) {
          console.log("djzhao-accessToken保存: ", 'accessToken保存成功');
          resolve();
        } else {
          console.log("djzhao-accessToken保存: ", 'accessToken保存失败');
          reject('accessToken保存失败: ' + err);
        }
      });
    });
  }

  /**
   * 读取accessToken
   */
  readAccessToken() {
    // 从文件中读取accessToken
    return new Promise((resolve, reject) => {
      // 这是一个异步方法，所以使用Promise进行包裹
      readFile('./accessToken.txt', (err, data) => {
        if (!err) {
          console.log("djzhao-accessToken读取: ", 'accessToken读取成功');
          data = JSON.parse(data);
          resolve(data);
        } else {
          console.log("djzhao-accessToken读取: ", 'accessToken读取失败');
          reject('accessToken读取失败: ' + err);
        }
      });
    });
  }

  /**
   * 获取一个没有过期的AccessToken
   * @returns {Promise<{access_token, expires_in: *}>} AccessToken
   */
  fetchAccessToken() {
    if (this.access_token && this.expires_in && this.isValidAccessToken(this.expires_in)) {
      // 说明之前保存过，并且可以直接使用
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      });
    }
    return this.readAccessToken()
    // 使用 async 和 await 来处理异步请求
      .then(async res => {
        // 有文件，判定是否过期
        if (this.isValidAccessToken(res)) {
          // 返回数据
          return Promise.resolve(res);
        } else {
          // 失效
          res = await this.getAccessToken();
          await this.saveAccessToken(res);
          // 返回数据
          return new Promise.resolve(res);
        }
      })
      .catch(async err => {
        const res = await this.getAccessToken();
        await this.saveAccessToken(res);
        // 返回数据
        return Promise.resolve(res);
      })
      // 因为前面的then和catch都是返回的Promise对象，所以可以继续.then
      .then(res => {
        // 将access_token挂载到this上
        this.access_token = res.access_token;
        this.expires_in = res.expires_in;
        // 方法的最终返回值
        return Promise.resolve(res);
      });
  }

}


// 测试请求
// let wx = new WeChat();
// wx.getAccessToken();

/*
wx.fetchAccessToken()
  .then(res => {
    console.log("djzhao-获取Token: ", res);
  });
*/

