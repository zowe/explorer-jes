/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2019, 2020
 */

import PropTypes from 'prop-types';
import React from 'react';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import Description from '@material-ui/icons/Description';
import { hideMenu } from 'react-contextmenu/modules/actions';
import { fetchJobFile, getFileLabel, changeSelectedContent, downloadFile } from '../actions/content';

class JobFile extends React.Component {
    constructor(props) {
        super(props);
        this.isFileOpen = this.isFileOpen.bind(this);
        this.openFile = this.openFile.bind(this);
        this.refreshFile = this.refreshFile.bind(this);
        this.downloadJobFile = this.downloadJobFile.bind(this);
        this.openInNewWindow = this.openInNewWindow.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.state = {
            menuShortCuts: true,
            menuVisible: false,
        };

        this.checkForShowDD();
    }

    checkForShowDD() {
        const { file, showDD } = this.props;
        if (file && file.label && file.label === showDD) {
            this.openFile();
        }
    }

    isFileOpen() {
        const { content, job, file } = this.props;
        return content.filter(x => { return x.id === getFileLabel(job.get('jobId'), file.label) + file.id; }).size > 0;
    }

    openFile() {
        const { content, dispatch, job, file } = this.props;
        if (this.isFileOpen()) {
            // Find which index the file is open in and change to it
            content.forEach(x => {
                if (x.id === getFileLabel(job.get('jobId'), file.label) + file.id) {
                    dispatch(changeSelectedContent(content.indexOf(x)));
                }
            });
        } else {
            dispatch(fetchJobFile(job.get('jobName'), job.get('jobId'), file.label, file.id));
        }
    }

    refreshFile() {
        const { dispatch, job, file } = this.props;
        dispatch(fetchJobFile(job.get('jobName'), job.get('jobId'), file.label, file.id, true));
    }

    downloadJobFile() {
        const { job, file, dispatch } = this.props;
        const url = `zosmf/restjobs/jobs/${job.get('jobName')}/${job.get('jobId')}/files/${file.id}/records`;
        downloadFile(job, file.label, url, dispatch);
    }

    openInNewWindow() {
        const { job, file } = this.props;
        const baseURI = `${window.location.origin}${window.location.pathname}`;
        const newWindow = window.open(`${baseURI}#/viewer?jobName=${job.get('jobName')}&jobId=${job.get('jobId')}&fileId=${file.id}`, '_blank');
        newWindow.focus();
    }

    hideContextMenu() {
        hideMenu();
        this.setState({ menuVisible: false });
    }

    handleKeyDown(e) {
        if (e.metaKey || e.altKey || e.ctrlKey) {
            return;
        }
        if (e.key === 'Enter' && this.state.menuVisible === false) {
            this.openFile();
        }
        if (this.state.menuShortCuts && this.state.menuVisible) {
            if (e.key.toLowerCase() === 'd') {
                this.downloadJobFile();
                this.hideContextMenu();
            }
            if (e.key.toLowerCase() === 'o') {
                this.openInNewWindow();
                this.hideContextMenu();
            }
            if (e.key.toLowerCase() === 'r') {
                this.refreshFile();
                this.hideContextMenu();
            }
        }
    }

    renderJobFileMenu() {
        const { job, file } = this.props;
        const menuItems = [
            <MenuItem onClick={this.downloadJobFile} key="download" >
                <u>D</u>ownload
            </MenuItem>,
            <MenuItem onClick={this.openInNewWindow} key="fullscreen" >
                <u>O</u>pen in Fullscreen
            </MenuItem>,
        ];

        if (this.isFileOpen()) {
            menuItems.push(
                <MenuItem onClick={() => { return this.refreshFile(); }} key="refresh" >
                    <u>R</u>efresh Content
                </MenuItem>,
            );
        }
        return (
            <ContextMenu
                id={`${job.get('jobId')}${file.id}`}
                style={{ zIndex: '100' }}
                onShow={() => { this.setState({ menuVisible: true }); }}
                onHide={() => { this.setState({ menuVisible: false }); }}
            >
                <MenuItem onClick={this.downloadJobFile} >
                    <u>D</u>ownload
                </MenuItem>
                <MenuItem onClick={this.openInNewWindow}>
                    <u>O</u>pen in Fullscreen
                </MenuItem>
            </ContextMenu>
        );
    }

    render() {
        const { job, file } = this.props;
        return (
            <div>
                <li className="job-file" role="none">
                    <ContextMenuTrigger id={`${job.get('jobId')}${file.id}`}>
                        <span
                            className="content-link"
                            onClick={() => { this.openFile(); }}
                            onKeyDown={this.handleKeyDown}
                            tabIndex="0"
                            role="treeitem"
                            aria-level="2"
                            aria-haspopup={true}
                            style={this.state.menuVisible ? { border: '1px solid #333333' } : null}
                        >
                            <Description className="node-icon" />
                            <span className="job-file-label">{file.label}</span>
                        </span>
                    </ContextMenuTrigger>
                </li>
                {this.renderJobFileMenu()}
            </div>);
    }
}

JobFile.propTypes = {
    job: PropTypes.instanceOf(Map).isRequired,
    showDD: PropTypes.string,
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
