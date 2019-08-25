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

// 引入工具函数
const {writeFileAsync, readFileAsync} = require('../utils/tools');

// 引入常量
const {appID, appsecret} = require('../config');

// 引入菜单模块
const menu = require('./menu');

// 引入API模块
const api = require('../utils/api');

class WeChat {
  constructor() {
  }

  /**
   * 用来向微信服务器请求access_token
   * @returns {Promise<unknown>}
   */
  getAccessToken() {
    // 请求的地址
    const url = `${api.accessToken}&appid=${appID}&secret=${appsecret}`;
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
    return writeFileAsync(accessToken, 'accessToken.txt');
  }

  /**
   * 读取accessToken
   */
  readAccessToken() {
    return readFileAsync('accessToken.txt');
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


  /**
   * 用来向微信服务器请求jsapi_ticket
   * @returns {Promise<unknown>}
   */
  getJsapiTicket() {

    //发送请求 request-promise-native的返回值是一个promise对象
    return new Promise(async (resolve, reject) => {
      // 获取accessToken
      const token = await this.fetchAccessToken();
      // 请求的地址
      const url = `${api.ticket}&access_token=${token.access_token}`;
      request({
        method: 'GET',
        url,
        json: true
      })
        .then(res => {
          // 将promise的状态改为成功
          resolve({
            ticket: res.ticket,
            expires_in: Date.now() + (res.expires_in - 300) * 1000
          });
        })
        .catch(err => {
          console.log("djzhao-请求ticket出错: ", err);
          // 将promise的状态改为失败
          reject('getJsapiTicket出错：' + err);
        })
    });
  }

  /**
   * 检测jsapi_ticket是否有效
   *
   * @param data 需要检测的jsapi_ticket
   */
  isValidJsapiTicket(data) {
    if (!data || !data.ticket || !data.expires_in) {
      return false;
    }
    // 检测是否在有效期内
    return data.expires_in > Date.now();
  }

  /**
   * 保存jsapi_ticket
   * @param ticket 要保存的jsapi_ticket
   */
  saveJsapiTicket(ticket) {
    return writeFileAsync(ticket, 'ticket.txt');
  }

  /**
   * 读取jsapi_ticket
   */
  readJsapiTicket() {
    return readFileAsync('ticket.txt');
  }

  /**
   * 获取一个没有过期的jsapi_ticket
   * @returns {Promise<{access_token, expires_in: *}>} jsapi_ticket
   */
  fetchJsapiTicket() {
    if (this.ticket && this.ticket_expires_in && this.isValidJsapiTicket(this.ticket_expires_in)) {
      // 说明之前保存过，并且可以直接使用
      return Promise.resolve({
        ticket: this.ticket,
        expires_in: this.expires_in
      });
    }
    return this.readJsapiTicket()
    // 使用 async 和 await 来处理异步请求
      .then(async res => {
        // 有文件，判定是否过期
        if (this.isValidJsapiTicket(res)) {
          // 返回数据
          return Promise.resolve(res);
        } else {
          // 失效
          res = await this.getJsapiTicket();
          await this.saveJsapiTicket(res);
          // 返回数据
          return new Promise.resolve(res);
        }
      })
      .catch(async err => {
        const res = await this.getJsapiTicket();
        await this.saveJsapiTicket(res);
        // 返回数据
        return Promise.resolve(res);
      })
      // 因为前面的then和catch都是返回的Promise对象，所以可以继续.then
      .then(res => {
        // 将ticket挂载到this上
        this.ticket = res.ticket;
        this.ticket_expires_in = res.expires_in;
        // 方法的最终返回值
        return Promise.resolve(res);
      });
  }

  /**
   * 创建自定义菜单
   * @param menu 菜单布局
   * @returns {Promise<unknown>}
   */
  createMenu(menu) {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取token
        const token = await this.fetchAccessToken();
        const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token.access_token}`;
        // 发送请求
        const result = await request({
          method: 'POST',
          json: true,
          url,
          body: menu
        });
        resolve(result);
      } catch (e) {
        reject('createMenu发生了错误：' + e);
      }
    })
  }


  /**
   * 删除自定义菜单
   * @returns {Promise<unknown>}
   */
  deleteMenu() {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取token
        const token = await this.fetchAccessToken();
        const url = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${token.access_token}`;
        const result = await request({
          method: 'GET',
          url,
          json: true
        });
        resolve(result);
      } catch (e) {
        reject('deleteMenu发生了错误：' + e);
      }
    })
  }
}


// 测试请求
/*
let wx = new WeChat();
// wx.getAccessToken();

wx.fetchAccessToken()
  .then(res => {
    console.log("djzhao-获取Token: ", res);
  });
*/

/**
 * 微信自定义菜单的创建
 */
/*(async () => {
  let wx = new WeChat();
  /!*!// 进行菜单的删除
  let result = await wx.deleteMenu();
  console.log("djzhao-菜单的删除: ", result);
  // 进行菜单的创建
  result = await wx.createMenu(menu);
  console.log("djzhao-菜单的创建: ", result);*!/
  const res = await wx.fetchJsapiTicket();
  console.log("djzhao-ticket: ", res);
})();*/

// 将WeChat模块暴露出去
module.exports = WeChat;

let arr = {};

arr['123'] = Date.now();

console.log("djzhao-: ", arr['1232']);
