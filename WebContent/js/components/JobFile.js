/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2019
 */

import PropTypes from 'prop-types';
import React from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import Description from '@material-ui/icons/Description';
import { fetchJobFile, getFileLabel, changeSelectedContent } from '../actions/content';

class JobFile extends React.Component {
    constructor(props) {
        super(props);
        this.openFile = this.openFile.bind(this);
    }

    openFile() {
        const { content, dispatch, job, file } = this.props;
        // Is the file already open?
        if (content.filter(x => { return x.label === getFileLabel(job.get('jobId'), file.label); }).size > 0) {
            // Find which index the file is open in and change to it
            content.forEach(x => {
                if (x.label === getFileLabel(job.get('jobId'), file.label)) {
                    dispatch(changeSelectedContent(content.indexOf(x)));
                }
            });
        } else {
            dispatch(fetchJobFile(job.get('jobName'), job.get('jobId'), file.label, file.id));
        }
    }

    render() {
        const { file } = this.props;
        return (
            <li className="job-file">
                <span
                    className="content-link"
                    onClick={() => { this.openFile(); }}
                >
                    <Description className="node-icon" />
                    <span>{file.label}</span>
                </span>
            </li>);
    }
}

JobFile.propTypes = {
    job: PropTypes.instanceOf(Map).isRequired,
    content: PropTypes.instanceOf(List),
    file: PropTypes.shape({
        label: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
    }),
    dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const contentRoot = state.get('content');
    return {
        content: contentRoot.get('content'),
    };
}

const ConnectedJobFile = connect(mapStateToProps)(JobFile);
export default ConnectedJobFile;
