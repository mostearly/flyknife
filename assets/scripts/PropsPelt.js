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
    parent: {
      default: null,
      serializable: false
    }
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start() {

  },
  onCollisionEnter(self){
    // console.log("抛掷物：不敢乱碰");
    let parent = this.node.parent.getComponent("ThrowingObjects");
    switch (self.node.name){
      case "wooden":
        parent.isPelt = false;
        this.node.destroy();
        parent.newPelt();
        parent.allow = true;
        break;
      case "knife":
        parent.isPelt = false;
        let cb = cc.callFunc(()=>{
          if(this.node.y<-cc.winSize.height/2){
            this.node.stopAction();
            this.node.destroy();
            parent.allow = true;
            // parent.newPelt(); // 此处应该GAME OVER
            parent.gameover();
          }
        });
        this.node.runAction(cc.repeatForever(cc.spawn(cc.rotateBy(.2,parent.clockwise?-360:360),cc.moveBy(.6,cc.p(parent.clockwise?-100:100,-600)),cb)));
        break;
      case "apple":
        // console.log("22");
        break;
      default:break;
    }
  },

  // update (dt) {},
});
