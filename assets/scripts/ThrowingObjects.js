// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
  extends: cc.Component,

  properties: {
    isPelt: false,
    peltPrefab: {
      default: null,
      type: cc.Prefab
    },
    countLabel:{
      // 木头
      default:null,
      type:cc.Label
    },
    pelt:null,
    count:0,
    allow:true
  },

  // LIFE-CYCLE CALLBACKS:
  setTouthEvent() {
    cc.systemEvent.on('keyup', (event) => {
      if (event.keyCode === cc.KEY.space) {
        if(this.count<0||!this.allow)return;
        this.isPelt = true;
        this.allow = false;
      }
    }, this);
    this.node.parent.on('touchend',()=>{
      if(this.count<0||!this.allow)return;
      this.isPelt = true;
      this.allow = false;
    },this);
  },
  onLoad() {
    this.setTouthEvent();
    // 创建一把飞刀
  },
  init({count,clockwise}){
    this.count = count;
    this.total = count;
    this.clockwise = clockwise;
    this.allow = true;
    this.newPelt();
  },
  newPelt(){
    this.isPelt = false;
    this.count--;
    this.countLabel.string = this.total-this.count-1+" / "+this.total; // 为何因此计算是因为count是--的
    if(this.count<0){
      this.node.parent.getComponent("Game").transition();
      return;
    }
    this.pelt = cc.instantiate(this.peltPrefab);
    this.pelt.group = "pelt";
    this.pelt.setPosition(0,0);
    this.node.addChild(this.pelt);
  },
  gameover(){
    this.allow = false;
    this.node.parent.getComponent("Game").gameover();
  },
  update(dt) {
    if (this.isPelt) {
      this.pelt.y += 32;
    }
  }
});
