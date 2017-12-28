import React from 'react';

// 集体课
class GroupCourse extends React.Component {
    render(){
        return (
            <div>
                { this.props.children }
            </div>
        );
    }
}

export default GroupCourse;
