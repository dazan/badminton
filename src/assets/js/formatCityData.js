// 转换省市区的数据格式,转成以下格式
/**
 *  options: [
          {
            id: '330000',
            title: '浙江省',
            children: [
              {
                id: '330100',
                title: '杭州市',
                children: [
                  {
                    id: '330106',
                    title: '西湖区'
                  }
                ]
              }
            ]
 */

 export default function formatData(data){
    const res = [];
    for(let key in data){
        res.push({
            id: key,
            title: data[key]
        });
    }
    return res;
}