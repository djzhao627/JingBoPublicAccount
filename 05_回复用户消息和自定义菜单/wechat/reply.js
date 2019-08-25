/**
 * 处理用户发送的消息类型和内容，决定需要返沪给用户的内容
 * @param message 用户发送的消息
 * @returns {{fromUserName: *, msgType: string, createTime: *, toUserName: *}}
 */
module.exports = message => {

  let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    createTime: Date.now(),
    msgType: 'text'
  };

  let content = '你说什么，我听不懂？';
  // 判定用户发送消息的类型
  if (message.MsgType === 'text') {// 文本信息
    // 判定用户发送信息的内容
    if (message.Content === '签到') {
      content = '恭喜你，签到成功！';
    } else if (message.Content === '签退') {
      content = '您已成功签退';
    } else if (message.Content.match('爱')) {
      content = '我爱你';
    }
  } else if (message.MsgType === 'image') {// 图片信息
    options.msgType = 'image';
    options.mediaId = message.MediaId;
    console.log("djzhao-exports: ", message.PicUrl);
  } else if (message.MsgType === 'voice') {// 语音信息
    options.msgType = 'voice';
    options.mediaId = message.MediaId;
  } else if (message.MsgType === 'location') {// 定位信息
    content = `纬度信息：${message.Location_X}, 经度信息：${message.Location_Y}，缩放大小：${message.Scale}
    地理位置信息：${message.Label}`;
  } else if (message.MsgType === 'event') {// 事件类型
    switch (message.Event) {
      case 'subscribe':
        content = '谢谢你长得这么好看还关注我！~';
        if (message.EventKey) {// 特定事件关注，扫描或者...
          content = '谢谢你长得这么好看还扫描二维码关注我！~';
        }
        break;
      case 'unsubscribe':
        console.log("djzhao-exports: ", '用户无情取关！！');
        break;
      case 'SCAN':
        content = '谢谢你长得这么好看还关注我！~\n不过你之前就已经关注过我咯~！';
        break;
      case 'LOCATION':
        content = `纬度信息：${message.Latitude}, 经度信息：${message.Longitude}，精度：${message.Precision}`;
        break;
      case 'CLICK':
        content = '您点击了一个按钮呦！~' + message.EventKey;
        break;
      default:
        break;
    }
  }

  options.content = content;

  return options;

};
