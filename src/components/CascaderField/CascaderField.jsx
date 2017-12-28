/**
 *      父组件需传入:
                value={ this.state.city }
                options={ this.state.cityOptions }
                loadMore={ this.loadMore }
                changeCity={ this.changeCity.bind(this) }
        父组件的state需要有: city cityOptions
        父组件的function需要有: loadMore changeCity
 */

import React from 'react';
import omit from 'lodash/omit';
import { Form , Cascader } from 'zent';
import PropTypes from 'prop-types';
const { getControlGroup, unknownProps } = Form;

const CascaderWrap = (props) => {
    const passableProps = omit(props, unknownProps);
    const onChange = (data) => {
        props.changeCity(data);
    }
    return (
        <Cascader 
            { ...passableProps }
            options={ props.options }
            loadMore={ props.loadMore }
            onChange={ onChange }
            value={ props.value.map(item => item.id) }
        />
    );
}

CascaderWrap.propTypes = {
    value: PropTypes.array.isRequired,
    options: PropTypes.array.isRequired,
    loadMore: PropTypes.func.isRequired,
    changeCity: PropTypes.func.isRequired
};

const CascaderField = getControlGroup(CascaderWrap);

export default CascaderField;