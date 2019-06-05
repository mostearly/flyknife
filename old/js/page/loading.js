// 加载中
export default class Loading{
    constructor(ctx,width,height){
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.show();
    }
    show(){
        this.ctx.save();
        let tipsTitle = "健康提示";
        let tipsContent = [
            "本游戏适合年满7周岁以上的用户使用；",
            "请你确定已如实进行实名注册；",
            "本游戏适合年满7周岁以上的用户使用；"
        ];
        let titpsOther = [
          '抵制不良游戏，拒绝盗版游戏，注意自我保护，谨防受骗上当。',
          '适度游戏益脑，沉迷游戏伤身，合理安排时间，享受健康生活。'
        ];
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(0,0,this.width,this.height)
        this.ctx.fillStyle = "#666";
        this.ctx.font = "18px 幼圆";
        this.ctx.fillText(
            tipsTitle,
            this.width/2-tipsTitle.length*18/2,
            this.height*.7,
            this.width
        );
        this.ctx.font = "14px 幼圆";
        for (let i=0;i<tipsContent.length;i++){
            let tmp = tipsContent[i];
            this.ctx.fillText(tmp,
                this.width/2-14*tmp.length/2,
                this.height*.7+30+i*20,
                this.width
            );
        }
        this.ctx.font = "10px 幼圆";
        for (let i=0;i<titpsOther.length;i++){
            let tmp = titpsOther[i];
            this.ctx.fillText(tmp,
                this.width/2-10*tmp.length/2,
                this.height*.7+120+i*20,
                this.width
            );
        }
        this.ctx.save();
        this.ctx.translate(this.width/2,this.height*.4);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#666";
        this.ctx.beginPath();
        this.ctx.moveTo(0,0);
        this.ctx.arc(-20,0,40,-Math.PI/2,Math.PI/2);
        this.ctx.lineTo(40,40);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    }
}