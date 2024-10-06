import { getGameAssets } from '../init/assets.js';
import { clearStage, getStage, setStage } from '../models/stage.model.js';
import calculateTotalScore from '../utils/calculateTotalScore.js';
import { getUserItems, initializeItems } from '../models/item.model.js';

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  clearStage(uuid);
  initializeItems(uuid);
  setStage(uuid, stages.data[0].id, payload.timestamp);
  console.log('Stage:', getStage(uuid));

  return { status: 'success', handler: 2 };
};

export const gameEnd = (uuid, payload) => {
  // 클라이언트에서 받은 게임 종료 시 타임스탬프와 총 점수
  const { timestamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);
  const userItems = getUserItems(uuid);

  if (!stages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 총 점수 계산
  const totalScore = calculateTotalScore(stages, gameEndTime, false, userItems);

  // 점수와 타임스탬프 검증 (예: 클라이언트가 보낸 총점과 계산된 총점 비교)
  // 오차범위 5
  if (Math.abs(score - totalScore) > 5) {
    return { status: 'fail', message: 'Score verification failed' };
  }

  // 모든 검증이 통과된 후, 클라이언트에서 제공한 점수 저장하는 로직
  // saveGameResult(userId, clientScore, gameEndTime);
  // 검증이 통과되면 게임 종료 처리
  return { status: 'success', message: 'Game ended successfully', score, handler: 3 };
};
