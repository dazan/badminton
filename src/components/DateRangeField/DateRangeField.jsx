import React from 'react';
import omit from 'lodash/omit';
import { Form , DateRangeQuickPicker } from 'zent';
const { getControlGroup, unknownProps } = Form;

const DateRangeQuickPickerWrap = (props) => {
    const passableProps = omit(props, unknownProps);
    const onChange = (v) => {
        props.onChange(v);
    }
    return (
        <DateRangeQuickPicker 
            { ...passableProps }
            onChange={ onChange }
            value={ props.value }
            format="YYYY-MM-DD HH:mm:ss"
        />
    );
}

const DateRangeField = getControlGroup(DateRangeQuickPickerWrap);

export default DateRangeField;