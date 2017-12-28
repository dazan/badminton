import React from 'react';
import { Icon } from 'zent';
// 按需加载ant-design的timepiack组件
import TimePicker from 'antd/lib/time-picker';
import 'antd/lib/time-picker/style/css'; // 或者 antd/lib/button/style/css 加载 css 文件
import Message from 'antd/lib/message';
import 'antd/lib/message/style/css';
import moment from 'moment';
import cs from 'classnames';
import './style.css';

class DateLi extends React.Component {
    constructor(props, context){
        super(props);
        this.state = {
            leftShow: false,  // 让timepicker显示或隐藏
            rightShow: false,
            leftTime: moment(),  // 保存左边的时间值
            rightTime: moment(),  // 保存右边的时间值
            leftShowTime: '', // 用于展示的时间
            rightShowTime: '',
            deleteBtn: true,  // 控制删除的btn的显示和隐藏
            status: 'view', // 当前状态 edit/view
            leftEdit: true
        };
    }
    componentWillMount = () => {
      this.setState({
          leftShowTime: this.props.date.beginTime == null ? '' : this.props.date.beginTime,
          rightShowTime: this.props.date.endTime == null ? '' : this.props.date.endTime 
      });
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            leftShowTime: nextProps.date.beginTime == null ? '' : nextProps.date.beginTime,
            rightShowTime: nextProps.date.endTime == null ? '' : nextProps.date.endTime 
        });
    }
    
    // 不能同时显示两个timepicker
    // 点击左边的时间
    leftTimeClick(){
        this.setState({
            leftShow: !this.state.leftShow,
            rightShow: false,
            status: 'edit',
            deleteBtn: true
        })
    }
    // 点击右边的时间
    rightTimeClick(){   
        this.setState({
            rightShow: !this.state.rightShow,
            leftShow: false,
            status: 'edit',
            deleteBtn: true
        });
    }
    // 选择时间触发onchange
    leftTimeChange(time, timeString){
        this.setState({
            leftTime: time
        });
    }
    rightTimeChange(time, timeString){
        this.setState({
            rightTime: time
        });
    }
    // 鼠标点击其他区域隐藏timepicker
    leftTimeClose(open){
        if(!open){
            this.setState({
                leftShow: false,
                leftShowTime: this.getTimeByMoment(this.state.leftTime)
            });
        }
    }
    rightTimeClose(open){
        if(!open){
            this.setState({
                rightShow: false,
                rightShowTime: this.getTimeByMoment(this.state.rightTime)
            });
        }
    }
    // 调用moment对象的方法，返回'01:30'
    getTimeByMoment(m){
        let hoursStr = '0' + m.hours(),
            midStr = '0' + m.minutes();
        return hoursStr.substr(hoursStr.length - 2) + ':' + midStr.substr(midStr.length - 2);
    }
    // 让删除按钮显示或隐藏
    enterHandler(){
        if(this.state.status !== 'edit'){         // 非“编辑状态下”可切换
            this.setState({
                deleteBtn: false
            });
        }
    }
    leaveHandler(){
        if(this.state.status !== 'edit'){
            this.setState({
                deleteBtn: true
            });
        }
    }
    // 删除记录
    deleteHandler(){
        this.props.onDelete();
    }
    // 确认编辑----
    confirmHandler(){
        // 同步数据， 如果有一边没选时间，那么不同步
        if(this.state.leftShowTime !== '' && this.state.rightShowTime !== ''){
            let res = this.props.onConfirm({
                beginTime: this.state.leftShowTime,
                endTime: this.state.rightShowTime
            });
            if(res === false){
                Message.warning('时间重叠, 无法保存!');
            }else{
                this.setState({
                    leftShow: false,
                    rightShow: false,
                    status: 'view'
                });
            }
        }
    }
    // 关闭编辑
    closeHandler(){
        this.setState({
            leftShow: false,
            rightShow: false,
            status: 'view'
        });

    }
    // 反正左右的时间大小颠倒
    // 如果左边时间为空，那么右边时间无限制
    disabledRightHours(){
        if(this.state.leftShowTime !== ''){
            let leftHours = window.parseInt(this.state.leftShowTime.split(':')[0]);
            return this.range(0, leftHours);
        }else{
            return [];
        }
    }
    disabledRightMinutes(h){
        if(this.state.leftShowTime !== ''){
            let arr = this.state.leftShowTime.split(':'),
                leftHours = window.parseInt(arr[0]),
                leftMid = window.parseInt(arr[1]);
            if(h === leftHours){
                return this.range(0, leftMid + 1);
            }else{
                return [];
            }
        }else{
            return [];
        }
    }
    disabledLeftHours(){
        if(this.state.rightShowTime !== ''){
            let rightHours = window.parseInt(this.state.rightShowTime.split(':')[0]);
            return this.range(rightHours + 1, 60);
        }else{
            return [];
        }
    }
    disabledLeftMinutes(h){
        if(this.state.rightShowTime !== ''){
            let arr = this.state.rightShowTime.split(':'),
                rightHours = window.parseInt(arr[0]),
                rightMid = window.parseInt(arr[1]);
            if(h === rightHours){
                return this.range(rightMid, 60);
            }else{
                return [];
            }
        }else{
            return [];
        }
    }
    range(start, end) {
        const result = [];
        for (let i = start; i < end; i++) {
          result.push(i);
        }
        return result;
    }
    render(){
        return (
            <li className="date-li">
                <div className="date-wrapper"
                    onMouseEnter={ this.enterHandler.bind(this) }
                    onMouseLeave={ this.leaveHandler.bind(this) }    
                >
                    {/* 左边的时间 */}
                    <div className="time-left">
                        <span
                            className={
                                cs({
                                    'time-show': true,
                                    'time-edit': this.state.leftShow
                                })
                            }
                            onClick={ this.leftTimeClick.bind(this) }
                        >
                            { this.state.leftShowTime === '' ? '请选择开始时间' : this.state.leftShowTime }
                        </span>
                        <div className="time-picker" style={{ display: this.state.leftShow === true ? 'block' : 'none' }}>
                            <TimePicker 
                                format="HH:mm" 
                                size="small" 
                                value={ this.state.leftTime }
                                onChange={ this.leftTimeChange.bind(this) }
                                getPopupContainer={ (t) => { return t.parentNode }}
                                onOpenChange={ (open) => { this.leftTimeClose(open)} }
                                disabledHours={ this.disabledLeftHours.bind(this) }
                                disabledMinutes={ (h) => { return this.disabledLeftMinutes(h) } }
                                hideDisabledOptions
                            />
                        </div>
                    </div>

                    <span className="time-mid">-</span>

                    {/* 右边的时间 */}
                    <div className="time-right">
                        <span 
                            className={
                                cs({
                                    'time-show': true,
                                    'time-edit': this.state.rightShow
                                })
                            }  
                            onClick={ this.rightTimeClick.bind(this) }
                        >
                            { this.state.rightShowTime === '' ? '请选择结束时间' : this.state.rightShowTime }
                        </span>
                        <div className="time-picker" style={{ display: this.state.rightShow === true ? 'block' : 'none' }}>
                            <TimePicker 
                                format="HH:mm" 
                                size="small" 
                                value={ this.state.rightTime }
                                onChange={ this.rightTimeChange.bind(this) }
                                getPopupContainer={ (t) => { return t.parentNode }}
                                onOpenChange={ (open) => { this.rightTimeClose(open)} }
                                disabledHours={ this.disabledRightHours.bind(this) }
                                disabledMinutes={ (h) => { return this.disabledRightMinutes(h) } }
                                hideDisabledOptions
                            />
                        </div>
                    </div>

                    {/* 按钮 */}
                    <Icon 
                        type="close-circle-o" 
                        className={ cs({
                            'delete-btn' : true,
                            'delete-btn-hidden' : this.state.deleteBtn
                        })}
                        onClick={ this.deleteHandler.bind(this) }
                    />

                    <div className="time-btn" style={{ display: this.state.status === 'edit' ? 'inline-block' : 'none' }}>
                        <Icon type="check" onClick={ this.confirmHandler.bind(this) }/>
                        &nbsp;&nbsp;
                        <Icon type="close" onClick={ this.closeHandler.bind(this) }/>
                    </div>

                </div>
            </li>
        );
    }
}

export default DateLi;