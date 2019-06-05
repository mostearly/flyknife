// 游戏主体
import {rd} from "../base/utils";

export default class Game{
    drawTask = []; // 绘制任务
    eventTask = []; // 事件任务
    cacheImage = {}; // 缓存图片
    constructor(){
        this.canvas = wx.createCanvas();
        this.ctx = this.canvas.getContext("2d");
        // 初始宽高度
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.start();
    }
    // 全局绘制
    draw(){
        let animate = ()=>{
            // 清除上一帧
            this.ctx.clearRect(0,0,this.width,this.height)
            this.drawTaskQueue.getAll().forEach((cb)=>{
                cb();
            })
            requestAnimationFrame(animate)
        }
        animate();
    }
    drawTaskQueue=(()=>{
        let storageMap = {};
        let recycleMap = {};
        let storage = [];
        let size = 0;
        let recycle = [];
        let add = (key,callback) =>{
            if (!key||!callback)return;
            if (key in storageMap) throw 'Key already exists in the task queue';
            storage.push(callback);
            storageMap[key] = storage.length-1;
            size++;
        };
        let init = ()=>{
            size=0;
            storageMap={};
            storage=[];
            recycle = [];
            recycleMap = {};
        }
        let get = (key) => {
            if (!key) return;
            if (typeof storageMap[key] === 'number'){
                return storage[storageMap[key]];
            }
        }
        let getAll = ()=>storage;
        let remove = (key) => {
            if (!key) return;
            if (!(key in storageMap)) throw 'Key already not exists in the task queue';
            recycle.push(storage.splice(storageMap[key],1)[0]);
            recycleMap[key] = recycle.length-1;
            delete storageMap[key];
            size--;
        }
        let restore = (key) => {
            if (!key) return;
            if (!(key in recycleMap)) throw 'Restore key already not exists in the task queue';
            storage.push(recycle.splice(recycleMap[key], 1)[0]);
            storageMap[key] = storage.length - 1;
            delete recycleMap[key];
            size++;
        }
        return{
            init,
            add,
            get,
            getAll,
            remove,
            restore,
            size
        }
    })()
    start(){
        console.log(`屏幕信息：${this.width} x ${this.height}`);
        // 初始次数
        this.frequency = {
            use: 1,
            total: 7
        };
        // 旋转信息
        this.woodenPierInfo = {
            x: this.width / 2,
            y: 200,
            speed: 1, // 旋转速度
            direction: true, // 旋转是否顺时针
            isStopWhirl: false, // 是否停止旋转
            isStopDraw: false, // 是否停止绘制 ， 主要用来进行动画交接
            angle: 0 // 角度
        }
        // 设置初始的飞刀和苹果的信息
        this.point = {
            apple: [10, 60, 80, 120, 220],
            knife: [90, 20]
        }
        // 飞刀的信息
        this.knifeInfo = {
            y: 0,
            x: 0,
            angle: 0,
            isComeDown: false
        }
        // this.drawTaskQueue.init();
        this.eventTask = [];
        this.ctx.save();
        // 绘制背景图片
        let backgroundImage = wx.createImage();
        backgroundImage.src = "images/bg.jpg";
        backgroundImage.onload = ()=>{
            this.drawTaskQueue.add('drawBackground',()=>{
                this.ctx.drawImage(backgroundImage, 0, 0, this.width, this.height);
                this.ctx.save();
            });
            this.drawWoodenPier();
            this.drawFrequency();
            this.drawKnife();
            this.draw();
            this.bindEvent();
        }
    }
    restart(){
        // 初始次数
        this.frequency = {
            use: 1,
            total: 7
        };
        // 旋转信息
        this.woodenPierInfo = Object.assign({
            x: this.width / 2,
            y: 200,
            speed: 1, // 旋转速度
            isStopWhirl: false, // 是否停止旋转
            isStopDraw: false, // 是否停止绘制
        },this.woodenPierInfo);
        // 设置初始的飞刀和苹果的信息
        this.point = {
            apple: [10, 60, Math.floor(Math.random() * 360), Math.floor(Math.random() * 360)],
            knife: [Math.floor(Math.random() * 360), Math.floor(Math.random() * 360)]
        }
        // 飞刀的信息
        this.knifeInfo = {
            y: 0,
            x: 0,
            angle: 0,
            isComeDown: false
        }
        this.ctx.save();
    }
    // 绘制木墩
    drawWoodenPier(){
        let widthHeight = this.width * .6;
        let woodenPierImage = wx.createImage(),
            appleImage = wx.createImage(),
            knifeImage = wx.createImage();
        appleImage.src = "images/apple.png";
        knifeImage.src = "images/knife.png";
        woodenPierImage.src = "images/woodenPier.png";
        this.cacheImage['knife'] = knifeImage;
        this.cacheImage['apple'] = appleImage;
        this.cacheImage['woodenPier'] = woodenPierImage;
        woodenPierImage.onload = () => {
            this.drawTaskQueue.add('drawWoodenPier',()=>{
                // 如果停止，此处不绘制
                this.ctx.save();
                this.ctx.translate(this.woodenPierInfo.x, this.woodenPierInfo.y);
                let angle = this.woodenPierInfo.direction ? this.woodenPierInfo.angle : 360 - this.woodenPierInfo.angle;
                angle = Math.PI / 180 * angle;
                this.ctx.rotate(angle);
                // 绘制苹果
                for (let i = 0; i < this.point.apple.length; i++) {
                    this.ctx.save();
                    let tmpAngle = this.point.apple[i];
                    let x = widthHeight / 2 * Math.cos(Math.PI / 180 * tmpAngle),
                        y = widthHeight / 2 * Math.sin(Math.PI / 180 * tmpAngle);
                    this.ctx.translate(x, y);
                    let rotateAngle = 90 + tmpAngle;
                    this.ctx.rotate(Math.PI / 180 * rotateAngle);
                    this.ctx.drawImage(appleImage, -15, -15, 30, 30);
                    this.ctx.restore();
                }
                // 绘制小刀
                for (let i = 0; i < this.point.knife.length; i++) {
                    this.ctx.save();
                    let tmpAngle = this.point.knife[i];
                    let x = widthHeight / 2 * Math.cos(Math.PI / 180 * tmpAngle),
                        y = widthHeight / 2 * Math.sin(Math.PI / 180 * tmpAngle);
                    this.ctx.translate(x, y);
                    let rotateAngle = 360 - 90 + tmpAngle;
                    this.ctx.rotate(Math.PI / 180 * rotateAngle);
                    this.ctx.drawImage(knifeImage, -10, -40, 20, 80);
                    this.ctx.restore();
                }
                this.ctx.drawImage(woodenPierImage, -widthHeight / 2, -widthHeight / 2, widthHeight, widthHeight);
                this.ctx.restore();
                if (!this.woodenPierInfo.isStopWhirl) {
                    this.woodenPierInfo.angle += this.woodenPierInfo.speed;
                    if (this.woodenPierInfo.angle > 360) this.woodenPierInfo.angle = 0;
                }
            })
        }
    }
    // 绘制剩余次数
    drawFrequency() {
        this.drawTaskQueue.add('drawFrequency',() => {
            this.ctx.save();
            this.ctx.translate(30, this.height*.7);
            for(let i=0;i<this.frequency.total;i++){
                this.ctx.fillStyle = "rgba(34,204,158,1)";
                this.ctx.strokeStyle = "rgba(34,204,158,1)";
                if (i < this.frequency.use) {
                    this.ctx.fillStyle = "rgba(34,204,158,.2)";
                }
                this.ctx.beginPath();
                this.ctx.arc(0, i*15, 5, 0, Math.PI * 2);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }
            this.ctx.restore();
        })
    }
    drawKnife(){
        let self = this;
        this.eventTask.push({
            x: 0,
            endx: this.width,
            y: 0,
            endy: this.height,
            canuse:true,
            emit(){
                if (self.frequency.use === self.frequency.total) {return}
                if (!this.canuse)return;
                this.canuse = false;
                self.frequency.use++;
                let move = ()=>{
                    if (self.knifeInfo.isComeDown) {
                        self.knifeInfo.y += 10;
                        if (self.woodenPierInfo.direction) {
                            self.knifeInfo.x -= 4;
                        }else{
                            self.knifeInfo.x += 4;
                        }
                        self.knifeInfo.angle += 10;
                        if (self.knifeInfo.y > self.height) {
                            self.knifeInfo.y = 0;
                            self.knifeInfo.x = 0;
                            self.knifeInfo.isComeDown = false;
                            self.knifeInfo.angle = 0;
                            if (self.frequency.use === self.frequency.total) {
                                setTimeout(() => {
                                    self.nextLevel();
                                    this.canuse = true;
                                }, 100)
                                return;
                            }
                        }else{
                            setTimeout(move, 16)
                        }
                        return;
                    }else{
                        self.knifeInfo.y -= 20;
                    }
                    if (self.knifeInfo.y > -180) {
                        setTimeout(move, 16)
                    }else{
                        self.woodenPierInfo.y -= 4;
                        setTimeout(()=>{
                            self.woodenPierInfo.y += 4;
                        },100)
                        let tmpAngle = 0;
                        if (self.woodenPierInfo.direction){
                            tmpAngle = 90 - self.woodenPierInfo.angle;
                            tmpAngle = tmpAngle < 0 ? 360 + tmpAngle : tmpAngle;
                        }else{
                            tmpAngle = 90 + self.woodenPierInfo.angle;
                            tmpAngle = tmpAngle > 360 ? tmpAngle - 360 : tmpAngle;
                        }
                        if (self.frequency.use === self.frequency.total) {
                            self.knifeInfo.y = self.height;
                            self.smash();
                            setTimeout(() => {
                                this.canuse = true;
                                self.nextLevel();
                            }, 100)
                        } else {
                            this.canuse = true;
                            self.knifeInfo.y = 0;
                            self.knifeInfo.x = 0;
                        }
                        // 判断是否碰撞到刀具
                        for (let i = 0; i < self.point.knife.length; i++) {
                            let tmp = self.point.knife[i];
                            if (tmp - tmpAngle < 8 && tmp - tmpAngle > -8) {
                                // 动画继续
                                self.knifeInfo.isComeDown = true;
                                setTimeout(move, 16)
                                return;
                            }
                        }
                        // 判断是否碰撞到苹果
                        for (let i = 0; i < self.point.apple.length; i++) {
                            let tmp = self.point.apple[i];
                            if (tmp - tmpAngle < 10 && tmp - tmpAngle > -10) {
                                self.point.apple.splice(i, 1);
                            }
                        }
                        self.point.knife.push(tmpAngle);
                    }
                }
                move();
            }
        });
        this.drawTaskQueue.add('drawKnife',() => {
            this.ctx.save();
            this.ctx.translate(this.width / 2 + this.knifeInfo.x, this.height * .7 + this.knifeInfo.y+40);
            this.ctx.rotate(Math.PI / 180 * this.knifeInfo.angle);
            this.ctx.drawImage(this.cacheImage.knife, -10, -40,20,80);
            this.ctx.restore();
        })
    }
    // 绑定事件
    bindEvent(){
        wx.onTouchStart(ev=>{
            let curTouch = ev.touches[0];
            let x = curTouch.clientX;
            let y = curTouch.clientY;
            this.eventTask.forEach(task=>{
                if (task.x<x&&x<task.endx){
                    if (task.y < y && y < task.endy) {
                        task.emit();
                    }
                }
            })
        })
    }
    gameOver(){
        console.warn("游戏结束");
    }
    nextLevel() {
        wx.triggerGC()
        this.passingAnimation()
            .then(() => this.restart());
    }
    smash(){
        this.smashStorage = [];
        let widthHeight = this.width * .6;
        let startAngle = [];
        let endAngle = [];
        // 绘制扇形碎块图
        let draw = (ctx, start, end) => {
            let sDeg = 0;
            let eDeg = 0;
            if (start < end) {
                sDeg = Math.PI / 180 * start;
                eDeg = Math.PI / 180 * end;
            } else {
                sDeg = Math.PI / 180 * end;
                eDeg = Math.PI / 180 * start;
            }
            let r = widthHeight / 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, r, sDeg, eDeg);
            ctx.save();
            ctx.rotate(sDeg);
            ctx.moveTo(r, 0);
            ctx.lineTo(0, 0);
            ctx.restore();
            ctx.rotate(eDeg);
            ctx.lineTo(r, 0);
            ctx.closePath();
            ctx.restore();
        }
        // 生成随机角度及次数
        let order = rd(6, 12);
        let reserved = 360 - order * 10;
        for (let i = 0; i < order; i++) {
            let offset = i === order ? reserved : rd(reserved / (order - i), reserved / 2);
            reserved -= offset;
            let last = endAngle[i - 1] | 0;
            startAngle.push(last)
            endAngle.push(10 + offset + startAngle[i]);
        }
        for (let i = 0; i < order; i++) {
            let cs = wx.createCanvas();
            let cstx = cs.getContext("2d");
            cs.width = widthHeight;
            cs.height = widthHeight;
            this.smashStorage.push({ canvas: cs,off:rd(-20,20)});
            cstx.translate(widthHeight / 2, widthHeight / 2);
            draw(cstx, startAngle[i], endAngle[i])
            cstx.clip();
            cstx.drawImage(this.cacheImage.woodenPier, -widthHeight / 2, -widthHeight / 2, widthHeight, widthHeight);
        }
    }
    // 过关动画
    passingAnimation(){
        return new Promise((resolve,reject)=>{
            this.drawTaskQueue.remove('drawWoodenPier');
            let widthHeight = this.width * .6;
            // 苹果，小刀，木片 位置
            let ax = [], ay = [], kx = [], ky = [], _wx =[], _wy=[], _wf=false;
            this.drawTaskQueue.add('drawAnimation',() => {
                this.ctx.save();
                this.ctx.translate(this.woodenPierInfo.x, this.woodenPierInfo.y);
                let angle = this.woodenPierInfo.direction ? this.woodenPierInfo.angle : 360 - this.woodenPierInfo.angle;
                angle = Math.PI / 180 * angle;
                for (let i = 0; i < this.point.apple.length; i++) {
                    this.ctx.save();
                    let tmpAngle = this.point.apple[i];
                    this.ctx.translate(ax[i], ay[i]);
                    let rotateAngle = 90 + tmpAngle;
                    this.ctx.rotate(Math.PI / 180 * rotateAngle);
                    if(!ax[i]&&!ay[i]){
                        ax[i] = widthHeight / 2 * Math.cos(Math.PI / 180 * tmpAngle);
                        ay[i] = widthHeight / 2 * Math.sin(Math.PI / 180 * tmpAngle);
                    } else {
                        if (ay[i] < this.height - this.woodenPierInfo.y){
                            ay[i] += Math.floor(25 -Math.random() * 16);
                            this.point.apple[i] += Math.floor(Math.random() * 2);
                        }
                    }
                    this.ctx.drawImage(this.cacheImage.apple, -15, -15, 30, 30);
                    this.ctx.restore();
                }
                // 绘制小刀
                for (let i = 0; i < this.point.knife.length; i++) {
                    this.ctx.save();
                    let tmpAngle = this.point.knife[i];
                    this.ctx.translate(kx[i], ky[i]);
                    let rotateAngle = 90 + tmpAngle;
                    this.ctx.rotate(Math.PI / 180 * rotateAngle);
                    if (!kx[i] && !ky[i]) {
                        kx[i] = widthHeight / 2 * Math.cos(Math.PI / 180 * tmpAngle);
                        ky[i] = widthHeight / 2 * Math.sin(Math.PI / 180 * tmpAngle);
                    } else {
                        if (ky[i] < this.height - this.woodenPierInfo.y) {
                            ky[i] += Math.floor(15 -Math.random()*10);
                            this.point.knife[i] += Math.floor(Math.random() * 3);
                        }
                    }
                    this.ctx.drawImage(this.cacheImage.knife, -10, -40, 20, 80);
                    this.ctx.restore();
                }

                this.ctx.rotate(angle);
                for (let i = 0; i < this.smashStorage.length; i++) {
                    this.ctx.save();
                    this.ctx.rotate(-angle);
                    if (!_wx[i] && !_wy[i]) {
                        _wx[i] = -widthHeight / 2 + rd(-80,80);
                        _wy[i] = -widthHeight / 2;
                    } else {
                        if (_wy[i] < this.height - this.woodenPierInfo.y) {
                            if (_wy[i] < 0 - this.woodenPierInfo.y) { _wf = true; }
                            if (_wf) {
                                _wy[i] += 10;
                            } else {
                                _wy[i] -= 20;
                                _wx[i] += this.smashStorage[i].off;
                            }
                        }
                    }
                    this.ctx.drawImage(this.smashStorage[i].canvas, _wx[i], _wy[i], widthHeight, widthHeight);
                    this.ctx.restore();
                }
                this.ctx.restore();
            })
        })
    }
}