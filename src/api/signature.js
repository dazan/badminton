import axios from 'axios';

// 获取上传图片需要的cos签名
export default function getSignature(data){
    return axios.post('/a/cos-signature', data);
}