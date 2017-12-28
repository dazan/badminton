import React from 'react';
import { Table, Notify, Button, Sweetalert } from 'zent';
// banner api
import { getBannerList, onlineBanner, deleteBanner } from '../../../api/banner.js';
// 在组件外部使用导航
import { browserHistory } from 'react-router';
import './style.css';
import moment from 'moment';
// 图片预览组件
import PicShow from '../../../components/PicShow/PicShow';


class OnlineButton extends React.Component {
    handleClick(){
        let { id, status, change } = this.props;
        // status 0下线， 1上线
        if(status === 0){
            change(id, 1);
        }else if(status === 1){
            change(id, 0)
        }
    }
    render(){
        return (
            <Button type="primary" size="small" onClick={ () => { this.handleClick() }}>上下线</Button>
        );
    }
}

class ShowAllVenues extends React.Component {
    constructor(props, context){
        super(props, context);
        // 表头定义
        this.columns = [
            {
                title: '序号',
                name: 'order'
            }, 
            {
                title: '标题名称',
                name: 'title',
            }, 
            {
                title: 'banner图片',
                name: 'image',
                bodyRender: (data) => { 
                    return <PicShow imgList={ data.image && [ data.image ]}/>
                }
            }, 
            {
                title: '跳转方式',
                name: 'redirectType',
                bodyRender: (data) => {
                    let redirect = null;
                    if(data.redirectType === 0){
                        redirect = '跳转到集体课';
                    }
                    return (
                        <span>{ redirect }</span>
                    );
                }
            }, 
            {
                title: '跳转参数',
                name: 'redirectParam',
                bodyRender: (data) => { 
                    let rId = data.redirectParam.id;
                    return (
                        <span>{ rId }</span>
                    );
                }
            }, 
            {
                title: '创建时间',
                name: 'createTime',
                bodyRender: (data) => {
                    return (
                        <span>
                            {
                                moment(data.createTime).format('YYYY-MM-DD hh:mm:ss')
                            }
                        </span>
                    );
                }
            },
            {
                title: '最后更新时间',
                name: 'updateTime',
                bodyRender: (data) => {
                    return (
                        <span>
                            {
                                moment(data.updateTime).format('YYYY-MM-DD hh:mm:ss')
                            }
                        </span>
                    );
                }
            },
            {
                title: '最后更新人',
                name: 'adminId'
            },
            {
                title: '是否上线',
                name: 'status',
                bodyRender: (data) => {
                    let online = null;
                    if(data.status === 1){
                        online = '已上线';
                    }else{
                        online = '已下线';
                    }
                    return (
                        <span>{ online }</span>
                    );
                }
            },
            {
                title: '权重',
                name: 'priority'
            },
            {
                title: '操作',
                bodyRender: (data, pos) => { 
                    const editVenue = () => {
                        browserHistory.push(`/setting/edit/${ data.id }`);
                    };
                    return (
                        <div>
                            <OnlineButton id={ data.id } status={ data.status } change={ (id, status) => { this.changeOnlineStatus(id, status); } }/>
                            <Button onClick={ editVenue } type="primary" size="small" >编辑</Button>
                            {/* id 用来点击后获取场馆的id, first用来标记是否为第一条数据 */}
                            <Button data-id={ data.id } data-first={ pos.row === 0 ? 1 : 0 } className="delete-banner-btn" type="danger" size="small">删除</Button>
                        </div>
                    );
                },
                width: '150px'
            }
        ];
        // 组件内状态
        this.state = {
            totalItem: 0, // 总条目个数（发请求得来）
            pageSize: 10,  // 每页个数(自己规定)
            current: 1, // 当前页码(每次点击需更新)
            //maxPageToShow: 25, 最多可显示的个数(Math.ceil(totalItem/pageSize)) 可不传
            datasets: []
        };
    }
    // 修改上线状态
    changeOnlineStatus(id, status){
        Sweetalert.confirm({
            content: <p>确认{ status === 1 ? '上线' : '下线'}吗?</p>,
            onConfirm: () => { this.comfirmHandler(id, status) },
            confirmText: '确定',
            cancelText: '取消'
        });
    }
    comfirmHandler(id, status){
        onlineBanner({
            id,
            online: status === 1 ? true : false
        }).then(res => {
            if(res.data.code === 0){
                const data = this.state.datasets.slice(0);
                data.forEach(item => {
                    if(item.id === id){
                        item.status = status;
                        if(status === 1){
                            Notify.success('上线成功!');
                        }else{
                            Notify.success('下线成功!');
                        }
                    }
                });
                this.setState({
                    datasets: data
                });
            }
        });
    }
    // 点击“新增场馆”按钮--->跳转
    clickHandler = (e) => {
        this.props.router.push('/setting/create');
    }
    // 当组件挂载时先获取第一页的数据, 并绑定第一页按钮的click事件
    componentWillMount(){
        this._isMounted = true;
        const that = this;
        this.getAllBanners(function(){
            const allDeleteBtn = document.querySelectorAll('.delete-banner-btn'); // 为所有删除按钮绑定click事件
            allDeleteBtn.forEach(item => {
                item.addEventListener('click', that.deleteBannerHandler, false);
            });
        });
    }
    // 当组件卸载时，需要清除事件和全局变量，防止内存泄漏
    // 这里有一个优化点, this.allDeleteBtn = document.querySelectorAll('.delete-banner-btn');
    componentWillUnmount() {
        this._isMounted = false;
        const that = this;
        const allDeleteBtn = document.querySelectorAll('.delete-banner-btn'); 
        allDeleteBtn.forEach(item => {
            item.removeEventListener('click', that.deleteBannerHandler, false);
        });
        this.columns = null;
    }
    // 包装一层是为了在组件摧毁时，能解绑事件
    deleteBannerHandler = (e) => {
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
            deleteBanner({
                id: e.target.dataset.id
            }).then(function(res){                         // 先删除点击时的数据，然后设置当前页到前一页，再重新请求列表数据
                if(res.data.code === 0){
                that.setState({
                    current: that.state.current - 1
                }, function(){
                    that.getAllBanners(function(){
                    const allDeleteBtn = document.querySelectorAll('.delete-banner-btn'); // 需要重新绑定删除按钮的click事件
                    allDeleteBtn.forEach(item => {
                        item.removeEventListener('click', that.deleteBannerHandler, false);
                        item.addEventListener('click', that.deleteBannerHandler, false);
                    });
                    });
                });
                }
            }, function(){
                Notify.error('删除场馆失败！');
            });
        }else{
            deleteBanner({
                id: e.target.dataset.id
            }).then(function(res){                         // 删除后需要根据当前页码重新请求
                if(res.data.code === 0){
                that.getAllBanners(function(){
                    Notify.success('删除场馆成功!');
                });
                }
            }, function(){
                Notify.error('删除场馆失败！');
            });
        }
    }
    /**
     * 获取所有场馆数据
     * 
     * @param {any} cb 为首页数据填充并渲染完成后的回调
     * @memberof Student
     */
    getAllBanners(cb){
        const that = this;
        getBannerList({
            pageNumber: this.state.current - 1,
            pageSize: this.state.pageSize
        }).then(function(res){
            if(res.data.code === 0 && that._isMounted === true){
                const list = res.data.data.list;
                let total = res.data.data.total;
                const all = list.map((item, index) => {
                    return {
                        order: index + 1,
                        id: item.id,
                        title: item.title,
                        image: item.image,
                        redirectType: item.redirectType,
                        redirectParam: item.redirectParam,
                        createTime: item.createTime,
                        status: item.status,
                        priority: item.priority,
                        adminId: item.adminId,
                        updateTime: item.updateTime
                    }
                });
                that.setState({
                    totalItem: total,
                    datasets: all
                }, function(){
                    cb && cb();
                });
            }
        }, function(err){
            alert('网络出现错误！');
        });
    }
    // 点击某页会触发
    onChange(data) {
        const that = this;
        this.setState({  // this.setState是异步更新的
            current: data.current
        }, function(){
            this.getAllVenue(function(){
                const allDeleteBtn = document.querySelectorAll('.delete-venue-btn');
                if(allDeleteBtn.length !== 0){
                    allDeleteBtn.forEach(item => {
                        item.removeEventListener('click', that.deleteBannerHandler, false);
                        item.addEventListener('click', that.deleteBannerHandler, false)
                    });
                }
            });
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
            that.getAllBanners();
        });
    }
    render(){
        return (
            <div>
                <div className="filter">
                    <div className="btn-wrapper">
                        <Button type="primary" onClick={ this.clickHandler }>添加</Button>
                    </div>
                </div>
                <Table
                    columns={ this.columns }
                    datasets={ this.state.datasets }
                    rowKey="id"
                    onChange={ this.onChange.bind(this) }
                    pageInfo={{
                        limit: this.state.limit,
                        current: this.state.current,
                        maxPageToShow: this.state.maxPageToShow,
                        totalItem: this.state.totalItem,
                        pageSize: this.state.pageSize
                    }}
                    emptyLabel={ (this.state.reqName !== '' || this.state.reqPhone !== '') === true ? "搜索不到结果" : "一个场馆都没有，快去发布一个吧" }
                />
            </div>
        )
    }
}

export default ShowAllVenues;