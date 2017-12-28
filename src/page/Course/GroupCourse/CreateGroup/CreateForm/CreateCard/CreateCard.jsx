import React from 'react';
import { Form, Dialog, Button, Table, Notify, Sweetalert, Input, NumberInput } from 'zent';
import './style.css';
// 课时卡api
import { getAllCourseCard, updateCourseCard, deleteCourseCard } from '../../../../../../api/courseCards.js';
// 元分互转
import { f2y, y2f } from '../../../../../../assets/js/formatPrice.js';
// 课时卡api
import { addCourseCard } from '../../../../../../api/courseCards.js';
const { FormInputField, createForm, FormNumberInputField } = Form;

// 单元格组件
class EditableCell extends React.Component {
    state = {
        value: this.props.value, // 单元格的值
        editable: this.props.editable || false // 该单元格是否可编辑
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.editable !== this.state.editable){
            this.setState({
                editable: nextProps.editable
            });
            // 缓存旧值
            if(nextProps.editable){
                this.cacheValue = this.state.value;
            }
        }
        // 点击“取消”，需要设置为回来缓存的值。点击“保存”， 组件的value字段自动保存值了
        if(nextProps.status && nextProps.status !== this.props.status){
            // 点击保存，将值同步上去
            if(nextProps.status === 'save'){
                //this.props.onChange(this.state.value);
                let v = this.state.value.toString().trim();
                if(v === ''){ // 如果为空的时候点击保存，恢复之前的缓存值
                    this.props.onChange(this.cacheValue);
                    this.setState({
                        value: this.cacheValue
                    });
                }else{
                    this.props.onChange(this.state.value);
                }
            // 点击取消，设置为缓存的值
            }else if(nextProps.status === 'cancel'){
                this.setState({
                    value: this.cacheValue
                });
                //this.props.onChange(this.cacheValue);
            }
        }
    }
    shouldComponentsUpdate(nextProps, nextState){
        return nextProps.editable !== this.state.editable || nextState.value !== this.state.value;
    }
    handleChange(e){
        const value = e.target.value;
        //console.log('v', value);
        this.setState({
            value
        });
    }
    // 隐藏的input用来编辑
    render(){
        const { value, editable } = this.state;
        let type = this.props.type;
        let input;
        switch(type){
            case 'name':
                input = <Input value={ value } onChange={ e => this.handleChange(e) } className="cart-name-input"/>
                break;
            case 'number':
                input = <NumberInput  value={ value }  min={0} onChange={ e => this.handleChange(e) } showStepper/>
                break;  
            case 'price':
                input = <NumberInput  value={ value } min={0} onChange={ e => this.handleChange(e) } showStepper />
                break;
            case 'originalPrice':
                input = <NumberInput   value={ value } min={0} onChange={ e => this.handleChange(e) } showStepper />
                break;
            default:
                input = <Input value={ value } onChange={ e => this.handleChange(e) } type="textarea" className="cart-detail-input"/>
        }
        return (
            <div className="cart-cell">
                {
                    editable ? 
                    <div>
                        {/* <Input value={ value } onChange={ e => this.handleChange(e) } /> */}
                        { input }
                    </div>
                    :
                    <div>
                        {/* /* { value || ' '} */}
                        { value } 
                    </div>
                }
            </div>
        );
    }
}

class EditableTable extends React.Component {
    constructor(props){
        super(props);
        this.columns = [
            {
                title: '序号',
                name: 'order'
            }, 
            {
                title: '课时卡名称',
                name: 'name',
                bodyRender: (data, pos) => this.renderColumns(this.state.data, pos.row, 'name')
            }, 
            {
                title: '课时数',
                name: 'number',
                bodyRender: (data, pos) => this.renderColumns(this.state.data, pos.row, 'number'),
                // width: '50px'
            },
            {
                title: '优惠价',
                name: 'price',
                bodyRender: (data, pos) => this.renderColumns(this.state.data, pos.row, 'price'),
                // width: '70px'
            },
            {
                title: '原价',
                name: 'originalPrice',
                bodyRender: (data, pos) => this.renderColumns(this.state.data, pos.row, 'originalPrice'),
                // width: '70px'
            }, 
            {
                title: '备注',
                name: 'detail',
                bodyRender: (data, pos) => this.renderColumns(this.state.data, pos.row, 'detail')
            },
            {
                title: '操作',
                bodyRender: (data, pos) => {
                    const { editable } = this.state.data[pos.row].name;
                    return (
                        <div>
                            {
                                editable ?
                                    <div style={{ display: 'inline-block', marginRight: '10px'}}>
                                        <Button type="primary" size="small" 
                                            onClick={ () => this.editDone(pos.row, 'save') }
                                        >保存</Button>
                                        <Button type="primary" size="small" 
                                            onClick={ () => this.editDone(pos.row, 'cancel') }
                                        >取消</Button>
                                    </div>
                                    :
                                    <Button type="primary" size="small" 
                                        onClick={ () => this.edit(pos.row) }
                                    >编辑</Button>
                            }

                            {/* id 用来点击后获取场馆的id, first用来标记是否为第一条数据 */}
                            <Button data-id={ data.id } data-first={ pos.row === 0 ? 1 : 0 } className="delete-card-btn" type="danger" size="small">删除</Button>
                        </div>
                    );
                },
                width: '150px'
            }
        ];
        this.state = {
            data: [],
            totalItem: 0, // 总条目个数（发请求得来）
            pageSize: 5,  // 每页个数(自己规定)
            current: 1, // 当前页码(每次点击需更新)
            datasets: []
        }
    }
    // 构造cell
    renderColumns(data, index, key){
        const { editable, status, value } = data[index][key];
        return (
            <EditableCell
                value={ value }
                editable={ editable }
                status={ status }
                onChange={ value => this.handleChange(key, index, value )} 
                type={ key }
            />
        );
    }
    // 传递给单元格的onChange函数 ， 点击保存的时候会调用该函数，这时候可以发送"更新"请求来真正保存
    // 由于每个单元格都会调用一次，导致该函数调用了5次，为避免多次请求，需判断该函数是否为最后一次来发送请求
    handleChange(key, index, value){
        const { data } = this.state;
        data[index][key].value = value;
        //console.log(data);
        this.setState({ data }, () => {
            if(key === 'detail'){
                let d = data[index];
                let pushData = {
                    "id": d.id,
                    "name": d.name.value,
                    "price": y2f(d.price.value),
                    "originalPrice": y2f(d.originalPrice.value),
                    "number": d.number.value,
                    "detail": d.detail.value
                };
                //console.log(pushData);         // 有bug
                updateCourseCard(pushData).then((res)=>{
                    //console.log('res', res);
                });
            }
        });
    }
    // 点击了"编辑"按钮
    edit(index){
        const { data } = this.state;
        Object.keys(data[index]).forEach(key => {
            if(typeof data[index][key] === 'object'){
                data[index][key].editable = true;
            }
        });
        this.setState({ data });
    }
    // 点击了"保存"或"取消"按钮
    editDone(index, type){
        const { data } = this.state;
        Object.keys(data[index]).forEach(key => {
            if(typeof data[index][key] === 'object'){
                data[index][key].editable = false;
                data[index][key].status = type;
            }
        });
        this.setState({data}, () => {
            Object.keys(data[index]).forEach((item) => {
                if (data[index][item] && typeof data[index][item].editable !== 'undefined') {
                  delete data[index][item].status;
                }
              });
        });
    }
    componentWillMount(){
        this._isMounted = true;
        const that = this;
        this.getAllCards(function(){
            const allDeleteBtn = document.querySelectorAll('.delete-card-btn');
            allDeleteBtn.forEach(item => {
                item.addEventListener('click', that.deleteCardHandler, false);
            });
        });
    }
    // 当组件卸载时要清楚所有事件监听器
    componentWillUnmount() {
        this._isMounted = false;
        const that = this;
        const allDeleteBtn = document.querySelectorAll('.delete-card-btn'); 
        allDeleteBtn.forEach(item => {
            item.removeEventListener('click', that.deleteCardHandler, false);
        });
    }
    // refresh table
    componentWillReceiveProps(nextProps){
        const that = this;
        if(nextProps.refresh === true){
            this.getAllCards(function(){
                const allDeleteBtn = document.querySelectorAll('.delete-card-btn');
                allDeleteBtn.forEach(item => {
                    item.addEventListener('click', that.deleteCardHandler, false);
                });
                Notify.success('添加成功!');
            });
            // 把父组件的refresh值重新设置为false
            this.props.handlerRefresh();
        }
    }
    // 包装一层是为了在组件摧毁时，能解绑事件
    deleteCardHandler = (e) => {
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
    clickHander(e, that){
        let isTheFirstInLastPage = that.state.current !== 1 && that.state.current === Math.ceil(that.state.totalItem / that.state.pageSize) && that.state.totalItem === (that.state.current - 1) * that.state.pageSize + 1 && e.target.dataset.first === '1'; // 是否是最后一页剩下的最后一条
        if(isTheFirstInLastPage === true){ // 如果是最后一页剩下的最后一条，那么请求“前一页的数据”
            //alert('我是最后一页剩下的最后一条！');  
            deleteCourseCard({
                id: e.target.dataset.id
            }).then(function(res){                         // 先删除点击时的数据，然后设置当前页到前一页，再重新请求列表数据
                if(res.data.code === 0){
                    that.setState({
                        current: that.state.current - 1
                    }, function(){
                        that.getAllCards(function(){
                            const allDeleteBtn = document.querySelectorAll('.delete-card-btn'); // 需要重新绑定删除按钮的click事件
                            allDeleteBtn.forEach(item => {
                                item.removeEventListener('click', that.deleteCardHandler, false);
                                item.addEventListener('click', that.deleteCardHandler, false);
                            });
                            Notify.success('删除集体课成功!'); //
                        });
                    });
                }
            }, function(){
                Notify.error('删除集体课失败！');
            });
        }else{
            deleteCourseCard({
                id: e.target.dataset.id
            }).then(function(res){                         // 删除后需要根据当前页码重新请求
                if(res.data.code === 0){
                    that.getAllCards(function(){
                        Notify.success('删除集体课成功!');
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
            that.getAllCards(function(){
                const allDeleteBtn = document.querySelectorAll('.delete-card-btn');
                if(allDeleteBtn.length !== 0){
                    allDeleteBtn.forEach(item => {
                        item.removeEventListener('click', that.deleteCardHandler, false);
                        item.addEventListener('click', that.deleteCardHandler, false);
                    });
                }
            });
        });
    }
    // 获取所有卡片
    getAllCards(cb){
        const that = this;
        getAllCourseCard({
            pageNumber: this.state.current - 1,
            pageSize: this.state.pageSize
        }).then(function(res){
            const list = res.data.data.list; // 所有集体课信息
            let total = res.data.data.total; // 总个数
            const all = list.map((item, index) => {
                return {
                    order: index + 1,
                    id: item.id,
                    name: {
                        editable: false,
                        value: item.name,
                    },
                    number: {
                        editable: false,
                        value: item.number
                    },
                    price: {
                        editable: false,
                        value: f2y(item.price)
                    },
                    originalPrice: { 
                        editable: false,
                        value: f2y(item.originalPrice)
                    },
                    detail: {
                        editable: false,
                        value: item.detail
                    }
                };
            });
            if(that._isMounted === true){
                that.setState({
                    data: all,
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
    render() {
        const { data } = this.state;
        const datasets = data.map(item => {
            const obj = {};
            Object.keys(item).forEach(key => {
                obj[key] = typeof item[key].value !== 'undefined' ? item[key].value : item[key];
            });
            return obj;
        });
        return (
            <Table
                columns={ this.columns }
                datasets={ datasets }
                rowKey="id"
                onChange={ this.onChange.bind(this) }
                pageInfo={{
                    limit: this.state.limit,
                    current: this.state.current,
                    maxPageToShow: this.state.maxPageToShow,
                    totalItem: this.state.totalItem,
                    pageSize: this.state.pageSize
                }}
            />
        );
    }
}

class CreateCard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            name: '', // 课时卡名称
            number: '', // 课时数
            price: '', // 优惠价
            originalPrice: '', //原价
            detail: '', // 补充说明
            refresh: false
        }
    }
    submit = (val, zentForm) => {
        //this.props.cardTriggle(false);
        // 清空值
        // 发送请求
        const that = this;
        val.price = y2f(val.price);
        val.originalPrice = y2f(val.originalPrice);
        //this.props.onSumit(val);
        return new Promise((resolve, reject) => {
            addCourseCard(val).then(function(res){
                if(res.data.code === 0){
                    // 添加在下拉菜单中
                    that.props.onSubmit({
                        id: res.data.data.id,
                        name: val.name
                    });
                    resolve()
                    // 重置表单值
                    that.props.zentForm.resetFieldsValue();
                    that.props.zentForm.initialize({
                        name: '',
                        number: '',
                        price: '',
                        originalPrice: '',
                        detail: '',
                    });
                    // table刷新
                    that.setState({
                        refresh: true
                    });
                }
            }).catch(err => {
                if(err){
                    reject();
                    alert('网络出错！');
                }
            });
        });

    }
    handlerChange(key, e){
        const data = {};
        data[key] = e.target.value;
        this.setState(data);
    }
    refreshFn(){
        this.setState({
            refresh: false
        });
    }
    render(){
        const { handleSubmit, zentForm } = this.props;
        const isSubmitting = zentForm.isSubmitting();
        return (
        <Dialog
            visible={ this.props.visible }
            title="新建规格卡"
            onClose={ ()=> { this.props.cardTriggle(false)} }
        >   
        <div style={{ width: '750px' }}>
            <Form horizontal onSubmit={ handleSubmit(this.submit) } style={{ width: '750px', paddingLeft: '150px' }}>
                <FormInputField
                    name="name"
                    type="text"
                    label="课时卡名称："
                    spellCheck={false}
                    required
                    validations={{ required: true }}
                    validationErrors={{ required: '请输入课时卡名称' }}
                    //value={ this.state.name }
                    //onChange={ (e) => { this.handlerChange('name', e); } }
                />

                {/* name: '', // 课时卡名称
            number: '', // 课时数
            price: '', // 优惠价
            originalPrice: '', //原价
            detail: '', // 补充说明 */}

                <FormNumberInputField
                    name="number"
                    label="课时数："
                    showStepper
                    required
                    validations={{ required: true }}
                    validationErrors={{ required: '请选择课时数' }}
                    min={0}
                    style={{ width: '30px' }}
                    spellCheck={false}
                    //value={ this.state.number }
                    //onChange={ (e) => { this.handlerChange('number', e); } }
                />
                {/* <Form inline style={{ marginBottom: 0 }}> */}
                <FormNumberInputField
                    name="price"
                    type="text"
                    label="价格："
                    className="new-price-input"
                    placeholder="优惠价"
                    spellCheck={false}
                    required
                    validations={{ required: true }}
                    validationErrors={{ required: '请输入优惠价' }}
                    //value={ this.state.price }
                    //onChange={ (e) => { this.handlerChange('price', e); } }
                />
                <FormNumberInputField
                    name="originalPrice"
                    type="text"
                    className="old-price-input"
                    placeholder="原价"
                    spellCheck={false}
                    required
                    validations={{ required: true }}
                    validationErrors={{ required: '请输入原价' }}
                    //value={ this.state.originalPrice }
                    //onChange={ (e) => { this.handlerChange('originalPrice', e); } }
                />
                {/* </Form> */}

                <FormInputField
                    name="detail"
                    type="textarea"
                    label="补充说明："
                    style={{ width: '200px', maxWidth: '500px' }}
                    //value={ this.state.detail }
                    //onChange={ (e) => { this.handlerChange('detail', e); } }
                />
                <div className="zent-form__form-actions">
                    <Button type="primary" htmlType="submit" loading={ isSubmitting }>确定添加</Button>
                </div>                    
            </Form>
            <EditableTable refresh={ this.state.refresh } handlerRefresh={ () => { this.refreshFn() } }/>
        </div>
        </Dialog>
        );
    }
}

export default createForm()(CreateCard);