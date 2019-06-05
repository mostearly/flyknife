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
    backgroundPrefab:{
      default:null,
      type:cc.Prefab
    },
    maskPrefab:{
      default:null,
      type:cc.Prefab
    }
  },
  onLoad() {
    this.node.group = "woodenPier";
  },
  printMark(point){
    // 取得当前角度
    let apples=new cc.Node('apples');
    let knifes=new cc.Node('knifes');
    for(let i = 0;i<point.apple.length;i++){
      let tmpAngle = point.apple[i];
      let newApple = cc.instantiate(this.applePrefab);
      apples.addChild(newApple);
      let x = this.node.width / 2 * (Math.cos(Math.PI / 180 * tmpAngle).toFixed(2)),
          y = -this.node.height / 2 * (Math.sin(Math.PI / 180 * tmpAngle).toFixed(2)); // COCOS Y是从下向上的
      newApple.setPosition(x,y);
      newApple.group = "apple";
      newApple.zIndex = 10;
      let rotateAngle = 90 + tmpAngle;
      newApple.setRotation(rotateAngle);
    }
    for(let i = 0;i<point.knife.length;i++){
      let tmpAngle = point.knife[i];
      let newKnife = cc.instantiate(this.knifePrefab);
      knifes.addChild(newKnife);
      let x = this.node.width / 2 * (Math.cos(Math.PI / 180 * tmpAngle).toFixed(2)),
          y = -this.node.height / 2 * (Math.sin(Math.PI / 180 * tmpAngle).toFixed(2)); // COCOS Y是从下向上的
      newKnife.setPosition(x,y);
      newKnife.group = "knife";
      newKnife.zIndex = 10;
      let rotateAngle = 360 - 90 + tmpAngle;
      newKnife.setRotation(rotateAngle);
    }
    this.node.addChild(apples);
    this.node.addChild(knifes);
  },
  addMark(){
    let tmpAngle = 90-Math.floor(this.node.rotation%360);
    tmpAngle = tmpAngle<0?tmpAngle+360:tmpAngle;
    let newKnife = cc.instantiate(this.knifePrefab);
    this.node.getChildByName("knifes").addChild(newKnife);
    let x = this.node.width / 2 * (Math.cos(Math.PI / 180 * tmpAngle).toFixed(2)),
        y = -this.node.height / 2 * (Math.sin(Math.PI / 180 * tmpAngle).toFixed(2)); // COCOS Y是从下向上的
    newKnife.setPosition(x,y);
    newKnife.setRotation(tmpAngle-90);
    newKnife.group = "knife";
    newKnife.zIndex = 10;
  },
  init(point){
    this.node.children.forEach((node)=>{node.destroy()}); // 销毁所有节点
    // 设置背景图
    this.createBackground(point.url);
    this.createChip(point.url);
    this.clockwise = point.clockwise;
    this.node.runAction(cc.repeatForever(cc.rotateBy(point.speed,point.clockwise?360:-360)));
    this.printMark(point);
  },
  woodenAnim(){
    let shakeT = cc.moveBy(.032, cc.p(0, 10));
    let shakeB = cc.moveBy(.032, cc.p(0, -10));
    this.node.runAction(cc.sequence(shakeT,shakeB));
  },
  createBackground(url){
    cc.loader.loadRes(url, cc.SpriteFrame,(err, spriteFrame)=>{
      if(err){console.warn(err);return;}
      let background=cc.instantiate(this.backgroundPrefab);
      let sprite=background.getComponent(cc.Sprite);
      sprite.spriteFrame=spriteFrame;
      sprite.sizeMode = 'custom';
      background.zIndex = 99;
      background.width = 240;
      background.height = 240;
      this.node.addChild(background)
    });
  },
  createChip(url){
    cc.loader.loadRes(url, cc.SpriteFrame,(err, backgroundSpriteFrame)=>{
      if(err){console.warn(err);return;}
      cc.loader.loadResDir("images/component", cc.SpriteFrame, (err, assets)=>{
        if(err){console.warn(err);return;}
        let mask=new cc.Node('mask');
        let maskChildren=new cc.Node('maskChildren');
        assets.forEach((spriteFrame)=>{
          let node = cc.instantiate(this.maskPrefab);
          let nodeSprite=node.getComponent(cc.Mask);
          nodeSprite.spriteFrame = spriteFrame;

          let children = cc.instantiate(maskChildren);
          let childrenSprite=children.addComponent(cc.Sprite);
          childrenSprite.spriteFrame=backgroundSpriteFrame;
          childrenSprite.sizeMode = 'custom';
          children.width = 240;
          children.height = 240;
          node.addChild(children);
          mask.addChild(node);
        });
        mask.active = false;
        this.node.addChild(mask)
      })
    });
  },
  onCollisionEnter(self){
    // console.log("木头：有人碰到我了，要是以前它早挂了，现在我允许它插在我身上");
    this.addMark();
    this.woodenAnim();
    this.node.parent.getComponent("Game").gainScore();
  },
  start(){

  },
  update(){
    // console.log(Math.floor(this.node.rotation%360));
  }
});
