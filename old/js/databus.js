/*
* 全局状态管理
* */
import Pool from './base/pool';
let instance; // 针对重复实例化
export default class DataBus{
    constructor(){
        if(instance)return instance;
        instance = this;
        this.pool = new Pool;
        this.init();
    }
    init(){
        // 帧数
        this.frame = 0;
        // 分数
        this.score = 0;
        // 游戏是否结束
        this.gameOver = false;
        // 苹果
        this.resourcesApple = [];
        // 小刀
        this.resourcesKnife = [];
        // 动画
        this.resourcesAnimations = [];
    }
}