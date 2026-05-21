/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright Contributors to the Zowe Project.
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const ThemeContext = createContext({
    mode: 'light',
    toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

const darkPalette = {
    type: 'dark',
    primary: { main: '#818cf8', dark: '#6366f1', light: '#a5b4fc' },
    secondary: { main: '#a78bfa' },
    background: { default: '#06060f', paper: '#0f1022' },
    text: { primary: '#eef0ff', secondary: '#8b8fba', disabled: '#5a5d8a' },
    divider: 'rgba(99, 102, 241, 0.12)',
};

const lightPalette = {
    type: 'light',
    primary: { main: '#4f46e5', dark: '#3730a3', light: '#818cf8' },
    secondary: { main: '#7c3aed' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#475569', disabled: '#94a3b8' },
    divider: 'rgba(99, 102, 241, 0.12)',
};

function buildTheme(mode) {
    const palette = mode === 'dark' ? darkPalette : lightPalette;
    const isDark = mode === 'dark';

    return createMuiTheme({
        palette,
        typography: {
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
            fontSize: 13,
        },
        shape: { borderRadius: 10 },
        overrides: {
            MuiCssBaseline: {
                '@global': {
                    body: {
                        backgroundColor: palette.background.default,
                        color: palette.text.primary,
                    },
                },
            },
            MuiCard: {
                root: {
                    backgroundColor: isDark ? '#0a0a1a' : '#ffffff',
                    borderRadius: 0,
                    boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                },
            },
            MuiAccordion: {
                root: {
                    backgroundColor: palette.background.paper,
                    '&::before': { display: 'none' },
                },
            },
            MuiAccordionSummary: {
                root: { color: palette.text.primary },
            },
            MuiTypography: {
                body1: {
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                    fontWeight: 400,
                    fontSize: '0.875rem',
                    color: palette.text.primary,
                },
                body2: { color: palette.text.secondary },
            },
            MuiButton: {
                root: { textTransform: 'none', fontWeight: 600, borderRadius: 6 },
                containedPrimary: {
                    background: isDark
                        ? 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)'
                        : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    boxShadow: isDark
                        ? '0 2px 12px rgba(129, 140, 248, 0.3)'
                        : '0 2px 8px rgba(79, 70, 229, 0.25)',
                    color: '#ffffff',
                    '&:hover': {
                        background: isDark
                            ? 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)'
                            : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    },
                },
            },
            MuiIconButton: {
                root: {
                    color: palette.text.secondary,
                    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        backgroundColor: isDark ? 'rgba(129, 140, 248, 0.1)' : 'rgba(79, 70, 229, 0.08)',
                        color: palette.primary.main,
                    },
                },
            },
            MuiPaper: {
                root: { backgroundColor: palette.background.paper },
                elevation1: {
                    boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 12px rgba(0, 0, 0, 0.08)',
                },
            },
            MuiCardHeader: {
                root: { color: palette.text.primary },
                subheader: { color: palette.text.secondary },
            },
            MuiTableCell: {
                root: {
                    borderBottomColor: isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    color: palette.text.primary,
                },
                head: { color: palette.text.secondary, fontWeight: 600 },
            },
            MuiTableRow: {
                root: {
                    '&:hover': {
                        backgroundColor: isDark
                            ? 'rgba(26, 28, 69, 0.5) !important'
                            : 'rgba(79, 70, 229, 0.04) !important',
                    },
                },
            },
            MuiChip: { root: { borderRadius: 6 } },
            MuiTab: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    color: palette.text.secondary,
                    '&.Mui-selected': { color: palette.primary.main },
                },
            },
            MuiTabs: { indicator: { backgroundColor: palette.primary.main } },
            MuiOutlinedInput: {
                root: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0, 0, 0, 0.12)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: isDark ? 'rgba(129, 140, 248, 0.4)' : 'rgba(79, 70, 229, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: palette.primary.main,
                        borderWidth: 1,
                    },
                },
                input: {
                    color: palette.text.primary,
                    '&::placeholder': { color: palette.text.disabled, opacity: 1 },
                },
            },
            MuiInputBase: { root: { color: palette.text.primary } },
            MuiFormLabel: {
                root: {
                    color: palette.text.disabled,
                    '&.Mui-focused': { color: palette.primary.main },
                },
            },
            MuiSelect: { icon: { color: palette.text.disabled } },
            MuiMenu: {
                paper: {
                    backgroundColor: isDark ? '#151635' : '#ffffff',
                    border: isDark ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 10,
                },
            },
            MuiDialog: {
                paper: {
                    backgroundColor: palette.background.paper,
                    border: isDark ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 14,
                    boxShadow: isDark ? '0 24px 64px rgba(0, 0, 0, 0.6)' : '0 24px 48px rgba(0, 0, 0, 0.15)',
                },
            },
            MuiDialogTitle: { root: { color: palette.text.primary } },
            MuiDialogContent: { root: { color: palette.text.primary } },
            MuiMenuItem: {
                root: {
                    color: palette.text.primary,
                    fontSize: '13px',
                    '&:hover': {
                        backgroundColor: isDark ? 'rgba(129, 140, 248, 0.08)' : 'rgba(79, 70, 229, 0.06)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: isDark ? 'rgba(129, 140, 248, 0.12)' : 'rgba(79, 70, 229, 0.1)',
                    },
                },
            },
            MuiLinearProgress: {
                root: { borderRadius: 4, height: 2 },
                colorPrimary: {
                    backgroundColor: isDark ? 'rgba(26, 28, 69, 0.5)' : 'rgba(79, 70, 229, 0.1)',
                },
                barColorPrimary: { backgroundColor: palette.primary.main },
            },
            MuiTableSortLabel: {
                root: {
                    color: palette.text.disabled,
                    '&:hover': { color: palette.text.secondary },
                    '&.MuiTableSortLabel-active': { color: palette.primary.main },
                },
                icon: { color: `${palette.text.disabled} !important` },
            },
        },
    });
}

export function ThemeProviderWrapper({ children }) {
    const [mode, setMode] = useState(() => {
        try {
            return localStorage.getItem('jes-explorer-theme') || 'light';
        } catch (e) {
            return 'light';
        }
    });

    const toggleTheme = () => {
        const newMode = mode === 'dark' ? 'light' : 'dark';
        setMode(newMode);
        try {
            localStorage.setItem('jes-explorer-theme', newMode);
        } catch (e) { /* ignore */ }
        // Update body background and theme attribute immediately
        document.body.style.backgroundColor = newMode === 'dark' ? '#06060f' : '#f8fafc';
        document.body.style.color = newMode === 'dark' ? '#eef0ff' : '#1e293b';
        document.documentElement.setAttribute('data-theme', newMode);
    };

    // Set initial theme attribute on mount
    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        document.body.style.backgroundColor = mode === 'dark' ? '#06060f' : '#f8fafc';
        document.body.style.color = mode === 'dark' ? '#eef0ff' : '#1e293b';
    }, []);

    const theme = useMemo(() => buildTheme(mode), [mode]);

    const contextValue = useMemo(() => ({ mode, toggleTheme }), [mode]);

    return (
        <ThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

export default ThemeContext;
