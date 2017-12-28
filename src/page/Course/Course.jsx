import React from 'react';
import TopMenu from '../../components/TopMenu/TopMenu';

class Course extends React.Component {
    constructor(props, context){
        super(props);
        this.state = {
            menu : [
                {
                    to: '/course/group',
                    txt: '集体课'
                },
                {
                    to: '/course/team',
                    txt: '团课'
                }
            ],
            activeClass: 'active'
        };
    }
    render(){
        return (
            <div>
                <TopMenu activeClass={ this.state.activeClass } menu={ this.state.menu }/>
                <div className="course-container">{ this.props.children }</div>
            </div>
        );
    }
}

export default Course;