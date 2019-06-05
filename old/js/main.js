// 全局状态管理
'use strict';
import DataBus from "./databus";
import Loading from "./page/loading";
import Game from "./page/game";
let canvas,ctx;
let databus = new DataBus();
export default class Main {
  constructor(){
    if(!wx){throw "this is not wx app"}
    console.log('%cVERSION 1.0','color:#22cc9e');
    canvas = wx.createCanvas();
    ctx = canvas.getContext('2d');
    this.aniId = 0;
    this.start();
  }
  start(){
    databus.init();
    new Game(ctx,canvas.width,canvas.height);
  }
  update(){
    // 负责更新数据
  }
  render(){
    // 负责重新渲染
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除画布
  }
}