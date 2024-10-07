class Stage {

    constructor(ctx, scaleRatio) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.scaleRatio = scaleRatio;
        this.currentStage = 1000;
    }

    // 현재 스테이지 설정
    setCurrentStage(stageId) {
        this.currentStage = stageId;
    }

    draw() {
        const stage = this.currentStage - 999;
        const fontSize = 20 * this.scaleRatio;
        this.ctx.font = `${fontSize}px Verdana`;
        this.ctx.fillStyle = 'black';
        const x = this.canvas.width / 2.5;
        const y = 25 * this.scaleRatio;
        this.ctx.fillText(`Stage ${stage}`, x, y);
    }
}

export default Stage;