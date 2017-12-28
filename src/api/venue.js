import axios from 'axios';

// export default {
//     // 添加场馆
//     addVenue(data){
//         return axios.post('/a/add-venue', data);
//     },
//     // 删除场馆
//     deleteVenue(data){
//         return axios.post('/a/delete-venue', data);
//     },
//     // 更新场馆数据
//     updateVenue(data){
//         return axios.post('/a/update-venue', data);
//     },
//     // 所有场馆的简要信息
//     getTotalBaseVenues(data){
//         return axios.post('/a/total-base-venue', data);
//     },
//     // 场馆信息
//     getVenueList(data){
//         return axios.post('/a/venue-list', data);
//     }
// }

// 添加场馆
export function addVenue(data){
    return axios.post('/a/add-venue', data);
}

// 获取场馆信息
export function getVenueList(data){
    return axios.post('/a/venue-list', data);
}

// 删除场馆
export function deleteVenue(data){
    return axios.post('/a/delete-venue', data);
}

// 根据场馆id获取该场馆的具体信息
export function getVenueMesById(data){
    return axios.post('/a/venue/detail', data);
}

// 更新场馆信息
export function updateVenue(data){
    return axios.post('/a/update-venue', data);
}

// 所有场馆的简要信息
export function getVenues(){
    return axios.post('/a/total-base-venues');
}