import React from 'react';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import CreateForm from './CreateForm/CreateForm';

class CreateGroup extends React.Component {
    constructor(props, context){
        super(props);
        this.state = {
            listAdd: [
                { name: '课程管理', to: '/course/group' },
                { name: '新增集体课' }
            ],
            listEdit: [
                { name: '课程管理', to: '/course/group' },
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

export default CreateGroup;