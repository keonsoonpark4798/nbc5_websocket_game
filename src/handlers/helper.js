import { getUsers, removeUser } from '../models/user.model.js';
import { CLIENT_VERSION } from '../constants.js';
import { createStage } from '../models/stage.model.js';
import handlerMappings from './handlerMapping.js';

export const handleDisconnect = (socket, uuid) => {
    removeUser(socket.id); // 사용자 삭제
    console.log(`User disconnected: ${socket.id}`);
    console.log('Current users:', getUsers());
};

// 스테이지에 따라서 더 높은 점수 획득
// 1스테이지, 0점 -> 1점씩
// 2스테이지, 1000점 -> 2점씩
export const handleConnection = (socket, userUUID) => {
    console.log(`New user connected: ${userUUID} with socket ID ${socket.id}`);
    console.log('Current users:', getUsers());


    createStage(userUUID);
    // emit 메서드로 해당 유저에게 메시지를 전달할 수 있다.
    // 현재의 경우 접속하고 나서 생성된 uuid를 바로 전달해주고 있다.
    socket.emit('connection', { uuid: userUUID });
};

export const handleEvent = (io, socket, data) => {
    // 서버에 저장된 클라이언트 배열에서 메세지로 받은 clientVersion을 확인합니다.
    if (!CLIENT_VERSION.includes(data.clientVersion)) {
        // 만약 일치하는 버전이 없다면 response 이벤트로 fail 결과를 전송합니다.
        socket.emit('response', { status: 'fail', message: 'Client version mismatch' });
        return;
    }

    const handler = handlerMappings[data.handlerId];
    if (!handler) {
        socket.emit('response', { status: 'fail', message: 'Handler not found' });
        return;
    }

    // 적절한 핸들러에 userID 와 payload를 전달하고 결과를 받습니다.
    const response = handler(data.userId, data.payload);
    // 만약 결과에 broadcast (모든 유저에게 전달)이 있다면 broadcast 합니다.
    if (response.broadcast) {
        io.emit('response', 'broadcast');
        return;
    }
    // 해당 유저에게 적절한 response를 전달합니다.
    socket.emit('response', response);
};