/**
 * 验证模块，验证服务器有效性
 */

// 引入sha1模块
const sha1 = require('sha1');

// 引入config模块
const config = require("../config");

// 引入tools模块
const {getUserDataAsync, parseXMLAsync, formatMessage} = require('../utils/tools');

module.exports = () => {
  return async (req, res, next) => {
    // 对象的结构赋值
    const {signature, echostr, timestamp, nonce} = req.query;
    const {token} = config;

    // 1. 将参与微信签名计算的三个参数（timestamp、nonce、token），按照字典序排序
    // 2. 按照排好的顺序组合成一个字符串
    // 3. 将组合好的字符串进行sha1加密
    const sha1Str = sha1([timestamp, nonce, token].sort().join(""));

    /*
    * 微信服务器会给开发者服务器发送两种类型的消息
    *   1.GET请求
    *     - 验证服务器的有效性
    *   2. POST请求
    *     - 微信服务器会将用户发送的数据已POST的方式转发到开发者的服务器上
    *       - 如果开发者服务器没有给微信服务器发送响应，微信会发送三次请求
    *
    * */

    // 判定是否是微信服务器
    if (sha1Str === signature) {
      // 有效性验证
      if (req.method === 'GET') {
        // 返回echostr给微信服务器
        res.send(echostr);
        // 转发过来的用户请求
      } else if (req.method === 'POST') {
        // console.log("djzhao-微信的所有请求都携带的参数: ", req.query);
        /*djzhao-用户的请求:  { signature: '56a1b9549f1cf546475c45b6b70b61d6c15e8b3b',
                              timestamp: '1566637879',
                              nonce: '744091499',
                              openid: 'oU6I0w8pemDm_QVU30ilTqMAY_G4' }*/

        // 接收请求体中的数据（流式数据）
        const xmlData = await getUserDataAsync(req);
        // console.log("djzhao-用户请求的数据: ", xmlData);
        /*<xml>
            <ToUserName><![CDATA[gh_3260dbf4d682]]></ToUserName> 开发者ID
            <FromUserName><![CDATA[oU6I0w8pemDm_QVU30ilTqMAY_G4]]></FromUserName> 用户openid
            <CreateTime>1566657614</CreateTime> 发送时间戳
            <MsgType><![CDATA[text]]></MsgType> 消息类型
            <Content><![CDATA[来来来]]></Content>  内容
            <MsgId>22429144851367471</MsgId>  消息ID默认保存三天
          </xml>*/

        // 解析xml数据
        const jsData = await parseXMLAsync(xmlData);
        // console.log("djzhao-xml解析结果: ", jsData);

        // xml数据格式化
        const message = formatMessage(jsData);
        console.log("djzhao-格式化后的数据: ", message);
        /*{ ToUserName: 'gh_3260dbf4d682',
            FromUserName: 'oU6I0w8pemDm_QVU30ilTqMAY_G4',
            CreateTime: '1566658679',
            MsgType: 'text',
            Content: '是嘛',
            MsgId: '22429160821737069' }*/

        res.end('');
      } else {
        res.end('error');
      }
    } else {
      res.end('error');
    }
  };
};
