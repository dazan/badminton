import axios from 'axios';

// 用户登录
export function login(data){
    return axios.post('/a/login', data);
};


// 用户登出
export function logout(){
    return axios.post();
}