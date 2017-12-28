import { TOKEN_CREATE, TOKEN_DELETE } from '../types';

let initToken = window.sessionStorage.getItem('token');

// 定义规则
export default function token(state = initToken, action){
    switch(action.type){
        case TOKEN_CREATE:  // 创建token
            window.sessionStorage.setItem('token', action.token);
            return action.token;
        case TOKEN_DELETE:  // 删除token
            window.sessionStorage.setItem('token', '');
            return '';
        default:
            return state;
    }
}