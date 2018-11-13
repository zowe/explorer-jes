import PropTypes from 'prop-types';
import React from 'react';
import { Map } from 'immutable';
import DescriptionIcon from 'material-ui/svg-icons/action/description';
import { fetchJobFile } from '../actions/content';

const JobFile = props => {
    const { job, file, dispatch } = props;
    return (
        <li>
            <span
                className="content-link"
                onClick={() => { dispatch(fetchJobFile(job.get('jobName'), job.get('jobId'), file.label, file.id)); }}
            >
                <DescriptionIcon className="node-icon" />
                <span>{file.label}</span>
            </span>
        </li>);
};
export default JobFile;

JobFile.propTypes = {
    job: PropTypes.instanceOf(Map).isRequired,
    file: PropTypes.shape({
        label: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
    }),
    dispatch: PropTypes.func.isRequired,
};
