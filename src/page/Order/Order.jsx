import React from 'react';
import TopMenu from '../../components/TopMenu/TopMenu';
import './style.css';

class Order extends React.Component {
    constructor(props, context){
        super(props);
        this.state = {
            menu : [
                {
                    to: '/order/group',
                    txt: '集体课'
                },
                {
                    to: '/order/team',
                    txt: '团课'
                },
                {
                    to: '/order/private',
                    txt: '私教'
                }
            ],
            activeClass: 'active'
        };
    }
    render(){
        return (
            <div>
                <TopMenu activeClass={ this.state.activeClass } menu={ this.state.menu }/>
                <div className="order-container">{ this.props.children }</div>
            </div>
        );
    }
}

export default Order;