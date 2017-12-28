/**
 * 
 *  父组件需要传入
 *  uploadImage 上传图片的方法
 *  value: 富文本的value值
 *  onChange: 富文本value值更改时触发的
 *  toobars: 配置需要显示的按钮
 * 
 */
import React from 'react';
import PropTypes from 'prop-types';

let content = ''  // 存储编辑器的实时数据，用于传递给父组件
let ueditor, isContentChangedByWillReceiveProps = false, tempfileInput = null;
let firstIn = false; // 第一次进来这个组件 

class ReactUeditor extends React.Component {

constructor() {
    super()
    this.uploadImage = this.uploadImage.bind(this)
}

componentDidMount() {
    this.createScript('/utf8-jsp/ueditor.config.js').then(() => {
        this.createScript('/utf8-jsp/ueditor.all.js').then(() => {
            this.createScript('/utf8-jsp/lang/zh-cn/zh-cn.js').then(() => {
                this.createScript('/utf8-jsp/uploadImage.js').then(() => {
                    tempfileInput = document.getElementById('tempfileInput');
                    this.initEditor(); // 调用初始化编译器的方法
                });
            });
        });
    });
}

createScript(url) {
    return new Promise((resolve, reject) => {
        let node = document.createElement('script')
        node.src = url
        node.onload = resolve
        document.body.appendChild(node)
    });
}

  /**
   * 需注释！！！
   * 这里存在两种情况会改变编辑器的内容：
   * 1. 父组件初始化传递的 value。父组件 value 的获取是异步的，因此会触发一次 componentWillReceiveProps，这种情况不需要将更新再通知父组件
   * 2. 用户对编辑器进行编辑
   */
  componentWillReceiveProps(nextProps) {
    // 编辑模式才走这里， create模式不走这里
    if ('value' in nextProps && this.props.value !== nextProps.value && firstIn === false && this.props.action === 'edit') {
      firstIn = true; // 为解决初始value传进来，ueditor还没ready的情况
      //console.log('进来了');
      isContentChangedByWillReceiveProps = true
      content = nextProps.value

      if (ueditor) {
        ueditor.ready(() => {
          ueditor.setContent(nextProps.value);
        })
      }
    }
  }

  componentWillUnmount() {
    // 这里需要在组件摧毁时把firstIn这个标志位置false，不然一直存在内存中并且为true
    firstIn = false;
    if (ueditor) {
      ueditor.destroy();
    }
  }

  uploadImage(e) {
    let props = this.props
    if (props.uploadImage) {
      props.uploadImage(e.target.files[0]);
    }
    tempfileInput.value = ''
  }

  // 静态方法
  static insertImage(imageUrl) {
    if (ueditor) {
      ueditor.focus()
      ueditor.execCommand('inserthtml', '<img src="' + imageUrl + '" />')
    }
  }

  initEditor() {
    const props  = this.props;
    ueditor = window.UE.getEditor('container', {
        toolbars: [[
            'fullscreen', '|',
            'bold', 'italic', 'underline', 'strikethrough', 'blockquote', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', '|',
            'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
            'paragraph', 'fontsize', '|',
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
            'link', 'removeformat', '|',
            'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols'
        ]],
        initialFrameWidth: 700,   //初始化编辑器宽度
        initialFrameHeight: 150,  //初始化编辑器高度
        elementPathEnabled : false
    });
    ueditor.ready(() => {
      ueditor.addListener('contentChange', () => {
        // 由 componentWillReceiveProps 导致的 contentChange 不需要通知父组件
        if (isContentChangedByWillReceiveProps) {
          isContentChangedByWillReceiveProps = false;
        } else {
          content = ueditor.getContent();
          if (props.onChange) {
            props.onChange(ueditor.getContent())
          }
        }
      });

      if (isContentChangedByWillReceiveProps) {
        isContentChangedByWillReceiveProps = false;
        ueditor.setContent(content);
      } else {
        ueditor.setContent(props.value);
      }
      
    });
  }

  render() {
    return (
      <div>
        <script id="container" type="text/plain"></script>
        <input type="file" id="tempfileInput" onChange={ this.uploadImage } style={{ display: 'none'}}/>
      </div>
    )
  }
}

ReactUeditor.propTypes = {
  action: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  uploadImage: PropTypes.func.isRequired
};


export default ReactUeditor;