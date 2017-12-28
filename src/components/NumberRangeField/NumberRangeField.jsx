import React from 'react';
import cx from 'classnames';
import { NumberInput } from 'zent';

const NumberSelect = (props) => {
    const value = props.value; // 拿到 { min: 0, max: 10 }
    const showError = props.isDirty && props.error; // isDirty元素值被修改过并且有错误
    const helpDesc = props.helpDesc; // 提示信息
    const mobileClassName = cx({
        'zent-form__control-group': true,
        'has-error': showError  // 这个class根据有没错误来出现
    });
    const minChange = (e) => {
        const newValue = Object.assign({}, value, {
            min: e.target.value
        });
        props.onChange(newValue);
    };
    const maxChange = (e) => {
        const newValue = Object.assign({}, value, {
            max: e.target.value
        });
       props.onChange(newValue);
        
    };
    return (
        <div className={mobileClassName}>
            <label className="zent-form__control-label">
                <em className="zent-form__required">*</em>
                人数限制：
            </label>
            <div className="zent-form__controls">
                <div className="zent-input-wrapper phone-num" style={{ display: 'inline-block', marginRight: '30px', width: '90px' }}>
                    <NumberInput 
                        value={ value.min } 
                        showStepper 
                        placeholder="最小数字" 
                        min={0}
                        onChange={ minChange }
                    />
                </div> 
                <div className="zent-input-wrapper phone-num" style={{ display: 'inline-block', width: '90px' }}>
                    <NumberInput 
                        value={ value.max } 
                        showStepper 
                        placeholder="最大数字" 
                        min={0}
                        onChange={ maxChange }
                    />
                </div> 
                {showError && <p className="zent-form__error-desc">{props.error}</p>}
                {helpDesc && <p className="zent-form__help-desc">{helpDesc}</p>}
            </div>
        </div>
    );
}

export default NumberSelect;