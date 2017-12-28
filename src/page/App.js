import React from 'react';
import './App.css';
import { Link } from 'react-router';
import { Button } from 'zent';
// redux 相关
import { connect } from 'react-redux';
import { deleteToken } from '../store/actions/token.js';
// 手动跳转
import { browserHistory } from 'react-router';
// 按需加载ant-design
import Message from 'antd/lib/message';
import 'antd/lib/message/style/css';

class App extends React.Component {
    // 登出
    handleLoginout(){
        this.props.dispatch(deleteToken());
        browserHistory.push('/login');
        Message.success('登出成功！');
    }
    render(){
        return (
                <div>
                    <aside id="app-aside">
                        <div className="aside-wrapper">
                            <div className="aside-container">   
                                <div className="store-info">
                                    <div className="pic">
                                        <img alt="头像" src="http://img.yzcdn.cn/upload_files/2017/04/06/FkzPke7UiK-QgqA0_KFby82u6KV7.png" width="45" height="45"/>
                                    </div>
                                    <div className="detail">
                                        <h2 className="title">篮球篮球</h2>
                                        <div className="tag">
                                            <div className="auth">未认证</div>
                                            <div className="type">有赞美业</div>
                                        </div>
                                    </div>
                                </div>   
                                <nav className="store-nav">
                                    <ul>
                                        <li>
                                            <i className="icon iconfont icon-changdiguanli"></i>
                                            <Link to="/place" activeClassName="active">场馆管理</Link>
                                        </li>
                                        <li>
                                            <i className="icon iconfont icon-jiaolian"></i>
                                            <Link to="/coach" activeClassName="active">教练管理</Link>
                                        </li>
                                        <li>
                                            <i className="icon iconfont icon-kecheng"></i>
                                            <Link to="/course" activeClassName="active">课程管理</Link>
                                        </li>
                                        <li>
                                            <i className="icon iconfont icon-dingdan"></i>
                                            <Link to="/order" activeClassName="active">订单管理</Link>
                                        </li>
                                        <li>
                                            <i className="icon iconfont icon-xueyuan"></i>
                                            
                                            <Link to="/student" activeClassName="active">学员管理</Link>
                                        </li>
                                        <li>
                                            <i className="icon iconfont icon-paiqi"></i>
                                            <Link to="/schedule" activeClassName="active">教练排期</Link>
                                        </li>
                                        <li>
                                            <i className="icon iconfont icon-ttpodicon"></i>
                                            <Link to="/setting" activeClassName="active">运营设置</Link>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                        <div className="aside-userinfo">
                            <Button onClick={ () => this.handleLoginout() }>退出登录</Button>
                        </div>
                    </aside>
                    <div id="app-container" style={{ marginLeft: '200px' }}>
                        { this.props.children }
                    </div>
                </div>
        );
    }
}

export default connect()(App);