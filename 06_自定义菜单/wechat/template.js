/**
 * 回复消息的模板
 * @param options 传入的参数
 */
module.exports = options => {
  let replyMessage = `
  <xml>
    <ToUserName><![CDATA[${options.toUserName}]]></ToUserName>
    <FromUserName><![CDATA[${options.fromUserName}]]></FromUserName>
    <CreateTime>${options.createTime}</CreateTime>
    <MsgType><![CDATA[${options.msgType}]]></MsgType>
  `;
  if (options.msgType === 'text') {// 文本
    replyMessage += `<Content><![CDATA[${options.content}]]></Content>`;
  } else if (options.msgType === 'image') {// 图片
    replyMessage +=
      ` <Image>
          <MediaId><![CDATA[${options.mediaId}]]></MediaId>
        </Image>`;
  } else if (options.msgType === 'voice') { // 语音
    replyMessage +=
      `<Voice>
        <MediaId><![CDATA[${options.mediaId}]]></MediaId>
      </Voice>`;
  } else if (options.msgType === 'video') {// 视频
    replyMessage +=
      `<Video>
        <MediaId><![CDATA[${options.mediaId}]]></MediaId>
        <Title><![CDATA[${options.title}]]></Title>
        <Description><![CDATA[${options.description}]]></Description>
      </Video>`;
  } else if (options.msgType === 'music') {// 音乐
    replyMessage +=
      `<Music>
        <Title><![CDATA[${options.title}]]></Title>
        <Description><![CDATA[${options.description}]]></Description>
        <MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl>
        <HQMusicUrl><![CDATA[${options.hdMiusicUrl}]]></HQMusicUrl>
        <ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId>
      </Music>`;
  } else if (options.msgType === 'news') {// 文章
    replyMessage +=
      `<ArticleCount>${options.content.length}</ArticleCount>
        <Articles>`;

    options.content.forEach(item => {
      replyMessage +=
        `<item>
        <Title><![CDATA[${item.title}]]></Title>
        <Description><![CDATA[${item.description1}]]></Description>
        <PicUrl><![CDATA[${item.picurl}]]></PicUrl>
        <Url><![CDATA[${item.url}]]></Url>
      </item>`
    });

    replyMessage += `</Articles>`;
  }

  replyMessage += '</xml>';
  // 最终回复给用户的xml数据
  return replyMessage;
};
