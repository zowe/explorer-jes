import PropTypes from 'prop-types';
import React from 'react';
import { Map } from 'immutable';
import LabelIcon from 'material-ui/svg-icons/action/label';
import { fetchJobFilesAndSteps, toggleJob } from '../actions/jobNodes';
import JobFile from './JobFile';


export default class JobInstance extends React.Component {
    handleJobToggle(job) {
        const { dispatch } = this.props;
        if (!job.get('isToggled') && !job.get('files').length > 0) {
            dispatch(fetchJobFilesAndSteps(job.get('jobName'), job.get('jobId')));
        } else {
            dispatch(toggleJob(job.get('jobId')));
        }
    }

    renderJobFiles(job) {
        const { dispatch } = this.props;
        return job.get('files').map(file => {
            return (<JobFile key={file.id} job={job} dispatch={dispatch} file={file} />);
        });
    }

    render() {
        const { job } = this.props;
        return (
            <div>
                <li>
                    <span onClick={() => { this.handleJobToggle(job); }}>
                        <LabelIcon className="node-icon" />
                        <span>{job.get('label')}</span>
                    </span>
                </li>
                <ul>
                    {job.get('isToggled') ? this.renderJobFiles(job) : null}
                </ul>
            </div>);
    }
}

JobInstance.propTypes = {
    dispatch: PropTypes.func.isRequired,
    job: PropTypes.instanceOf(Map).isRequired,
};
