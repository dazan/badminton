// banner 设置

import axios from 'axios';

// 添加首页banner
export function addBanner(data){
    return axios.post('/a/banner/home/add', data);
}

// 首页banner列表
export function getBannerList(data){
    return axios.post('/a/banner/home', data);
}

// 更新首页banner
export function updateBanner(data){
    return axios.post('/a/banner/home/update', data);
} 

// 首页banner详情
export function getBannerDetail(data){
    return axios.post('/a/banner/home/detail', data);
}

// 删除首页banner
export function deleteBanner(data){
    return axios.post('/a/banner/home/delete', data);
}

// 上线/下线banner
export function onlineBanner(data){
    return axios.post('/a/banner/home/online', data);
}
