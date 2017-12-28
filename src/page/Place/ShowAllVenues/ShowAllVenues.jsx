import React from 'react';
import { SearchInput, Table, Notify, Button, Sweetalert } from 'zent';
// venue api
import { getVenueList, deleteVenue } from '../../../api/venue.js';
// 在组件外部使用导航
import { browserHistory } from 'react-router';
// 图片预览组件
import PicShow from '../../../components/PicShow/PicShow';
import './style.css';

class ShowAllVenues extends React.Component {
    constructor(props, context){
        super(props, context);
        // 表头定义
        this.columns = [
            {
                title: '序号',
                name: 'order',
                textAlign: 'left'
            }, 
            {
                title: '场馆ID',
                name: 'id',
            }, 
            {
                title: '场馆名称',
                name: 'name'
            }, 
            {
                title: '场馆地址',
                name: 'address'
            }, 
            {
                title: '照片',
                bodyRender: (data) => {
                    let imgArr = data.images;
                    return <PicShow imgList={ imgArr }/>
                }
            }, 
            {
                title: '咨询电话',
                name: 'phone'
            }, 
            {
                title: '备注',
                name: 'remark'
            },
            {
                title: '操作',
                bodyRender: (data, pos, data2) => { 
                    const editVenue = () => {
                        browserHistory.push(`/place/edit/${ data.id }`);
                    };
                    return (
                        <div>
                            <Button onClick={ editVenue } type="primary" size="small" >编辑</Button>
                            {/* id 用来点击后获取场馆的id, first用来标记是否为第一条数据 */}
                            <Button data-id={ data.id } data-first={ pos.row === 0 ? 1 : 0 } className="delete-venue-btn" type="danger" size="small">删除</Button>
                        </div>
                    );
                }
            }
        ];
        // 组件内状态
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
    // 点击“新增场馆”按钮--->跳转
    clickHandler = (e) => {
        this.props.router.push('/place/create');
    }
    // 当组件挂载时先获取第一页的数据, 并绑定第一页按钮的click事件
    componentWillMount(){
        this._isMounted = true;
        const that = this;
        this.getAllVenue(function(){
            const allDeleteBtn = document.querySelectorAll('.delete-venue-btn'); // 为所有删除按钮绑定click事件
            allDeleteBtn.forEach(item => {
                item.addEventListener('click', that.deleteVenueHandler, false);
            });
        });
    }
    // 当组件卸载时，需要清除事件和全局变量，防止内存泄漏
    // 这里有一个优化点, this.allDeleteBtn = document.querySelectorAll('.delete-venue-btn');
    componentWillUnmount() {
        this._isMounted = false;
        const that = this;
        const allDeleteBtn = document.querySelectorAll('.delete-venue-btn'); 
        allDeleteBtn.forEach(item => {
            item.removeEventListener('click', that.deleteVenueHandler, false);
        });
        this.columns = null;
    }
    // 包装一层是为了在组件摧毁时，能解绑事件
    deleteVenueHandler = (e) => {
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
            deleteVenue({
                id: e.target.dataset.id
            }).then(function(res){                         // 先删除点击时的数据，然后设置当前页到前一页，再重新请求列表数据
                if(res.data.code === 0){
                that.setState({
                    current: that.state.current - 1
                }, function(){
                    that.getAllVenue(function(){
                    const allDeleteBtn = document.querySelectorAll('.delete-venue-btn'); // 需要重新绑定删除按钮的click事件
                    allDeleteBtn.forEach(item => {
                        item.removeEventListener('click', that.deleteVenueHandler, false);
                        item.addEventListener('click', that.deleteVenueHandler, false);
                    });
                    });
                });
                }
            }, function(){
                Notify.error('删除场馆失败！');
            });
        }else{
            deleteVenue({
                id: e.target.dataset.id
            }).then(function(res){                         // 删除后需要根据当前页码重新请求
                if(res.data.code === 0){
                that.getAllVenue(function(){
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
    getAllVenue(cb){
        const that = this;
        getVenueList({                             // 拿到当前state中的pageNumber和pageSize
            pageNumber: this.state.current - 1,
            pageSize: this.state.pageSize,
            nameKey: this.state.reqName,       // reqName,reqPhone刚进来是空字符串
            phoneKey: this.state.reqPhone
        }).then(function(res){
            if(res.data.code === 0 && that._isMounted === true){
                const list = res.data.data.list; // 所有场馆信息
                let total = res.data.data.total; // 总个数
                const all = list.map((item, index) => {
                    return {
                        order: index + 1,
                        id: item.id,
                        name: item.name,
                        address: `${item.province}${item.city}${item.area}${item.address}`, 
                        images: item.images == null ? [] : item.images.slice(0), // 避免没有图片images字段会报错
                        phone: item.phone,
                        remark: item.remark
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
                        item.removeEventListener('click', that.deleteVenueHandler, false);
                        item.addEventListener('click', that.deleteVenueHandler, false)
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
            that.getAllVenue(function(){
                const allDeleteBtn = document.querySelectorAll('.delete-venue-btn'); // 为所有删除按钮绑定click事件
                allDeleteBtn.forEach(item => {
                    item.addEventListener('click', that.deleteVenueHandler, false);
                });
            });
        });
    }
    // 筛选的onChange函数
    handleChange(name, e){
        const data = {};
        data[name] = e.target.value;
        this.setState(data);
    }
    render(){
        return (
            <div>
                <div className="filter">
                    <div className="search-wrapper">
                            <div className="place">
                            <SearchInput
                                placeholder="请输入场地名称"
                                value={ this.state.name }
                                onChange={ (e) => this.handleChange('name', e) }
                            />
                        </div>
                        <div className="phone">
                            <SearchInput
                                placeholder="请输入场馆咨询电话"
                                value={ this.state.phone }
                                onChange={ (e) => this.handleChange('phone', e) }
                            />
                        </div>
                        <Button className="search-btn" onClick={ this.searchHandler.bind(this) }>筛选</Button>
                    </div>
                    <div className="btn-wrapper">
                        <Button type="primary" onClick={ this.clickHandler }>新增场馆</Button>
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