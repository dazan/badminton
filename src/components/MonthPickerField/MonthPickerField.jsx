import React from 'react';
import omit from 'lodash/omit';
import { Form , MonthPicker } from 'zent';
const { getControlGroup, unknownProps } = Form;

const MonthWrap = (props) => {
    const passableProps = omit(props, unknownProps);
    const onChange = (data) => {
        props.onChange(data);
    }
    return (
        <MonthPicker 
            { ...passableProps }
            onChange={ onChange }
            value={ props.value }
        />
    );
}

const CascaderField = getControlGroup(MonthWrap);

export default CascaderField;