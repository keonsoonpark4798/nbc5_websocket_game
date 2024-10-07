import { sendEvent } from './Socket.js';

class Score {
  score = 0;
  scoreIncrement = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChanged = {}; // 스테이지 클리어한 기록
  currentStage = 1000;

  constructor(ctx, scaleRatio, stageData, itemTable, itemController, stage) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.stageData = stageData;
    this.itemTable = itemTable;
    this.itemController = itemController;
    this.stage = stage;

    // 초기화
    this.stageData.forEach((stage) => {
      this.stageChanged[stage.id] = false;
    })
  }

  update(deltaTime) {
    // 현재 스테이지 정보 가져오기
    const currentStageInfo = this.stageData.find((stage) => stage.id === this.currentStage);
    // 초당 점수 증가량 -> 스테이지 마다 다른 점수로 변경
    const scorePerSecond = currentStageInfo ? currentStageInfo.scorePerSecond : 1;
    this.scoreIncrement += deltaTime * 0.001 * scorePerSecond;

    // 그냥 스코어에 더해버리면 시각적으로 증가하는 폭이 1씩 올라가기 때문에 증가분으로 반영
    // 증가분이 scorePerSecond 만큼 쌓이면 score에 반영하고 초기화 => 버퍼
    if (this.scoreIncrement >= scorePerSecond) {
      this.score += scorePerSecond;
      this.scoreIncrement -= scorePerSecond;
    }

    this.isStageChange();
  }

  isStageChange() {
    for (let i = 0; i < this.stageData.length; i++) {
      const stage = this.stageData[i];

      // 현재 점수가 스테이지 점수 이상이고, 해당 스테이지로 변경된 적이 없는 경우
      if (
        Math.floor(this.score) >= stage.score &&
        !this.stageChanged[stage.id] &&
        stage.id !== 1000
      ) {
        const previousStage = this.currentStage;
        this.currentStage = stage.id;

        // 해당 스테이지로 변경됨을 표시
        this.stageChanged[stage.id] = true;

        // 서버로 이벤트 전송
        sendEvent(11, { currentStage: previousStage, targetStage: this.currentStage });

        // 아이템 컨트롤러에 현재 스테이지 설정
        if (this.itemController) {
          this.itemController.setCurrentStage(this.currentStage);
        }

        // 현재 스테이지 설정
        if (this.stage) {
          this.stage.setCurrentStage(this.currentStage);
        }

        // 스테이지 변경 후 반복문 종료
        break;
      }
    }
  }

  getItem(itemId) {
    // 아이템 획득시 점수 변화
    const item = this.itemTable.find((item) => item.id === itemId);
    if (item) {
      this.score += item.score;
      sendEvent(21, { itemId, timestamp: Date.now() });
    }
  }

  reset() {
    this.score = 0;
    this.scoreIncrement = 0;
    this.currentStage = 1000;

    Object.keys(this.stageChanged).forEach((key) => {
      this.stageChanged[key] = false;
    });

    if (this.itemController) {
      this.itemController.setCurrentStage(this.currentStage);
    }
    if (this.stage) {
      this.stage.setCurrentStage(this.currentStage);
    }
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
