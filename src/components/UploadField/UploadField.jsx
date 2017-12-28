/**
 *            父组件需传入:
                    value={ this.state.imageList }
                    maxAmount={ this.state.maxAmount }
                    setImage={ this.setImage.bind(this) }  // 增加图片
                    deleteImage={ this.deleteImage.bind(this) }  // 删除图片
    父组件的state需要有: imageList maxAmount
    父组件的function需要有: setImage deleteImage
 */
import React from 'react';
import omit from 'lodash/omit';
import { Form , Upload, previewImage } from 'zent';
import PropTypes from 'prop-types';
// 右上角点击删除图片的btn的样式
import './style.css';

const { getControlGroup, unknownProps } = Form;

const UploadWrap = (props) => {
    const passableProps = omit(props, unknownProps);
    const wrappedOnChange = (imgs) => {
      // 存储图片
      props.setImage(imgs);
    };
    // 删除图片
    function deleteFn(){
        let index = this;
        props.deleteImage(index);
    }
    // 预览
    function handlePreview(e) {
      const imgArr = props.value.map(item => item.src);
      previewImage({
        images: imgArr,
        index: imgArr.indexOf(e.target.src)
      });
    }
    return (<div>
      <Upload {...passableProps} onUpload={wrappedOnChange} localOnly />
      {
        props.value && props.value.map((item, index) => {
          return <div className="img-wrapper" key={index}>
                    <img width="80" height="80"  src={ item.src } alt={ 'img_' + index } onClick={ (e) => { handlePreview(e)} }/>
                    <span className="close-btn" onClick={ deleteFn.bind(index) }>×</span>
                 </div>
        })
      } 
    </div>);
  };

  

const UploadField = getControlGroup(UploadWrap);


UploadField.propTypes = {
  value: PropTypes.array.isRequired,
  maxAmount: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired,
  ]),
  setImage: PropTypes.func.isRequired,
  deleteImage: PropTypes.func.isRequired
};

export default UploadField;