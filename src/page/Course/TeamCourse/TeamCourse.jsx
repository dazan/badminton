import React from 'react';

class TeamCourse extends React.Component {
    render(){
        return (
            <div>
                { this.props.children }
            </div>
        );
    }
}

export default TeamCourse;
