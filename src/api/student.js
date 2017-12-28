import axios from 'axios';

// 获取学员列表
export function getStuList(data){
    return axios.post('/a/customer', data);    
}

// 学员详情
export function getStuMesById(data){
    return axios.post('/a/customer/detail', data);
}