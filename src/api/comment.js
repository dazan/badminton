// 评论api
import axios from 'axios';

// 添加评论
export function addComment(data){
    return axios.post('/a/comment/add', data);
}

// 更新评论
export function updateComment(data){
    return axios.post('/a/comment/update', data);
}

// 删除评论评论
export function deleteCommentById(data){
    return axios.post('/a/comment/delete', data);
}