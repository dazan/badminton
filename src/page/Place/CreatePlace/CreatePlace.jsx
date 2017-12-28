import React from 'react';
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb';
import CreateForm from './CreateForm/CreateForm';

class CreatePlace extends React.Component {
    constructor(props, context){
        super(props);
        this.state = {
            listAdd: [
                { name: '场馆管理', to: '/place' },
                { name: '新增场馆' }
            ],
            listEdit: [
                { name: '场馆管理', to: '/place' },
                { name: '编辑' }
            ]
        }
    }
    render(){
        return (
            <div>
                <Breadcrumb breads={ this.props.params.id === undefined ? this.state.listAdd : this.state.listEdit }/>
                {/* 从url获取参数并向子组件传递 */}
                <CreateForm id={ this.props.params.id }/> 
            </div>
        )
    }
}

export default CreatePlace;