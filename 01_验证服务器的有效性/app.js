// 引入express 模块
const express = require('express');

// 引入sha1模块
const sha1 = require('sha1');

// 创建app应用对象
const app = new express();

/*
  * 步骤：
  *   1. 微信后台接口配置
  *     - 本地启动express服务器
  *     - 用ngrok进行内网穿透，将本地服务映射到一个外网域名
  *     - 在微信后台填写这个外网域名和一个自定义的token
  *   2. 本地验证消息是否来自微信服务器
  *     - 计算出signature签名信息，和微信传过来的进行比较，一样则说明来自微信服务器
  *     - 计算方式
  *       1. 将参与微信签名计算的三个参数（timestamp、nonce、token），按照字典序排序
  *       2. 按照排好的顺序组合成一个字符串
  *       3. 将组合好的字符串进行sha1加密，这就是计算出的signature
  *     - 进行比较，比较成功则将echostr返回给微信服务器
  * */

const config = {
  token: "djzhao",
  appID: "wx25273b6f79d49faf",
  appsecret: "0ed472ec69379ba458df7e72449fc420"
};

// 验证服务器的有效性
// 接受处理所有消息
app.use((req, res, next) => {
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

});

// 监听端口号
app.listen(3000, () => {
  console.log("服务器启动成功了~！")
});

