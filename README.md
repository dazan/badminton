## 羽毛球项目


项目采用[create-react-app](https://github.com/facebookincubator/create-react-app)构建，后经```npm run eject```生成当前目录

## src目录的划分

* api：每个文件对应一类请求
* assets：font/css/js等各类资源文件
* components：通用组件
* page：页面级组件
* router：路由配置
* stroe：redux
* config.js：一些配置信息
* index.js：入口文件

## page文件夹

page文件夹下的目录结构跟所配置路由结构是一致的。

比如:
```
 # router/RouterMap.jsx
    <Route path="schedule" component={ Schedule }>
        <IndexRoute component={ ShowAllSchedule } />
        <Route path="edit/:id" component={ DateCard }/>
    </Route>
```
以上路由结构表示**父页面组件Schedule组件**下有两个**子页面组件**,分别为ShowAllSchedule组件和DateCard组件。
那么其在page文件夹下对应的目录就为以下这种结构。
```
 # page/Schedule
     # page/Schedule/ShowAllSchedule
     # page/Schedule/DateCard
```

## 其他细节信息

### 项目采用自定义状态码

```
    NO_DATA(1), // "没有找到相关数据"
    WRONG_PARAMTER(2), //参数错误
    INVALID_PARAMTER(3), // 参数无效
    WRONG_PASSWORD(4), // 密码错误
    NOT_LOGGED(5), //请登录
    UNKNOWN_ERROR(6), // 未知错误
    CREATE_USER_FAILED(7),  // 创建用户失败
    Group_Course_Not_Exist(8), // 课程不存在
    Venue_Not_Exist(9), // 场馆不存在
    Customer_Not_Exist(10), // 用户不存在
    Coach_Not_Exist(11), //教练不存在
    Insufficient_Number_Group_Course(12), //团课余量不足
    SUCCESS(0); // 成功
```

### 图片文件上传有如下文件夹

* course 课程 
* header 头像 
* venue 场馆 
* coach 教练

### 上传所需信息

```javascript
{
    bucket: 'testbadminton',
    appid: '1253195000',
    sid: 'AKID672hGlsUmsoXDcLmeO0Uov8ED1jNDGTT',
    skey: 'AMbr11XxBD2f6NRL4dz97sSr48HI8lEV',
    region: 'gz'
}
```

### 参考资料

* [react+ueditor(百度富文本编辑器)](http://www.jianshu.com/p/d5d5ee66e733)
* [UEditor实现单张图片上传至腾讯云（对象存储服务）功能（html5 + canvas）](http://www.imooc.com/article/16845)
* [less配置](https://segmentfault.com/a/1190000010162614)
* [请求代理配置](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#proxying-api-requests-in-development)
* [省市区接口](https://www.youzan.com/v2/common/region/list.jsonp?region_id=110100)