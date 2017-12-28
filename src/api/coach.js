import axios from 'axios';

// 添加教练
export function addCoach(data){
    return axios.post('/a/add-coach', data);
}

// 更新教练
export function updateCoach(data){
    return axios.post('/a/update-coach', data);
}

// 删除教练
export function deleteCoach(data){
    return axios.post('/a/delete-coach', data);
}

// 私教教练列表
export function getCoachList(data){
    return axios.post('/a/coach-list', data);
}

// 教练详情
export function getCoachMesById(data){
    return axios.post('/a/coach/deltail', data);
}

// 所有教练简要信息
export function getAllCoachMes(data){
    return axios.post('/a/coach/avatar-list', data);
}

// 获取下拉列表的数组
export function getSelectMenuData(){
    return axios.post('/a/total-base-venues');
}