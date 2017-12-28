import React from 'react';
import TopMenu from '../../components/TopMenu/TopMenu';

class Coach extends React.Component {
    constructor(props, context){
        super(props, context);
        this.state = {
            menu : [
                {
                    to: '/coach',
                    txt: '教练管理'
                }
            ],
            activeClass: 'active'
        };
    }
    render(){
        return (
            <div className="coach-container">
                <TopMenu activeClass={ this.state.activeClass } menu={ this.state.menu }/>
                {
                    this.props.children
                }
            </div>
        );
    }
}

export default Coach;