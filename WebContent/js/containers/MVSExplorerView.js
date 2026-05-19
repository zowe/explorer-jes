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
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import FolderIcon from '@material-ui/icons/Folder';
import DescriptionIcon from '@material-ui/icons/Description';
import StorageIcon from '@material-ui/icons/Storage';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import SaveIcon from '@material-ui/icons/Save';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import BlockIcon from '@material-ui/icons/Block';
import ConfirmDialog from '../components/ConfirmDialog';
import {
    fetchDatasets, fetchDSMembers, fetchDSContent, saveDSContent, saveAsDSContent,
    setMVSPath, resetDSChildren, toggleDSNode, deleteDataset, invalidateMVSFile,
    downloadDataset, submitJob, createMember, createDataset, renameDataset,
    validateDatasetName, validateMemberName,
} from '../actions/mvsExplorer';

// Dataset creation presets
const DS_PRESETS = {
    JCL: { dsorg: 'PO', alcunit: 'TRK', primary: 10, secondary: 5, dirblk: 10, recfm: 'FB', blksize: 6160, lrecl: 80 },
    COBOL: { dsorg: 'PO', alcunit: 'TRK', primary: 30, secondary: 15, dirblk: 20, recfm: 'FB', blksize: 6160, lrecl: 80 },
    PLX: { dsorg: 'PO', alcunit: 'TRK', primary: 30, secondary: 15, dirblk: 20, recfm: 'VB', blksize: 27998, lrecl: 132 },
    XML: { dsorg: 'PS', alcunit: 'TRK', primary: 30, secondary: 15, dirblk: 0, recfm: 'VB', blksize: 27998, lrecl: 8000 },
};

// ═══════════════════════════════════════════════════════════════
// DATASET NODE COMPONENT
// ═══════════════════════════════════════════════════════════════

const DatasetNode = ({ dataset, isToggled, members, dispatch, activeFile, isFetchingMembers,
    qualifier, currentFile, onCreateMember, onRenameDataset, onDeleteDataset, unauthorized }) => {
    const dsName = dataset.get('name');
    const dsorg = dataset.get('dsorg');
    const isPDS = dsorg && (dsorg.startsWith('PO') || dsorg.includes('PO'));
    const isVSAM = dsorg && dsorg.startsWith('VS');
    const isDA = dsorg && dsorg.startsWith('DA');
    const isHFS = dsorg && dsorg === 'HFS';
    const isUnsupported = isVSAM || isDA || isHFS;

    const handleClick = useCallback(() => {
        if (isUnsupported) return;
        if (isPDS) {
            if (!isToggled) {
                dispatch(fetchDSMembers(dsName));
            } else {
                dispatch(toggleDSNode(dsName));
            }
        } else {
            dispatch(fetchDSContent(dsName));
        }
    }, [dsName, isPDS, isUnsupported, isToggled, dispatch]);

    const handleDelete = useCallback((e) => {
        e.stopPropagation();
        onDeleteDataset(dsName);
    }, [dsName, onDeleteDataset]);

    const handleDownload = useCallback((e) => {
        e.stopPropagation();
        dispatch(downloadDataset(dsName));
    }, [dsName, dispatch]);

    const handleSubmit = useCallback((e) => {
        e.stopPropagation();
        dispatch(submitJob(dsName));
    }, [dsName, dispatch]);

    const handleCreateMember = useCallback((e) => {
        e.stopPropagation();
        onCreateMember(dsName);
    }, [dsName, onCreateMember]);

    const handleRename = useCallback((e) => {
        e.stopPropagation();
        onRenameDataset(dsName);
    }, [dsName, onRenameDataset]);

    const isActive = activeFile === dsName;

    return (
        <div className="mvs-tree-node" style={{ marginBottom: '1px' }}>
            <div
                className={`mvs-node-row ${isActive ? 'mvs-node-active' : ''}`}
                onClick={handleClick}
                role="treeitem"
                aria-expanded={isToggled}
                style={{
                    display: 'flex', alignItems: 'center', padding: '4px 8px',
                    borderRadius: '6px', cursor: isUnsupported ? 'not-allowed' : 'pointer',
                    transition: 'all 150ms ease',
                    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                    opacity: isUnsupported ? 0.5 : 1,
                }}
            >
                {isPDS && (
                    <span style={{ display: 'flex', alignItems: 'center', marginRight: '2px', transition: 'transform 150ms ease', transform: isToggled ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                        <ExpandMoreIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
                    </span>
                )}
                {!isPDS && <span style={{ width: '18px' }} />}
                {isPDS ? (
                    <FolderIcon style={{ fontSize: 16, color: 'var(--accent-amber)', marginRight: '8px' }} />
                ) : isUnsupported ? (
                    <BlockIcon style={{ fontSize: 16, color: 'var(--text-muted)', marginRight: '8px' }} />
                ) : (
                    <DescriptionIcon style={{ fontSize: 16, color: 'var(--accent-cyan)', marginRight: '8px' }} />
                )}
                <span style={{
                    fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)', letterSpacing: '-0.02em', flex: 1,
                }}>
                    {dsName}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
                    {dsorg || '?'}
                </span>
                {!isUnsupported && (
                    <div className="mvs-node-actions" style={{ display: 'flex', gap: '2px', marginLeft: '4px', opacity: 0, transition: 'opacity 150ms ease' }}>
                        {isPDS && (
                            <Tooltip title="New Member">
                                <IconButton size="small" onClick={handleCreateMember} style={{ padding: '2px' }}>
                                    <AddIcon style={{ fontSize: 13, color: 'var(--accent-emerald)' }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {!isPDS && (
                            <Tooltip title="Submit as JCL">
                                <IconButton size="small" onClick={handleSubmit} style={{ padding: '2px' }}>
                                    <PlayArrowIcon style={{ fontSize: 13, color: 'var(--accent-emerald)' }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Rename">
                            <IconButton size="small" onClick={handleRename} style={{ padding: '2px' }}>
                                <EditIcon style={{ fontSize: 13, color: 'var(--accent-amber)' }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                            <IconButton size="small" onClick={handleDownload} style={{ padding: '2px' }}>
                                <GetAppIcon style={{ fontSize: 13, color: 'var(--accent-indigo)' }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" onClick={handleDelete} style={{ padding: '2px' }}>
                                <DeleteIcon style={{ fontSize: 13, color: 'var(--accent-rose)' }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                )}
            </div>
            {isPDS && isToggled && (
                <div className="mvs-members-list" style={{ marginLeft: '28px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '8px', marginTop: '2px' }}>
                    {isFetchingMembers ? (
                        <div style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CircularProgress size={12} style={{ color: 'var(--accent-indigo)' }} />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Loading members...</span>
                        </div>
                    ) : unauthorized ? (
                        <div style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BlockIcon style={{ fontSize: 14, color: 'var(--accent-rose)' }} />
                            <span style={{ fontSize: '11px', color: 'var(--accent-rose)', fontWeight: 600 }}>UNAUTHORIZED</span>
                        </div>
                    ) : members && members.size > 0 ? members.map(member => (
                        <MemberNode
                            key={member}
                            member={member}
                            parentDS={dsName}
                            dispatch={dispatch}
                            isActive={activeFile === `${dsName}(${member})`}
                            onDelete={onDeleteDataset}
                        />
                    )) : (
                        <div style={{ padding: '6px 8px', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No members
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MEMBER NODE COMPONENT
// ═══════════════════════════════════════════════════════════════

const MemberNode = ({ member, parentDS, dispatch, isActive, onDelete }) => {
    const fullName = `${parentDS}(${member})`;

    const handleClick = useCallback(() => {
        dispatch(fetchDSContent(fullName));
    }, [fullName, dispatch]);

    const handleSubmit = useCallback((e) => {
        e.stopPropagation();
        dispatch(submitJob(fullName));
    }, [fullName, dispatch]);

    const handleDownload = useCallback((e) => {
        e.stopPropagation();
        dispatch(downloadDataset(fullName));
    }, [fullName, dispatch]);

    const handleDelete = useCallback((e) => {
        e.stopPropagation();
        onDelete(fullName);
    }, [fullName, onDelete]);

    return (
        <div
            className={`mvs-member-row ${isActive ? 'mvs-node-active' : ''}`}
            onClick={handleClick}
            style={{
                display: 'flex', alignItems: 'center', padding: '3px 8px',
                borderRadius: '5px', cursor: 'pointer', transition: 'all 150ms ease',
                background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            }}
        >
            <DescriptionIcon style={{ fontSize: 14, color: 'var(--accent-indigo)', marginRight: '8px' }} />
            <span style={{ fontSize: '11.5px', fontWeight: 500, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', flex: 1 }}>
                {member}
            </span>
            <div className="mvs-node-actions" style={{ display: 'flex', gap: '2px', opacity: 0, transition: 'opacity 150ms ease' }}>
                <Tooltip title="Submit JCL">
                    <IconButton size="small" onClick={handleSubmit} style={{ padding: '2px' }}>
                        <PlayArrowIcon style={{ fontSize: 12, color: 'var(--accent-emerald)' }} />
                    </IconButton>
                </Tooltip>
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
// CREATE DATASET DIALOG
// ═══════════════════════════════════════════════════════════════

const CreateDatasetDialog = ({ open, onClose, dispatch, qualifier }) => {
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState(null);
    const [preset, setPreset] = useState('JCL');
    const [dsorg, setDsorg] = useState('PO');
    const [alcunit, setAlcunit] = useState('TRK');
    const [primary, setPrimary] = useState(10);
    const [secondary, setSecondary] = useState(5);
    const [dirblk, setDirblk] = useState(10);
    const [recfm, setRecfm] = useState('FB');
    const [blksize, setBlksize] = useState(6160);
    const [lrecl, setLrecl] = useState(80);

    useEffect(() => {
        if (open) {
            const p = DS_PRESETS[preset] || DS_PRESETS.JCL;
            setDsorg(p.dsorg);
            setAlcunit(p.alcunit);
            setPrimary(p.primary);
            setSecondary(p.secondary);
            setDirblk(p.dirblk);
            setRecfm(p.recfm);
            setBlksize(p.blksize);
            setLrecl(p.lrecl);
        }
    }, [preset, open]);

    const handleNameChange = (val) => {
        const upper = val.toUpperCase();
        setName(upper);
        setNameError(validateDatasetName(upper));
    };

    const handleSubmit = () => {
        const err = validateDatasetName(name);
        if (err) { setNameError(err); return; }
        const properties = { dsorg, alcunit, primary, secondary, recfm, blksize, lrecl };
        if (dsorg === 'PO') properties.dirblk = dirblk;
        dispatch(createDataset(name, properties, qualifier));
        onClose();
        setName('');
    };

    const fieldStyle = { marginBottom: '12px' };
    const inputProps = { style: { fontSize: '12px' } };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{
            style: { background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }
        }}>
            <DialogTitle style={{ paddingBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Create Dataset</span>
            </DialogTitle>
            <DialogContent>
                <TextField label="Dataset Name" fullWidth size="small" variant="outlined"
                    value={name} onChange={e => handleNameChange(e.target.value)}
                    error={!!nameError} helperText={nameError}
                    style={fieldStyle} InputProps={inputProps}
                    placeholder="HLQ.DATASET.NAME" autoFocus />
                <div style={{ display: 'flex', gap: '12px', ...fieldStyle }}>
                    <FormControl variant="outlined" size="small" style={{ flex: 1 }}>
                        <InputLabel style={{ fontSize: '12px' }}>Preset</InputLabel>
                        <Select label="Preset" value={preset} onChange={e => setPreset(e.target.value)} style={{ fontSize: '12px' }}>
                            <MenuItem value="JCL">JCL</MenuItem>
                            <MenuItem value="COBOL">COBOL</MenuItem>
                            <MenuItem value="PLX">PLI/PLX</MenuItem>
                            <MenuItem value="XML">XML</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" size="small" style={{ flex: 1 }}>
                        <InputLabel style={{ fontSize: '12px' }}>Organization</InputLabel>
                        <Select label="Organization" value={dsorg} onChange={e => { setDsorg(e.target.value); if (e.target.value !== 'PO') setDirblk(0); }} style={{ fontSize: '12px' }}>
                            <MenuItem value="PO">Partitioned (PO)</MenuItem>
                            <MenuItem value="PS">Sequential (PS)</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <div style={{ display: 'flex', gap: '12px', ...fieldStyle }}>
                    <FormControl variant="outlined" size="small" style={{ flex: 1 }}>
                        <InputLabel style={{ fontSize: '12px' }}>Alloc Unit</InputLabel>
                        <Select label="Alloc Unit" value={alcunit} onChange={e => setAlcunit(e.target.value)} style={{ fontSize: '12px' }}>
                            <MenuItem value="TRK">Track (TRK)</MenuItem>
                            <MenuItem value="CYL">Cylinder (CYL)</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="Primary" type="number" size="small" variant="outlined"
                        value={primary} onChange={e => setPrimary(parseInt(e.target.value) || 0)}
                        InputProps={inputProps} style={{ flex: 1 }} />
                    <TextField label="Secondary" type="number" size="small" variant="outlined"
                        value={secondary} onChange={e => setSecondary(parseInt(e.target.value) || 0)}
                        InputProps={inputProps} style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', ...fieldStyle }}>
                    <TextField label="Dir Blocks" type="number" size="small" variant="outlined"
                        value={dirblk} onChange={e => setDirblk(parseInt(e.target.value) || 0)}
                        disabled={dsorg !== 'PO'} InputProps={inputProps} style={{ flex: 1 }} />
                    <FormControl variant="outlined" size="small" style={{ flex: 1 }}>
                        <InputLabel style={{ fontSize: '12px' }}>RECFM</InputLabel>
                        <Select label="RECFM" value={recfm} onChange={e => setRecfm(e.target.value)} style={{ fontSize: '12px' }}>
                            <MenuItem value="FB">FB</MenuItem>
                            <MenuItem value="VB">VB</MenuItem>
                            <MenuItem value="F">F</MenuItem>
                            <MenuItem value="V">V</MenuItem>
                            <MenuItem value="U">U</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="BLKSIZE" type="number" size="small" variant="outlined"
                        value={blksize} onChange={e => setBlksize(parseInt(e.target.value) || 0)}
                        InputProps={inputProps} style={{ flex: 1 }} />
                    <TextField label="LRECL" type="number" size="small" variant="outlined"
                        value={lrecl} onChange={e => setLrecl(parseInt(e.target.value) || 0)}
                        InputProps={inputProps} style={{ flex: 1 }} />
                </div>
            </DialogContent>
            <DialogActions style={{ padding: '8px 16px 16px' }}>
                <Button onClick={onClose} style={{ textTransform: 'none', fontSize: '12px', color: 'var(--text-secondary)' }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!name || !!nameError} style={{
                    textTransform: 'none', fontSize: '12px', fontWeight: 600,
                    color: '#fff', background: 'var(--accent-indigo)', borderRadius: '6px', padding: '4px 16px',
                }}>Create</Button>
            </DialogActions>
        </Dialog>
    );
};

// ═══════════════════════════════════════════════════════════════
// CREATE MEMBER DIALOG
// ═══════════════════════════════════════════════════════════════

const CreateMemberDialog = ({ open, onClose, dispatch, parentDS }) => {
    const [memberName, setMemberName] = useState('');
    const [nameError, setNameError] = useState(null);

    const handleChange = (val) => {
        const upper = val.toUpperCase();
        setMemberName(upper);
        setNameError(validateMemberName(upper));
    };

    const handleSubmit = () => {
        const err = validateMemberName(memberName);
        if (err) { setNameError(err); return; }
        dispatch(createMember(parentDS, memberName));
        onClose();
        setMemberName('');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
            style: { background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }
        }}>
            <DialogTitle>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    New Member in {parentDS}
                </span>
            </DialogTitle>
            <DialogContent>
                <TextField label="Member Name" fullWidth size="small" variant="outlined"
                    value={memberName} onChange={e => handleChange(e.target.value)}
                    error={!!nameError} helperText={nameError || 'Max 8 characters, A-Z, 0-9, @, #, $'}
                    placeholder="MEMBER"
                    InputProps={{ style: { fontSize: '12px', fontFamily: 'var(--font-mono)' } }}
                    autoFocus />
            </DialogContent>
            <DialogActions style={{ padding: '8px 16px 16px' }}>
                <Button onClick={onClose} style={{ textTransform: 'none', fontSize: '12px', color: 'var(--text-secondary)' }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!memberName || !!nameError} style={{
                    textTransform: 'none', fontSize: '12px', fontWeight: 600,
                    color: '#fff', background: 'var(--accent-indigo)', borderRadius: '6px', padding: '4px 16px',
                }}>Create</Button>
            </DialogActions>
        </Dialog>
    );
};

// ═══════════════════════════════════════════════════════════════
// RENAME DATASET DIALOG
// ═══════════════════════════════════════════════════════════════

const RenameDatasetDialog = ({ open, onClose, dispatch, oldName, currentFile }) => {
    const [newName, setNewName] = useState('');
    const [nameError, setNameError] = useState(null);

    useEffect(() => {
        if (open && oldName) setNewName(oldName);
    }, [open, oldName]);

    const handleChange = (val) => {
        const upper = val.toUpperCase();
        setNewName(upper);
        setNameError(validateDatasetName(upper));
    };

    const handleSubmit = () => {
        const err = validateDatasetName(newName);
        if (err) { setNameError(err); return; }
        if (newName === oldName) { onClose(); return; }
        dispatch(renameDataset(oldName, newName, currentFile));
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
            style: { background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }
        }}>
            <DialogTitle>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Rename Dataset</span>
            </DialogTitle>
            <DialogContent>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Current: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{oldName}</span>
                </div>
                <TextField label="New Name" fullWidth size="small" variant="outlined"
                    value={newName} onChange={e => handleChange(e.target.value)}
                    error={!!nameError} helperText={nameError}
                    InputProps={{ style: { fontSize: '12px', fontFamily: 'var(--font-mono)' } }}
                    autoFocus />
            </DialogContent>
            <DialogActions style={{ padding: '8px 16px 16px' }}>
                <Button onClick={onClose} style={{ textTransform: 'none', fontSize: '12px', color: 'var(--text-secondary)' }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!newName || !!nameError || newName === oldName} style={{
                    textTransform: 'none', fontSize: '12px', fontWeight: 600,
                    color: '#fff', background: 'var(--accent-amber)', borderRadius: '6px', padding: '4px 16px',
                }}>Rename</Button>
            </DialogActions>
        </Dialog>
    );
};

// ═══════════════════════════════════════════════════════════════
// EDITOR COMPONENT
// ═══════════════════════════════════════════════════════════════

const MVSEditor = ({ file, content, etag, isFetchingContent, isSaving, saveError, dispatch }) => {
    const [editedContent, setEditedContent] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [showSaveAs, setShowSaveAs] = useState(false);
    const [saveAsName, setSaveAsName] = useState('');
    const textAreaRef = useRef(null);

    useEffect(() => {
        if (content !== null) {
            setEditedContent(content);
            setHasChanges(false);
        }
    }, [content, file]);

    const handleSave = useCallback(() => {
        if (file && hasChanges) {
            dispatch(saveDSContent(file, editedContent, etag));
            setHasChanges(false);
        }
    }, [file, editedContent, etag, hasChanges, dispatch]);

    const handleSaveAs = useCallback(() => {
        if (saveAsName.trim()) {
            dispatch(saveAsDSContent(saveAsName.trim(), editedContent));
            setShowSaveAs(false);
            setSaveAsName('');
        }
    }, [saveAsName, editedContent, dispatch]);

    const handleKeyDown = useCallback((e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
    }, [handleSave]);

    if (!file) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <StorageIcon style={{ fontSize: 48, opacity: 0.3, marginBottom: '16px' }} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Select a dataset to view</span>
                <span style={{ fontSize: '11px', marginTop: '4px' }}>Click any dataset or member in the tree</span>
            </div>
        );
    }

    if (isFetchingContent) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress size={28} style={{ color: 'var(--accent-indigo)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>Loading {file}...</span>
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
                <DescriptionIcon style={{ fontSize: 16, color: 'var(--accent-indigo)' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', flex: 1 }}>
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
                {file.includes('(') && (
                    <Tooltip title="Save As...">
                        <IconButton size="small" onClick={() => { setSaveAsName(file); setShowSaveAs(true); }} style={{ color: 'var(--text-muted)' }}>
                            <CreateNewFolderIcon style={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title="Download">
                    <IconButton size="small" onClick={() => dispatch(downloadDataset(file))} style={{ color: 'var(--text-muted)' }}>
                        <GetAppIcon style={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Close">
                    <IconButton size="small" onClick={() => dispatch(invalidateMVSFile())} style={{ color: 'var(--text-muted)' }}>
                        <CloseIcon style={{ fontSize: 18 }} />
                    </IconButton>
                </Tooltip>
            </div>
            {/* Code editor area */}
            <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-deep)' }}>
                <textarea
                    ref={textAreaRef}
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
                    <TextField label="Target Dataset(Member)" fullWidth size="small" variant="outlined"
                        value={saveAsName} onChange={e => setSaveAsName(e.target.value.toUpperCase())}
                        InputProps={{ style: { fontSize: '12px', fontFamily: 'var(--font-mono)' } }}
                        autoFocus />
                </DialogContent>
                <DialogActions style={{ padding: '8px 16px 16px' }}>
                    <Button onClick={() => setShowSaveAs(false)} style={{ textTransform: 'none', fontSize: '12px', color: 'var(--text-secondary)' }}>Cancel</Button>
                    <Button onClick={handleSaveAs} disabled={!saveAsName.trim()} style={{
                        textTransform: 'none', fontSize: '12px', fontWeight: 600,
                        color: '#fff', background: 'var(--accent-indigo)', borderRadius: '6px', padding: '4px 16px',
                    }}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN MVS EXPLORER VIEW
// ═══════════════════════════════════════════════════════════════

const MVSExplorerView = ({ dispatch, DSPath, datasets, isFetchingDatasets, datasetsError,
    members, toggledDatasets, isFetchingMembers,
    file, content, etag, isFetchingContent, isSaving, contentError, saveError }) => {

    const [qualifier, setQualifier] = useState('');
    const debounceRef = useRef(null);
    // Dialog state
    const [showCreateDS, setShowCreateDS] = useState(false);
    const [showCreateMember, setShowCreateMember] = useState(false);
    const [createMemberParent, setCreateMemberParent] = useState('');
    const [showRename, setShowRename] = useState(false);
    const [renameTarget, setRenameTarget] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);

    // On mount, set default qualifier
    useEffect(() => {
        if (!DSPath && !qualifier) {
            setQualifier('*');
        }
    }, []);

    // Debounced search (1500ms after typing stops)
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (qualifier.trim() && qualifier.trim() !== DSPath) {
            debounceRef.current = setTimeout(() => {
                dispatch(resetDSChildren());
                dispatch(fetchDatasets(qualifier.trim()));
                dispatch(setMVSPath(qualifier.trim()));
            }, 1500);
        }
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [qualifier]);

    const handleSearch = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (qualifier.trim()) {
            dispatch(resetDSChildren());
            dispatch(fetchDatasets(qualifier.trim()));
            dispatch(setMVSPath(qualifier.trim()));
        }
    }, [qualifier, dispatch]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    const handleRefresh = useCallback(() => {
        if (DSPath) {
            dispatch(resetDSChildren());
            dispatch(fetchDatasets(DSPath));
            // Re-fetch expanded PDS members
            toggledDatasets.keySeq().forEach(dsName => {
                if (toggledDatasets.get(dsName)) {
                    dispatch(fetchDSMembers(dsName));
                }
            });
        }
    }, [DSPath, toggledDatasets, dispatch]);

    const handleCreateMember = useCallback((dsName) => {
        setCreateMemberParent(dsName);
        setShowCreateMember(true);
    }, []);

    const handleRenameDataset = useCallback((dsName) => {
        setRenameTarget(dsName);
        setShowRename(true);
    }, []);

    const handleDeleteDataset = useCallback((name) => {
        setDeleteTarget(name);
    }, []);

    const confirmDelete = useCallback(() => {
        if (deleteTarget) {
            dispatch(deleteDataset(deleteTarget, DSPath, file));
            setDeleteTarget(null);
        }
    }, [deleteTarget, DSPath, file, dispatch]);

    return (
        <div className="mvs-explorer-root" style={{ display: 'flex', height: '100%', background: 'var(--bg-base)' }}>
            {/* Left Panel - Dataset Tree */}
            <div style={{
                width: '320px', minWidth: '280px', maxWidth: '400px',
                borderRight: '1px solid var(--border-subtle)',
                display: 'flex', flexDirection: 'column',
                background: 'var(--bg-base)',
            }}>
                {/* Search bar */}
                <div style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TextField
                            placeholder="Qualifier (e.g. USER.*)"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={qualifier}
                            onChange={(e) => setQualifier(e.target.value.toUpperCase())}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
                                    </InputAdornment>
                                ),
                                style: { fontSize: '12px', borderRadius: '8px', fontFamily: 'var(--font-mono)' },
                            }}
                        />
                        <Tooltip title="Search">
                            <IconButton size="small" onClick={handleSearch} style={{ color: 'var(--accent-indigo)' }}>
                                <SearchIcon style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={handleRefresh} disabled={isFetchingDatasets} style={{ color: 'var(--accent-indigo)' }}>
                                <RefreshIcon style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="New Dataset">
                            <IconButton size="small" onClick={() => setShowCreateDS(true)} style={{ color: 'var(--accent-emerald)' }}>
                                <CreateNewFolderIcon style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                    {DSPath && (
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Filter:
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>
                                {DSPath}
                            </span>
                            {!isFetchingDatasets && (
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                    {datasets.size} dataset{datasets.size !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Dataset tree list */}
                <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                    {isFetchingDatasets && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
                            <CircularProgress size={24} style={{ color: 'var(--accent-indigo)' }} />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Fetching datasets...</span>
                        </div>
                    )}
                    {datasetsError && (
                        <div style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{ fontSize: '12px', color: 'var(--accent-rose)' }}>{datasetsError}</span>
                            <Button onClick={handleRefresh} size="small" style={{ marginTop: '8px', color: 'var(--accent-indigo)', textTransform: 'none', fontSize: '11px' }}>
                                <RefreshIcon style={{ fontSize: 14, marginRight: 4 }} /> Retry
                            </Button>
                        </div>
                    )}
                    {!isFetchingDatasets && !datasetsError && datasets.size === 0 && DSPath && (
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            <StorageIcon style={{ fontSize: 32, color: 'var(--text-muted)', opacity: 0.4 }} />
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>No datasets found</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Try a different qualifier</div>
                        </div>
                    )}
                    {!isFetchingDatasets && datasets.size > 0 && (
                        <div role="tree" className="mvs-dataset-tree">
                            {datasets.map(dataset => (
                                <DatasetNode
                                    key={dataset.get('name')}
                                    dataset={dataset}
                                    isToggled={!!toggledDatasets.get(dataset.get('name'))}
                                    members={members.get(dataset.get('name'))}
                                    dispatch={dispatch}
                                    activeFile={file}
                                    isFetchingMembers={isFetchingMembers}
                                    qualifier={DSPath}
                                    currentFile={file}
                                    onCreateMember={handleCreateMember}
                                    onRenameDataset={handleRenameDataset}
                                    onDeleteDataset={handleDeleteDataset}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Editor */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <MVSEditor
                    file={file}
                    content={content}
                    etag={etag}
                    isFetchingContent={isFetchingContent}
                    isSaving={isSaving}
                    saveError={saveError}
                    dispatch={dispatch}
                />
            </div>

            {/* Dialogs */}
            <CreateDatasetDialog open={showCreateDS} onClose={() => setShowCreateDS(false)} dispatch={dispatch} qualifier={DSPath} />
            <CreateMemberDialog open={showCreateMember} onClose={() => setShowCreateMember(false)} dispatch={dispatch} parentDS={createMemberParent} />
            <RenameDatasetDialog open={showRename} onClose={() => setShowRename(false)} dispatch={dispatch} oldName={renameTarget} currentFile={file} />
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Resource"
                message={`Are you sure you want to delete "${deleteTarget}"? This action cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

MVSExplorerView.propTypes = {
    dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const mvs = state.get('mvsExplorer');
    return {
        DSPath: mvs.get('DSPath'),
        datasets: mvs.get('datasets'),
        isFetchingDatasets: mvs.get('isFetchingDatasets'),
        datasetsError: mvs.get('datasetsError'),
        members: mvs.get('members'),
        toggledDatasets: mvs.get('toggledDatasets'),
        isFetchingMembers: mvs.get('isFetchingMembers'),
        file: mvs.get('file'),
        content: mvs.get('content'),
        etag: mvs.get('etag'),
        isFetchingContent: mvs.get('isFetchingContent'),
        isSaving: mvs.get('isSaving'),
        saveError: mvs.get('saveError'),
        contentError: mvs.get('contentError'),
    };
}

const ConnectedMVSExplorerView = connect(mapStateToProps)(MVSExplorerView);
export default ConnectedMVSExplorerView;
