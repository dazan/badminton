import React from 'react';
import { Form, Button, Notify, Radio } from 'zent';
// 上传组件
import UploadField from '../../../../components/UploadField/UploadField';
// 上传图片
import { uploadFile } from '../../../../api/upload.js';
// banner api 
import { addBanner, updateBanner, getBannerDetail } from '../../../../api/banner.js';
//import './style.css';
// 在组件外部使用导航
import { browserHistory } from 'react-router';


const { Field, FormInputField, createForm, FormSelectField, FormNumberInputField, FormRadioGroupField } = Form;



class PlaceForm extends React.Component {
    constructor(props, context){
        super(props, context);
        this.state = {
            title: '', // 标题名称
            redirectType: '',  // 跳转方式
            redirectParam: '', // 跳转参数
            status: 0, // 是否上线
            priority: '', // 权重
            image: [], // 存放教练头像, 头像张数为1
            imageMaxAmount: "1", // 必须是字符串格式，踩到坑了
            redirectTypeData: [
                { value: 0, text: '跳转到集体课'},
            ]
        }
    }
    // 提交表单
    // [{ url: ''}]
    // [{ src: '', file: {}}]
    submit = (values, zentForm) => {
        let id = this.props.id;
        if(id !== undefined){;
            return new Promise((resolve, reject) => {
                uploadFile(values.image[0].file ? [ values.image[0].file ] : [], function(res){  // 当submit时，没有新增图，newImgs可以为空
                    let imgSrc = values.image[0].file ? res[0].data.access_url : values.image[0].src;
                    //console.log('第二步：图片已上传到cos', res);
                    
                    let pushData = {  // 添加场馆需要的信息
                        id,
                        title: values.title,
                        redirectType: values.redirectType,
                        redirectParam: {
                            id: values.redirectParam
                        },
                        priority: values.priority,
                        status: values.status,
                        image: {
                            url: imgSrc
                        }
                    };

                    //console.log('第三步：需要提交的对象出来了', pushData);
                    updateBanner(pushData).then(function(data){
                        //console.log('第四步：场馆添加完成的返回结果', data);
                        if(data){
                            resolve();
                            browserHistory.push('/setting');
                            Notify.success('修改成功！');
                        }
                    }, function(){
                        reject();
                        Notify.error('网络出错,添加失败!');
                    })

                });
            });

        }else{
            const image = values.image;
            // 先上传图片，再上传其他信息
            return new Promise((resolve, reject) => {
                uploadFile(image.map(item => item.file), function(res){
                    //console.log('第二步：图片已上传到cos', res);
                    let pushData = {  // 添加场馆需要的信息
                        title: values.title,
                        redirectType: values.redirectType,
                        redirectParam: {
                            id: values.redirectParam
                        },
                        priority: values.priority,
                        status: values.status,
                        image: {
                                url: res[0].data.access_url
                            }
                    };
                    //console.log('第三步：需要提交的对象出来了', pushData);
                    addBanner(pushData).then(function(data){
                        //console.log('第四步：场馆添加完成的返回结果', data);
                        if(data){
                            resolve();
                            browserHistory.push('/setting');
                            Notify.success('添加成功！');
                        }
                    }, function(){
                        Notify.error('网络出错,添加失败!');
                        reject();
                    })

                });
            });
        }
    }

    // 以下两个函数用于处理“教练头像”
    deleteImage(index){
        alert(index);
        const copyArr = this.state.image.slice(0);
        copyArr.splice(index, 1);
        this.setState({
            image: copyArr
        });
    }
    setImage(imgs){ // 应该教练头像只能上传一张，所以逻辑得更改下
        const allImage = this.state.image.slice(0);
        if(Number(this.state.imageMaxAmount) === 1){ // 如果教练头像被限制为1
            this.setState({         // 直接替换
                image: imgs.slice(0)
            });
        }else{ // 如果教练头像被限制为1以上的数字
            // 上传的图片超过规定的张数
            if(allImage.length < this.state.imageMaxAmount){
                if(allImage.length + imgs.length <= this.state.imageMaxAmount){
                    this.setState({
                        image: allImage.concat(imgs.slice(0))
                    });
                }else {
                    let add = this.state.imageMaxAmount - allImage.length;
                    this.setState({
                        image: allImage.concat(imgs.slice(0, add))
                    });
                }
            }else{}
        }
    }
    handleChange(name, e){
        const data = {};
        data[name] = typeof e === 'object' ? e.target.value : e;
        this.setState({
            data
        });
    }

    // 由于编辑组件和创建venue组件共用，所以一进来需先判断是点击"编辑"进来还是点击"新增场馆进来"
    componentWillMount(){
        const that = this;
        let id = this.props.id;
        if(id !== undefined){
            getBannerDetail({
                id
            }).then(function(res){
                if(res.data.code === 0){
                    const d = res.data.data;
                    that.setState({
                        title: d.title, 
                        redirectType: d.redirectType,
                        redirectParam: d.redirectParam.id,
                        status: d.status,
                        priority: d.priority,
                        image: [{
                            src: d.image.url
                        }]
                    });
                }
            }, function(){
                alert('网络出错！');
            });
        }
    }
    render(){
        const { handleSubmit, zentForm } = this.props;
        const isSubmitting = zentForm.isSubmitting();
        return (
            <div className="create-coach">
                <Form horizontal onSubmit={ handleSubmit(this.submit) }>
                    <FormInputField
                        name="title"
                        type="text"
                        label="标题名称："
                        value={ this.state.title }
                        required
                        validations={ { required: true} }
                        validationErrors={ { required: '请输入标题名称' } }
                        onChange={ (e) => { this.handleChange('title', e) } }
                    />

                    <FormInputField
                        name="redirectParam"
                        type="text"
                        label="跳转参数："
                        required
                        validations={ { required: true} }
                        validationErrors={ { required: '请输入跳转参数地址' } }
                        value={ this.state.redirectParam }
                        onChange={ (e) => { this.handleChange('redirectParam', e) } }
                    />

                    <Field
                        name="image"
                        label="Banner 图片："
                        component={ UploadField }
                        maxSize={ 8 * 1000 * 1000 }
                        triggerInline
                        required
                        validations={ { minLength: 1 } }
                        validationErrors={ { minLength: '请上传一张图片' } }
                        value={ this.state.image }
                        maxAmount={ this.state.imageMaxAmount }
                        deleteImage={ this.deleteImage.bind(this) }
                        setImage={ this.setImage.bind(this) }
                    />
                    

                    <FormSelectField
                        name="redirectType"
                        label="跳转方式："
                        required
                        validations={{ required: true }}
                        validationErrors={{ required: '请选择跳转方式' }}
                        data={ this.state.redirectTypeData }
                        value={ this.state.redirectType }
                        onChange={ (e) => { this.handleChange('redirectTypeData', e) } }
                    />

                    <FormNumberInputField
                        name="priority"
                        label="权重："
                        showStepper
                        required
                        validations={{ required: true }}
                        validationErrors={{ required: '请输入权重' }}
                        min={0}
                        value={ this.state.priority }
                        onChange={ (e) => { this.handleChange('priority', e) } }
                    />

                    <FormRadioGroupField
                        name="status"
                        label="是否上线："
                        required
                        validations={{
                            required(values, value) {
                                return value !== ''
                            }
                        }}
                        validationErrors={{
                            required: '请选择是否上线'
                        }}
                        value={ this.state.status }
                        onChange={ (e) => { this.handleChange('status', e) } }
                        >
                        <Radio value={0}>否</Radio>
                        <Radio value={1}>是</Radio>
                    </FormRadioGroupField>


                    <div className="zent-form__form-actions">
                        <Button type="primary" htmlType="submit" loading={ isSubmitting }>{ this.props.id === undefined ? '确定添加' : '保存' }</Button>
                    </div>
                </Form>
            </div>
        );
    }
}

export default createForm()(PlaceForm);