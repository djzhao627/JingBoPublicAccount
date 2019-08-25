// 引入mongoose
const mongoose = require('mongoose');

module.exports = new Promise((resolve, reject) => {
  // 连接数据库
  mongoose.connect('mongdb://localhost:27017/yoga', {useNewUrlParser: true});
  // 绑定事件监听
  mongoose.connection.once('open', err => {
    if (!err) {
      console.log("djzhao-数据库连接: ", '数据库连接成功');
      resolve();
    } else {
      reject('数据库连接失败: ' + err);
    }
  });

});
