import React from 'react';
import { Icon, Button, Notify, Select } from 'zent';
import DateLi from './DateLi/DateLi';
import moment from 'moment';
import { getCoachTimeById, addCoachTime } from '../../../api/schedule.js';
import { getAllCoachMes } from '../../../api/coach.js';
import './style.css';
import { browserHistory } from 'react-router';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import Message from 'antd/lib/message';
import 'antd/lib/message/style/css';


// 毫秒---> '17:00'
function getDetailTime(t){
    let h = '00' + Math.floor(t / 1000 / 3600);
    let m = '00' + Math.floor((t / 1000 - h * 3600 ) / 60);
    return h.substr(h.length - 2) + ':' +  m.substr(m.length - 2);
}

class DateCard extends React.Component {
    constructor(props, context){
        super(props);
        this.state = {
            data: {
                '周一': [],
                '周二': [],
                '周三': [],
                '周四': [],
                '周五': [],
                '周六': [],
                '周日': []
            },
            coachSelectData: [],
            coachId: '',
            listAdd: [
                { name: '教练排期', to: '/schedule' },
                { name: '添加排期' }
            ],
            listEdit: [
                { name: '教练排期', to: '/schedule' },
                { name: '编辑' }
            ],
            showError: false,
            disabled: false
        };
    }
    addDateHandler(key){
        let d = this.state.data[key].slice(0);
        d.push({});
        this.setState({
            data: Object.assign({}, this.state.data, {
                [key]: d
            })
        });
    }
    // 删除记录
    deleteHandler(key, index){
        // 遗留问题，react对元素的复用问题，通过props解决
        //console.log('key' + key + ':' + 'index' + ':' + index);
        let d = this.state.data[key].slice(0);
        //console.log('old',d.slice(0));
        d.splice(index, 1);
        //console.log('new', d);
        this.setState({
            data: Object.assign({}, this.state.data, {
                [key]: d
            })
        });
    }
    // 确认编辑
    confirmHandler(key, index, data){
        let left = data.beginTime,
            right = data.endTime,
            d = this.state.data[key].slice(0);
        // 如果两边时间相等，直接返回false
        if(left === right){
            return false;
        }
        // 如果左边时间大于右边时间,返回false
        if(moment(`2017-10-20 ${ left }`, 'YYYY-MM-DD HH:mm').isAfter(moment(`2017-10-20 ${ right }`, 'YYYY-MM-DD HH:mm'))){
            return false;
        }
        if(d.length === 1){ // 第一次添加记录,无需判断时间的重叠
            d[index] = data;
            this.setState({
                data: Object.assign({}, this.state.data, {
                    [key]: d
                })
            });
            return true;
        }else{
            for(let i = 0; i < d.length; i++){
                let item = d[i];
                if(i === index){ //如果是本身，那么跳过
                    continue;
                }
                if(item.beginTime && item.endTime){
                    let begin = moment(`2017-10-20 ${ item.beginTime }`, 'YYYY-MM-DD HH:mm');
                    let end = moment(`2017-10-20 ${ item.endTime }`, 'YYYY-MM-DD HH:mm');
                    let leftTime = moment(`2017-10-20 ${ left }`, 'YYYY-MM-DD HH:mm');
                    let rightTime = moment(`2017-10-20 ${ right }`, 'YYYY-MM-DD HH:mm');
                    // 时间重叠了, 返回false，让子组件弹出提示框
                    if(leftTime.isBefore(begin) === true && rightTime.isBefore(begin) === true && leftTime.isBefore(rightTime)){
                        console.log('符合1');
                    }else if(leftTime.isAfter(end) === true && rightTime.isAfter(end) === true && leftTime.isBefore(rightTime)){
                        console.log('符合2');
                    }else if(leftTime.isSame(end) === true && rightTime.isSame(begin) === false){
                        console.log('符合3');
                    }else if(rightTime.isSame(begin) === true && leftTime.isSame(end) === false){
                        console.log('符合4');
                    }else{
                        return false;
                    }
                }
            }
            d[index] = data;
            this.setState({
                data: Object.assign({}, this.state.data, {
                    [key]: d
                })
            });
            return true;

        }
    }
    componentWillMount(){
        const that = this;
        this._isMounted = true;
        let id = this.props.params.id;
        if(id){
           //this.getCoachTime(id);
           //console.log(id);
           this.getAllCoach(() => {
                this.getCoachTime(id);
           });  
           this.setState({
               disabled: true
           });
        }else {
            this.getAllCoach();  
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    // 获取下拉列表的数据
    getAllCoach(cb){
        getAllCoachMes().then(res => {
            if(res.data.code === 0 && this._isMounted === true){
                this.setState({
                    coachSelectData: res.data.data.map(item => {
                        return {
                            value: item.id,
                            text: item.name
                        }
                    })
                }, () => {
                    cb && cb();
                });
            }
        }).catch(err => {
            if(err){
                alert('网络出错！');
            }
        });
    }
    // 根据id获取教练排期
    getCoachTime(id){
        getCoachTimeById({ id }).then(res => {
            if(res.data.code === 0 && this._isMounted === true){
                    const date = [];
                    let coachId = res.data.data.coachId;
                    for(let i = 0; i < res.data.data.items.length; i++){
                        let child = res.data.data.items[i];
                        if(date[child.dayOfWeek]){
                            date[child.dayOfWeek].push({
                                beginTime: child.beginTime,
                                endTime: child.endTime
                            });
                        }else{
                            date[child.dayOfWeek] = [];
                            date[child.dayOfWeek].push({
                                beginTime: child.beginTime,
                                endTime: child.endTime
                            });
                        }
                    }
                    this.setState({
                        data: {
                            '周一': date[2] ? date[2].map(item => {
                                return {
                                    beginTime: getDetailTime(item.beginTime),
                                    endTime: getDetailTime(item.endTime)
                                }
                            }) : [],
                            '周二': date[3] ? date[3].map(item => {
                                return {
                                    beginTime: getDetailTime(item.beginTime),
                                    endTime: getDetailTime(item.endTime)
                                }
                            }) : [],
                            '周三': date[4] ? date[4].map(item => {
                                return {
                                    beginTime: getDetailTime(item.beginTime),
                                    endTime: getDetailTime(item.endTime)
                                }
                            }) : [],
                            '周四': date[5] ? date[5].map(item => {
                                return {
                                    beginTime: getDetailTime(item.beginTime),
                                    endTime: getDetailTime(item.endTime)
                                }
                            }) : [],
                            '周五': date[6] ? date[6].map(item => {
                                return {
                                    beginTime: getDetailTime(item.beginTime),
                                    endTime: getDetailTime(item.endTime)
                                }
                            }) : [],
                            '周六': date[7] ? date[7].map(item => {
                                return {
                                    beginTime: getDetailTime(item.beginTime),
                                    endTime: getDetailTime(item.endTime)
                                }
                            }) : [],
                            '周日':  date[1] ? date[1].map(item => {
                                return {
                                    beginTime: getDetailTime(item.beginTime),
                                    endTime: getDetailTime(item.endTime)
                                }
                            }) : []
                        },
                        coachId
                    });         

             }
        }).catch(err => {
            if(err){
                alert('网络出错！');
            }
        });
    }
    submitHandler(){
        let id = this.props.params.id;
        // 此处可提取公共函数
        if(id){
            const items = [];
            for(let key in this.state.data){
                if(this.state.data[key].length > 0){
                    for(let i = 0; i < this.state.data[key].length; i++){
                        let dateObj = this.state.data[key][i];
                        if(dateObj.beginTime){
                            switch(key){
                                case '周一':
                                    items.push(filter(dateObj, 2))
                                    break;
                                case '周二':
                                    items.push(filter(dateObj, 3));
                                    break;
                                case '周三':
                                    items.push(filter(dateObj, 4));
                                    break;
                                case '周四':
                                    items.push(filter(dateObj, 5));
                                    break;
                                case '周五':
                                    items.push(filter(dateObj, 6));
                                    break;
                                case '周六':
                                    items.push(filter(dateObj, 7));
                                    break;
                                case '周日':
                                    items.push(filter(dateObj, 1));
                                    break;
                            }
                        }
                    }
                }
            }
            addCoachTime({
                coachId: id,
                items
            }).then(res => {
                if(res.data.code === 0){
                    browserHistory.push('/schedule');
                    Notify.success('添加排期成功！');
                }else{
                    Notify.error('添加失败，数据有误!');
                }
            }).catch(err => {
                if(err){
                    alert('网络出错！');
                }
            });
        }else{
            if(this.state.coachId !== ''){
                if(judge(this.state.data)){
                    const items = [];
                    for(let key in this.state.data){
                        if(this.state.data[key].length > 0){
                            for(let i = 0; i < this.state.data[key].length; i++){
                                let dateObj = this.state.data[key][i];
                                if(dateObj.beginTime){
                                    switch(key){
                                        case '周一':
                                            items.push(filter(dateObj, 2))
                                            break;
                                        case '周二':
                                            items.push(filter(dateObj, 3));
                                            break;
                                        case '周三':
                                            items.push(filter(dateObj, 4));
                                            break;
                                        case '周四':
                                            items.push(filter(dateObj, 5));
                                            break;
                                        case '周五':
                                            items.push(filter(dateObj, 6));
                                            break;
                                        case '周六':
                                            items.push(filter(dateObj, 7));
                                            break;
                                        case '周日':
                                            items.push(filter(dateObj, 1));
                                            break;
                                    }
                                }
                            }
                        }
                    }
                    addCoachTime({
                        coachId: this.state.coachId,
                        items
                    }).then(res => {
                        if(res.data.code === 0){
                            browserHistory.push('/schedule');
                            Notify.success('添加排期成功！');
                        }else{
                            Notify.error('添加失败，数据有误!');
                        }
                    }).catch(err => {
                        if(err){
                            alert('网络出错！');
                        }
                    });
                }else{
                    Message.error('请添加排期！');
                }
            }else{
                this.setState({
                    showError: true
                });
                Message.error('请选择教练！');
            }
        }
        function judge(data){
            for(let key in data){
                if(data[key].length > 0){
                    for(let i = 0; i < data[key].length; i++){
                        let obj = data[key][i];
                        if(obj.beginTime){
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        function filter(o, i){
            return {
                beginTime: strToTime(o.beginTime),
                endTime: strToTime(o.endTime),
                dayOfWeek: i
            }
        }
        function strToTime(timeStr){
            const arr = timeStr.split(':');
            let h = window.parseInt(arr[0]);
            let m = window.parseInt(arr[1]);
            return (h * 3600 + m * 60) * 1000;
        }
    }
    handlerChange(e){
        let id = e.target.value;
        this.setState({
            coachId: id,
            showError: false
        }, () => {
            // 选择下拉框的时候，需要去服务器再拉一次数据
            this.getCoachTime(id);
        });
    }
    render(){
        return (
            <div>
                <Breadcrumb breads={ this.props.params.id === undefined ? this.state.listAdd : this.state.listEdit }/>
                <div className="schedule-wrapper">
                    <div className="schedule-select">
                        <span>教练：</span>
                        <Select
                            data={ this.state.coachSelectData }
                            value={ this.state.coachId }
                            onChange={ (e) => { this.handlerChange(e) } }
                            disabled={ this.state.disabled }
                        /> 
                         {/* this.state.showError && <p className="zent-form__error-desc">请选择教练</p> */} 
                    </div>
                    {
                        Object.keys(this.state.data).map((key, index) => {
                            return (
                                <div className="schedule" key={ index }>
                                    <div className="schedule-top">
                                        <span className="time">{ key }</span>
                                        <Button className="plus-btn" onClick={ this.addDateHandler.bind(this, key) }>
                                            <Icon type="plus" className="plus-icon"/>
                                            添加
                                        </Button>
                                    </div>
                                    <div className="schedule-bottom">
                                        <ul className="date-list">
                                            {
                                                this.state.data[key].map((item, index) => {
                                                    return (
                                                        <DateLi 
                                                            key={ index } 
                                                            index={ index }
                                                            date={ item }
                                                            onDelete={ this.deleteHandler.bind(this, key, index) }
                                                            onConfirm={ this.confirmHandler.bind(this, key, index) }
                                                        />
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>                     
                                </div>
                            )
                        })
                    }
                    <div>
                        <Button type="primary" onClick={ this.submitHandler.bind(this) } className="schedule-submit">提交</Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default DateCard;