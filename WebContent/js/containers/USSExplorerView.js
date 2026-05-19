/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import FolderIcon from '@material-ui/icons/Folder';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import SaveIcon from '@material-ui/icons/Save';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import HomeIcon from '@material-ui/icons/Home';
import CloseIcon from '@material-ui/icons/Close';
import ConfirmDialog from '../components/ConfirmDialog';
import {
    fetchUSSChildren, fetchDirectoryChildren, fetchUSSContent, saveUSSContent,
    saveAsUSSContent, setUSSPath, resetUSSChildren, toggleDirectory, downloadUSSFile,
    createUSSResource, deleteUSSResource, resetDirChildren, invalidateUSSFile,
} from '../actions/ussExplorer';

// ═══════════════════════════════════════════════════════════════
// DIRECTORY NODE COMPONENT
// ═══════════════════════════════════════════════════════════════

const DirectoryNode = ({ item, dispatch, isToggled, dirChildren, toggledDirs, activeFile, level = 0,
    onDelete, onCreateFile, onCreateDir }) => {
    const path = item.get('path');
    const name = item.get('name');

    const handleClick = useCallback(() => {
        if (!isToggled) {
            dispatch(fetchDirectoryChildren(path));
        } else {
            dispatch(toggleDirectory(path));
        }
    }, [path, isToggled, dispatch]);

    const handleDoubleClick = useCallback(() => {
        dispatch(resetUSSChildren());
        dispatch(resetDirChildren());
        dispatch(setUSSPath(path));
        dispatch(fetchUSSChildren(path));
    }, [path, dispatch]);

    const handleDelete = useCallback((e) => {
        e.stopPropagation();
        onDelete(path);
    }, [path, onDelete]);

    const handleCreateFile = useCallback((e) => {
        e.stopPropagation();
        onCreateFile(path);
    }, [path, onCreateFile]);

    const handleCreateDir = useCallback((e) => {
        e.stopPropagation();
        onCreateDir(path);
    }, [path, onCreateDir]);

    const children = dirChildren.get(path);

    return (
        <div style={{ marginLeft: level > 0 ? '12px' : '0' }}>
            <div
                className="uss-node-row"
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                style={{
                    display: 'flex', alignItems: 'center', padding: '4px 8px',
                    borderRadius: '6px', cursor: 'pointer', transition: 'all 150ms ease',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', marginRight: '2px', transition: 'transform 150ms ease', transform: isToggled ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                    <ExpandMoreIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
                </span>
                {isToggled ? (
                    <FolderOpenIcon style={{ fontSize: 16, color: 'var(--accent-amber)', marginRight: '8px' }} />
                ) : (
                    <FolderIcon style={{ fontSize: 16, color: 'var(--accent-amber)', marginRight: '8px' }} />
                )}
                <span style={{
                    fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', flex: 1,
                    fontFamily: 'var(--font-mono)',
                }}>
                    {name}
                </span>
                <div className="uss-node-actions" style={{ display: 'flex', gap: '2px', opacity: 0, transition: 'opacity 150ms ease' }}>
                    <Tooltip title="New File">
                        <IconButton size="small" onClick={handleCreateFile} style={{ padding: '2px' }}>
                            <NoteAddIcon style={{ fontSize: 13, color: 'var(--accent-cyan)' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="New Folder">
                        <IconButton size="small" onClick={handleCreateDir} style={{ padding: '2px' }}>
                            <CreateNewFolderIcon style={{ fontSize: 13, color: 'var(--accent-emerald)' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" onClick={handleDelete} style={{ padding: '2px' }}>
                            <DeleteIcon style={{ fontSize: 13, color: 'var(--accent-rose)' }} />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            {isToggled && children && (
                <div className="uss-children-list" style={{ borderLeft: '1px solid var(--border-subtle)', marginLeft: '10px', paddingLeft: '4px' }}>
                    {children
                        .filter(child => child.get('type') === 'directory')
                        .sortBy(child => child.get('name'))
                        .map(child => (
                            <DirectoryNode
                                key={child.get('path')}
                                item={child}
                                dispatch={dispatch}
                                isToggled={!!toggledDirs.get(child.get('path'))}
                                dirChildren={dirChildren}
                                toggledDirs={toggledDirs}
                                activeFile={activeFile}
                                level={level + 1}
                                onDelete={onDelete}
                                onCreateFile={onCreateFile}
                                onCreateDir={onCreateDir}
                            />
                        ))}
                    {children
                        .filter(child => child.get('type') === 'file')
                        .sortBy(child => child.get('name'))
                        .map(child => (
                            <FileNode
                                key={child.get('path')}
                                item={child}
                                dispatch={dispatch}
                                isActive={activeFile === child.get('path')}
                                onDelete={onDelete}
                            />
                        ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// FILE NODE COMPONENT
// ═══════════════════════════════════════════════════════════════

const FileNode = ({ item, dispatch, isActive, onDelete }) => {
    const path = item.get('path');
    const name = item.get('name');

    const handleClick = useCallback(() => {
        dispatch(fetchUSSContent(path));
    }, [path, dispatch]);

    const handleDownload = useCallback((e) => {
        e.stopPropagation();
        dispatch(downloadUSSFile(path));
    }, [path, dispatch]);

    const handleDelete = useCallback((e) => {
        e.stopPropagation();
        onDelete(path);
    }, [path, onDelete]);

    // Determine file icon color by extension
    const ext = name.split('.').pop().toLowerCase();
    let iconColor = 'var(--accent-cyan)';
    if (['sh', 'bash', 'ksh'].includes(ext)) iconColor = 'var(--accent-emerald)';
    else if (['jcl', 'cntl'].includes(ext)) iconColor = 'var(--accent-violet)';
    else if (['xml', 'json', 'yaml', 'yml'].includes(ext)) iconColor = 'var(--accent-amber)';
    else if (['rexx', 'rex'].includes(ext)) iconColor = 'var(--accent-rose)';
    else if (['c', 'h', 'cpp', 'cxx'].includes(ext)) iconColor = 'var(--accent-indigo)';
    else if (['py', 'pl'].includes(ext)) iconColor = 'var(--accent-violet)';

    return (
        <div
            className={`uss-file-row ${isActive ? 'uss-node-active' : ''}`}
            onClick={handleClick}
            style={{
                display: 'flex', alignItems: 'center', padding: '3px 8px', marginLeft: '12px',
                borderRadius: '5px', cursor: 'pointer', transition: 'all 150ms ease',
                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
            }}
        >
            <InsertDriveFileIcon style={{ fontSize: 14, color: iconColor, marginRight: '8px' }} />
            <span style={{
                fontSize: '11.5px', fontWeight: 500, color: 'var(--text-primary)', flex: 1,
                fontFamily: 'var(--font-mono)',
            }}>
                {name}
            </span>
            <div className="uss-node-actions" style={{ display: 'flex', gap: '2px', opacity: 0, transition: 'opacity 150ms ease' }}>
                <Tooltip title="Download">
                    <IconButton size="small" onClick={handleDownload} style={{ padding: '2px' }}>
                        <GetAppIcon style={{ fontSize: 12, color: 'var(--accent-indigo)' }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton size="small" onClick={handleDelete} style={{ padding: '2px' }}>
                        <DeleteIcon style={{ fontSize: 12, color: 'var(--accent-rose)' }} />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// CREATE RESOURCE DIALOG
// ═══════════════════════════════════════════════════════════════

const CreateResourceDialog = ({ open, onClose, dispatch, parentPath, type, USSPath }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = () => {
        if (!name.trim()) { setError('Name is required'); return; }
        if (name.includes('/')) { setError('Name cannot contain /'); return; }
        const targetPath = `${parentPath}/${name.trim()}`;
        dispatch(createUSSResource(targetPath, type));
        onClose();
        setName('');
        // Refresh the parent directory after a brief delay
        setTimeout(() => {
            if (parentPath === USSPath) {
                dispatch(fetchUSSChildren(USSPath));
            } else {
                dispatch(fetchDirectoryChildren(parentPath));
            }
        }, 500);
    };

    const label = type === 'directory' ? 'Directory' : 'File';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
            style: { background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }
        }}>
            <DialogTitle>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Create New {label}
                </span>
            </DialogTitle>
            <DialogContent>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    In: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{parentPath}</span>
                </div>
                <TextField label={`${label} Name`} fullWidth size="small" variant="outlined"
                    value={name} onChange={e => { setName(e.target.value); setError(null); }}
                    error={!!error} helperText={error}
                    InputProps={{ style: { fontSize: '12px', fontFamily: 'var(--font-mono)' } }}
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                />
            </DialogContent>
            <DialogActions style={{ padding: '8px 16px 16px' }}>
                <Button onClick={onClose} style={{ textTransform: 'none', fontSize: '12px', color: 'var(--text-secondary)' }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!name.trim()} style={{
                    textTransform: 'none', fontSize: '12px', fontWeight: 600,
                    color: '#fff', background: type === 'directory' ? 'var(--accent-amber)' : 'var(--accent-indigo)',
                    borderRadius: '6px', padding: '4px 16px',
                }}>Create</Button>
            </DialogActions>
        </Dialog>
    );
};

// ═══════════════════════════════════════════════════════════════
// USS EDITOR COMPONENT
// ═══════════════════════════════════════════════════════════════

const USSEditor = ({ file, content, checksum, isFetchingContent, isSaving, saveError, dispatch, USSPath }) => {
    const [editedContent, setEditedContent] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [showSaveAs, setShowSaveAs] = useState(false);
    const [saveAsPath, setSaveAsPath] = useState('');

    useEffect(() => {
        if (content !== null) {
            setEditedContent(content);
            setHasChanges(false);
        }
    }, [content, file]);

    const handleSave = useCallback(() => {
        if (file && hasChanges) {
            dispatch(saveUSSContent(file, editedContent, checksum));
            setHasChanges(false);
        }
    }, [file, editedContent, checksum, hasChanges, dispatch]);

    const handleSaveAs = useCallback(() => {
        if (saveAsPath.trim()) {
            const parentDir = saveAsPath.trim().substring(0, saveAsPath.trim().lastIndexOf('/'));
            dispatch(saveAsUSSContent(saveAsPath.trim(), editedContent, parentDir || USSPath));
            setShowSaveAs(false);
            setSaveAsPath('');
        }
    }, [saveAsPath, editedContent, USSPath, dispatch]);

    const handleKeyDown = useCallback((e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
    }, [handleSave]);

    if (!file) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <InsertDriveFileIcon style={{ fontSize: 48, opacity: 0.3, marginBottom: '16px' }} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Select a file to view</span>
                <span style={{ fontSize: '11px', marginTop: '4px' }}>Click any file in the tree to open it</span>
            </div>
        );
    }

    if (isFetchingContent) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress size={28} style={{ color: 'var(--accent-indigo)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>Loading {file.split('/').pop()}...</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Editor toolbar */}
            <div style={{
                display: 'flex', alignItems: 'center', padding: '8px 16px',
                borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
                gap: '8px', flexShrink: 0,
            }}>
                <InsertDriveFileIcon style={{ fontSize: 16, color: 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file}
                </span>
                {hasChanges && (
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-amber)', background: 'rgba(251, 191, 36, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        MODIFIED
                    </span>
                )}
                {saveError && (
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-rose)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        {saveError.includes('conflict') ? 'CONFLICT' : 'ERROR'}
                    </span>
                )}
                {isSaving && <CircularProgress size={14} style={{ color: 'var(--accent-indigo)' }} />}
                <Tooltip title="Save (Ctrl+S)">
                    <IconButton size="small" onClick={handleSave} disabled={!hasChanges || isSaving} style={{ color: hasChanges ? 'var(--accent-indigo)' : 'var(--text-muted)' }}>
                        <SaveIcon style={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Save As...">
                    <IconButton size="small" onClick={() => { setSaveAsPath(file); setShowSaveAs(true); }} style={{ color: 'var(--text-muted)' }}>
                        <CreateNewFolderIcon style={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                    <IconButton size="small" onClick={() => dispatch(downloadUSSFile(file))} style={{ color: 'var(--text-muted)' }}>
                        <GetAppIcon style={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Close">
                    <IconButton size="small" onClick={() => dispatch(invalidateUSSFile())} style={{ color: 'var(--text-muted)' }}>
                        <CloseIcon style={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
            </div>
            {/* Code editor */}
            <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-deep)' }}>
                <textarea
                    value={editedContent}
                    onChange={(e) => { setEditedContent(e.target.value); setHasChanges(true); }}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    style={{
                        width: '100%', height: '100%', resize: 'none',
                        background: 'transparent', color: 'var(--text-primary)',
                        border: 'none', outline: 'none', padding: '12px 16px',
                        fontSize: '12.5px', lineHeight: '1.6',
                        fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em',
                        whiteSpace: 'pre', overflowWrap: 'normal', overflowX: 'auto',
                    }}
                />
            </div>
            {/* Save As Dialog */}
            <Dialog open={showSaveAs} onClose={() => setShowSaveAs(false)} maxWidth="xs" fullWidth PaperProps={{
                style: { background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }
            }}>
                <DialogTitle><span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Save As</span></DialogTitle>
                <DialogContent>
                    <TextField label="Target Path" fullWidth size="small" variant="outlined"
                        value={saveAsPath} onChange={e => setSaveAsPath(e.target.value)}
                        InputProps={{ style: { fontSize: '12px', fontFamily: 'var(--font-mono)' } }}
                        placeholder="/u/user/filename"
                        autoFocus />
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px' }}>
                    <Button onClick={() => setShowSaveAs(false)} style={{ textTransform: 'none', fontSize: '12px', color: 'var(--text-secondary)' }}>Cancel</Button>
                    <Button onClick={handleSaveAs} disabled={!saveAsPath.trim()} style={{
                        textTransform: 'none', fontSize: '12px', fontWeight: 600,
                        color: '#fff', background: 'var(--accent-indigo)', borderRadius: '6px', padding: '4px 16px',
                    }}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN USS EXPLORER VIEW
// ═══════════════════════════════════════════════════════════════

const USSExplorerView = ({ dispatch, USSPath, children, isFetchingChildren, childrenError,
    dirChildren, toggledDirs, file, content, checksum, isFetchingContent, isSaving, contentError, saveError }) => {

    const [pathInput, setPathInput] = useState('');
    const debounceRef = useRef(null);
    // Dialog state
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [createType, setCreateType] = useState(null); // 'file' or 'directory'
    const [createParentPath, setCreateParentPath] = useState('');

    useEffect(() => {
        setPathInput(USSPath || '/u');
    }, [USSPath]);

    // Fetch on mount
    useEffect(() => {
        if (USSPath) {
            dispatch(fetchUSSChildren(USSPath));
        }
    }, []);

    const handleNavigate = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (pathInput.trim()) {
            dispatch(resetUSSChildren());
            dispatch(resetDirChildren());
            dispatch(setUSSPath(pathInput.trim()));
            dispatch(fetchUSSChildren(pathInput.trim()));
        }
    }, [pathInput, dispatch]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleNavigate();
        }
    }, [handleNavigate]);

    // Debounced path navigation (1500ms)
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (pathInput.trim() && pathInput.trim() !== USSPath) {
            debounceRef.current = setTimeout(() => {
                dispatch(resetUSSChildren());
                dispatch(resetDirChildren());
                dispatch(setUSSPath(pathInput.trim()));
                dispatch(fetchUSSChildren(pathInput.trim()));
            }, 1500);
        }
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [pathInput]);

    const handleGoUp = useCallback(() => {
        const parts = USSPath.split('/').filter(Boolean);
        if (parts.length > 1) {
            const parentPath = '/' + parts.slice(0, -1).join('/');
            dispatch(resetUSSChildren());
            dispatch(resetDirChildren());
            dispatch(setUSSPath(parentPath));
            dispatch(fetchUSSChildren(parentPath));
            setPathInput(parentPath);
        }
    }, [USSPath, dispatch]);

    const handleRefresh = useCallback(() => {
        if (USSPath) {
            dispatch(resetUSSChildren());
            dispatch(resetDirChildren());
            dispatch(fetchUSSChildren(USSPath));
        }
    }, [USSPath, dispatch]);

    const handleGoHome = useCallback(() => {
        const homePath = '/u';
        dispatch(resetUSSChildren());
        dispatch(resetDirChildren());
        dispatch(setUSSPath(homePath));
        dispatch(fetchUSSChildren(homePath));
        setPathInput(homePath);
    }, [dispatch]);

    const handleDelete = useCallback((path) => {
        setDeleteTarget(path);
    }, []);

    const confirmDelete = useCallback(() => {
        if (deleteTarget) {
            dispatch(deleteUSSResource(deleteTarget));
            // Close editor if the deleted file is open
            if (file && file === deleteTarget) {
                dispatch(invalidateUSSFile());
            }
            setDeleteTarget(null);
            // Refresh after a brief delay
            setTimeout(() => {
                dispatch(fetchUSSChildren(USSPath));
            }, 500);
        }
    }, [deleteTarget, file, USSPath, dispatch]);

    const handleCreateFile = useCallback((parentPath) => {
        setCreateType('file');
        setCreateParentPath(parentPath);
    }, []);

    const handleCreateDir = useCallback((parentPath) => {
        setCreateType('directory');
        setCreateParentPath(parentPath);
    }, []);

    return (
        <div className="uss-explorer-root" style={{ display: 'flex', height: '100%', background: 'var(--bg-base)' }}>
            {/* Left Panel - File Tree */}
            <div style={{
                width: '320px', minWidth: '280px', maxWidth: '400px',
                borderRight: '1px solid var(--border-subtle)',
                display: 'flex', flexDirection: 'column',
                background: 'var(--bg-base)',
            }}>
                {/* Path navigation bar */}
                <div style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tooltip title="Home (/u)">
                            <IconButton size="small" onClick={handleGoHome} style={{ color: 'var(--accent-indigo)', padding: '4px' }}>
                                <HomeIcon style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Go up">
                            <IconButton size="small" onClick={handleGoUp} style={{ color: 'var(--accent-indigo)', padding: '4px' }}>
                                <ArrowUpwardIcon style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        <TextField
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={pathInput}
                            onChange={(e) => setPathInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                style: { fontSize: '11.5px', borderRadius: '6px', fontFamily: 'var(--font-mono)' },
                            }}
                        />
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={handleRefresh} disabled={isFetchingChildren} style={{ color: 'var(--accent-indigo)', padding: '4px' }}>
                                <RefreshIcon style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="New File">
                            <IconButton size="small" onClick={() => handleCreateFile(USSPath)} style={{ color: 'var(--accent-cyan)', padding: '4px' }}>
                                <NoteAddIcon style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="New Folder">
                            <IconButton size="small" onClick={() => handleCreateDir(USSPath)} style={{ color: 'var(--accent-emerald)', padding: '4px' }}>
                                <CreateNewFolderIcon style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Path:
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 500, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {USSPath}
                        </span>
                        {!isFetchingChildren && children.size > 0 && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                {children.size} item{children.size !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>

                {/* File tree */}
                <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                    {isFetchingChildren && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
                            <CircularProgress size={24} style={{ color: 'var(--accent-indigo)' }} />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Loading directory...</span>
                        </div>
                    )}
                    {childrenError && (
                        <div style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{ fontSize: '12px', color: 'var(--accent-rose)' }}>{childrenError}</span>
                            <Button onClick={handleRefresh} size="small" style={{ marginTop: '8px', color: 'var(--accent-indigo)', textTransform: 'none', fontSize: '11px' }}>
                                <RefreshIcon style={{ fontSize: 14, marginRight: 4 }} /> Retry
                            </Button>
                        </div>
                    )}
                    {!isFetchingChildren && !childrenError && children.size === 0 && (
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            <FolderIcon style={{ fontSize: 32, color: 'var(--text-muted)', opacity: 0.4 }} />
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Empty directory</div>
                        </div>
                    )}
                    {!isFetchingChildren && children.size > 0 && (
                        <div role="tree" className="uss-file-tree">
                            {/* Directories first, then files, both sorted */}
                            {children
                                .filter(item => item.get('type') === 'directory')
                                .sortBy(item => item.get('name'))
                                .map(item => (
                                    <DirectoryNode
                                        key={item.get('path')}
                                        item={item}
                                        dispatch={dispatch}
                                        isToggled={!!toggledDirs.get(item.get('path'))}
                                        dirChildren={dirChildren}
                                        toggledDirs={toggledDirs}
                                        activeFile={file}
                                        onDelete={handleDelete}
                                        onCreateFile={handleCreateFile}
                                        onCreateDir={handleCreateDir}
                                    />
                                ))}
                            {children
                                .filter(item => item.get('type') === 'file')
                                .sortBy(item => item.get('name'))
                                .map(item => (
                                    <FileNode
                                        key={item.get('path')}
                                        item={item}
                                        dispatch={dispatch}
                                        isActive={file === item.get('path')}
                                        onDelete={handleDelete}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Editor */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <USSEditor
                    file={file}
                    content={content}
                    checksum={checksum}
                    isFetchingContent={isFetchingContent}
                    isSaving={isSaving}
                    saveError={saveError}
                    dispatch={dispatch}
                    USSPath={USSPath}
                />
            </div>

            {/* Dialogs */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Resource"
                message={`Are you sure you want to delete "${deleteTarget}"? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
            {createType && (
                <CreateResourceDialog
                    open={!!createType}
                    onClose={() => setCreateType(null)}
                    dispatch={dispatch}
                    parentPath={createParentPath}
                    type={createType}
                    USSPath={USSPath}
                />
            )}
        </div>
    );
};

USSExplorerView.propTypes = {
    dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const uss = state.get('ussExplorer');
    return {
        USSPath: uss.get('USSPath'),
        children: uss.get('children'),
        isFetchingChildren: uss.get('isFetchingChildren'),
        childrenError: uss.get('childrenError'),
        dirChildren: uss.get('dirChildren'),
        toggledDirs: uss.get('toggledDirs'),
        file: uss.get('file'),
        content: uss.get('content'),
        checksum: uss.get('checksum'),
        isFetchingContent: uss.get('isFetchingContent'),
        isSaving: uss.get('isSaving'),
        saveError: uss.get('saveError'),
        contentError: uss.get('contentError'),
    };
}

const ConnectedUSSExplorerView = connect(mapStateToProps)(USSExplorerView);
export default ConnectedUSSExplorerView;
