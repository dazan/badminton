import React from 'react';
import { Icon, Input, Button } from 'zent';
import PropTypes from 'prop-types';
import './style.css';

class CommentInput extends React.Component {
    //constructor(props){
        //super(props);
    constructor(){
        super();
        this.state = {
            customerName: '', // 用户名
            content: '', // 用户评价
            priority: '', // 权重
            id: '', // 当前评论的id,只有发送请求之后才有
            show: false
        };
    }
    
    // 3个onchange函数
    nameChange(e){
        this.setState({
            customerName: e.target.value
        });
    }
    contentChange(e){
        this.setState({
            content: e.target.value
        });
    }
    priorityChange(e){
        this.setState({
            priority: e.target.value.replace(/\D/g, '')
        });
    }

    // 要么创建新评论，要么更新评论
    checkClick(){
       // 先判断内容为空不为空,为空不给以提交
       // 发送请求，拿到id || 也有可能已有id,那么是“编辑”进来的，此时调用更新的接口
       // 将内容和index传给父组件,父组件会修改响应的数组
       let name = this.state.customerName.trim();
       let content = this.state.content.trim();
       let p = this.state.priority;
       const that = this;
       if(name === '' || content === '' || p === ''){
           return ;
       }
        this.props.onChange({
            index: this.props.index,
            data: {
                customerName: this.state.customerName,
                content: this.state.content,
                priority: this.state.priority
            }
        }, function(){
            that.setState({
                show: false
            });
        });
    }
    // 更新评论
    feedClick(){
        // 此时肯定有id了
        // 先把当前props传给state, 让input框有内容显示
        this.setState({
            show: true,
            customerName: this.props.comment.customerName,
            content: this.props.comment.content,
            priority: this.props.comment.priority
        });
    }
    // 此时并不确定有没有id,因为用户可能是点击“编辑”，也可能是“新建”
    closeHandler(){
        this.props.deleteComment(this.props.index);
    }
    // 两步：根据id发送请求去删除评论，然后将index传给父组件让其删除数组中的第index项元素
    closeById(){
        this.props.deleteComment(this.props.index);
    }
    // 不能输入非数字
    // inputHandler(e){
    //     // console.log(e);
    //     // let oInput = this.refs['pInput'].input;
    //     // oInput.value = oInput.value.replace(/\D/g, '');
    //     this.setState({
    //         priority: e.target.value.replace(/\D/g, '')
    //     });
    // }
    render(){
        return (
            <div>
                {/* 当前评论没有id(还没有发请求) || show=true都可以显示*/}
                <div className="comment" style={ { display: this.props.comment.id === undefined || this.state.show === true ? 'block' : 'none'}}>
                    <div  className="comment-div">
                        <Input
                            name="customerName"
                            type="text"
                            placeholder="昵称"
                            style={{ borderRadius: '8px', width: '45px'}}
                            value={ this.state.customerName }
                            onChange={ this.nameChange.bind(this) }
                        />
                    </div>
                    <div className="comment-div">
                        <Input
                            name="content"
                            type="text"
                            placeholder="评价内容"
                            style={{ borderRadius: '8px', width: '200px'}}
                            value={ this.state.content }
                            onChange={ this.contentChange.bind(this) }
                        />
                    </div>
                    <div  className="comment-div">
                        <Input
                            name="priority"
                            type="text"
                            placeholder="权重"
                            style={{ borderRadius: '8px', width: '30px'}}
                            value={ this.state.priority }
                            onChange={ this.priorityChange.bind(this) }
                            //ref="pInput"
                            //onInput={ this.inputHandler.bind(this) }
                        />
                    </div>
                    <span className="comment-btn">
                        <Icon type="check" className="check-class" onClick={ this.checkClick.bind(this) }/>
                        <Icon type="close" className="close-class" onClick={ this.closeHandler.bind(this) }/>
                    </span>
                    {/* <p className="zent-form__error-desc comment-error">内容不能为空</p> */}
                </div>
                
                {/* 这部分显示的内容是由父组件传来的 */}
                {/* 只有评论id存在时，这部分有才有可能会显示 */}
                {/* show值用来切换 */}
                <div className="comment-show" style={ { display: this.props.comment.id !== undefined && this.state.show === false ? 'block' : 'none' }}>
                    <div className="comment-show-name">{ this.props.comment.customerName }</div>
                    <div className="comment-show-content">{ this.props.comment.content }</div>
                    <div className="comment-show-priority">{ this.props.comment.priority }</div>
                    <span className="comment-show-btn">
                        <Icon type="feedback" className="feed-class" onClick={ this.feedClick.bind(this) }/>
                        <Icon type="close-circle-o" className="close-o-class" onClick={ this.closeById.bind(this) }/>
                    </span>
                </div>
            </div>
        );
    }
}

CommentInput.propTypes = {
    index: PropTypes.number.isRequired,
    comment: PropTypes.object.isRequired,
    deleteComment: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
};


class CommentField extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div className="zent-form__control-group">
                <label className="zent-form__control-label">
                    <em className="zent-form__required">*</em>
                    学员点评：
                </label>
                <div className="zent-form__controls">
                    <Button onClick={ this.props.addComment } style={{ marginTop: '5px'}}><Icon type="plus" className="plus-class"/>&nbsp;&nbsp;添加</Button>
                    <div style={ this.props.value.length > 0 ? { border: '1px solid #ddd', padding: '20px', marginTop: '20px'} : { display: 'none'} }>
                        {
                            this.props.value.map((item, index) => {
                                return <CommentInput comment={ item } key={ index } onChange={ this.props.updateComment } index={ index }
                                            deleteComment={ this.props.deleteComment }
                                        />
                            })
                        }
                    </div>
                    {/* { this.props.isDirty && <p className="zent-form__error-desc" style={{ color: '#f44'}}>{this.props.error}</p> } */}
                   
                </div>
            </div>
        );
    }
}


export default CommentField;