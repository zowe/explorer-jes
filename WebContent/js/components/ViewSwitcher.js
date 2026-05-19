/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        gap: '2px',
        marginLeft: '24px',
        padding: '3px',
        borderRadius: '8px',
        background: 'rgba(99, 102, 241, 0.06)',
        border: '1px solid rgba(99, 102, 241, 0.1)',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '5px 16px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        letterSpacing: '0.2px',
        position: 'relative',
    },
    active: {
        background: 'rgba(129, 140, 248, 0.2)',
        color: '#eef0ff',
        boxShadow: '0 0 12px rgba(129, 140, 248, 0.15)',
        border: '1px solid rgba(129, 140, 248, 0.3)',
    },
    inactive: {
        background: 'transparent',
        color: 'rgba(139, 143, 186, 0.8)',
        border: '1px solid transparent',
    },
    dot: {
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: '#818cf8',
        boxShadow: '0 0 6px rgba(129, 140, 248, 0.6)',
    },
};

const ViewSwitcher = ({ activeView, onViewChange }) => {
    const views = [
        { id: 'jes', label: 'JES Jobs', icon: '📋' },
        { id: 'ip', label: 'IP Network', icon: '🌐' },
    ];

    return (
        <div style={styles.container} role="tablist" aria-label="View Navigation">
            {views.map(view => (
                <Tooltip key={view.id} title={`Switch to ${view.label}`} placement="bottom">
                    <div
                        style={{
                            ...styles.navItem,
                            ...(activeView === view.id ? styles.active : styles.inactive),
                        }}
                        onClick={() => onViewChange(view.id)}
                        role="tab"
                        aria-selected={activeView === view.id}
                    >
                        <span style={{ fontSize: '13px' }}>{view.icon}</span>
                        <span>{view.label}</span>
                        {activeView === view.id && <span style={styles.dot}></span>}
                    </div>
                </Tooltip>
            ))}
        </div>
    );
};

ViewSwitcher.propTypes = {
    activeView: PropTypes.string.isRequired,
    onViewChange: PropTypes.func.isRequired,
};

export default ViewSwitcher;
