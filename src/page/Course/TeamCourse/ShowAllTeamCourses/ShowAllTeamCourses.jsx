import React from 'react';
import { SearchInput, Table, Notify, Button, Sweetalert } from 'zent';
// 团课 api
import { getAllTeamCourse, deleteTeamCourse } from '../../../../api/teamCourse.js';
// 在组件外部使用导航
import { browserHistory } from 'react-router';
// 图片预览组件
import PicShow from '../../../../components/PicShow/PicShow';

class ShowAllTeamCourses extends React.Component {
    constructor(props, context){
        super(props, context);
        // 表头声明
        this.columns = [
                {
                    title: '序号',
                    name: 'order'
                }, 
                {
                    title: '课程ID',
                    name: 'id'
                }, 
                {
                    title: '课程名称',
                    name: 'name'
                }, 
                {
                    title: '课程照片',
                    bodyRender: (data) => {
                        return <PicShow imgList={ data.images && data.images }/>
                    }
                }, 
                {
                    title: '人数限制',
                    name: 'customer'
                },
                // {
                //     title: '课程评价',
                //     name: 'courseScore'
                // }, 
                // {
                //     title: '学员点评',
                //     bodyRender: (data) => {
                //         let comments = data.comments;
                //         return (
                //             <div>
                //                 {
                //                     comments.map((item, index) => {
                //                         return <p key={ index }>{ item.name }:{ item.content }</p>
                //                     })
                //                 }
                //             </div>
                //         );
                //     },
                //     width: '200px'
                // },
                {
                    title: '操作',
                    bodyRender: (data, pos) => { 
                        const editTeamCourse = () => {
                            browserHistory.push(`/course/team/edit/${ data.id }`);
                        };
                        return (
                            <div>
                                <Button onClick={ editTeamCourse } type="primary" size="small" >编辑</Button>
                                {/* id 用来点击后获取场馆的id, first用来标记是否为第一条数据 */}
                                <Button data-id={ data.id } data-first={ pos.row === 0 ? 1 : 0 } className="delete-team-btn" type="danger" size="small">删除</Button>
                            </div>
                        );
                    },
                    width: '128px'
                }
            ];
        this.state = {
            totalItem: 0, // 总条目个数（发请求得来）
            pageSize: 10,  // 每页个数(自己规定)
            current: 1, // 当前页码(每次点击需更新)
            //maxPageToShow: 25, 最多可显示的个数(Math.ceil(totalItem/pageSize)) 可不传
            datasets: [],
            name: '', // 筛选时的课程名称
            reqName: '', // 要post出去的课程名称
        };
    }
    // 点击“新增课程”按钮-》跳转
    clickHandler = (e) => {
        this.props.router.push('/course/team/create');
    }
    // 当组件挂载时先获取第一页的数据, 并绑定第一页按钮的click事件
    componentWillMount(){
        this._isMounted = true;
        const that = this;
        this.getAllCourses(function(){
            const allDeleteBtn = document.querySelectorAll('.delete-team-btn');
            allDeleteBtn.forEach(item => {
                item.addEventListener('click', that.deleteTeamHandler, false);
            });
        });
    }
    // 当组件卸载时要清楚所有时间监听器
    componentWillUnmount() {
        this._isMounted = false;
        const that = this;
        const allDeleteBtn = document.querySelectorAll('.delete-team-btn'); 
        allDeleteBtn.forEach(item => {
            item.removeEventListener('click', that.deleteTeamHandler, false);
        });
    }
    // 包装一层是为了在组件摧毁时，能解绑事件
    deleteTeamHandler = (e) => {
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
            deleteTeamCourse({
                id: window.parseInt(e.target.dataset.id)
            }).then(function(res){                         // 先删除点击时的数据，然后设置当前页到前一页，再重新请求列表数据
                if(res.data.code === 0){
                    that.setState({
                        current: that.state.current - 1
                    }, function(){
                        that.getAllCourses(function(){
                            const allDeleteBtn = document.querySelectorAll('.delete-team-btn'); // 需要重新绑定删除按钮的click事件
                            allDeleteBtn.forEach(item => {
                                item.removeEventListener('click', that.deleteTeamHandler, false);
                                item.addEventListener('click', that.deleteTeamHandler, false);
                            });
                            Notify.success('删除团课成功!'); //
                        });
                    });
                }
            }, function(){
                Notify.error('删除团课失败！');
            });
        }else{
            deleteTeamCourse({
                id: window.parseInt(e.target.dataset.id)
            }).then(function(res){                         // 删除后需要根据当前页码重新请求
                if(res.data.code === 0){
                    that.getAllCourses(function(){
                        Notify.success('删除团课成功!');
                    });
                }
            }, function(){
                Notify.error('删除集体课失败！');
            });
        }
    }
    // 点击某页会触发
    onChange(data) {
        const that = this;
        this.setState({  // this.setState是异步更新的
            current: data.current
        }, function(){
            that.getAllCourses(function(){
                const allDeleteBtn = document.querySelectorAll('.delete-team-btn');
                if(allDeleteBtn.length !== 0){
                    allDeleteBtn.forEach(item => {
                        item.removeEventListener('click', that.deleteTeamHandler, false);
                        item.addEventListener('click', that.deleteTeamHandler, false);
                    });
                }
            });
        });
    }
    // 获取集体课列表
    getAllCourses(cb){
        const that = this;
        getAllTeamCourse({
            pageNumber: this.state.current - 1,
            pageSize: this.state.pageSize,
            nameKey: this.state.reqName,
            //id: this.state.reqId
        }).then(function(res){
            if(res.data.code === 0 && that._isMounted === true){
                const list = res.data.data.list; // 所有团课信息
                let total = res.data.data.total; // 总个数
                const all = list.map((item, index) => {
                    return {
                        order: index + 1,
                        id: item.id,
                        name: item.name,
                        images: item.images == null ? [] : item.images,//item.images,    // 课程照片
                        customer: `${ item.minCustomer }-${ item.maxCustomer }人`, // 人数限制
                        courseScore: item.courseScore,  // 课程评价（分数）
                        comments: item.comments == null ? [] : item.comments.map(item => { // 学员点评: 返回评论者和内容
                            return {
                                name: item.customerName,
                                content: item.content
                            }
                        })
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


    // 点击筛选时，请求需要携带上当前输入框里面的name值,
    searchHandler(){
        const that = this;
        this.setState({
            reqName: this.state.name.trim(),
            current: 1
        }, function(){
            that.getAllCourses();
        });
    }
    // 表单的onChange函数
    nameChange(e){
        this.setState({
            name: e.target.value
        });
    }
    render(){
        return (
            <div>
                <div className="filter">
                    <div className="search-wrapper">
                        <div className="place">
                            <SearchInput
                                placeholder="请输入课程名称"
                                value={ this.state.name }
                                onChange={ this.nameChange.bind(this) }
                            />
                        </div>
                        {/* <div className="phone">
                            <SearchInput
                                placeholder="请选择课时卡规格"
                                value={ this.state.phone }
                                onChange={ this.phoneChange.bind(this) }
                            />
                        </div> */}
                        {/* <div className="card">
                            <Select
                                data={ this.state.selectData }
                                value={ this.state.cardId }
                                onChange={ this.selectChange.bind(this) }
                                optionValue="id"
                                optionText="name"
                                searchPlaceholder="Search"
                                filter={ (item, keyword) => item.name.indexOf(keyword) > -1 }
                                placeholder="请选择课时卡规格"
                            />
                        </div> */}
                        <Button className="search-btn" onClick={ this.searchHandler.bind(this) } type="primary" outline >筛选</Button>
                    </div>
                    <div className="btn-wrapper">
                        <Button type="primary" onClick={ this.clickHandler }>新增团课</Button>
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

export default ShowAllTeamCourses;