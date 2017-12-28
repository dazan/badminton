import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import './style.css';

class TopMenu extends React.Component {
    render(){
        const { menu, activeClass } = this.props;
        return (
            <div className="menu-wrapper"> 
                <ul className="menu-ul">
                    {
                        menu.map((item, index) => {
                            return <li key={ index }><Link to={ item.to } activeClassName={ activeClass } >{ item.txt }</Link></li>
                        })
                    }
                </ul>
            </div>
        );
    }
}

TopMenu.propTypes = {
    menu: PropTypes.array.isRequired,
    activeClass: PropTypes.string.isRequired
};

export default TopMenu;