import React from 'react';
import TopMenu from '../../components/TopMenu/TopMenu';

class Schedule extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            menu : [  
                {
                    to: '/schedule',
                    txt: '教练排期'
                } 
            ],
            activeClass: 'active'
        }
    }
    render(){
        return (
            <div className="schedule-container">
                <TopMenu  menu={ this.state.menu } activeClass={ this.state.activeClass } />
                { this.props.children }
            </div>
        );
    }
}

export default Schedule;