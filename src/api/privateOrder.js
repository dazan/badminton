import axios from 'axios';

export function getAllTeamOrder(data){
    return axios.post('/a/order/private-coach', data);
}