/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/Info';
import { popNotification } from '../actions/notifications';

const SEVERITY_STYLES = {
    success: { background: 'var(--bg-surface)', borderLeft: '4px solid var(--accent-emerald)', color: 'var(--text-primary)' },
    error: { background: 'var(--bg-surface)', borderLeft: '4px solid var(--accent-rose)', color: 'var(--text-primary)' },
    warning: { background: 'var(--bg-surface)', borderLeft: '4px solid var(--accent-amber)', color: 'var(--text-primary)' },
    info: { background: 'var(--bg-surface)', borderLeft: '4px solid var(--accent-indigo)', color: 'var(--text-primary)' },
};

const SEVERITY_ICONS = {
    success: <CheckCircleIcon style={{ fontSize: 18, color: 'var(--accent-emerald)', marginRight: '8px' }} />,
    error: <ErrorIcon style={{ fontSize: 18, color: 'var(--accent-rose)', marginRight: '8px' }} />,
    warning: <WarningIcon style={{ fontSize: 18, color: 'var(--accent-amber)', marginRight: '8px' }} />,
    info: <InfoIcon style={{ fontSize: 18, color: 'var(--accent-indigo)', marginRight: '8px' }} />,
};

const NotificationSnackbar = ({ messages, dispatch }) => {
    const currentMsg = messages && messages.size > 0 ? messages.first() : null;

    useEffect(() => {
        if (currentMsg) {
            const timer = setTimeout(() => {
                dispatch(popNotification());
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [currentMsg, dispatch]);

    if (!currentMsg) return null;

    const severity = currentMsg.get('severity') || 'info';
    const message = currentMsg.get('message') || '';

    return (
        <Snackbar
            open={true}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            onClose={() => dispatch(popNotification())}
        >
            <div style={{
                ...SEVERITY_STYLES[severity],
                display: 'flex', alignItems: 'center',
                padding: '10px 16px', borderRadius: '8px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(8px)',
                fontSize: '12.5px', fontWeight: 500,
                maxWidth: '420px',
            }}>
                {SEVERITY_ICONS[severity]}
                <span style={{ flex: 1 }}>{message}</span>
                <IconButton size="small" onClick={() => dispatch(popNotification())} style={{ marginLeft: '8px', padding: '2px', color: 'var(--text-muted)' }}>
                    <CloseIcon style={{ fontSize: 14 }} />
                </IconButton>
            </div>
        </Snackbar>
    );
};

function mapStateToProps(state) {
    const notifs = state.get('notifications');
    return {
        messages: notifs ? notifs.get('messages') : null,
    };
}

export default connect(mapStateToProps)(NotificationSnackbar);
