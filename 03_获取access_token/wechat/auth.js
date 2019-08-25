/**
 * 验证模块，验证服务器有效性
 */

// 引入sha1模块
const sha1 = require('sha1');

// 引入config模块
const config = require("../config");

module.exports = () => {
  return (req, res, next) => {
    // 微信服务器提交的请求参数
    console.log("djzhao-微信发送的请求: ", req.query);
    /*{ signature: '2e3ce289e5db3e5f6127337b5d17fdc4ad174e3a', // 微信的加密签名
      echostr: '1668753804341795751', // 微信的随机字符串
      timestamp: '1566399137', // 微信发送请求的时间戳
      nonce: '178752509' }*/ // 微信的随机数字

    // 对象的结构赋值
    const {signature, echostr, timestamp, nonce} = req.query;
    const {token} = config;
    // 1. 将参与微信签名计算的三个参数（timestamp、nonce、token），按照字典序排序
    const arr = [timestamp, nonce, token].sort();
    console.log("djzhao-签名要的参数: ", arr);
    // 2. 按照排好的顺序组合成一个字符串
    const str = arr.join("");
    // 3. 将组合好的字符串进行sha1加密
    const sha1Str = sha1(str);
    console.log("djzhao-sha1: ", sha1Str);

    // 判定是否是微信服务器
    if (sha1Str === signature) {
      res.send(echostr);
    } else {
      res.end('error');
    }

  }
};
