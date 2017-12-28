import React from 'react';
import { Router, Route, browserHistory, IndexRedirect, IndexRoute } from 'react-router';
import {connect} from 'react-redux';

// 容器组件
import App from '../page/App';

// 场地管理组件
import Place from '../page/Place/Place';
import CreatePlace from '../page/Place/CreatePlace/CreatePlace';
import ShowAllVenues from '../page/Place/ShowAllVenues/ShowAllVenues';

// 教练管理组件  
import Coach from '../page/Coach/Coach';
import ShowAllCoachs from '../page/Coach/ShowAllCoachs/ShowAllCoachs';
import CreateCoach from '../page/Coach/CreateCoach/CreateCoach';

// 课程管理组件 
// 子组件：集体课组件 + 团课组件
import Course from '../page/Course/Course';

import GroupCourse from '../page/Course/GroupCourse/GroupCourse';
import CreateGroupCourse from '../page/Course/GroupCourse/CreateGroup/CreateGroup';
import ShowAllGroupCourses from '../page/Course/GroupCourse/ShowAllGroupCourses/ShowAllGroupCourses';

import TeamCourse from '../page/Course/TeamCourse/TeamCourse';
import CreateTeamCourse from '../page/Course/TeamCourse/CreateTeam/CreateTeam';
import ShowAllTeamCourses from '../page/Course/TeamCourse/ShowAllTeamCourses/ShowAllTeamCourses';

// 订单管理组件
// 子组件: 集体课订单 + 团课订单 + 私教订单
import Order from '../page/Order/Order';
import GroupOrder from '../page/Order/GroupOrder/GroupOrder';
import TeamOrder from '../page/Order/TeamOrder/TeamOrder';
import PrivateOrder from '../page/Order/PrivateOrder/PrivateOrder';

// 学员管理组件
import Student from '../page/Student/Student';

// 教练排期组件
import Schedule from '../page/Schedule/Schedule';
import ShowAllSchedule from '../page/Schedule/ShowAllSchedule/ShowAllSchedule';
import DateCard from '../page/Schedule/DateCard/DateCard';

// 登录组件
import Login from '../page/Login/Login';

// 运营设置组件
import Setting from '../page/Setting/Setting';
import CreateBanner from '../page/Setting/CreateBanner/CreateBanner';
import ShowAllBanners from '../page/Setting/ShowAllBanners/ShowAllBanners';



class RouterMap extends React.Component {
    // 路由的鉴权
    handleEnter(){
        if(this.props.token === '' || this.props.token == null){
            browserHistory.replace(`/login?redirect=${ encodeURIComponent(window.location.pathname) }`);
        }
    }
    render(){
        return (
            <Router history={ browserHistory }>
                <Route path="/" component={ App } onEnter={ () => this.handleEnter() }>
                    <IndexRedirect to="/place"/>
                    <Route path="place" component={ Place }>
                        <IndexRoute component={ ShowAllVenues } />
                        <Route path="create" component={ CreatePlace }/>
                        <Route path="edit/:id" component={ CreatePlace }/>
                    </Route>

                    <Route path="coach" component={ Coach }>
                        <IndexRoute component={ ShowAllCoachs } />
                        <Route path="create" component={ CreateCoach }/>
                        <Route path="edit/:id" component={ CreateCoach }/>
                    </Route>

                    <Route path="course" component={ Course }>
                        <IndexRedirect to="/course/group"/>
                        <Route path="group" component={ GroupCourse }>
                            <IndexRoute component={ ShowAllGroupCourses } />
                            <Route path="create" component={ CreateGroupCourse }/>
                            <Route path="edit/:id" component={ CreateGroupCourse }/>
                        </Route>
                        <Route path="team" component={ TeamCourse }>
                            <IndexRoute component={ ShowAllTeamCourses } />
                            <Route path="create" component={ CreateTeamCourse }/>
                            <Route path="edit/:id" component={ CreateTeamCourse }/>
                        </Route>
                    </Route>

                    <Route path="order" component={ Order }>
                        <IndexRedirect to="group"/>
                        <Route path="group" component={ GroupOrder }/>
                        <Route path="team" component={ TeamOrder }/>
                        <Route path="private" component={ PrivateOrder }/>
                    </Route>

                    <Route path="student" component={ Student }/>

                    <Route path="schedule" component={ Schedule }>
                        <IndexRoute component={ ShowAllSchedule } />
                        <Route path="create" component={ DateCard }/>
                        <Route path="edit/:id" component={ DateCard }/>
                    </Route>


                    <Route path="setting" component={ Setting }>
                        <IndexRoute component={ ShowAllBanners } />
                        <Route path="create" component={ CreateBanner }/>
                        <Route path="edit/:id" component={ CreateBanner }/>
                    </Route>

                </Route>
                <Route path="/login" component={ Login } />
                <Route path="*">
                    <IndexRedirect to="/place"/>
                </Route>
            </Router>
        );
    }
}

function mapStateToProps(state) {
    return {
      token: state.token,
    };
  }

export default connect(mapStateToProps)(RouterMap);