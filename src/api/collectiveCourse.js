import axios from 'axios';
// collectiveCourse
// 集体课接口

// 添加集体课
export function addCollCourse(data){
    return axios.post('/a/course/collective-course/add', data);
}

// 获取集体课列表
export function getAllCollCourse(data){
    return axios.post('/a/course/collective-course', data);
}

// 删除集体课
export function deleteCollCourse(data){
    return axios.post('/a/course/collective-course/delete', data);
}

// 更新集体课
export function updateCollCourse(data){
    return axios.post('/a/course/collective-course/update', data);
}

// 获取集体课详情
export function getCollCourseById(data){
    return axios.post('/a/course/collective-course/detail', data);
}