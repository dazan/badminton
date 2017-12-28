import React from 'react';
import omit from 'lodash/omit';
import { Form } from 'zent';
import Ueditor from '../Ueditor/Ueditor';

const { getControlGroup, unknownProps } = Form;

const UeditorWrap = (props) => {
    const passableProps = omit(props, unknownProps);
    const wrappedOnChange = (v) => {
        props.onChange(v); 
    };
    // 图片上，需要调用Ueditor类上的静态方法
    const uploadHandler = (file) => {
          props.upLoadImage(file).then(function(src){
              Ueditor.insertImage(src);
          });
    }
    return (
        <Ueditor 
            {...passableProps}
            value={ props.value }
            onChange={ wrappedOnChange }
            uploadImage={ uploadHandler }
        />
    );
  };

const UeditorField = getControlGroup(UeditorWrap);

export default UeditorField;