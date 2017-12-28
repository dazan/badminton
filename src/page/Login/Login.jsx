import React from 'react';
import { Icon, Button } from 'zent';
// login api
import { login } from '../../api/login.js';
// md5 加密
import md5 from 'md5';
// 引入connect 和 action函数
import { connect } from 'react-redux';
import { createToken } from '../../store/actions/token.js';
// 手动跳转
import { browserHistory } from 'react-router';
// 按需引入 ant-design 组件
import Message from 'antd/lib/message';
import 'antd/lib/message/style/css';
import Input from 'antd/lib/input';
import 'antd/lib/input/style/css';

import './style.css';

class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }
    handleChange(name, e){
        const data = {};
        data[name] = e.target.value;
        this.setState(data);
    }
    handleSubmit(e){
        e.preventDefault();
        let { username, password } = this.state;
        password = md5(password);
        // 发起登陆请求
        login({
            name: username,
            password: password
        }).then(res => {
            let code = res.data.code;
            if(code === 0){
                const state = res.data.data.state;
                let token = state.token;
                // 将token存储在store中
                this.props.dispatch(createToken(token));
                let redir = decodeURIComponent(window.location.search.split('=')[1]);
                redir = redir === 'undefined' ? '/' : redir;
                browserHistory.push(redir);
                Message.success('登录成功！');
            }else if(code === 4){
                Message.error('账号或密码错误！');
            }
        }).catch(err => {
            if(err){
                alert('网络出错！');
            }
        });
    }
    render(){
        return (
            <div className="screen">
                <div className="login-wrapper" >
                    <h2 className="login-title">新锐羽毛球馆</h2>
                    <form onSubmit={ (e) => this.handleSubmit(e) }>
                        <div className="login-input">
                            <Input
                                placeholder="username"
                                prefix={ <Icon type="customer-o" /> }
                                value={ this.state.username }
                                onChange={ (e) => this.handleChange('username', e) }
                                className="ant-login-input"
                            />
                        </div>
                        <div className="login-input">
                            <Input
                                placeholder="password"
                                prefix={ <Icon type="lock" /> }
                                value={ this.state.password }
                                onChange={ (e) => this.handleChange('password', e) }
                                className="ant-login-input"
                                type="password"
                            />
                        </div>
                        <div className="login-input">
                            <Button type="primary" htmlType="submit" className="login-btn">登录</Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default connect()(Login);