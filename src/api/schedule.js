import axios from 'axios';

// 教练排期列表
export function getCoachTimeList(data){
    return axios.post('/a/coach/private-coach-time', data);
}


// 教练排期详情
export function getCoachTimeById(data){
    return axios.post('/a/coach/private-coach-time/detail', data);
}

// 添加教练排期
export function addCoachTime(data){
    return axios.post('/a/coach/private-coach-time/add', data);
}
