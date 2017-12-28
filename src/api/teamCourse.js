import axios from 'axios';
// 团课接口

// 添加团课
export function addTeamCourse(data){
    return axios.post('/a/course/group-course/add', data);
}

// 获取团课列表
export function getAllTeamCourse(data){
    return axios.post('/a/course/group-course', data);
}

// 删除团课
export function deleteTeamCourse(data){
    return axios.post('/a/course/group-course/delete', data);
}

// 更新团课
export function updateTeamCourse(data){
    return axios.post('/a/course/group-course/update', data);
}

// 获取团课详情
export function getTeamCourseById(data){
    return axios.post('/a/course/group-course/detail', data);
}