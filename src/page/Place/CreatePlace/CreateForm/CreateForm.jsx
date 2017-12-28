import React from 'react';
import { Form, Button, Notify } from 'zent';
// 上传组件
import UploadField from '../../../../components/UploadField/UploadField';
// 联动菜单
import CascaderField from '../../../../components/CascaderField/CascaderField';
import formatCityData from '../../../../assets/js/formatCityData.js';
import provinceData from '../../../../assets/js/province.js';
import { getPlaceById } from '../../../../api/jsonp.js';
// 上传图片
import { uploadFile } from '../../../../api/upload.js';
// 添加场馆
import { addVenue, getVenueMesById, updateVenue } from '../../../../api/venue.js';
import './style.css';
// 在组件外部使用导航
import { browserHistory } from 'react-router';

const { Field, FormInputField, createForm } = Form;



class PlaceForm extends React.Component {
    constructor(props, context){
        super(props, context);
        this.state = {
            venueName: '', // 场馆名称   // 前3个state,都只设置了默认值，如果想跟表单同步，应该要传onchange
            phone: '',  // 场馆电话
            remark: '',    // 场馆备注
            imageList: [],  // 所有图片
            address: '', // 场馆地址
            maxAmount: 5,    // 限制图片最大数量
            city: [],  // 省市区 格式务必是[{title: '北京省', "id": "110000"}, {}, {}]
            cityOptions: formatCityData(provinceData)  // 初始化只有省级
        }
    }
    // 提交表单
    // [{ url: ''}]
    // [{ src: '', file: {}}]
    submit = (values, zentForm) => {
        let id = this.props.id;
        if(id !== undefined){
            // console.log('修改---submit');
            // console.log(values.imgs);
            const oldImgs = [], // 老照片，是url
                  newImgs = []; // 新照片，是file对象
            values.imgs.forEach(item => {
                if(item.file){
                    newImgs.push(item);
                }else{
                    oldImgs.push(item);
                }
            });
            return new Promise((resolve, reject) => {
                uploadFile(newImgs.map(item => item.file), function(res){  // 当submit时，没有新增图，newImgs可以为空
                    //console.log('第二步：图片已上传到cos', res);
                    let pushData = {  // 添加场馆需要的信息
                        id,
                        name: values.place,
                        province: values.city[0].title,
                        provinceCode: values.city[0].id,
                        city: values.city[1].title,
                        cityCode: values.city[1].id,
                        area: values.city[2].title,
                        areaCode: values.city[2].id,
                        address: values.place,
                        phone: values.phone,
                        remark: values.remark,
                        images: oldImgs.concat(res.map(item => {
                            return {
                                url: item.data.access_url
                            }
                        }))
                    };
                    //console.log('第三步：需要提交的对象出来了', pushData);
                    updateVenue(pushData).then(function(data){
                        //console.log('第四步：场馆添加完成的返回结果', data);
                        if(data){
                            resolve();
                            browserHistory.push('/place');
                            Notify.success('修改成功！');
                        }
                    }, function(){
                        reject();
                        Notify.error('网络出错,添加失败!');
                    })

                });
            });
        }else{
            //console.log('添加---submit');
            const images = values.imgs;
            // 先上传图片，再上传其他信息
            return new Promise((resolve, reject) => {
                uploadFile(images.map(item => item.file), function(res){
                    //console.log('第二步：图片已上传到cos', res);
                    let pushData = {  // 添加场馆需要的信息
                        name: values.place,
                        province: values.city[0].title,
                        provinceCode: values.city[0].id,
                        city: values.city[1].title,
                        cityCode: values.city[1].id,
                        area: values.city[2].title,
                        areaCode: values.city[2].id,
                        address: values.place,
                        phone: values.phone,
                        remark: values.remark,
                        images: res.map(item => {
                            return {
                                url: item.data.access_url
                            }
                        })
                    };
                    //console.log('第三步：需要提交的对象出来了', pushData);
                    addVenue(pushData).then(function(data){
                        //console.log('第四步：场馆添加完成的返回结果', data);
                        if(data){
                            resolve();
                            browserHistory.push('/place');
                            Notify.success('添加成功！');
                        }
                    }, function(){
                        Notify.error('网络出错,添加失败!');
                        reject()
                    })

                });
            });
        }
    }
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
        if(allImage.length < this.state.maxAmount){
            if(allImage.length + imgs.length <= this.state.maxAmount){
                this.setState({
                    imageList: allImage.concat(imgs.slice(0))
                });
            }else {
                let add = this.state.maxAmount - allImage.length;
                this.setState({
                    imageList: allImage.concat(imgs.slice(0, add))
                });
            }
        }else{}
    }
    // 3级联动菜单 点击加载更多
    loadMore(root, stage){
        return new Promise((resolve, reject) => {
            let id = root.id;
            let url = `https://www.youzan.com/v2/common/region/list.jsonp`;
            let isLeaf = stage >= 2;
            getPlaceById(url, id, function(data){
                const children = formatCityData(data).map(item => {
                    item.isLeaf = isLeaf;
                    return item;
                });
                resolve(children);
            });
        });
    }
    // 3级菜单选完时会调用该函数，更新city
    changeCity(val){
        //console.log(val.map(item => item.id));
        this.setState({
            city: val
        }); 
    }
    // 以下连续4个onChange函数
    venueNameChange(e){
        this.setState({
            venueName: e.target.value.trim()
        });
    }
    addressChange(e){
        this.setState({
            address: e.target.value.trim()
        });
    }
    phoneChange(e){
        this.setState({
            phone: e.target.value.trim()
        });
    }
    remarkChange(e){
        this.setState({
            remark: e.target.value.trim()
        })
    }
    // 由于编辑组件和创建venue组件共用，所以一进来需先判断是点击"编辑"进来还是点击"新增场馆进来"
    componentWillMount(){
        this._isMounted = true;
        const that = this;
        let id = this.props.id;
        if(id !== undefined){
            getVenueMesById({
                id
            }).then(function(res){
                if(res.data.code === 0 && that._isMounted === true){
                    let mes = res.data.data;
                    let province = mes.province;
                    let provinceCode = mes.provinceCode.toString();  // 省id
                    let city = mes.city;    // 市title
                    let cityCode = mes.cityCode.toString(); // 市id
                    let area = mes.area;    // 区title
                    let areaCode = mes.areaCode.toString(); // 区id
                    // 难点主要只省市区对象的构造
                    that.setState({ 
                        venueName: mes.name,
                        address: mes.address,
                        phone: mes.phone,
                        remark: mes.remark,
                        imageList: mes.images.map(item => {
                            item.src = item.url;
                            return item;
                        }),
                        cityOptions: that.state.cityOptions.map(item => {
                            if(item.id === provinceCode){
                                item.children = [];
                                item.children.push({
                                    title: city,
                                    id: cityCode
                                });
                                item.children[0].children = [];
                                item.children[0].children.push({
                                    title: area,
                                    id: areaCode
                                });
                                return item;
                            }else{
                                return item;
                            }
                        }),
                        city: [
                            { id: provinceCode, title: province },
                            { id: cityCode, title: city },
                            { id: areaCode, title: area }
                        ]
                    }, function(){
                        console.log(that.state.cityOptions);
                        console.log(that.state.city);
                    });  
                }
            }, function(){
                alert('网络出错！');
            });
        }else { // 把“场馆地址”限制在“惠州”
            //{id: "440000", title: "广东省"}
            // _isMounted
            /*
                city: [
                            {id: "440000", title: "广东省"}           
                            {id: "441300", title: "惠州市"},
                            {id: "441302", title: "惠城区"}
                    ]
            */
        //     getPlaceById('https://www.youzan.com/v2/common/region/list.jsonp', '441300', function(data){
        //         console.log(data);
        //     });
        //     getPlaceById('https://www.youzan.com/v2/common/region/list.jsonp', '440000', function(data){
                
        //     })
            
        //     this.setState({
        //         cityOptions: that.state.cityOptions.map(item => {
        //             if(item.id === "440000"){ //广东省
        //                 item.children = [];
        //                 item.children.push({
        //                     title: "惠州市",
        //                     id: "441300"
        //                 });
        //                 // item.children[0].children = [];
        //                 // item.children[0].children.push({
        //                 //     title: area,
        //                 //     id: areaCode
        //                 // });
        //                 return item;
        //             }else{
        //                 return item;
        //             }
        //         }),
        //         city: [
        //             //{id: "440000", title: "广东省"},
        //             //{id: "441300", title: "惠州市"},
        //             //{id: "441302", title: "惠城区"}
        //         ]
        //     });
        // }

        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    render(){
        const { handleSubmit, zentForm } = this.props;
        const isSubmitting = zentForm.isSubmitting();
        return (
            <div className="create-place">
                <Form horizontal onSubmit={ handleSubmit(this.submit) }>
                    <FormInputField
                        name="place"
                        type="text"
                        label="场馆名称："
                        value={ this.state.venueName }
                        required
                        validations={ { required: true} }
                        validationErrors={ { required: '请输入场馆名称' } }
                        onChange={ this.venueNameChange.bind(this) }
                    />
                    <Field
                        name="city"
                        label="场馆地址："
                        component={ CascaderField }
                        value={ this.state.city }
                        options={ this.state.cityOptions }
                        loadMore={ this.loadMore }
                        changeCity={ this.changeCity.bind(this) }
                        required
                        validations={ { isLength: 3 } }
                        validationErrors={ { isLength: '请选择场馆区域' } }
                    />
                    <FormInputField
                        name="detail"
                        type="text"
                        label="详细地址："
                        required
                        validations={ { required: true} }
                        validationErrors={ { required: '请输入详细地址' } }
                        value={ this.state.address }
                        onChange={ this.addressChange.bind(this) }
                    />
                    <Field
                        name="imgs"
                        label="场馆照片："
                        component={ UploadField }
                        value={ this.state.imageList }
                        maxSize={ 8 * 1000 * 1000 }
                        triggerInline
                        maxAmount={ this.state.maxAmount }
                        deleteImage={ this.deleteImage.bind(this) }
                        setImage={ this.setImage.bind(this) }
                        required
                        validations={ { minLength: 1 } }
                        validationErrors={ { minLength: '至少上传一张图片' } }
                    />
                    <FormInputField
                        name="phone"
                        type="text"
                        label="咨询电话："
                        required
                        validations={ { required: true, matchRegex: /^1[3|4|5|8][0-9]\d{4,8}$/ } }
                        validationErrors={ { required: '请输入咨询电话', matchRegex: '请输入合法的咨询电话' } }
                        value={ this.state.phone }
                        onChange={ this.phoneChange.bind(this) }
                    />
                    <FormInputField
                        name="remark"
                        type="textarea"
                        label="备注："
                        //required
                        //validations={ { required: true} }
                        //validationErrors={ { required: '请输入备注' } }
                        value={ this.state.remark }
                        onChange={ this.remarkChange.bind(this) }
                    />
                    <div className="zent-form__form-actions">
                        <Button type="primary" htmlType="submit" loading={ isSubmitting }>{ this.props.id === undefined ? '确定添加' : '保存' }</Button>
                    </div>
                </Form>
            </div>
        );
    }
}

export default createForm()(PlaceForm);




