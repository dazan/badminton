import { TOKEN_CREATE, TOKEN_DELETE } from '../types';

// action创建函数
export function createToken(token){
    return {
        type: TOKEN_CREATE,
        token
    }
}

export function deleteToken(){
    return {
        type: TOKEN_DELETE
    }
}
