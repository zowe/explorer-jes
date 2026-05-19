/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import ViewListIcon from '@material-ui/icons/ViewList';
import DashboardIcon from '@material-ui/icons/Dashboard';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import DeviceHubIcon from '@material-ui/icons/DeviceHub';
import StorageIcon from '@material-ui/icons/Storage';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import { fetchConnections, fetchReservedPortsList, fetchDefaultTcpipName, fetchTcpipInfo, setIpTab, setIpFilter } from '../actions/ipExplorer';

// ─────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────
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

function getStateColor(state) {
    switch (state) {
        case 'Established': return { bg: 'rgba(52, 211, 153, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(52, 211, 153, 0.25)' };
        case 'Listen': return { bg: 'rgba(129, 140, 248, 0.1)', color: 'var(--accent-indigo)', border: '1px solid rgba(129, 140, 248, 0.25)' };
        case 'TimeWait': return { bg: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-amber)', border: '1px solid rgba(251, 191, 36, 0.25)' };
        case 'CloseWait': return { bg: 'rgba(251, 113, 133, 0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(251, 113, 133, 0.25)' };
        default: return { bg: 'rgba(139, 143, 186, 0.08)', color: 'var(--text-muted)', border: '1px solid rgba(139, 143, 186, 0.2)' };
    }
}

// ─────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER - Smooth count-up animation
// ─────────────────────────────────────────────────────────────────────
const AnimatedCounter = ({ value, duration = 800 }) => {
    const [display, setDisplay] = useState(0);
    const startRef = useRef(null);
    const frameRef = useRef(null);

    useEffect(() => {
        const target = typeof value === 'number' ? value : 0;
        const start = display;
        const startTime = performance.now();
        startRef.current = startTime;

        const animate = (now) => {
            if (startRef.current !== startTime) return; // cancelled
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(start + (target - start) * eased));
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
    }, [value]);

    return <span>{display.toLocaleString()}</span>;
};

// ─────────────────────────────────────────────────────────────────────
// NETWORK ACTIVITY VISUALIZATION (Innovative Canvas Animation)
// Shows real-time flowing particles representing network connections
// ─────────────────────────────────────────────────────────────────────
const NetworkActivityCanvas = ({ connectionCount, stateGroups }) => {
    const canvasRef = useRef(null);
    const animFrameRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);
        };
        resize();

        // Create particles based on connection count (capped for performance)
        const particleCount = Math.min(Math.max(connectionCount / 3, 12), 60);
        const colors = ['#818cf8', '#22d3ee', '#34d399', '#a78bfa', '#fb7185'];
        const particles = [];
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2 + 1,
                color: colors[i % colors.length],
                alpha: Math.random() * 0.5 + 0.3,
                pulse: Math.random() * Math.PI * 2,
            });
        }
        particlesRef.current = particles;

        const animate = () => {
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;
            ctx.clearRect(0, 0, w, h);

            // Draw connection lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 80) {
                        const alpha = (1 - dist / 80) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Update and draw particles
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += 0.03;

                // Bounce off walls
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                p.x = Math.max(0, Math.min(w, p.x));
                p.y = Math.max(0, Math.min(h, p.y));

                const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace(')', `, ${pulseAlpha})`).replace('rgb', 'rgba').replace('#', '');
                // handle hex colors
                const r = parseInt(p.color.slice(1, 3), 16);
                const g = parseInt(p.color.slice(3, 5), 16);
                const b = parseInt(p.color.slice(5, 7), 16);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulseAlpha})`;
                ctx.fill();

                // Glow effect
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulseAlpha * 0.15})`;
                ctx.fill();
            });

            animFrameRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [connectionCount]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                pointerEvents: 'none', opacity: 0.7,
            }}
        />
    );
};

// ─────────────────────────────────────────────────────────────────────
// STAT CARD (with animated counter)
// ─────────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, delay }) => (
    <div className="ip-stat-card ip-card-animate" style={{
        padding: '18px 20px', borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: '14px',
        animationDelay: `${delay * 80}ms`,
        cursor: 'default',
    }}>
        <div style={{
            width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
            background: `rgba(99, 102, 241, 0.08)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent, border: `1px solid rgba(99, 102, 241, 0.15)`,
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                <AnimatedCounter value={typeof value === 'number' ? value : 0} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.3px', marginTop: '2px' }}>
                {label}
            </div>
        </div>
    </div>
);

const cardStyle = {
    borderRadius: 'var(--radius-lg)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    overflow: 'hidden',
};

const cardHeaderStyle = {
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-subtle)',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '0.3px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textTransform: 'uppercase',
};

// ─────────────────────────────────────────────────────────────────────
// PROGRESS BAR COMPONENT (reliable, no color-mix)
// ─────────────────────────────────────────────────────────────────────
const ProgressBar = ({ percentage, color, animate = true }) => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        if (animate) {
            const timer = setTimeout(() => setWidth(percentage), 50);
            return () => clearTimeout(timer);
        }
        setWidth(percentage);
    }, [percentage, animate]);

    return (
        <div style={{ height: '6px', borderRadius: '3px', background: 'var(--bg-hover)', overflow: 'hidden' }}>
            <div style={{
                width: `${width}%`,
                height: '100%',
                borderRadius: '3px',
                background: color,
                transition: 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────
// DONUT CHART - Lightweight SVG donut for connection state breakdown
// ─────────────────────────────────────────────────────────────────────
const DonutChart = ({ data, size = 120 }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return null;

    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercent = 0;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ip-donut">
                {data.map((segment, idx) => {
                    const percent = segment.value / total;
                    const strokeDash = circumference * percent;
                    const strokeOffset = circumference * cumulativePercent;
                    cumulativePercent += percent;
                    return (
                        <circle
                            key={segment.label}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={segment.rawColor}
                            strokeWidth="10"
                            strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                            strokeDashoffset={-strokeOffset}
                            strokeLinecap="round"
                            style={{
                                transition: 'stroke-dasharray 600ms ease, stroke-dashoffset 600ms ease',
                                transform: 'rotate(-90deg)',
                                transformOrigin: '50% 50%',
                            }}
                        />
                    );
                })}
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{ fill: 'var(--text-primary)', fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {total}
                </text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.map(segment => (
                    <div key={segment.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: segment.rawColor, flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{segment.label}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{segment.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────
// DASHBOARD VIEW
// ─────────────────────────────────────────────────────────────────────
const DashboardView = ({ connections, reservedPorts, isFetching, error, onRefresh }) => {
    const data = connections.toJS ? connections.toJS() : connections;

    if (isFetching) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress size={40} style={{ color: 'var(--accent-indigo)' }} />
                <span style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading network data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <WifiIcon style={{ fontSize: 56, color: 'var(--accent-rose)', opacity: 0.4, marginBottom: 12 }} />
                <span style={{ color: 'var(--accent-rose)', fontWeight: 600, fontSize: '14px' }}>{error}</span>
                <Button onClick={onRefresh} style={{ marginTop: 16, color: 'var(--accent-indigo)', textTransform: 'none', fontWeight: 600 }}>
                    <RefreshIcon style={{ fontSize: 16, marginRight: 6 }} /> Retry
                </Button>
            </div>
        );
    }

    // Compute statistics
    const totalConnections = data.length;
    const stateGroups = {};
    const resourceGroups = {};
    const portRanges = { 'Well-Known (0-1023)': 0, 'Registered (1024-49151)': 0, 'Dynamic (49152-65535)': 0 };
    const uniqueRemoteIPs = new Set();

    data.forEach(conn => {
        stateGroups[conn.state] = (stateGroups[conn.state] || 0) + 1;
        resourceGroups[conn.resourceName] = (resourceGroups[conn.resourceName] || 0) + 1;
        if (conn.remoteIPaddress) uniqueRemoteIPs.add(conn.remoteIPaddress);
        const port = parseInt(conn.localPort, 10);
        if (port <= 1023) portRanges['Well-Known (0-1023)']++;
        else if (port <= 49151) portRanges['Registered (1024-49151)']++;
        else portRanges['Dynamic (49152-65535)']++;
    });

    const topResources = Object.entries(resourceGroups)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    const maxResourceCount = topResources.length > 0 ? topResources[0][1] : 1;
    const stateEntries = Object.entries(stateGroups).sort((a, b) => b[1] - a[1]);
    const reservedData = reservedPorts.toJS ? reservedPorts.toJS() : reservedPorts;

    // Color mapping for donut
    const stateColorMap = {
        'Established': '#34d399',
        'Listen': '#818cf8',
        'TimeWait': '#fbbf24',
        'CloseWait': '#fb7185',
    };
    const donutData = stateEntries.map(([label, value]) => ({
        label, value, rawColor: stateColorMap[label] || '#8b8fba',
    }));

    return (
        <div className="ip-dashboard" style={{ padding: '20px', overflow: 'auto', height: '100%' }}>
            {/* Network Activity Banner */}
            <div className="ip-card ip-card-animate" style={{
                ...cardStyle, position: 'relative', height: '100px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', padding: '0 24px', overflow: 'hidden',
            }}>
                <NetworkActivityCanvas connectionCount={totalConnections} stateGroups={stateGroups} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <SettingsEthernetIcon style={{ fontSize: 28, color: 'var(--accent-indigo)' }} />
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Network Activity</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {totalConnections} active connections across {Object.keys(resourceGroups).length} resources
                        </div>
                    </div>
                </div>
                <div style={{ position: 'relative', zIndex: 1, marginLeft: 'auto' }}>
                    <Tooltip title="Refresh Data">
                        <IconButton onClick={onRefresh} style={{ color: 'var(--accent-indigo)' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <StatCard icon={<WifiIcon style={{ fontSize: 20 }} />} label="Total Connections" value={totalConnections} accent="var(--accent-indigo)" delay={0} />
                <StatCard icon={<DeviceHubIcon style={{ fontSize: 20 }} />} label="Unique Remote IPs" value={uniqueRemoteIPs.size} accent="var(--accent-cyan)" delay={1} />
                <StatCard icon={<StorageIcon style={{ fontSize: 20 }} />} label="Active Resources" value={Object.keys(resourceGroups).length} accent="var(--accent-violet)" delay={2} />
                <StatCard icon={<LockIcon style={{ fontSize: 20 }} />} label="Reserved Ports" value={reservedData.length} accent="var(--accent-emerald)" delay={3} />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {/* Connection States with Donut */}
                <div className="ip-card ip-card-animate" style={{ ...cardStyle, animationDelay: '120ms' }}>
                    <div style={cardHeaderStyle}>
                        <TrendingUpIcon style={{ fontSize: 16, color: 'var(--accent-indigo)' }} />
                        <span>Connection States</span>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                        {donutData.length > 0 ? (
                            <DonutChart data={donutData} size={130} />
                        ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No connection data</span>
                        )}
                    </div>
                </div>

                {/* Port Range Distribution */}
                <div className="ip-card ip-card-animate" style={{ ...cardStyle, animationDelay: '200ms' }}>
                    <div style={cardHeaderStyle}>
                        <StorageIcon style={{ fontSize: 16, color: 'var(--accent-cyan)' }} />
                        <span>Port Distribution</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                        {Object.entries(portRanges).map(([range, count], idx) => {
                            const pct = totalConnections > 0 ? (count / totalConnections * 100) : 0;
                            const rangeColors = ['var(--accent-indigo)', 'var(--accent-cyan)', 'var(--accent-violet)'];
                            return (
                                <div key={range} className="ip-bar-row" style={{ marginBottom: '14px', animationDelay: `${idx * 80}ms` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--text-primary)' }}>{range}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                            {count} ({pct.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <ProgressBar percentage={pct} color={rangeColors[idx] || 'var(--accent-indigo)'} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Resources */}
            <div className="ip-card ip-card-animate" style={{ ...cardStyle, animationDelay: '300ms' }}>
                <div style={cardHeaderStyle}>
                    <DeviceHubIcon style={{ fontSize: 16, color: 'var(--accent-violet)' }} />
                    <span>Top Resources</span>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'none' }}>
                        by connection count
                    </span>
                </div>
                <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                    {topResources.map(([name, count], idx) => (
                        <div key={name} className="ip-resource-chip" style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 14px', borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                            animationDelay: `${idx * 40}ms`,
                        }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                                background: 'rgba(129, 140, 248, 0.08)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--border-subtle)',
                                flexShrink: 0,
                            }}>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                                    {count}
                                </span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {name}
                                </div>
                                <div style={{ height: '3px', borderRadius: '2px', background: 'var(--bg-hover)', marginTop: '5px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${(count / maxResourceCount * 100)}%`,
                                        height: '100%', borderRadius: '2px',
                                        background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-violet))',
                                        transition: 'width 600ms ease-out',
                                    }} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {topResources.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No resource data</span>}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────
const styles = {
    container: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-base)',
    },
    header: {
        padding: '14px 20px 0',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
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
        color: 'var(--text-muted)',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-base)',
        flexShrink: 0,
    },
    searchField: {
        width: '280px',
    },
    tableContainer: {
        flex: 1,
        overflow: 'auto',
    },
    headCell: {
        fontWeight: 700,
        fontSize: '10.5px',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border-default)',
        padding: '10px 16px',
        whiteSpace: 'nowrap',
        background: 'var(--bg-surface)',
    },
    bodyCell: {
        fontSize: '12.5px',
        fontWeight: 500,
        padding: '9px 16px',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-subtle)',
    },
    bodyCellNumeric: {
        fontSize: '12.5px',
        fontWeight: 600,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        padding: '9px 16px',
        color: 'var(--accent-indigo)',
        borderBottom: '1px solid var(--border-subtle)',
    },
    statusBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        fontSize: '11.5px',
        color: 'var(--text-muted)',
        fontWeight: 500,
        flexShrink: 0,
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        color: 'var(--text-muted)',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
    },
};

// ─────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────
const IPExplorerView = ({ dispatch, connections, reservedPorts, isFetchingConnections, isFetchingPorts,
    connectionsError, portsError, connectionsTimestamp, portsTimestamp, activeTab, filter, tcpipName }) => {
    
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('localPort');
    const [protocolFilter, setProtocolFilter] = useState('TCP');
    const [viewMode, setViewMode] = useState('table');

    useEffect(() => {
        dispatch(fetchDefaultTcpipName()).then(name => {
            if (name) {
                dispatch(fetchConnections(name));
                dispatch(fetchReservedPortsList(name));
                dispatch(fetchTcpipInfo(name));
            }
        });
    }, [dispatch]);

    const handleSort = useCallback((property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);

    const handleTabChange = useCallback((event, newValue) => {
        dispatch(setIpTab(newValue));
        setOrderBy(newValue === 0 ? 'localPort' : 'portNumber');
        setOrder('asc');
    }, [dispatch]);

    const handleFilterChange = useCallback((event) => {
        dispatch(setIpFilter(event.target.value));
    }, [dispatch]);

    const handleRefresh = useCallback(() => {
        const name = tcpipName || '*';
        dispatch(fetchConnections(name));
        dispatch(fetchReservedPortsList(name));
    }, [dispatch, tcpipName]);

    const filterData = useCallback((data) => {
        if (!filter) return data;
        const lowerFilter = filter.toLowerCase();
        return data.filter(row => {
            return Object.values(row).some(val => 
                String(val).toLowerCase().includes(lowerFilter)
            );
        });
    }, [filter]);

    const renderConnectionsTable = () => {
        const isFetching = isFetchingConnections;
        const data = connections.toJS ? connections.toJS() : connections;
        const filteredData = filterData(data);
        const sortedData = stableSort(filteredData, getComparator(order, orderBy));

        if (isFetching) {
            return (
                <div style={styles.loadingContainer}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CircularProgress size={32} style={{ color: 'var(--accent-indigo)' }} />
                        <span style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>Loading connections...</span>
                    </div>
                </div>
            );
        }

        if (connectionsError) {
            return (
                <div style={styles.emptyState} className="ip-fade-in">
                    <WifiIcon style={{ fontSize: 48, marginBottom: 12, opacity: 0.3, color: 'var(--accent-rose)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-rose)' }}>Connection Error</span>
                    <span style={{ fontSize: '12px', marginTop: 4, color: 'var(--text-muted)' }}>{connectionsError}</span>
                    <Button onClick={handleRefresh} style={{ marginTop: 12, color: 'var(--accent-indigo)', textTransform: 'none', fontWeight: 600, fontSize: '12px' }}>
                        <RefreshIcon style={{ fontSize: 14, marginRight: 4 }} /> Retry
                    </Button>
                </div>
            );
        }

        if (filteredData.length === 0) {
            return (
                <div style={styles.emptyState} className="ip-fade-in">
                    <WifiIcon style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>No active connections found</span>
                    <span style={{ fontSize: '12px', marginTop: 4 }}>Try refreshing or adjusting your search filter</span>
                </div>
            );
        }

        return (
            <TableContainer style={styles.tableContainer} className="ip-fade-in">
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
                            <TableRow key={`${row.localPort}-${row.remotePort}-${index}`} hover className="ip-table-row">
                                <TableCell align="right" style={styles.bodyCellNumeric}>{row.localPort}</TableCell>
                                <TableCell style={styles.bodyCell}>{row.localIPaddress}</TableCell>
                                <TableCell style={styles.bodyCell}>{row.remoteIPaddress}</TableCell>
                                <TableCell align="right" style={styles.bodyCellNumeric}>{row.remotePort}</TableCell>
                                <TableCell style={styles.bodyCell}>
                                    {(() => {
                                        const chipColors = getStateColor(row.state);
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
                                        color: 'var(--accent-indigo)',
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
        data = data.filter(row => row.protocol === protocolFilter);
        const filteredData = filterData(data);
        const sortedData = stableSort(filteredData, getComparator(order, orderBy));

        if (isFetching) {
            return (
                <div style={styles.loadingContainer}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CircularProgress size={32} style={{ color: 'var(--accent-indigo)' }} />
                        <span style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>Loading ports...</span>
                    </div>
                </div>
            );
        }

        if (portsError) {
            return (
                <div style={styles.emptyState} className="ip-fade-in">
                    <LockIcon style={{ fontSize: 48, marginBottom: 12, opacity: 0.3, color: 'var(--accent-rose)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-rose)' }}>Failed to Load Ports</span>
                    <span style={{ fontSize: '12px', marginTop: 4, color: 'var(--text-muted)' }}>{portsError}</span>
                    <Button onClick={handleRefresh} style={{ marginTop: 12, color: 'var(--accent-indigo)', textTransform: 'none', fontWeight: 600, fontSize: '12px' }}>
                        <RefreshIcon style={{ fontSize: 14, marginRight: 4 }} /> Retry
                    </Button>
                </div>
            );
        }

        if (filteredData.length === 0) {
            return (
                <div style={styles.emptyState} className="ip-fade-in">
                    <LockIcon style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>No reserved ports found</span>
                    <span style={{ fontSize: '12px', marginTop: 4 }}>Try refreshing or adjusting your search filter</span>
                </div>
            );
        }

        return (
            <TableContainer style={styles.tableContainer} className="ip-fade-in">
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
                            <TableRow key={`${row.portNumber}-${row.jobname}-${index}`} hover className="ip-table-row">
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
                                        color: 'var(--accent-indigo)',
                                    }}>
                                        {row.jobname}
                                    </span>
                                </TableCell>
                                <TableCell style={styles.bodyCell}>{row.safname || '\u2014'}</TableCell>
                                <TableCell style={styles.bodyCell}>
                                    <Chip
                                        label={row.useType}
                                        size="small"
                                        style={{
                                            backgroundColor: 'rgba(167, 139, 250, 0.1)',
                                            color: 'var(--accent-violet)',
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
                                            color: row.protocol === 'TCP' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
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
        <div style={styles.container} className="ip-explorer-root">
            {/* Tab Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    
                    {/* View Mode Toggle */}
                    <div className="ip-view-toggle" style={{ display: 'flex', gap: '2px', padding: '3px', borderRadius: '8px', background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
                        <Tooltip title="Table View">
                            <IconButton
                                size="small"
                                onClick={() => setViewMode('table')}
                                style={{
                                    padding: '6px',
                                    borderRadius: '6px',
                                    background: viewMode === 'table' ? 'var(--accent-indigo)' : 'transparent',
                                    color: viewMode === 'table' ? '#ffffff' : 'var(--text-muted)',
                                    transition: 'all 200ms ease',
                                }}
                            >
                                <ViewListIcon style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Dashboard View">
                            <IconButton
                                size="small"
                                onClick={() => setViewMode('dashboard')}
                                style={{
                                    padding: '6px',
                                    borderRadius: '6px',
                                    background: viewMode === 'dashboard' ? 'var(--accent-indigo)' : 'transparent',
                                    color: viewMode === 'dashboard' ? '#ffffff' : 'var(--text-muted)',
                                    transition: 'all 200ms ease',
                                }}
                            >
                                <DashboardIcon style={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Toolbar - only in table mode */}
            {viewMode === 'table' && (
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
                                        <SearchIcon style={{ fontSize: 18, color: 'var(--text-muted)' }} />
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
                                        backgroundColor: protocolFilter === 'TCP' ? 'var(--accent-indigo)' : 'transparent',
                                        color: protocolFilter === 'TCP' ? '#ffffff' : 'var(--text-muted)',
                                        border: '1px solid var(--border-default)',
                                        fontWeight: 600, fontSize: '11px', textTransform: 'none',
                                    }}
                                >TCP</Button>
                                <Button
                                    onClick={() => setProtocolFilter('UDP')}
                                    style={{
                                        backgroundColor: protocolFilter === 'UDP' ? 'var(--accent-indigo)' : 'transparent',
                                        color: protocolFilter === 'UDP' ? '#ffffff' : 'var(--text-muted)',
                                        border: '1px solid var(--border-default)',
                                        fontWeight: 600, fontSize: '11px', textTransform: 'none',
                                    }}
                                >UDP</Button>
                            </ButtonGroup>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {timestamp && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated: {timestamp}</span>
                        )}
                        <Tooltip title="Refresh">
                            <IconButton
                                size="small"
                                onClick={handleRefresh}
                                disabled={isFetchingConnections || isFetchingPorts}
                                className="ip-refresh-btn"
                                style={{ color: 'var(--accent-indigo)' }}
                            >
                                <RefreshIcon style={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {viewMode === 'dashboard' ? (
                    <DashboardView
                        connections={connections}
                        reservedPorts={reservedPorts}
                        isFetching={isFetchingConnections}
                        error={connectionsError}
                        onRefresh={handleRefresh}
                    />
                ) : (
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {activeTab === 0 ? renderConnectionsTable() : renderReservedPortsTable()}
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div style={styles.statusBar}>
                <span>
                    {viewMode === 'dashboard' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <DashboardIcon style={{ fontSize: 14 }} /> Dashboard Overview
                        </span>
                    ) : (
                        <span>
                            {filteredCount} {activeTab === 0 ? 'connections' : 'ports'}{filter && ' (filtered)'}
                        </span>
                    )}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="ip-status-dot" style={{ 
                        width: 6, height: 6, borderRadius: '50%', 
                        background: (connectionsError || portsError) ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                        display: 'inline-block',
                    }} />
                    {(connectionsError || portsError) ? 'Error' : 'Connected'}
                    {timestamp && (
                        <span style={{ marginLeft: '8px', fontSize: '10px' }}>{'\u2022'} {timestamp}</span>
                    )}
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
