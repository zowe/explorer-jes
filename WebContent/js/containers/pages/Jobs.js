/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2020
 */

import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import IconButton from '@material-ui/core/IconButton';
import JobTree from '../JobTree';
import ConnectedContentViewer from '../ContentViewer';
import LoginDialog from '../../components/dialogs/LoginDialog';
import ConnectedSnackbar from '../../components/Snackbar';
import debounce from '../../utilities/debouncer';
import TopBar from '../../components/TopBar';

const HomeView = props => {
    const isEmbedded = window.top !== window;
    const { validated } = props;
    const gridOfTwelveCol3 = 0.238;
    const widthForFullScreen = 600;
    const minContainerWidth = 260;

    const [moveMode, setMoveMode] = useState(false);
    const [collapsed, setCollapse] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [treeWidthPercent, setTreeWidth] = useState(gridOfTwelveCol3);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth * treeWidthPercent < minContainerWidth) {
                setTreeWidth(minContainerWidth / window.innerWidth);
            }
        };
        const debHandleResize = debounce(handleResize, 100);
        window.addEventListener('resize', debHandleResize);
        return () => {
            window.removeEventListener('resize', debHandleResize);
        };
    });

    const recalcTreeWidth = mouseX => {
        const maxTreeWidth = window.innerWidth - minContainerWidth;
        const halfBarWidthCorrection = window.innerWidth * 0.005;
        let newX = mouseX;
        if (mouseX < minContainerWidth || mouseX > maxTreeWidth) {
            newX = (minContainerWidth < mouseX) ? maxTreeWidth : minContainerWidth;
        }
        setTreeWidth((newX - halfBarWidthCorrection) / window.innerWidth);
    };
    const debRecalcTreeWidth = debounce(recalcTreeWidth, 10);

    const onDraggingStart = event => {
        if (!collapsed) {
            event.preventDefault();
            setMoveMode(true);
        }
    };
    const onDragging = event => {
        if (moveMode) {
            debRecalcTreeWidth(event.clientX);
        }
    };
    const onDraggingEnd = event => {
        if (moveMode) {
            debRecalcTreeWidth(event.clientX);
            setMoveMode(false);
        }
    };

    if (validated) {
        return (
            <div className="row group" role="main" aria-label="Home">
                { !isEmbedded && <TopBar /> }
                <div
                    className={moveMode ? 'action-layer draggable' : 'action-layer'}
                    onMouseUp={onDraggingEnd}
                    onMouseMove={onDragging}
                >
                    <div
                        id="explorer-sidebar"
                        className={`component col col-3 ${collapsed ? 'hidden' : ''}`}
                        style={windowWidth <= widthForFullScreen ? {} : { width: `${treeWidthPercent * 100}%` }}
                        region="search-jobs"
                        aria-label="Search Jobs"
                    >
                        <JobTree />
                    </div>
                    <div
                        className={`component col col-0-1 collapse-col ${collapsed ? '' : 'draggable'} `}
                        onMouseDown={onDraggingStart}
                        region="resize-bar"
                        aria-label="Resize Bar"
                    >
                        <IconButton
                            className="collapse-btn"
                            onClick={() => {
                                setCollapse(!collapsed);
                            }}
                            onMouseDown={e => {
                                e.stopPropagation();
                            }}
                            aria-label="Collapse Tree"
                        >
                            <KeyboardArrowLeftIcon className={collapsed ? 'rotate-180' : ''} />
                        </IconButton>
                    </div>
                    <div
                        id="explorer-viewer-home"
                        className={`component col ${collapsed ? 'col-11-8' : 'col-9-2'}`}
                        style={(collapsed || windowWidth <= widthForFullScreen) ? {} : { width: `calc(100% - ${treeWidthPercent * 100}% - 2%)` }}
                        region="content-viewer"
                        aria-label="Content Viewer"
                    >
                        <ConnectedContentViewer />
                    </div>
                    <ConnectedSnackbar />
                </div>
            </div>
        );
    }
    return <LoginDialog />;
};

HomeView.propTypes = {
    validated: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    const validationRoot = state.get('validation');
    return {
        validated: validationRoot.get('validated'),
        isValidating: validationRoot.get('isValidating'),
    };
}

const ConnectedHomeView = connect(mapStateToProps)(HomeView);
export default ConnectedHomeView;
