
import React from 'react';
import omit from 'lodash/omit';
import { Form , Select } from 'zent';
const { getControlGroup, unknownProps } = Form;

const SelectWrap = (props) => {
    const passableProps = omit(props, unknownProps);
    const onChange = (data) => {
        props.onChange(data);
    }
    const onDelete = (item) => {
        props.onDelete(item);
    }
    return (
        <Select 
            { ...passableProps }
            onChange={ onChange }
            onDelete={ onDelete }
            data={ props.data }
            value={ props.value }
        />
    );
}

const CascaderField = getControlGroup(SelectWrap);

export default CascaderField;