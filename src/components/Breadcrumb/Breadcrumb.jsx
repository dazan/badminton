import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import './style.css';

class Breadcrumb extends React.Component {
    render(){
        const breads = this.props.breads;
        return (
            <div className="breadcrumb">
                {
                    breads.map((item, index) => {
                        if(index < breads.length - 1){
                            return <Link to={ item.to } key={index}>{ item.name }</Link>
                        }else{
                            return <span key={index}>{ item.name }</span>
                        }
                    })
                }
            </div>
        );
    }
}

Breadcrumb.propTypes = {
    breads: PropTypes.array.isRequired
};

export default Breadcrumb;