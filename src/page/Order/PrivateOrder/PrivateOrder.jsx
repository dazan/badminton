import React from 'react';
import { SearchInput, Table, Button, Select, DatePicker } from 'zent';
import { getAllTeamOrder } from '../../../api/privateOrder.js';
import moment from 'moment';
// import './style.css';

const columns = [
    {
        title: '序号',
        name: 'order'
    }, {
    title: '订单ID',
    name: 'id',
    }, {
        title: '订单号',
        name: 'orderId',
    }, {
        title: '订单状态',
        name: 'status',
    },
     {
        title: '教练名称',
        name: 'coachName',
    }, {
        title: '培训场馆',
        name: 'venueName'
    }, {
        title: '上课时间',
        name: 'beginTime',
        bodyRender: (data) => {
            return (
                <span>
                    {
                        moment(data.beginTime).format('YYYY-MM-DD hh:mm:ss')
                    }
                </span>
            );
        }
    }, 
    {
        title: '购买数量',
        name: 'count'
    }, {
        title: '购买时间',
        name: 'orderTime',
        bodyRender: (data) => {
            return (
                <span>
                    {
                        moment(data.orderTime).format('YYYY-MM-DD hh:mm:ss')
                    }
                </span>
            );
        }
    }, {
        title: '支付价格',
        name: 'totalFee'
    }, {
        title: '支付方式',
        name: 'payment'
    }
];

class PrivateOrder extends React.Component {
    constructor(props, context){
        super(props, context);
        this.state = {
            totalItem: 0, // 总条目个数（发请求得来）
            pageSize: 10,  // 每页个数(自己规定)
            current: 1, // 当前页码(每次点击需更新)
            //maxPageToShow: 25, 最多可显示的个数(Math.ceil(totalItem/pageSize)) 可不传
            datasets: [],
            orderId: '',  // 订单号
            reqOrderId: '', 
            coachNameKey: '',  // 教练名
            reqCoachNameKey: '',
            customerNameKey: '',  // 用户名
            reqCustomerNameKey: '',
            customerPhoneKey: '', //用户手机号
            reqCustomerPhoneKey: '',
            status: '',  //订单状态
            statusData: [
                { value: '5', text: '所有' },
                { value: '0', text: '未支付' },
                { value: '1', text: '已支付' },
                { value: '2', text: '已支付申请退款' },
                { value: '3', text: '已支付同意申请退款' },
                { value: '4', text: '退款中' }
            ],
            reqStatus: '',
            payBeginDate: '', // 购买开始时间
            reqPayBeginDate: '', 
            payEndDate: '',  // 购买结束时间
            reqPayEndDate: '',
            
        };
    }
    // 状态 0:未支付;1:已支付;2:已支付申请退款;3:已支付同意申请退款;4:退款中;

    // 当组件挂载时先获取第一页的数据, 并绑定第一页按钮的click事件
    componentWillMount(){
        this._isMounted = true;
        this.getAllOrder();
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    getAllOrder(cb){
        const that = this;
        getAllTeamOrder({                       
            pageNumber: this.state.current - 1,
            pageSize: this.state.pageSize,
            orderId: this.state.reqOrderId,
            // courseNameKey: this.state.reqCourseNameKey,
            coachNameKey: this.state.reqCoachNameKey,
            customerNameKey: this.state.reqCustomerNameKey,
            customerPhoneKey: this.state.reqCustomerPhoneKey,
            status: this.state.reqStatus,
            payBeginDate: this.state.reqPayBeginDate,
            payEndDate: this.state.reqPayEndDate
        }).then(function(res){
            if(res.data.code === 0 && that._isMounted === true){
                const list = res.data.data.list;
                let total = res.data.data.total;
                const all = list.map((item, index) => {
                    return {
                        order: index + 1,
                        id: item.id,
                        orderId: item.orderId,
                        status: item.status,
                        coachName: item.items[0].info && item.items[0].info.coachName && item.items[0].info.coachName,
                        beginTime: item.items[0].info && item.items[0].info.beginTime && item.items[0].info.beginTime,
                        venueName: item.items[0].info && item.items[0].info.venueName && item.items[0].info.venueName,
                        //groupCourseName: item.items[0].info.groupCourseName && item.items[0].info.groupCourseName,
                        count: item.items[0].count && item.items[0].count,
                        orderTime: item.orderTime,
                        totalFee: item.totalFee,
                        payment: item.payment
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
        this.setState({  // this.setState是异步更新的
            current: data.current
        }, function(){
            this.getAllOrder();
        });
    }
    // 点击筛选时，请求需要携带上当前输入框里面的值
    searchHandler(){
        const that = this;
        let status = ''; // 选择所有
        this.setState({
            reqOrderId: this.state.orderId.trim(),
            reqCoachNameKey: this.state.coachNameKey.trim(),
            reqCustomerNameKey: this.state.customerNameKey.trim(),
            reqCustomerPhoneKey: this.state.customerPhoneKey.trim(),
            reqStatus: this.state.status === '5' ? status : this.state.status,
            reqPayBeginDate: this.state.payBeginDate,
            reqPayEndDate: this.state.payEndDate,
            current: 1
        }, function(){
            that.getAllOrder();
        });
    }
    // 统一处理表单的onChange函数
    handleChange(name, e){
        var data = {};
        data[name] = e.target.value;
        this.setState(data);
    }
    dateHandleChange(name, v){
        const data = {};
        data[name] = v;
        this.setState(data);
    }
    render(){
        return (
            <div className="team-order">
                <div className="team-order-filter">
                        <div className="top">
                            <SearchInput
                                placeholder="请输入订单号"
                                value={ this.state.orderId }
                                onChange={ (e) => this.handleChange('orderId', e) }
                                className="top-input"
                            />
                            <SearchInput
                                placeholder="请输入教练名"
                                value={ this.state.coachNameKey }
                                onChange={ (e) => this.handleChange('coachNameKey', e) }
                                className="top-input"
                            />
                            <SearchInput
                                placeholder="请输入用户名"
                                value={ this.state.customerNameKey }
                                onChange={ (e) => this.handleChange('customerNameKey', e) }
                                className="top-input"
                            />
                            <SearchInput
                                placeholder="请输入用户手机号"
                                value={ this.state.customerPhoneKey }
                                onChange={ (e) => this.handleChange('customerPhoneKey', e) }
                                className="top-input"
                            />
                        </div>
                        <div className="bottom">
                            <Select
                                placeholder="请选择订单状态"
                                data={ this.state.statusData }
                                onChange={ (e) => this.handleChange('status', e) }
                                value={this.state.status } 
                                className="bottom-input"
                            />
                            <DatePicker
                                className="bottom-input"
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                value={ this.state.payBeginDate }
                                valueType="number"
                                onChange={ (v) => this.dateHandleChange('payBeginDate', v) }
                                placeholder="购买开始时间"
                            />
                            <DatePicker
                                className="bottom-input"
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                value={ this.state.payEndDate }
                                valueType="number"
                                onChange={ (v) => this.dateHandleChange('payEndDate', v) }
                                placeholder="购买结束时间"
                            />
                            <Button className="search-btn" onClick={ this.searchHandler.bind(this) }>筛选</Button>
                         </div>
                </div>
                <Table
                    columns={columns}
                    datasets={ this.state.datasets }
                    rowKey="item_id"
                    onChange={this.onChange.bind(this)}
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

export default PrivateOrder;