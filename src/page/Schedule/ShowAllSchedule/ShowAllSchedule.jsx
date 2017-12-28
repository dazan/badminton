import React from 'react';
import { Button, Select, Table, SearchInput } from 'zent';
import moment from 'moment';
// schedule api
import { getCoachTimeList } from '../../../api/schedule.js';
import { browserHistory } from 'react-router';
import './style.css';

// 毫秒---> '17:00'
function getDetailTime(t){
    let h = '00' + Math.floor(t / 1000 / 3600);
    let m = '00' + Math.floor((t / 1000 - h * 3600 ) / 60);
    return h.substr(h.length - 2) + ':' +  m.substr(m.length - 2);
}

let Now = null;


class ShowAllSchedule extends React.Component {
    constructor(props, context){
        super(props);
        this.state = {
            totalItem: 0, // 总条目个数（发请求得来）
            pageSize: 10,  // 每页个数(自己规定)
            current: 1, // 当前页码(每次点击需更新)
            //maxPageToShow: 25, 最多可显示的个数(Math.ceil(totalItem/pageSize)) 可不传
            datasets: [],
            columns: null,
            weekSelectData: [], // 所有周
            weekSelect: null,  // 选择的周
            now: null, // 当前时间的moment对象
            name: '', // 筛选时的场地名称
            phone: '', // 筛选时的电话号码
            reqName: '', // 要post出去的场地名称
            reqPhone: '', // 要post出去的电话
        };
    }
    getAllCoachTime(cb){
        const that = this;
        getCoachTimeList({                             // 拿到当前state中的pageNumber和pageSize
            pageNumber: this.state.current - 1,
            pageSize: this.state.pageSize,
            //nameKey: this.state.reqName,
            //phoneKey: this.state.reqPhone
        }).then(function(res){
            if(res.data.code === 0 && that._isMounted === true){
                const list = res.data.data.list;
                let total = res.data.data.total;
                let result = list.map(item => {
                    const dateList = item.items;
                    const date = [];
                    for(let i = 0; i < dateList.length; i++){
                        let child = dateList[i];
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
                    return {
                       id: item.coachId,
                       name: item.coach && item.coach.name,
                       mon: date[2] || [],
                       tue: date[3] || [],
                       web: date[4] || [],
                       thu: date[5] || [],
                       fri: date[6] || [],
                       sat: date[7] || [],
                       sun: date[1] || []
                    }
                });
                that.setState({
                    totalItem: total,
                    datasets: result
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
            this.getAllCoachTime();
        });
    }
    // 初始化select
    componentWillMount(){
        Now = moment();
        Now.startOf('isoweek');
        this._isMounted = true;
        if(this._isMounted === true){
            this.setState({
                weekSelectData: this.initWeekSelectData(),
                weekSelect: Now.isoWeeks(),
            });
        }
        this.refreshColData(this.getWeekDate(Now.clone()));
        this.getAllCoachTime();
    }
    // 组件摧毁
    componentWillUnmount() {
        Now = null;
        this._isMounted = false;
        //Now = null;
    }
    // 注意moment的传递需要clone,不然可能会更改moment对象本身
    // 根据周数构造下拉框的数据
    initWeekSelectData(){
        let totalWeeks = Now.isoWeeksInYear(), // 一年总周数
                    res = [];
        for(let i = 1; i <= totalWeeks; i++){
            res.push({
                id: i,
                week: `第${ i }周`                
            });
        }
        return res;
    }
    // 更新col数据。 传入存储一周7天的对象。d的数据格式为: [{ day: '周一', date: '2017-10', name: 'mon' }]
    refreshColData(d){
        this.setState({
            columns: [
                {
                    title: '教练',
                    name: 'name',
                },
                {
                  title: <div><div>{ d[0].day }</div><div>{ d[0].date }</div></div>,
                  name: 'mon',
                  bodyRender: (data) => {
                      return (
                          <ul>
                              {
                                  data['mon'].map((item, index) => {
                                      return <li key={ index }>{ getDetailTime(item.beginTime) }-{ getDetailTime(item.endTime) }</li>
                                  })
                              }
                          </ul>
                      );
                  },
                  textAlign: 'center'
                }, 
                {
                    title: <div><div>{ d[1].day }</div><div>{ d[1].date }</div></div>,
                    name: 'tue',
                    bodyRender: (data) => {
                        return (
                            <ul>
                                {
                                    data['tue'].map((item, index) => {
                                        return <li key={ index }>{ getDetailTime(item.beginTime) }-{ getDetailTime(item.endTime) }</li>
                                    })
                                }
                            </ul>
                        );
                    },
                    textAlign: 'center'
                },
                {
                    title: <div><div>{ d[2].day }</div><div>{ d[2].date }</div></div>,
                    name: 'web',
                    bodyRender: (data) => {
                        return (
                            <ul>
                                {
                                    data['web'].map((item, index) => {
                                        return <li key={ index }>{ getDetailTime(item.beginTime) }-{ getDetailTime(item.endTime) }</li>
                                    })
                                }
                            </ul>
                        );
                    },
                    textAlign: 'center'
                }, 
                {
                    title: <div><div>{ d[3].day }</div><div>{ d[3].date }</div></div>,
                    name: 'thu',
                    bodyRender: (data) => {
                        return (
                            <ul>
                                {
                                    data['thu'].map((item, index) => {
                                        return <li key={ index }>{ getDetailTime(item.beginTime) }-{ getDetailTime(item.endTime) }</li>
                                    })
                                }
                            </ul>
                        );
                    },
                    textAlign: 'center'
                },
                {
                    title: <div><div>{ d[4].day }</div><div>{ d[4].date }</div></div>,
                    name: 'fri',
                    bodyRender: (data) => {
                        return (
                            <ul>
                                {
                                    data['fri'].map((item, index) => {
                                        return <li key={ index }>{ getDetailTime(item.beginTime) }-{ getDetailTime(item.endTime) }</li>
                                    })
                                }
                            </ul>
                        );
                    },
                    textAlign: 'center'
                },
                {
                    title: <div><div>{ d[5].day }</div><div>{ d[5].date }</div></div>,
                    name: 'sat',
                    bodyRender: (data) => {
                        return (
                            <ul>
                                {
                                    data['sat'].map((item, index) => {
                                        return <li key={ index }>{ getDetailTime(item.beginTime) }-{ getDetailTime(item.endTime) }</li>
                                    })
                                }
                            </ul>
                        );
                    },
                    textAlign: 'center'
                },
                {
                    title: <div><div>{ d[6].day }</div><div>{ d[6].date }</div></div>,
                    name: 'sun',
                    bodyRender: (data) => {
                        return (
                            <ul>
                                {
                                    data['sun'].map((item, index) => {
                                        return <li key={ index }>{ getDetailTime(item.beginTime) }-{ getDetailTime(item.endTime) }</li>
                                    })
                                }
                            </ul>
                        );
                    },
                    textAlign: 'center'
                },
                {
                    title: '操作',
                    bodyRender: (data, pos) => { 
                        const handleClick = () => {
                            browserHistory.push(`/schedule/edit/${ data.id }`);
                        };
                        return (
                            <div>
                                <Button type="primary" size="small" onClick={ handleClick }>排期</Button>
                            </div>
                        );
                    }
                }
            ]
        });
    }
    
    // 传入某一周的第一天, 返回这一周的所有日期
    getWeekDate(m){
        const week = ['周日','周一','周二','周三','周四','周五','周六'],
                  name = ['sun', 'mon', 'tue', 'web', 'thu', 'fri', 'sat'],
                    res = [{
                        day: week[m.day()],
                        date: `${ m.months() + 1 }-${ m.date() }`,
                        name: name[m.day()]
                    }];
            
            for(let i = 1; i <= 6; i++){
                m.add(1, 'day');
                res.push({
                    day: week[m.day()],
                    date: `${ m.months() + 1 }-${ m.date() }`,
                    name: name[m.day()]
                })
            }
            return res;
    }
    // 点击“上一周”, 当前moment对象减去一周,并更新下拉框，返回出现53周的情况
    preWeek(){
        Now.subtract(1, 'w');
        this.setState({
            weekSelectData: this.initWeekSelectData(),
            weekSelect: Now.isoWeeks(),
        });
        this.refreshColData(this.getWeekDate(Now.clone()));
    }
    // 点击“下一周”
    nextWeek(){
        Now.add(1, 'w');
        this.setState({
            weekSelectData: this.initWeekSelectData(),
            weekSelect: Now.isoWeeks()
        });
        this.refreshColData(this.getWeekDate(Now.clone()));
    }
    // 选择某一周
    selectWeekChange(e){
        Now.isoWeeks(e.target.value);
        this.setState({
            weekSelect: e.target.value
        });
        this.refreshColData(this.getWeekDate(Now.clone()));
    }
    // 选择教练
    selectCoachChange(e){  
    }
    searchHandler(){
        const that = this;
        this.setState({
            reqName: this.state.name.trim(),
            reqPhone: this.state.phone.trim(),
            current: 1
        }, function(){
            that.getAllCoachTime();
        });
    }
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
    createHandler(){
        browserHistory.push('/schedule/create');
    }
    render(){  
        return (
            <div>
                 <div className="filter">
                    <div className="search-wrapper">
                        <div className="card">
                            
                            <SearchInput
                                placeholder="请输入教练姓名"
                                value={ this.state.name }
                                onChange={ this.nameChange.bind(this) }
                                className="card-input"
                            />
                  
                            <SearchInput
                                placeholder="请输入教练联系方式"
                                value={ this.state.phone }
                                onChange={ this.phoneChange.bind(this) }
                                className="card-input"
                            />
              
                            <Button className="search-btn" onClick={ this.searchHandler.bind(this) } type="primary" outline >筛选</Button>
                        </div>
                        

                        <div className="week-select">
                            <Button type="primary" onClick={ this.preWeek.bind(this) }>上一周</Button>
                            <Select
                                data={ this.state.weekSelectData }
                                value={ this.state.weekSelect }
                                onChange={ this.selectWeekChange.bind(this) }
                                optionValue="id"
                                optionText="week"
                            /> 
                            <Button  type="primary" onClick={ this.nextWeek.bind(this) }>下一周</Button>
                        </div>
                    </div>
                    <Button type="primary" onClick={ this.createHandler.bind(this) } className="add-schedule">添加排期</Button>
        
                </div>

                <Table
                    columns={ this.state.columns }
                    datasets={ this.state.datasets }
                    rowKey="id"
                    pageInfo={{
                        current: this.state.current,
                        totalItem: this.state.totalItem,
                        pageSize: this.state.pageSize
                    }}
                    onChange={this.onChange.bind(this)}

                /> 

            </div>
        );
    }

}

export default ShowAllSchedule;