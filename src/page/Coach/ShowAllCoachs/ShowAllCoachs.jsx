import React from 'react';
import { SearchInput, Table, Notify, Button, Sweetalert } from 'zent';
// coach api
import { getCoachList, deleteCoach } from '../../../api/coach.js';
import './style.css';
// 在组件外部使用导航
import { browserHistory } from 'react-router';
// 传入"2017-10"的字符串，会把它专为"2017-10-1"的时间戳
import { dateToStr } from '../../../assets/js/formatDate.js';
// 元分互转
import { f2y } from '../../../assets/js/formatPrice.js';
// 图片预览组件
import PicShow from '../../../components/PicShow/PicShow';

class ShowAllCoachs extends React.Component {
    constructor(props, context){
        super(props, context);
        // 表头声明
        this.columns = [
            {
                title: '序号',
                name: 'order'
            }, {
              title: '教练ID',
              name: 'id'
            }, {
              title: '教练姓名',
              name: 'name'
            },{
                title: '教练头像',
                name: 'header',
                bodyRender: (data) => {
                    return <PicShow imgList={ [ { url: data.header } ] }/>
                } 
            }, {
              title: '级别',
              name: 'level',
              bodyRender: (data) => {
                let levelTxt = '';
                if(data.level === 1){
                    levelTxt = '普通';
                }else if(data.level === 2){
                    levelTxt = '中等';
                }else if(data.level === 3){
                    levelTxt = '高级';
                }
                return (
                    <span>{ levelTxt }</span>
                );
              }
            }, {
                title: '收费',
                name: 'privateCoachingPrice'
            },
            {
              title: '执教时间',
              name: 'coachingDate',
              bodyRender: (data) => {
                  return (
                      <span>{ dateToStr(data.coachingDate) }</span> 
                  );
              }
            },{
                title: '性别',
                name: 'gender',
                bodyRender: (data) => {
                    let genderTxt = '';
                    if(data.gender === 'female'){
                        genderTxt = '女';
                    }else {
                        genderTxt = '男';
                    }
                    return (
                        <span>{ genderTxt }</span>
                    );
                }
            },
            {
                title: '联系方式',
                name: 'phone'
            }, {
                title: '可执教场馆',
                name: 'venues',
                bodyRender: (data) => {
                    const venues = data.venues;
                    return (
                        <ul>
                            {
                                venues && venues.map((item, index) => {
                                    return <li key={ index }>{index + 1}.{ item }</li>
                                })
                            }
                        </ul>
                    );
                }
            },
            {
                title: '操作',
                bodyRender: (data, pos) => { 
                    const editVenue = () => {
                        browserHistory.push(`/coach/edit/${ data.id }`);
                    };
                    return (
                        <div>
                            {/* <Button type="primary" size="small" >排期</Button> */}
                            <Button onClick={ editVenue } type="primary" size="small" >编辑</Button>
                            {/* id 用来点击后获取场馆的id, first用来标记是否为第一条数据 */}
                            <Button data-id={ data.id } data-first={ pos.row === 0 ? 1 : 0 } className="delete-coach-btn" type="danger" size="small">删除</Button>
                        </div>
                    );
                },
                // width: '128px'
            }
        ];            
        this.state = {
            totalItem: 0, // 总条目个数（发请求得来）
            pageSize: 10,  // 每页个数(自己规定)
            current: 1, // 当前页码(每次点击需更新)
            //maxPageToShow: 25, 最多可显示的个数(Math.ceil(totalItem/pageSize)) 可不传
            datasets: [],
            name: '', // 筛选时的场地名称
            phone: '', // 筛选时的电话号码
            reqName: '', // 要post出去的场地名称
            reqPhone: '' // 要post出去的电话
        };
    }
    // 点击“新增教练”按钮-》跳转
    clickHandler = (e) => {
        this.props.router.push('/coach/create');
    }
    // 当组件挂载时先获取第一页的数据, 并绑定第一页按钮的click事件
    componentWillMount(){
        this._isMounted = true;
        const that = this;
        this.getAllCoachs(function(){
            const allDeleteBtn = document.querySelectorAll('.delete-coach-btn');
            allDeleteBtn.forEach(item => {
                item.addEventListener('click', that.deleteCoachHandler, false);
            });
        });
    }
    // 当组件卸载时要清楚所有时间监听器
    componentWillUnmount() {
        this._isMounted = false;
        const that = this;
        const allDeleteBtn = document.querySelectorAll('.delete-coach-btn'); 
        allDeleteBtn.forEach(item => {
            item.removeEventListener('click', that.deleteCoachHandler, false);
        });
    }
    // 包装一层是为了在组件摧毁时，能解绑事件
    deleteCoachHandler = (e) => {
        const that = this;
        Sweetalert.confirm({
            confirmType: 'danger',
            confirmText: '删除',
            content: '确认删除吗？',
            title: '请确认',
            onConfirm: function(){
                that.clickHander(e, that);
            }
        });
    }
    // 删除场馆的事件函数
    clickHander(e, that){
        let isTheFirstInLastPage = that.state.current !== 1 && that.state.current === Math.ceil(that.state.totalItem / that.state.pageSize) && that.state.totalItem === (that.state.current - 1) * that.state.pageSize + 1 && e.target.dataset.first === '1'; // 是否是最后一页剩下的最后一条
        if(isTheFirstInLastPage === true){ // 如果是最后一页剩下的最后一条，那么请求“前一页的数据”
            //alert('我是最后一页剩下的最后一条！');  
            deleteCoach({
                id: e.target.dataset.id
            }).then(function(res){                         // 先删除点击时的数据，然后设置当前页到前一页，再重新请求列表数据
                if(res.data.code === 0){
                    that.setState({
                        current: that.state.current - 1
                    }, function(){
                        that.getAllCoachs(function(){
                            const allDeleteBtn = document.querySelectorAll('.delete-coach-btn'); // 需要重新绑定删除按钮的click事件
                            allDeleteBtn.forEach(item => {
                                item.removeEventListener('click', that.deleteCoachHandler, false);
                                item.addEventListener('click', that.deleteCoachHandler, false);
                            });
                        });
                    });
                }
            }, function(){
                Notify.error('删除场馆失败！');
            });
        }else{
            deleteCoach({
                id: e.target.dataset.id
            }).then(function(res){                         // 删除后需要根据当前页码重新请求
                if(res.data.code === 0){
                    that.getAllCoachs(function(){
                        Notify.success('删除场馆成功!');
                    });
                }
            }, function(){
                Notify.error('删除场馆失败！');
            });
        }
    }
    // 点击某页会触发
    onChange(data) {
        const that = this;
        this.setState({  // this.setState是异步更新的
            current: data.current
        }, function(){
            that.getAllCoachs(function(){
                const allDeleteBtn = document.querySelectorAll('.delete-coach-btn');
                if(allDeleteBtn.length !== 0){
                    allDeleteBtn.forEach(item => {
                        item.removeEventListener('click', that.deleteCoachHandler, false);
                        item.addEventListener('click', that.deleteCoachHandler, false);
                    });
                }
            });
        });
    }
    // 获取教练列表
    getAllCoachs(cb){
        const that = this;
        getCoachList({
            pageNumber: this.state.current - 1,
            pageSize: this.state.pageSize,
            nameKey: this.state.reqName,
            phoneKey: this.state.reqPhone
        }).then(function(res){
            if(res.data.code === 0 && that._isMounted === true){
                const list = res.data.data.list; // 所有教练信息
                let total = res.data.data.total; // 总个数
                const all = list.map((item, index) => {
                    return {
                        order: index + 1,
                        id: item.id,
                        name: item.name,
                        level: item.level,
                        header: item.header,
                        privateCoachingPrice: f2y(item.privateCoachingPrice),
                        coachingDate: item.coachingDate,
                        gender: item.gender,
                        privateTime: item.privateTime,
                        phone: item.phone,
                        venues: item.venues == null ? [] : item.venues.map(item => item.name)
                    };
                });
                that.setState({
                    datasets: all,
                    totalItem: total
                }, function(){
                    cb && cb();
                });
            }
        }, function(err){
            if(err){
                alert('网络错误！');
            }
        });
    }
    // 点击筛选时，请求需要携带上当前输入框里面的name值和phone值,
    searchHandler(){
        const that = this;
        this.setState({
            reqName: this.state.name.trim(),
            reqPhone: this.state.phone.trim(),
            current: 1
        }, function(){
            that.getAllCoachs();
        });
    }
    // 表单的onChange函数
    nameChange(e){
        this.setState({
            name: e.target.value
        });
    }
    phoneChange(e){
        this.setState({
            phone: e.target.value
        });
    }
    render(){
        return (
            <div>
                <div className="filter">
                    <div className="search-wrapper">
                            <div className="place">
                            <SearchInput
                                placeholder="请输入教练姓名"
                                value={ this.state.name }
                                onChange={ this.nameChange.bind(this) }
                            />
                        </div>
                        <div className="phone">
                            <SearchInput
                                placeholder="请输入教练联系方式"
                                value={ this.state.phone }
                                onChange={ this.phoneChange.bind(this) }
                            />
                        </div> 
                        <Button className="search-btn" onClick={ this.searchHandler.bind(this) } type="primary" outline >筛选</Button>
                    </div>
                    <div className="btn-wrapper">
                        <Button type="primary" onClick={ this.clickHandler }>新增教练</Button>
                    </div>
                </div>
                <Table
                    columns={ this.columns }
                    datasets={ this.state.datasets }
                    rowKey="item_id"
                    onChange={ this.onChange.bind(this) }
                    pageInfo={{
                        limit: this.state.limit,
                        current: this.state.current,
                        maxPageToShow: this.state.maxPageToShow,
                        totalItem: this.state.totalItem,
                        pageSize: this.state.pageSize
                    }}
                    emptyLabel={ (this.state.reqName !== '' || this.state.reqPhone !== '') === true ? "搜索不到结果" : "一个教练都没有，快去添加吧" }
                />
            </div>
        )
    }
}

export default ShowAllCoachs;