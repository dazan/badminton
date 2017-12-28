// 集体课
import axios from 'axios';

// 获取所有集体课订单
export function getAllGroupOrder(data){
    return axios.post('/a/order/collective-course', data);
}