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
    this.wooden.getChildByName('woodenBackground').destroy();
    // 取得所有参与到动画的所有节点
    let masks = this.wooden.getChildByName('mask');
    let knife = this.wooden.getChildByName('knifes').children;
    let apple = this.wooden.getChildByName('apples').children;
    this.wooden.setRotation(0);
    let angle = Math.floor(this.wooden.rotation%360);
    let mask = masks.children;
    masks.active = true;
    let rd = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
    let animation = (arr)=>{
      for (let i =0;i<arr.length;i++){
        let temp = arr[i];
        let tempAngle = angle+90;
        tempAngle = tempAngle<360?tempAngle:360-tempAngle;
        let x,y;
        let randonAngle= Math.random()*360;
        let down = null;
        if(tempAngle%180===0){
          x = 120*Math.sin(Math.PI/180*(tempAngle+randonAngle))*Math.random();
          y = rd(100,-100)*Math.cos(Math.PI/180*tempAngle);
          down = cc.moveTo(2,cc.p(-cc.winSize.height,x))
        }else{
          x = rd(100,-100)*Math.cos(Math.PI/180*tempAngle);
          y = 120*Math.sin(Math.PI/180**(tempAngle+randonAngle))*Math.random();
          down = cc.moveTo(2,cc.p(y,-cc.winSize.height))
        }
        let p=arr.length/4;
        // 顺时针重设中心点
        if(i>=0&&i<p){
          temp.anchorX = 0.75;
          temp.anchorY = 0.25;
        }else if(i>=p&&p+p){
          temp.anchorX = 0.25;
          temp.anchorY = 0.25;
        }else if(i>=2*p&&i<3*p){
          temp.anchorX = 0.25;
          temp.anchorY = 0.75;
        }else{
          temp.anchorX = 0.75;
          temp.anchorY = 0.75;
        }
        let up = cc.moveTo(.1,cc.p(x,y)).easing(cc.easeCubicActionOut());
        let rotate = cc.rotateBy(4,360);
        let callback = cc.callFunc(()=>{
          temp.destroy();
          console.log("已销毁");
        });
        temp.runAction(cc.sequence(up,down));
        temp.runAction(cc.repeatForever(rotate))
      }
    };
    animation(mask);
    // this.init();
  },
  gameover(){
    this.gameOverNode.active = true;
  }
  // update (dt) {},
});
