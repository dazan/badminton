import React from 'react';
import omit from 'lodash/omit';
import { Form , DatePicker } from 'zent';
const { getControlGroup, unknownProps } = Form;

const DatePickerWrap = (props) => {
    const passableProps = omit(props, unknownProps);
    const onChange = (v) => {
        props.onChange(v);
    }
    return (
        <DatePicker 
            { ...passableProps }
            onChange={ onChange }
            value={ props.value }
        />
    );
}

const DatePickerField = getControlGroup(DatePickerWrap);

export default DatePickerField;