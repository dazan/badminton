import React from 'react';
import { Form, Button, Notify } from 'zent';
// 上传组件
import UploadField from '../../../../../components/UploadField/UploadField';
// 上传图片api
import { uploadFile } from '../../../../../api/upload.js';
// 添加场馆
//import { addVenue, getVenueMesById, updateVenue } from '../../../../../api/venue.js';
// 在组件外部使用导航
import { browserHistory } from 'react-router';
// 多选标签组件
import SelectField from '../../../../../components/SelectField/SelectField';
// “年-月”选择组件
//import MonthPickerField from '../../../../../components/MonthPickerField/MonthPickerField';
// 富文本组件
import UeditorField from '../../../../../components/UeditorField/UeditorField';
// 添加教练
import { getSelectMenuData } from '../../../../../api/coach.js';
// 传入"2017-10"的字符串，会把它专为"2017-10-1"的时间戳
//import { strToDate, dateToStr } from '../../../../../assets/js/formatDate.js';
// 人数限制组件
import NumberRangeField from '../../../../../components/NumberRangeField/NumberRangeField';
// 学员点评组件
import CommentField from '../../../../../components/CommentField/CommentField';
// 评论api
import { addComment, updateComment, deleteCommentById } from '../../../../../api/comment.js';
// 团课api
import { addTeamCourse, getTeamCourseById, updateTeamCourse } from '../../../../../api/teamCourse.js';
// 获取场馆列表
import { getVenues } from '../../../../../api/venue.js';
// import './style.css';

const { Field, FormInputField, createForm, FormSelectField, FormNumberInputField } = Form;

class CreateForm extends React.Component {
    constructor(props, context){
        super(props, context);
        this.state = {
            name: '', // 课程名称
            imageList: [],  // 存放课程照片
            listMaxAmount: "5",    // 限制课程照片最大数量
            courseScore: '' , // 课程分数
            coachScore: '', // 教练分
            details: '', // 课程介绍
            numberRange: {  // 人数限制
                min: "",
                max: ""
            },
            comments: [],
            venueIds: [], // 场馆id
            venueData: [], // 场馆列表数据
            coachIds: [],  // 教练id
            coachData: [] // 教练列表数据
        }
    }
    componentWillMount(){
        this._isMounted = true;
        const that = this;
        let id = this.props.id;
        if(id !== undefined){
            this.getSelectData(function(){
                getTeamCourseById({
                    id
                }).then(function(res){
                    if(res.data.code === 0 && that._isMounted === true){
                        let d = res.data.data;
                        let numberR = {
                            min: d.minCustomer.toString(),
                            max: d.maxCustomer.toString()
                        }
                        that.setState({
                            name: d.name,
                            imageList: d.images == null ? [] : d.images.slice(0).map(item => { item.src = item.url; return item; }),
                            courseScore: d.courseScore,
                            coachScore: d.coachScore,
                            details: d.details,
                            numberRange: numberR,
                            comments: d.comments == null ? [] : d.comments.slice(0),
                            coachId: d.coachId,
                            venueIds: d.venues == null ? [] : d.venues.map(item => item.id)
                        });
                    }
                }, function(){
                    alert('网络出错！');
                });
            });
        }else{
            // 获取场馆列表 && 获取教练列表
            this.getSelectData();
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    getSelectData(cb){
        // 获取场馆列表数据和教练列表数据
        const that = this;
        Promise.all([getVenues(), getSelectMenuData()]).then(res => {
            let venues = res[0].data.data,
                coachs = res[1].data.data;
                that.setState({
                    venueData: venues.map(item => {
                        return {
                            id: item.id,
                            name: item.name
                        }
                    }),
                    coachData: coachs.map(item => {
                        return {
                            id: item.id,
                            name: item.name
                        }
                    })
                });
                cb && cb();
        }, function(err){
            if(err){
                alert('网络出错！');
            }
        });
    }

    // 提交表单
    // [{ url: ''}]
    // [{ src: '', file: {}}]
    submit = (values, zentForm) => {
        //console.log('提交的数据', values);
        let id = this.props.id;
        if(id !== undefined){
            return new Promise((resolve, reject) => {
                let img = values.images;
                const oldImgs = [], // 老照片，是url
                      newImgs = []; // 新照片，是file对象
                img.forEach(item => {
                    if(item.file){
                        newImgs.push(item);
                    }else{
                        oldImgs.push(item);
                    }
                });
                uploadFile(newImgs.map(item => item.file), function(res){
                    img = oldImgs.concat(res.map(item => {
                        return {
                            url: item.data.access_url
                        }
                    }));
                    let pushData = {
                        id: window.parseInt(id),
                        name: values.name.trim(),
                        minCustomer: values.number.min,
                        maxCustomer: values.number.max,
                        details: values.details,
                        courseScore: values.courseScore,
                        coachScore: values.coachScore,
                        commentIds: values.comments.map(item => {
                            if(item.id){
                                return item.id;
                            }else{
                                return;
                            }
                        }),
                        images: img,
                        venueIds: values.venueIds,
                        coachId: values.coachId
                    }
                    //console.log('PUSHD', pushData);
                    updateTeamCourse(pushData).then(function(data){
                        if(data.data.code === 0){
                            browserHistory.push('/course/team');
                            resolve();
                            Notify.success('更新团课成功！');
                        }
                    }, function(err){
                        if(err){
                            reject();
                            Notify.error('网络出错,添加失败!');
                        }
                    });

                }, '/course'); 
            });
        }else{
            return new Promise((resolve, reject) => {
                uploadFile(values.images.map(item => item.file), function(result){
                    let pushData = {
                        name: values.name,
                        minCustomer: values.number.min,
                        maxCustomer: values.number.max,
                        details: values.details,
                        courseScore: values.courseScore,
                        coachScore: values.coachScore,
                        commentIds: values.comments.map(item => {
                            if(item.id){
                                return item.id;
                            }else{
                                return;
                            }
                        }),
                        images: result.map(item => {
                                        return {
                                            url: item.data.access_url
                                        }
                                }),
                        venueIds: values.venueIds,
                        coachId: values.coachId
                    }
                    //console.log('pushData', pushData);
                    addTeamCourse(pushData).then(function(res){
                        if(res.data.code === 0){
                            resolve();
                            browserHistory.push('/course/team');
                            Notify.success('添加团课成功！');
                        }
                    }, function(err){
                        if(err){
                            reject();
                            Notify.error('网络出错,添加失败!');
                        }
                    });
                }, '/course');
            });
        }
    }
    // 课程图片的删除与限制
    deleteImage(index){
        alert(index);
        const copyArr = this.state.imageList.slice(0);
        copyArr.splice(index, 1);
        this.setState({
            imageList: copyArr
        });
    }
    setImage(imgs){
        const allImage = this.state.imageList.slice(0);
        // 上传的图片超过规定的张数
        if(allImage.length < this.state.listMaxAmount){
            if(allImage.length + imgs.length <= this.state.listMaxAmount){
                this.setState({
                    imageList: allImage.concat(imgs.slice(0))
                });
            }else {
                let add = this.state.listMaxAmount - allImage.length;
                this.setState({
                    imageList: allImage.concat(imgs.slice(0, add))
                });
            }
        }else{}
    }
    // onChange函数
    nameChange(e){
        this.setState({
            name: e.target.value.trim()
        });
    }
    coachScoreChange(e){
        this.setState({
            coachScore: e.target.value
        });
    }
    courseScoreChange(e){
        this.setState({
            courseScore: e.target.value
        });
    }
    numberChange(v){
        this.setState({
            numberRange: v
        });
    }
    // 富文本
    detailsChange(v){
        this.setState({
            details: v
        });
    }
    // 富文本点击上传图片，需要将图片上传到cos,拿到src
    detailsImgHandler(file){
        return new Promise((resolve, reject) => {
            uploadFile([file], function(res){
                resolve(res[0].data.access_url);
            }, function(){}, '/coach');
        });
    }
    // 添加评论
    addComment(){
        this.setState({
            comments: this.state.comments.concat({})
        });
    }
    // 更新或创建评论
    updateComment(v, cb){
        let { index, data } = v;
        let id = this.state.comments[index].id;
        //const that = this;
        // 更新评论的函数
        const update = function (id){
            let newArr = this.state.comments.map((item, i) => {
                if(i === index){
                    return Object.assign({}, data, { id });
                }else{
                    return item;
                }
            });
            this.setState({
                comments: newArr
            });
        }.bind(this);
        // 评论post的数据格式
        // {
        //     "token": "string",
        //     "customerName": "string",
        //     "content": "string",
        //     "priority": 0
        //   }
        // 没有id,创建评论
        if(id === undefined){
            // 发送请求，拿到id, 然后update
            addComment(data).then(function(res){
                if(res.data.code === 0){
                    update(res.data.data.id);
                    //console.log(that.state.comments);
                    cb && cb();
                }
            })
           
        }else{ // 有id,更新评论
            //发送请求去更新
            updateComment(Object.assign({}, data, { id })).then(function(res){
                if(res.data.code === 0){
                    update(id);
                    //console.log(that.state.comments);
                    cb && cb();
                }
            });
        }
        
    }
    // 删除评论
    deleteComment(index){
        // 删除评论的函数
        const deleteFn = function(index){
            let newArr = this.state.comments.slice(0);
            newArr.splice(index, 1);
            this.setState({
                comments: newArr
            });
        }.bind(this);
        let id = this.state.comments[index].id;
        if(id !== undefined){
            // 有id, 发请求删除
            deleteCommentById({ id });
            //...
            deleteFn(index);
        }else{ // 没有id, 将index传给父组件让其删除数组中的第index项元素
            // 直接删除
            deleteFn(index);
        }
    }
    // 场馆onchange
    venueChange(e){
        this.setState({
            venueIds: this.state.venueIds.concat(e.target.value)
        });
    }
    venuesDelete(item){
        const newVenuesSelected = this.state.venueIds.filter(v => {
            return v !== item.value;
        });
        this.setState({
            venueIds: newVenuesSelected
        });
    }
    coachChange(v){
        this.setState({
            coachId: v
        });
    }
    render(){
        const { handleSubmit, zentForm } = this.props;
        const isSubmitting = zentForm.isSubmitting();
        return (
            
            <div className="create-coach">
                <Form horizontal onSubmit={ handleSubmit(this.submit) }>
                    <FormInputField
                        name="name"
                        type="text"
                        label="课程名称："
                        value={ this.state.name }
                        required
                        validations={ { required: true} }
                        validationErrors={ { required: '请输入课程名称' } }
                        onChange={ this.nameChange.bind(this) }
                    />
                    <Field
                        name="images"
                        label="课程照片："
                        component={ UploadField }
                        maxSize={ 8 * 1000 * 1000 }
                        triggerInline
                        required
                        validations={ { minLength: 1 } }
                        validationErrors={ { minLength: '至少上传一张图片' } }
                        value={ this.state.imageList }
                        maxAmount={ this.state.listMaxAmount }
                        deleteImage={ this.deleteImage.bind(this) }
                        setImage={ this.setImage.bind(this) }
                    />
                    
                    <Field
                        name="venueIds"
                        component={ SelectField }
                        label="场馆选择"
                        required
                        validations={ { minLength: 1 } }
                        validationErrors={ { minLength: '请至少选择一个场馆' } }
                        tags
                        optionValue="id"
                        optionText="name"
                        value={ this.state.venueIds }
                        data={ this.state.venueData }
                        onChange={ this.venueChange.bind(this) }
                        onDelete={ this.venuesDelete.bind(this) }
                    />
                    <FormSelectField
                        name="coachId"
                        label="教练选择"
                        value={ this.state.coachId }
                        data={ this.state.coachData }
                        optionValue="id"
                        optionText="name"
                        required
                        validations={{ required: true }}
                        validationErrors={{ required: '请选择教练' }}
                        onChange={ this.coachChange.bind(this) }
                    />

                    <Field
                        name="number"
                        value={ this.state.numberRange }
                        validations={{
                            validRange(values, value){
                                if(values.number.min < values.number.max){
                                    return true;
                                }else{
                                    return false;
                                }
                            }
                        }}
                        validationErrors={{ validRange: '请输入正确的人数范围' }}
                        component={ NumberRangeField } 
                        onChange={ this.numberChange.bind(this) }
                    />
                    
                    <Field
                        name="details"
                        label="课程介绍："
                        component={ UeditorField }
                        required
                        value={ this.state.details }
                        onChange={ this.detailsChange.bind(this) }
                        upLoadImage={ this.detailsImgHandler.bind(this) }
                        action={ this.props.id !== undefined ? 'edit' : 'create'}
                    />

                    <FormNumberInputField
                        name="coachScore"
                        label="教练评分："
                        showStepper
                        required
                        validations={{ required: true }}
                        validationErrors={{ required: '请输入教练评分' }}
                        min={0}
                        max={10}
                        decimal={1}
                        value={ this.state.coachScore }
                        onChange={ this.coachScoreChange.bind(this) }
                    />

                    <FormNumberInputField
                        name="courseScore"
                        label="课程评分："
                        showStepper
                        required
                        validations={{ required: true }}
                        validationErrors={{ required: '请输入课程评分' }}
                        min={0}
                        max={10}
                        decimal={1}
                        value={ this.state.courseScore }
                        onChange={ this.courseScoreChange.bind(this) }
                    />
                    
                    <Field
                        name="comments"
                        value={ this.state.comments }
                        component={ CommentField }          
                        addComment={ this.addComment.bind(this) }
                        updateComment={ this.updateComment.bind(this) }
                        deleteComment={ this.deleteComment.bind(this) }
                    />

                    <div className="zent-form__form-actions">
                        <Button type="primary" htmlType="submit" loading={ isSubmitting }>{ this.props.id === undefined ? '确定添加' : '保存' }</Button>
                    </div>
                </Form>


            </div>
        );
    }

}

export default createForm()(CreateForm);