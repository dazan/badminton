import React from 'react';
import { Form, Button, Notify, Radio } from 'zent';
// 上传组件
import UploadField from '../../../../components/UploadField/UploadField';
// 上传图片api
import { uploadFile } from '../../../../api/upload.js';
// 在组件外部使用导航
import { browserHistory } from 'react-router';
// 多选标签组件
import SelectField from '../../../../components/SelectField/SelectField';
// “年-月”选择组件
import MonthPickerField from '../../../../components/MonthPickerField/MonthPickerField';
// 富文本组件
import UeditorField from '../../../../components/UeditorField/UeditorField';
// 添加教练
import { addCoach, getCoachMesById, getSelectMenuData, updateCoach } from '../../../../api/coach.js';
// 传入"2017-10"的字符串，会把它专为"2017-10-1"的时间戳
import { strToDate, dateToStr } from '../../../../assets/js/formatDate.js';
// 元分互转
import { y2f, f2y } from '../../../../assets/js/formatPrice.js';

import './style.css';

const { Field, FormInputField, createForm, FormSelectField, FormRadioGroupField, FormNumberInputField } = Form;

class CreateForm extends React.Component {
    constructor(props, context){
        super(props, context);
        this.state = {
            coachName: '', // 教练名称
            header: [], // 存放教练头像, 头像张数为1
            headerMaxAmount: "1", // 必须是字符串格式，踩到坑了
            imageList: [],  // 存放教练照片
            listMaxAmount: "5",    // 限制教练照片最大数量
            level: "", // 教练级别
            levelData: [
                { value: 1, text: '普通' },
                { value: 2, text: '中等' },
                { value: 3, text: '高级' }
            ],
            coachingDate: 0, // 执教时间
            gender: '', // 教练性别123
            profile: '', // 个人简介
            phone: '', // 联系方式
            price: '', // 元/课时
            venuesSelected: [], // 可执教场馆
            venuesData: []
        }
    }
    componentWillMount(){
        this._isMounted = true;
        const that = this;
        let id = this.props.id;
        if(id !== undefined){
            getCoachMesById({
                id
            }).then(function(res){
                if(res.data.code === 0 && that._isMounted === true){
                    let mes = res.data.data;
                    that.setState({
                        coachName: mes.name, // 教练名称
                        level: mes.level, // 教练级别
                        coachingDate: dateToStr(mes.coachingDate), // 执教时间
                        gender: mes.gender === 'male' ? "1" : "2", // 教练性别, 后台已经处理为male/female，所以这里需要转为数字
                        phone: mes.phone, // 联系方式
                        price: f2y(mes.privateCoachingPrice), // 元/课时
                    }, function(){
                        setTimeout(function(){ // 为确保ueditor触发ready事件
                            that.setState({
                                profile: mes.profile,
                                header: [{src: mes.header}], // 存放教练头像, 头像张数为1
                                imageList: mes.images == null ? [] : mes.images.slice(0).map(item => { item.src = item.url; return item; }),  // 存放教练照片
                            });
                        }, 0);
                        that.getSelectMenu(function(){
                            that.setState({
                                venuesSelected: mes.venues.map(item => {
                                    return item.id;
                                })
                            })
                        });
                    });
                }
            }, function(){
                alert('网络出错！');
            });
        }else{
            that.getSelectMenu(); //获取下拉列表的数据
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    // 获取下拉列表的数据
    getSelectMenu(cb){
        const that = this;
        getSelectMenuData().then(function(res){
            if(res.data.code === 0){
                let arr  = res.data.data;
                arr = arr.map(item => {
                    return {
                        value: item.id,
                        text: item.name
                    }
                });
                that.setState({
                    venuesData: arr
                }, function(){
                    cb && cb();
                });
            }
        });
    }
    // 提交表单
    // [{ url: ''}]
    // [{ src: '', file: {}}]
    submit = (values, zentForm) => {
        let id = this.props.id;
        if(id !== undefined){
            /****************点击了“编辑” 叫来*************/
            return new Promise((resolve, reject) => {
                let headerImage = values.header;
                let coachImages = values.images;
                const oldImgs = [], // 老照片，是url
                      newImgs = []; // 新照片，是file对象
                coachImages.forEach(item => {
                    if(item.file){
                        newImgs.push(item);
                    }else{
                        oldImgs.push(item);
                    }
                });
                //console.log('price', values.privateCoachingPrice);
                uploadFile(newImgs.map(item => item.file), function(res){
                    coachImages = oldImgs.concat(res.map(item => {
                        return {
                            url: item.data.access_url
                        }
                    }));
                    uploadFile(headerImage[0].file ? [ headerImage[0].file ] : [], function(r){
                        headerImage = headerImage[0].file ? r[0].data.access_url : headerImage[0].src;
                        let pushData = {
                            id,
                            name: values.name.trim(),
                            level: values.level,
                            header: headerImage,
                            gender: window.parseInt(values.gender),
                            images: coachImages,
                            coachingDate: strToDate(values.coachingDate), // 将“2016-10”转为事件戳
                            venueIds: values.venues,
                            profile: values.profile,
                            phone: values.phone,
                            privateCoachingPrice: y2f(values.privateCoachingPrice),
                            privateCoachingUnit: "string" // 收费单位，暂时传为空
                        };
                        updateCoach(pushData).then(function(data){
                            if(data.data.code === 0){
                                browserHistory.push('/coach');
                                resolve();
                                Notify.success('更新教练成功！');
                            }
                        }, function(err){
                            if(err){
                                reject();
                                Notify.error('网络出错,添加失败!');
                            }
                        });
                    }, '/header');
                }, '/coach'); 
            });
        }else{
            /****************点击了“新增教练” 叫来*************/
            let headerImage = values.header;
            const coachImages = values.images;
            return new Promise((resolve, reject) => {
                uploadFile(headerImage.map(item => item.file), function(res){
                    headerImage = res[0].data.access_url;
                    uploadFile(coachImages.map(item => item.file), function(result){
                        let pushData = {
                            name: values.name.trim(),
                            level: values.level,
                            header: headerImage,
                            gender: window.parseInt(values.gender),
                            images: result.map(item => {
                                return {
                                    url: item.data.access_url
                                }
                            }),
                            coachingDate: strToDate(values.coachingDate), // 将“2016-10”转为事件戳
                            venueIds: values.venues,
                            profile: values.profile,
                            phone: values.phone,
                            privateCoachingPrice: y2f(values.privateCoachingPrice),
                            privateCoachingUnit: "string" // 收费单位，暂时传为空
                        };
                        addCoach(pushData).then(function(data){
                            if(data.data.code === 0){
                                browserHistory.push('/coach');
                                resolve();
                                Notify.success('添加教练成功！');
                            }
                        }, function(err){
                            if(err){
                                reject();
                                Notify.error('网络出错,添加失败!');
                            }
                        });
                    }, '/coach');
                }, '/header');
            });
        }
    }
    // 以下两个函数用于处理“教练头像”
    deleteHeaderImage(index){
        //alert(index);
        const copyArr = this.state.header.slice(0);
        copyArr.splice(index, 1);
        this.setState({
            header: copyArr
        });
    }
    setHeaderImage(imgs){ // 应该教练头像只能上传一张，所以逻辑得更改下
        const allImage = this.state.header.slice(0);
        if(Number(this.state.headerMaxAmount) === 1){ // 如果教练头像被限制为1
            this.setState({         // 直接替换
                header: imgs.slice(0)
            });
        }else{ // 如果教练头像被限制为1以上的数字
            // 上传的图片超过规定的张数
            if(allImage.length < this.state.headerMaxAmount){
                if(allImage.length + imgs.length <= this.state.headerMaxAmount){
                    this.setState({
                        header: allImage.concat(imgs.slice(0))
                    });
                }else {
                    let add = this.state.headerMaxAmount - allImage.length;
                    this.setState({
                        header: allImage.concat(imgs.slice(0, add))
                    });
                }
            }else{}
        }
    }

    // 以下两个函数用于处理“教练照片”
    // 在弹窗点击确定弹出图片
    deleteImage(index){
        //alert(index);
        const copyArr = this.state.imageList.slice(0);
        copyArr.splice(index, 1);
        this.setState({
            imageList: copyArr
        });
    }
    // 存储图片到state中
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
    // 以下连续4个onChange函数
    coachNameChange(e){
        this.setState({
            coachName: e.target.value.trim()
        });
    }
    phoneChange(e){
        this.setState({
            phone: e.target.value.trim()
        });
    }
    levelChange(selectedVal){
        this.setState({
            level: selectedVal
        });
    }
    genderChange(e){
        this.setState({
            gender: e.target.value
        });
    }
    priceChange(e){
        this.setState({
            price: e.target.value
        });
    }
    venuesChange = (event) => {
        this.setState({
            venuesSelected: this.state.venuesSelected.concat(event.target.value)
        });
    }
    venuesDelete(item){
        const newVenuesSelected = this.state.venuesSelected.filter(v => {
            return v !== item.value;
        });
        this.setState({
            venuesSelected: newVenuesSelected
        });
    }
    monthChange(v){
        this.setState({
            coachingDate: v
        });
    }
    profileChange(v){
        this.setState({
            profile: v
        });
    }
    // 富文本点击上传图片，需要将图片上传到cos,拿到src
    profileImgHandler(file){
        return new Promise((resolve, reject) => {
            uploadFile([file], function(res){
                resolve(res[0].data.access_url);
            }, function(){}, '/coach');
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
                        label="教练名称："
                        value={ this.state.coachName }
                        required
                        validations={ { required: true} }
                        validationErrors={ { required: '请输入教练名称' } }
                        onChange={ this.coachNameChange.bind(this) }
                    />
                    <Field
                        name="header"
                        label="教练头像："
                        component={ UploadField }
                        maxSize={ 8 * 1000 * 1000 }
                        triggerInline
                        required
                        validations={ { minLength: 1 } }
                        validationErrors={ { minLength: '请上传一张图片' } }
                        value={ this.state.header }
                        maxAmount={ this.state.headerMaxAmount }
                        deleteImage={ this.deleteHeaderImage.bind(this) }
                        setImage={ this.setHeaderImage.bind(this) }
                    />
                    <Field
                        name="images"
                        label="教练照片："
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
                    <FormSelectField
                        name="level"
                        label="教练级别："
                        required
                        validations={{ required: true }}
                        validationErrors={{ required: '请选择教练级别' }}
                        data={ this.state.levelData }
                        value={ this.state.level }
                        onChange={ this.levelChange.bind(this) }
                    />
                    <FormNumberInputField
                        name="privateCoachingPrice"
                        label="收费："
                        showStepper
                        helpDesc={ <span>提示：单位为元/课时</span> }
                        required
                        validations={{ required: true }}
                        validationErrors={{ required: '请输入收费情况' }}
                        min={0}
                        value={ this.state.price }
                        onChange={ this.priceChange.bind(this) }
                    />
                    <FormRadioGroupField
                        name="gender"
                        label="性别："
                        required
                        validations={{
                            required(values, value) {
                                return value !== ''
                            }
                        }}
                        validationErrors={{
                            required: '请选择性别'
                        }}
                        value={ this.state.gender }
                        onChange={ this.genderChange.bind(this) }
                        >
                        <Radio value="1">男</Radio>
                        <Radio value="2">女</Radio>
                    </FormRadioGroupField>
                    <FormInputField
                        name="phone"
                        type="text"
                        label="联系方式："
                        required
                        validations={ { required: true, matchRegex: /^1[3|4|5|8][0-9]\d{4,8}$/ } }
                        validationErrors={ { required: '请输入联系电话', matchRegex: '请输入合法的联系电话' } }
                        value={ this.state.phone }
                        onChange={ this.phoneChange.bind(this) }
                    />
                    <Field
                        name="venues"
                        label="可执教场馆："
                        component={ SelectField }
                        required
                        validations={ { minLength: 1 } }
                        validationErrors={ { minLength: '请至少选择一个可执教场馆' } }
                        tags
                        value={ this.state.venuesSelected }
                        data={ this.state.venuesData }
                        onChange={ this.venuesChange.bind(this) }
                        onDelete={ this.venuesDelete.bind(this) }
                    />
                    <Field
                        name="coachingDate"
                        label="起始执教时间："
                        component={ MonthPickerField }
                        required
                        validations={ { required: true} }
                        validationErrors={ { required: '请选择起始执教时间' } }
                        value={ this.state.coachingDate }
                        onChange={ this.monthChange.bind(this) }
                    />
                    <Field
                        name="profile"
                        label="个人简介："
                        component={ UeditorField }
                        required
                        value={ this.state.profile }
                        onChange={ this.profileChange.bind(this) }
                        upLoadImage={ this.profileImgHandler.bind(this) }
                        action={ this.props.id !== undefined ? 'edit' : 'create'}
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