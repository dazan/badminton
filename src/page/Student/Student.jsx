import React from 'react';
import TopMenu from '../../components/TopMenu/TopMenu';
import { Button, Table, SearchInput } from 'zent';
import { getStuList } from '../../api/student.js';
import './style.css';
// 图片预览组件
import PicShow from '../../components/PicShow/PicShow';


const columns = [
    {
        title: '序号',
        name: 'order'
    }, {
      title: '学员ID',
      name: 'id',
    }, {
      title: 'openid',
      name: 'wxOpenid'
    }, {
      title: '头像(地址)',
      name: 'header',
      bodyRender: (data) => {
         return <PicShow imgList={ data.header && [ { url: data.header } ] }/>
      }
    }, {
        title: '性别',
        name: 'gender'
    }, {
        title: '城市',
        name: 'city'
    }, {
        title: '姓名',
        name: 'name'
    }, {
        title: '联系方式',
        name: 'phone'
    }, {
        title: '生日',
        name: 'birthday'
    }, {
        title: '地址',
        name: 'area'
    }, {
        title: '注册时间',
        name: 'regtime'
    },
    // {
    //     title: '操作',
    //     bodyRender: () => { 
    //         return (
    //             <div>
    //                 <Button type="primary" size="small" >编辑</Button>
    //             </div>
    //         );
    //     }
    // }
];

class Student extends React.Component {
    constructor(props, context){
        super(props);
        this.state = {
            menu : [
                {
                    to: '/student',
                    txt: '学员管理'
                } 
            ],
            activeClass: 'active',
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
    // 当组件挂载时先获取第一页的数据, 并绑定第一页按钮的click事件
    componentWillMount(){
        this._isMounted = true;
        this.getAllStu();
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    getAllStu(cb){
        const that = this;
        getStuList({                             // 拿到当前state中的pageNumber和pageSize
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
                        wxOpenid: item.wxOpenid,
                        header: item.header,
                        gender: item.gender,
                        birthday: item.birthday,
                        city: item.city, 
                        area: `${item.province}/${item.city}/${item.area}/${item.address}`,
                        images: item.images == null ? [] : item.images.slice(0), // 避免没有图片images字段会报错
                        phone: '123123123',
                        regtime: item.regtime
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
            this.getAllStu();
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
    // 点击筛选时，请求需要携带上当前输入框里面的name值和phone值,
    searchHandler(){
        const that = this;
        this.setState({
            reqName: this.state.name.trim(),
            reqPhone: this.state.phone.trim(),
            current: 1
        }, function(){
            that.getAllStu();
        });
    }

    render(){  
        return (
            <div className="student">
                <TopMenu activeClass={ this.state.activeClass } menu={ this.state.menu }/>
                
                 <div className="filter">
                    <div className="search-wrapper">
                        <div className="place">
                            <SearchInput
                                placeholder="请输入姓名"
                                value={ this.state.name }
                                onChange={ this.nameChange.bind(this) }
                            />
                        </div>
                        <div className="phone">
                            <SearchInput
                                placeholder="请输入联系方式"
                                value={ this.state.phone }
                                onChange={ this.phoneChange.bind(this) }
                            />
                        </div>
                        <Button className="search-btn" onClick={ this.searchHandler.bind(this) }>筛选</Button>
                    </div>
                    {/* <div className="btn-wrapper">
                        <Button type="primary">新增学员</Button>
                    </div> */}
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
        );
    }

}

export default Student;
