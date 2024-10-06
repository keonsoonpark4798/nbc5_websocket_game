// 유저는 스테이지를 하나씩 올라갈 수 있다. (1스테이지 ->2, 2->3)
// 유저는 일정 점수가 되면 다음 스테이지로 이동한다.

import { getStage, setStage } from '../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';

export const moveStageHandler = (userId, payload) => {
    // 유저의 현재 스테이지 배열을 가져오고, 최대 스테이지 ID를 찾는다.
    let currentStages = getStage(userId);
    if (!currentStages.length) {
        return { status: 'fail', message: 'No stages found for user' };
    }

    // 오름차순 정렬 후 가장 큰 스테이지 ID 확인 <- 유저의 현재 스테이지
    currentStages.sort((a, b) => a.id - b.id);
    const currentStage = currentStages[currentStages, length - 1];

    // payload의 currentStage 와 비교 <- 클라이언트 vs 서버 비교
    if (currentStage.id !== payload.currentStage) {
        return { status: 'fail', message: 'Current stage mismatch' };
    }

    // 점수 검증
    const serverTime = Date.now();
    const elapsedTime = (serverTime - currentStage.timestamp) / 1000; // 초 단위로 계산

    // 1초당 1점, 100점이상 다음스테이지 이동, 오차범위 5
    // 클라이언트와 서버 간의 통신 지연시간을 고려해서 오차범위 설정
    // elapsedTime 은 100 이상 105 이하 일 경우만 통과
    // 지금은 하드코딩이지만 나중엔 이걸 stage.json에서 점수로 계산할 수 있게 해줘야함
    if (elapsedTime < 100 || elapsedTime > 105) {
        return { status: 'fail', message: 'Invalid elapsed time' };
    }

    // 게임 에셋에서 다음 스테이지의 존재 여부 확인 <- targetStage 대한 검증 
    const { stages } = getGameAssets();
    if (!stages.data.some((stage) => stage.id === payload.targetStage)) {   // 조건문이 하나도 안맞으면 fail
        return { status: 'fail', message: 'Target stage does not exist' };
    }

    // 유저의 스테이지 정보 업데이트
    setStage(userId, payload.targetStage, serverTime);
    return { status: 'success' };
};