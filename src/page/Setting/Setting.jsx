import React from 'react';
import TopMenu from '../../components/TopMenu/TopMenu';


class Setting extends React.Component {
    constructor(props, context){
        super(props);
        this.state = {
            menu : [
                {
                    to: '/setting',
                    txt: '运营设置'
                }
            ],
            activeClass: 'active'
        };
    }
    render(){
        return (
            <div className="setting-container">
                <TopMenu  menu={ this.state.menu } activeClass={ this.state.activeClass } />
                { this.props.children }
            </div>
        );
    }
}

export default Setting;