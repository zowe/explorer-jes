/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2016, 2019
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import OrionEditor from 'orion-editor-component';
import { requestRealtimeContent, receiveRealtimeContent, invalidateRealtimeContent, markRealtimeContentRead } from '../actions/realtimeContent';
import { validateUser } from '../actions/validation';
import { SERVER_LOCATION } from '../utilities/urlUtils';

const REALTIME_CONTENT_VIEWER = 'realtime-content-viewer';
const BROWSER_SCROLL_OFFSET = 16; // Some browsers require additional offset (Firefox)

export class RealtimeContentViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stickyBottom: true,
            webSocketInitialised: false,
        };
        this.initWebsocket = this.initWebsocket.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentWillMount() {
        const { validated, dispatch } = this.props;
        if (!validated) {
            dispatch(validateUser());
        } else {
            this.initWebsocket();
        }
    }

    componentWillReceiveProps(nextProps) {
        const { dispatch, contentURI, updateUnreadLines } = this.props;
        if (contentURI !== nextProps.contentURI) {
            dispatch(invalidateRealtimeContent());
            this.uninitialiseWebSocket();
        }
        updateUnreadLines(nextProps.unreadLines);
    }

    componentWillUpdate() {
        const node = document.getElementById(REALTIME_CONTENT_VIEWER);
        if (node) {
            if (node.scrollHeight - (node.scrollTop + BROWSER_SCROLL_OFFSET) <= node.clientHeight) {
                this.state.stickyBottom = true;
            } else {
                this.state.stickyBottom = false;
            }
        }
    }

    componentDidUpdate() {
        const { validated } = this.props;
        if (validated && !this.state.webSocketInitialised) {
            this.initWebsocket();
        }
        const node = document.getElementById(REALTIME_CONTENT_VIEWER);
        if (node) {
            if (this.state.stickyBottom) {
                node.scrollTop = node.scrollHeight;
            }
            this.state.stickyBottom = !node.scrollHeight > BROWSER_SCROLL_OFFSET;
        }
    }

    componentWillUnmount() {
        this.websocket.close();
        this.uninitialiseWebSocket();
    }

    uninitialiseWebSocket() {
        this.setState(Object.assign({}, this.state, {
            webSocketInitialised: false,
        }));
    }

    initWebsocket() {
        const { contentURI, dispatch } = this.props;
        const websocketURI = `wss://${SERVER_LOCATION}/Atlas/api/sockets/${contentURI}`;

        this.websocket = new WebSocket(websocketURI);
        this.websocket.onopen = () => {
            dispatch(requestRealtimeContent());
        };
        this.websocket.onmessage = event => {
            dispatch(receiveRealtimeContent(event.data));
        };
        this.websocket.onclose = () => {
            dispatch(invalidateRealtimeContent());
        };

        this.setState(Object.assign({}, this.state, {
            webSocketInitialised: true,
        }));
    }

    handleScroll(event) {
        const { dispatch } = this.props;
        const scroller = event.target;
        if (scroller.scrollHeight - scroller.scrollTop === scroller.clientHeight) {
            dispatch(markRealtimeContentRead());
        }
    }

    render() {
        const { content, validated } = this.props;
        if (validated) {
            if (content) {
                return (
                    <OrionEditor
                        content={content}
                        syntax={'text/jclcontext'}
                        languageFilesHost={'winmvs3b.hursley.ibm.com:7445'}
                        editorTopOffset={60}
                        readonly={true}
                    />
                );
            }
        }
        return null;
    }
}

RealtimeContentViewer.propTypes = {
    content: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    contentURI: PropTypes.string.isRequired,
    validated: PropTypes.bool.isRequired,
    updateUnreadLines: PropTypes.func.isRequired,
    unreadLines: PropTypes.number,
};

function mapStateToProps(state) {
    const validationRoot = state.get('validation');
    const realtimeContentRoot = state.get('realtimeContent');
    return {
        validated: validationRoot.get('validated'),
        server: validationRoot.get('server'),
        content: realtimeContentRoot.get('content'),
        isFetching: realtimeContentRoot.get('isFetching'),
        unreadLines: realtimeContentRoot.get('unreadLines'),
    };
}

const ConnectedRealtimeContentViewer = connect(mapStateToProps)(RealtimeContentViewer);
export default ConnectedRealtimeContentViewer;
