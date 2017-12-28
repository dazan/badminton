import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';

// 引入路由组件
import RouterMap from './router/RouterMap';

// 通用样式
import './assets/css/common.css';

import 'zent/css/index.css';

// 引入redux和reducers主文件
import { createStore } from 'redux';
import reducers from './store';

import axios from 'axios';

// 连接react和redux
import { Provider } from 'react-redux';

// 清楚token的action
import { deleteToken } from './store/actions/token.js';

// 创建store
let store = createStore(reducers);

store.subscribe(function(){
    //console.log('订阅', store.getState());
});

//  axios配置
//  生产环境下
if(process.env.NODE_ENV === 'production'){
    axios.defaults.baseURL = '/api/';
}

//  定义request,response拦截器
axios.interceptors.request.use(function (config) {
    if(typeof config.data === 'undefined'){
        config.data = {};
    }
    config.data.token = store.getState().token;
    return config;
}, function (error) {
    return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
    if(response.data.code === 5){ // 没有token或者token失效，需要清除当前store里的token
        browserHistory.replace(`/login?redirect=${ encodeURIComponent(window.location.pathname) }`);
        store.dispatch(deleteToken());
    }
    return response;
}, function (error) {
    return Promise.reject(error);
});


// 在渲染之前将根组件包装进 <Provider>, 使得我们的 store 能为下面的组件所用
ReactDOM.render(
    <Provider store={store}>
        <RouterMap/>
    </Provider>
    , document.getElementById('root')
);