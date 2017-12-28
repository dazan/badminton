import axios from 'axios';

// 团课api

// 获取所有团课订单
export function getAllTeamOrder(data){
    return axios.post('/a/order/group-course', data);
}

// 团课订单详情
export function getTeamOrderById(data){
    return axios.post('/a/order/group-course/detail', data);
}

// 删除团课订单
export function deleteTeamOrderById(data){
    return axios.post('/a/order/group-course/delete', data);
}