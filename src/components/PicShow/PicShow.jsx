import React from 'react';
import PropTypes from 'prop-types';
import { previewImage } from 'zent';
import './style.css';

class PicShow extends React.Component {
    constructor(props){
        super(props);
        // 默认是“省略号”状态
        this.state = {
            show: false
        };
    }
    handlerClick(){
        this.setState({
            show: true
        });
    }
    handlePreview(e) {
        const imgArr = this.props.imgList.map(item => item.url);
        previewImage({
          images: imgArr,
          index: imgArr.indexOf(e.target.src)
        });
    }
    render(){
        const { imgList } = this.props;
        const { show } = this.state;
        let showPic = null;

        if(imgList&&!show){
            if(imgList.length === 1){
                showPic = (
                    <img src={ imgList[0].url } width="50px" height="50px" onClick={ (e) => { this.handlePreview(e)} }/>
                );
            }else {
                showPic = (
                    <ul>
                        <li><img src={ imgList[0].url } width="50px" height="50px" onClick={ (e) => { this.handlePreview(e)} } /></li>
                        <li className="more-pic" onClick={ () => { this.handlerClick() } }>...</li>
                    </ul>
                )
            }
        }else{
            showPic = (
                <ul className="all-pic">
                    {
                        imgList.map((item, index) => <li><img src={ item.url } alt={ `img__${ index }` } width="50px" height="50px" onClick={ (e) => { this.handlePreview(e)} } /></li>)
                    }
                </ul>
            )
        }

        return (
            <div className="pic-wrapper">
                    { showPic }
            </div>
        );
    }
}

PicShow.propTypes = {
    imgList: PropTypes.array.isRequired    
};

export default PicShow;