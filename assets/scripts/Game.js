// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
import Map from "./map";
cc.Class({
  extends: cc.Component,

  properties: {
    applePrefab:{
      default:null,
      type:cc.Prefab
    },
    knifePrefab:{
      default:null,
      type:cc.Prefab
    },
    wooden:{
      // 木头
      default:null,
      type:cc.Node
    },
    throwingObjects:{
      // 投掷物
      default:null,
      type:cc.Node
    },
    scoreDisplay: {
      default: null,
      type: cc.Label
    },
    missionDisplay: {
      default: null,
      type: cc.Label
    },
    gameOverNode: {
      default: null,
      type: cc.Node
    },
    reStartButton:{
      default:null,
      type:cc.Button
    },
    backIndexButton:{
      default:null,
      type:cc.Button
    },
    mission:0 // 当前关卡
  },
  onLoad() {
    this.score = 0;
    this.mission = 0;
    this.backIndexButton.node.on('click',()=>{
      cc.director.loadScene("Home");
    });

    this.reStartButton.node.on('click',()=>{
      this.restart();
    })
  },
  init(){
    if(this.mission>=Map.length){console.warn("没有关卡了");this.gameover();return;}
    this.wooden.getComponent("Wooden").init(Map[this.mission]);
    this.throwingObjects.getComponent("ThrowingObjects").init(Map[this.mission]);
    this.mission++;
    this.missionDisplay.string = 'No. '+this.mission;
  },
  gainScore(){
    this.score += 1;
    // 更新 scoreDisplay Label 的文字
    this.scoreDisplay.string = 'score: ' + this.score.toString();
  },
  start(){
    this.init();
    // 启动碰撞事件
    let manager = cc.director.getCollisionManager();
    manager.enabled = true;
    // manager.enabledDebugDraw = true;
  },
  restart(){
    this.gameOverNode.active = false;
    this.score = 0;
    this.mission = 0;
    this.init();
    this.scoreDisplay.string = 'score: 0';
  },
  transition(){
    this.wooden.stopAllActions();
    // 销毁 背景
    // 初始化，无法计算动画加上运行期大概多少时间便使用定时器
    let readyInit = (()=>{
      let time = null;
      return()=>{
        clearTimeout(time);
        time=setTimeout(this.init.bind(this),1000);
      }
    })();
    this.wooden.getChildByName('woodenBackground').destroy();
    // 取得所有参与到动画的所有节点
    let masks = this.wooden.getChildByName('mask');
    let knife = this.wooden.getChildByName('knifes').children;
    let apple = this.wooden.getChildByName('apples').children;
    let angle = Math.floor(this.wooden.rotation%360);
    let mask = masks.children;
    masks.active = true;
    let rd = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
    let animation = ()=>{
      for (let i =0;i<mask.length;i++){
        let temp = mask[i];
        let tempAngle = 0-angle;
        tempAngle = tempAngle>0?tempAngle:360+tempAngle;
        let x,y;
        x = temp.x+rd(180,240)*Math.sin(Math.PI/180*tempAngle)*Math.random();
        y = temp.y+rd(180,240)*Math.cos(Math.PI/180*tempAngle)*Math.random();
        console.log(x,y);
        let up = cc.moveTo(.2,cc.p(x,y));
        let down = cc.moveBy(rd(.8,1.2),cc.p(-cc.winSize.height*Math.sin(Math.PI/180*tempAngle),-cc.winSize.height*Math.cos(Math.PI/180*tempAngle)));
        // let rotate = cc.rotateBy(4,360);
        let callback = cc.callFunc(()=>{
          temp.destroy();
          console.log("已销毁");
          readyInit();
        });
        temp.runAction(cc.sequence(up,down,callback));
        // temp.runAction(cc.repeatForever(rotate))
      }
      for (let i =0;i<knife.length;i++){
        let temp = knife[i];
        let tempAngle = 0-angle;
        tempAngle = tempAngle>0?tempAngle:360+tempAngle;
        let up = cc.moveTo(.2,cc.p(temp.x+120*Math.sin(Math.PI/180*tempAngle)*Math.random(),temp.y+120*Math.cos(Math.PI/180*tempAngle)*Math.random()));
        let down = cc.moveBy(rd(1.0,1.6),cc.p(-cc.winSize.height*Math.sin(Math.PI/180*tempAngle),-cc.winSize.height*Math.cos(Math.PI/180*tempAngle)));
        let callback = cc.callFunc(()=>{
          temp.destroy();
          console.log("已销毁");
          readyInit();
        });
        let rotate = cc.rotateBy(2,360);
        temp.runAction(cc.sequence(up,down,callback));
        temp.runAction(cc.repeatForever(rotate))
      }
      for (let i =0;i<apple.length;i++){
        let temp = apple[i];
        let tempAngle = 0-angle;
        tempAngle = tempAngle>0?tempAngle:360+tempAngle;
        let up = cc.moveTo(.2,cc.p(temp.x+120*Math.sin(Math.PI/180*tempAngle)*Math.random(),temp.y+120*Math.cos(Math.PI/180*tempAngle)*Math.random()));
        let down = cc.moveBy(rd(1.0,1.4),cc.p(-cc.winSize.height*Math.sin(Math.PI/180*tempAngle),-cc.winSize.height*Math.cos(Math.PI/180*tempAngle)));
        let callback = cc.callFunc(()=>{
          temp.destroy();
          readyInit();
        });
        let rotate = cc.rotateBy(2,360);
        temp.runAction(cc.sequence(up,down,callback));
        temp.runAction(cc.repeatForever(rotate))
      }
    };
    animation();
  },
  gameover(){
    this.gameOverNode.active = true;
  }
  // update (dt) {},
});
