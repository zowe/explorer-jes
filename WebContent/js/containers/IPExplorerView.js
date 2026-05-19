/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import WifiIcon from '@material-ui/icons/Wifi';
import LockIcon from '@material-ui/icons/Lock';
import { fetchConnections, fetchReservedPortsList, fetchDefaultTcpipName, fetchTcpipInfo, setIpTab, setIpFilter } from '../actions/ipExplorer';

const CONNECTION_COLUMNS = [
    { id: 'localPort', label: 'Port', numeric: true },
    { id: 'localIPaddress', label: 'Local IP Address', numeric: false },
    { id: 'remoteIPaddress', label: 'Remote IP Address', numeric: false },
    { id: 'remotePort', label: 'Remote Port', numeric: true },
    { id: 'state', label: 'State', numeric: false },
    { id: 'resourceName', label: 'Resource', numeric: false },
];

const RESERVED_COLUMNS = [
    { id: 'portNumber', label: 'Port', numeric: true },
    { id: 'portNumberEnd', label: 'Range End', numeric: true },
    { id: 'jobname', label: 'Job Name', numeric: false },
    { id: 'safname', label: 'SAF Name', numeric: false },
    { id: 'useType', label: 'Use Type', numeric: false },
    { id: 'protocol', label: 'Protocol', numeric: false },
];

function stableSort(array, comparator) {
    const stabilized = array.map((el, index) => [el, index]);
    stabilized.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilized.map(el => el[0]);
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0)
        : (a, b) => (a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0);
}

function getStateChipColor(state) {
    switch (state) {
        case 'Established': return { bg: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.25)' };
        case 'Listen': return { bg: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.25)' };
        case 'TimeWait': return { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.25)' };
        case 'CloseWait': return { bg: 'rgba(251, 113, 133, 0.1)', color: '#fb7185', border: '1px solid rgba(251, 113, 133, 0.25)' };
        default: return { bg: 'rgba(139, 143, 186, 0.08)', color: '#8b8fba', border: '1px solid rgba(139, 143, 186, 0.2)' };
    }
}

const styles = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a1a',
    },
    header: {
        padding: '14px 20px 0',
        borderBottom: '1px solid rgba(99, 102, 241, 0.08)',
        background: 'linear-gradient(180deg, #0f1022 0%, #0a0a1a 100%)',
    },
    tabBar: {
        minHeight: '36px',
    },
    tab: {
        minHeight: '36px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'none',
        minWidth: 'auto',
        padding: '6px 16px',
        color: '#8b8fba',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(99, 102, 241, 0.06)',
        background: '#0a0a1a',
    },
    searchField: {
        width: '280px',
    },
    tableContainer: {
        flex: 1,
        overflow: 'auto',
    },
    tableHead: {
        background: '#0f1022',
    },
    headCell: {
        fontWeight: 700,
        fontSize: '10.5px',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        color: '#5a5d8a',
        borderBottom: '1px solid rgba(99, 102, 241, 0.12)',
        padding: '10px 16px',
        whiteSpace: 'nowrap',
        background: '#0f1022',
    },
    bodyCell: {
        fontSize: '12.5px',
        fontWeight: 500,
        padding: '9px 16px',
        color: '#eef0ff',
        borderBottom: '1px solid rgba(99, 102, 241, 0.05)',
    },
    bodyCellNumeric: {
        fontSize: '12.5px',
        fontWeight: 600,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        padding: '9px 16px',
        color: '#a5b4fc',
        borderBottom: '1px solid rgba(99, 102, 241, 0.05)',
    },
    statusBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        borderTop: '1px solid rgba(99, 102, 241, 0.08)',
        background: '#0f1022',
        fontSize: '11.5px',
        color: '#5a5d8a',
        fontWeight: 500,
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        color: '#5a5d8a',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
    },
};

const IPExplorerView = ({ dispatch, connections, reservedPorts, isFetchingConnections, isFetchingPorts,
    connectionsError, portsError, connectionsTimestamp, portsTimestamp, activeTab, filter, tcpipName }) => {
    
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('localPort');
    const [protocolFilter, setProtocolFilter] = useState('TCP');

    useEffect(() => {
        // First get the default TCPIP name, then fetch data
        dispatch(fetchDefaultTcpipName()).then(name => {
            dispatch(fetchConnections(name));
            dispatch(fetchReservedPortsList(name));
            dispatch(fetchTcpipInfo(name));
        });
    }, []);

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleTabChange = (event, newValue) => {
        dispatch(setIpTab(newValue));
        setOrderBy(newValue === 0 ? 'localPort' : 'portNumber');
        setOrder('asc');
    };

    const handleFilterChange = (event) => {
        dispatch(setIpFilter(event.target.value));
    };

    const handleRefresh = () => {
        if (activeTab === 0) {
            dispatch(fetchConnections(tcpipName));
        } else {
            dispatch(fetchReservedPortsList(tcpipName));
        }
    };

    const filterData = (data) => {
        if (!filter) return data;
        const lowerFilter = filter.toLowerCase();
        return data.filter(row => {
            return Object.values(row).some(val => 
                String(val).toLowerCase().includes(lowerFilter)
            );
        });
    };

    const renderConnectionsTable = () => {
        const isFetching = isFetchingConnections;
        const data = connections.toJS ? connections.toJS() : connections;
        const filteredData = filterData(data);
        const sortedData = stableSort(filteredData, getComparator(order, orderBy));

        if (isFetching) {
            return (
                <div style={styles.loadingContainer}>
                    <CircularProgress size={32} style={{ color: '#818cf8' }} />
                </div>
            );
        }

        if (connectionsError) {
            return (
                <div style={styles.emptyState}>
                    <WifiIcon style={{ fontSize: 48, marginBottom: 12, opacity: 0.3, color: '#fb7185' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fb7185' }}>Connection Error</span>
                    <span style={{ fontSize: '12px', marginTop: 4, color: '#5a5d8a' }}>{connectionsError}</span>
                </div>
            );
        }

        if (filteredData.length === 0) {
            return (
                <div style={styles.emptyState}>
                    <WifiIcon style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>No active connections found</span>
                    <span style={{ fontSize: '12px', marginTop: 4 }}>Try refreshing or adjusting your search filter</span>
                </div>
            );
        }

        return (
            <TableContainer style={styles.tableContainer}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {CONNECTION_COLUMNS.map(col => (
                                <TableCell
                                    key={col.id}
                                    align={col.numeric ? 'right' : 'left'}
                                    style={styles.headCell}
                                    sortDirection={orderBy === col.id ? order : false}
                                >
                                    <TableSortLabel
                                        active={orderBy === col.id}
                                        direction={orderBy === col.id ? order : 'asc'}
                                        onClick={() => handleSort(col.id)}
                                    >
                                        {col.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedData.slice(0, 500).map((row, index) => (
                            <TableRow key={index} hover>
                                <TableCell align="right" style={styles.bodyCellNumeric}>{row.localPort}</TableCell>
                                <TableCell style={styles.bodyCell}>{row.localIPaddress}</TableCell>
                                <TableCell style={styles.bodyCell}>{row.remoteIPaddress}</TableCell>
                                <TableCell align="right" style={styles.bodyCellNumeric}>{row.remotePort}</TableCell>
                                <TableCell style={styles.bodyCell}>
                                    {(() => {
                                        const chipColors = getStateChipColor(row.state);
                                        return (
                                            <Chip
                                                label={row.state}
                                                size="small"
                                                style={{
                                                    backgroundColor: chipColors.bg,
                                                    color: chipColors.color,
                                                    border: chipColors.border,
                                                    fontWeight: 600,
                                                    fontSize: '11px',
                                                    height: '22px',
                                                }}
                                            />
                                        );
                                    })()}
                                </TableCell>
                                <TableCell style={styles.bodyCell}>
                                    <span style={{ 
                                        background: 'rgba(129, 140, 248, 0.08)', 
                                        padding: '2px 8px', 
                                        borderRadius: '4px',
                                        fontSize: '11.5px',
                                        fontWeight: 500,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: '#a5b4fc',
                                    }}>
                                        {row.resourceName}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderReservedPortsTable = () => {
        const isFetching = isFetchingPorts;
        let data = reservedPorts.toJS ? reservedPorts.toJS() : reservedPorts;
        // Filter by protocol
        data = data.filter(row => row.protocol === protocolFilter);
        const filteredData = filterData(data);
        const sortedData = stableSort(filteredData, getComparator(order, orderBy));

        if (isFetching) {
            return (
                <div style={styles.loadingContainer}>
                    <CircularProgress size={32} style={{ color: '#818cf8' }} />
                </div>
            );
        }

        if (portsError) {
            return (
                <div style={styles.emptyState}>
                    <LockIcon style={{ fontSize: 48, marginBottom: 12, opacity: 0.3, color: '#fb7185' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fb7185' }}>Failed to Load Ports</span>
                    <span style={{ fontSize: '12px', marginTop: 4, color: '#5a5d8a' }}>{portsError}</span>
                </div>
            );
        }

        if (filteredData.length === 0) {
            return (
                <div style={styles.emptyState}>
                    <LockIcon style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>No reserved ports found</span>
                    <span style={{ fontSize: '12px', marginTop: 4 }}>Try refreshing or adjusting your search filter</span>
                </div>
            );
        }

        return (
            <TableContainer style={styles.tableContainer}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            {RESERVED_COLUMNS.map(col => (
                                <TableCell
                                    key={col.id}
                                    align={col.numeric ? 'right' : 'left'}
                                    style={styles.headCell}
                                    sortDirection={orderBy === col.id ? order : false}
                                >
                                    <TableSortLabel
                                        active={orderBy === col.id}
                                        direction={orderBy === col.id ? order : 'asc'}
                                        onClick={() => handleSort(col.id)}
                                    >
                                        {col.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedData.slice(0, 500).map((row, index) => (
                            <TableRow key={index} hover>
                                <TableCell align="right" style={styles.bodyCellNumeric}>{row.portNumber}</TableCell>
                                <TableCell align="right" style={styles.bodyCellNumeric}>{row.portNumberEnd}</TableCell>
                                <TableCell style={styles.bodyCell}>
                                    <span style={{ 
                                        background: 'rgba(129, 140, 248, 0.08)', 
                                        padding: '2px 8px', 
                                        borderRadius: '4px',
                                        fontSize: '11.5px',
                                        fontWeight: 500,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: '#a5b4fc',
                                    }}>
                                        {row.jobname}
                                    </span>
                                </TableCell>
                                <TableCell style={styles.bodyCell}>{row.safname || '—'}</TableCell>
                                <TableCell style={styles.bodyCell}>
                                    <Chip
                                        label={row.useType}
                                        size="small"
                                        style={{
                                            backgroundColor: 'rgba(167, 139, 250, 0.1)',
                                            color: '#a78bfa',
                                            border: '1px solid rgba(167, 139, 250, 0.25)',
                                            fontWeight: 600,
                                            fontSize: '10px',
                                            height: '20px',
                                        }}
                                    />
                                </TableCell>
                                <TableCell style={styles.bodyCell}>
                                    <Chip
                                        label={row.protocol}
                                        size="small"
                                        style={{
                                            backgroundColor: row.protocol === 'TCP' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                            color: row.protocol === 'TCP' ? '#34d399' : '#fbbf24',
                                            border: row.protocol === 'TCP' ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid rgba(251, 191, 36, 0.25)',
                                            fontWeight: 600,
                                            fontSize: '10px',
                                            height: '20px',
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const currentData = activeTab === 0 
        ? (connections.toJS ? connections.toJS() : connections)
        : (reservedPorts.toJS ? reservedPorts.toJS() : reservedPorts);
    const filteredCount = filterData(activeTab === 0 ? currentData : currentData.filter(r => r.protocol === protocolFilter)).length;
    const timestamp = activeTab === 0 ? connectionsTimestamp : portsTimestamp;

    return (
        <div style={styles.container}>
            {/* Tab Header */}
            <div style={styles.header}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    style={styles.tabBar}
                >
                    <Tab 
                        icon={<WifiIcon style={{ fontSize: 16, marginRight: 6, marginBottom: 0 }} />}
                        label="Active Connections" 
                        style={styles.tab}
                    />
                    <Tab 
                        icon={<LockIcon style={{ fontSize: 16, marginRight: 6, marginBottom: 0 }} />}
                        label="Reserved Ports" 
                        style={styles.tab}
                    />
                </Tabs>
            </div>

            {/* Toolbar */}
            <div style={styles.toolbar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <TextField
                        placeholder="Search..."
                        variant="outlined"
                        size="small"
                        value={filter}
                        onChange={handleFilterChange}
                        style={styles.searchField}
                        aria-label="Filter table data"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ fontSize: 18, color: '#5a5d8a' }} />
                                </InputAdornment>
                            ),
                            style: { fontSize: '13px', borderRadius: '8px' },
                        }}
                    />
                    {activeTab === 1 && (
                        <ButtonGroup size="small" variant="outlined">
                            <Button
                                onClick={() => setProtocolFilter('TCP')}
                                style={{
                                    backgroundColor: protocolFilter === 'TCP' ? '#818cf8' : 'transparent',
                                    color: protocolFilter === 'TCP' ? '#eef0ff' : '#5a5d8a',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    fontWeight: 600,
                                    fontSize: '11px',
                                    textTransform: 'none',
                                }}
                            >
                                TCP
                            </Button>
                            <Button
                                onClick={() => setProtocolFilter('UDP')}
                                style={{
                                    backgroundColor: protocolFilter === 'UDP' ? '#818cf8' : 'transparent',
                                    color: protocolFilter === 'UDP' ? '#eef0ff' : '#5a5d8a',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    fontWeight: 600,
                                    fontSize: '11px',
                                    textTransform: 'none',
                                }}
                            >
                                UDP
                            </Button>
                        </ButtonGroup>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {timestamp && (
                        <span style={{ fontSize: '11px', color: '#5a5d8a' }}>
                            Updated: {timestamp}
                        </span>
                    )}
                    <Tooltip title="Refresh">
                        <IconButton
                            size="small"
                            onClick={handleRefresh}
                            disabled={isFetchingConnections || isFetchingPorts}
                            style={{ color: '#818cf8' }}
                        >
                            <RefreshIcon style={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* Table Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
                {activeTab === 0 ? renderConnectionsTable() : renderReservedPortsTable()}
            </div>

            {/* Status Bar */}
            <div style={styles.statusBar}>
                <span>
                    {filteredCount} {activeTab === 0 ? 'connections' : 'ports'} 
                    {filter && ` (filtered)`}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                        width: 6, height: 6, borderRadius: '50%', 
                        background: (connectionsError || portsError) ? '#fb7185' : '#34d399',
                        display: 'inline-block',
                        boxShadow: (connectionsError || portsError) ? '0 0 6px rgba(251,113,133,0.5)' : '0 0 6px rgba(52,211,153,0.5)',
                    }}></span>
                    {(connectionsError || portsError) ? 'Error' : 'Connected'}
                </span>
            </div>
        </div>
    );
};

IPExplorerView.propTypes = {
    dispatch: PropTypes.func.isRequired,
    connections: PropTypes.instanceOf(List),
    reservedPorts: PropTypes.instanceOf(List),
    isFetchingConnections: PropTypes.bool,
    isFetchingPorts: PropTypes.bool,
    connectionsError: PropTypes.string,
    portsError: PropTypes.string,
    connectionsTimestamp: PropTypes.string,
    portsTimestamp: PropTypes.string,
    activeTab: PropTypes.number,
    filter: PropTypes.string,
    tcpipName: PropTypes.string,
};

function mapStateToProps(state) {
    const ipRoot = state.get('ipExplorer');
    return {
        connections: ipRoot.get('connections'),
        reservedPorts: ipRoot.get('reservedPorts'),
        isFetchingConnections: ipRoot.get('isFetchingConnections'),
        isFetchingPorts: ipRoot.get('isFetchingPorts'),
        connectionsError: ipRoot.get('connectionsError'),
        portsError: ipRoot.get('portsError'),
        connectionsTimestamp: ipRoot.get('connectionsTimestamp'),
        portsTimestamp: ipRoot.get('portsTimestamp'),
        activeTab: ipRoot.get('activeTab'),
        filter: ipRoot.get('filter'),
        tcpipName: ipRoot.get('tcpipName'),
    };
}

const ConnectedIPExplorerView = connect(mapStateToProps)(IPExplorerView);
export default ConnectedIPExplorerView;
