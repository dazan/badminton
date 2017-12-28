import jsonp from 'jsonp';


export function getPlaceById(url, id, cb){
    url = `https://www.youzan.com/v2/common/region/list.jsonp?region_id=${ id }`;
    jsonp(url, {}, function(err, res){
        if(err){
            alert('网络错误!');
            return;
        }
        cb(res.data);
    });
}