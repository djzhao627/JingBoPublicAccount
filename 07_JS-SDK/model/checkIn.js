// 引入mongoose
const mongoose = require('mongoose');

// 获取schema
const Schema = mongoose.modelSchemas;

// 创建约束对象
const checkInSchema = new Schema({
  userOpenID: String,
  checkedDate: Date
});

// 创建模型对象
const CheckIn = mongoose.model('CheckIn', checkInSchema);

module.exports = CheckIn;

