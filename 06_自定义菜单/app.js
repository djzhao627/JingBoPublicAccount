// 引入express 模块
const express = require('express');

// 引用auth模块
const auth = require('./wechat/auth');

// 创建app应用对象
const app = new express();

// 验证服务器的有效性
// 接受处理所有消息
app.use(auth());

// 监听端口号
app.listen(3000, () => {
  console.log("服务器启动成功了~！")
});

