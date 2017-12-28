// import CryptoJS from './crypto.js';
import CosCloud from 'cos-js-sdk-v4';

// 该接口需要传token, 现在token先随便传
import getSignature from './signature.js'

let bucket = 'testbadminton';
let appid = '1253195000';
// var sid = 'AKID672hGlsUmsoXDcLmeO0Uov8ED1jNDGTT';  // 没有用到
// var skey = 'AMbr11XxBD2f6NRL4dz97sSr48HI8lEV';  // 没有用到
let region = 'gz';
//TODO 以上几个值请确保填上再调用示例里的sdk方法

const cos = new CosCloud({
    appid: appid, // APPID 必填参数
    bucket: bucket, // bucketName 必填参数
    region: region, // 地域信息 必填参数 华南地区填gz 华东填sh 华北填tj
    getAppSign: function (callback) {//获取签名 必填参数

        // 方法一（推荐线上使用）：搭建鉴权服务器，构造请求参数获取签名，推荐实际线上业务使用，优点是安全性好，不会暴露自己的私钥
        // $.get('../server/auth.php', callback);
        // 方法二（前端调试使用）：直接在浏览器前端计算签名，需要获取自己的accessKey和secretKey, 一般在调试阶段使用
        // var self = this;
        // var random = parseInt(Math.random() * Math.pow(2, 32));
        // var now = parseInt(Date.now() / 1000);
        // var e = now + 600; //签名过期时间为当前+600s
        // var path = ''; //多次签名这里填空
        // var str = 'a=' + self.appid + '&k=' + sid + '&e=' + e + '&t=' + now + '&r=' + random + '&f=' + path + '&b=' + self.bucket;
        // var sha1Res = CryptoJS.HmacSHA1(str, skey); // 这里使用CryptoJS计算sha1值，你也可以用其他开源库或自己实现
        // var strWordArray = CryptoJS.enc.Utf8.parse(str);
        // var resWordArray = sha1Res.concat(strWordArray);
        // var res = resWordArray.toString(CryptoJS.enc.Base64);

        // callback(res);
        getSignature({
            token: '测试中....'
        }).then(function(data){
            let s = data.data.data.sigen; //得到签名
            console.log('第一步：拿到签名了', s);
            callback(s);
        }, function(err){
            alert('获取签名出错!');
        })
    }
});

// 图片id生成器函数
function genNonDuplicateID(randomLength){
    return Number(Math.random().toString().substr(3,randomLength) + Date.now()).toString()
}
// 获取图片后缀名
function getImgSuffix(name){
    return name.substring(name.lastIndexOf('.'), name.length);
}
/**
 * 
 * 
 * @export
 * @param {any} images  图片的对象数组 
 * @param {any} successCb 成功时的回调
 * @param {any} errCb 失败时的回调
 */
export function uploadFile(images, successCb, errCb, path){
    if(path == null){
        path = '/venue';
    }
    let promises = images.map(item => {
        return new Promise((resolve, reject) => {
            let imgId = genNonDuplicateID(10); // 生成唯一的id
            let suffix = getImgSuffix(item.name);
            cos.uploadFile(function(data){
                resolve(data);
            }, function(err){
                reject(err)
            }, function(){}, bucket, `${ path }/${ imgId }${ suffix }`, item, 1);
        });
    });
    Promise.all(promises).then(function(data){
        successCb(data);
    }, function(err){
        errCb && errCb(err);
    });
}
    
