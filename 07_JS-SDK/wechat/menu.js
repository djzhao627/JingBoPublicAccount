/**
 * 自定义菜单
 * @type {{button: *[]}}
 */
module.exports = {
  "button": [
    {
      "type": "click",
      "name": "点我啊！~",
      "key": "Click"
    },
    {
      "name": "戳我啊！~",
      "sub_button": [
        {
          "type": "view",
          "name": "静波瑜伽",
          "url": "http://203.195.152.121/yoga/index.html"
        },
        {
          "type": "miniprogram",
          "name": "静波小程序",
          "url": "http://mp.weixin.qq.com",
          "appid": "wx286b93c14bbf93aa",
          "pagepath": "pages/lunar/index"
        },
        {
          "type": "click",
          "name": "签到",
          "key": "checkIn"
        },
        {
          "type": "scancode_waitmsg",
          "name": "扫码带提示",
          "key": "rselfmenu_0_0"
        },
        {
          "type": "scancode_push",
          "name": "扫码推事件",
          "key": "rselfmenu_0_1"
        }
      ]
    },
    {
      "name": "发图",
      "sub_button": [
        {
          "type": "pic_sysphoto",
          "name": "系统拍照发图",
          "key": "rselfmenu_1_0"
        },
        {
          "type": "pic_photo_or_album",
          "name": "拍照或者相册发图",
          "key": "rselfmenu_1_1"
        },
        {
          "type": "pic_weixin",
          "name": "微信相册发图",
          "key": "rselfmenu_1_2"
        },
        {
          "name": "发送位置",
          "type": "location_select",
          "key": "rselfmenu_2_0"
        }
      ]
    }
  ]
};
