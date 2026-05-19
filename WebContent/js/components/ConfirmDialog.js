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
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import WarningIcon from '@material-ui/icons/Warning';

/**
 * Generic confirmation dialog for destructive actions
 */
const ConfirmDialog = ({ open, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel, severity = 'danger' }) => {
    const accentColor = severity === 'danger' ? 'var(--accent-rose)' : 'var(--accent-amber)';

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{
            style: {
                background: 'var(--bg-surface)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
            }
        }}>
            <DialogTitle style={{ paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <WarningIcon style={{ fontSize: 20, color: accentColor }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
                </div>
            </DialogTitle>
            <DialogContent>
                <DialogContentText style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions style={{ padding: '8px 16px 16px' }}>
                <Button onClick={onCancel} style={{
                    textTransform: 'none', fontSize: '12px', fontWeight: 500,
                    color: 'var(--text-secondary)', borderRadius: '6px',
                }}>
                    {cancelLabel}
                </Button>
                <Button onClick={onConfirm} style={{
                    textTransform: 'none', fontSize: '12px', fontWeight: 600,
                    color: '#fff', background: accentColor, borderRadius: '6px',
                    padding: '4px 16px',
                }}>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
