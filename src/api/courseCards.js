// 课程卡的接口 
import axios from 'axios';

// 课程卡列表（分页用）
export function getAllCourseCard(data){
    return axios.post('/a/course-card', data);
}

// 添加课程卡
export function addCourseCard(data){
    return axios.post('/a/course-card/add', data);
}

// 更新课程卡
export function updateCourseCard(data){
    return axios.post('/a/course-card/update', data);
}

// 删除课程卡
export function deleteCourseCard(data){
    return axios.post('/a/course-card/delete', data);
}

// 获取某个课程卡
export function getCardById(data){
    return axios.post('/a/course-card/detail', data);
}

// 课程简要信息列表{token}
export function getCardList(data){
    return axios.post('/a/course-card/total-base', data);
}