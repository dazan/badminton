import React from 'react';
import TopMenu from '../../components/TopMenu/TopMenu';


class Place extends React.Component {
    constructor(props, context){
        super(props);
        this.state = {
            menu : [
                {
                    to: '/place',
                    txt: '场馆管理'
                }
            ],
            activeClass: 'active'
        };
    }
    render(){
        return (
            <div className="place-container">
                <TopMenu  menu={ this.state.menu } activeClass={ this.state.activeClass } />
                { this.props.children }
            </div>
        );
    }
}

export default Place;