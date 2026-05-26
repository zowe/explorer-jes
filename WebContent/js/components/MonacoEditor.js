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
import * as monaco from 'monaco-editor';
import {
    EDITOR_FONT_SIZE,
    EDITOR_MINIMAP,
    EDITOR_WORD_WRAP,
    EDITOR_LINE_NUMBERS,
    EDITOR_RENDER_WHITESPACE,
    getStorageItem,
} from '../utilities/storageHelper';

// ─── JCL Language Definition (Monarch Tokenizer) ────────────────────────────
const JCL_LANGUAGE_ID = 'jcl';

const JCL_MONARCH_TOKENS = {
    defaultToken: '',
    ignoreCase: true,

    tokenizer: {
        root: [
            // Comments: //* or //*
            [/\/\/\*.*$/, 'comment'],
            // JCL statement: // at column 1-2
            [/^\/\//, 'keyword', '@jclStatement'],
            // Continuation
            [/^\s+/, 'white', '@continuation'],
            // Instream data delimiter
            [/^\/\*/, 'delimiter'],
            // Instream data
            [/.*$/, 'string'],
        ],
        jclStatement: [
            // Job/Exec/DD/Proc/Set etc keywords
            [/\b(JOB|EXEC|DD|PROC|PEND|SET|IF|THEN|ELSE|ENDIF|INCLUDE|JCLLIB|OUTPUT|COMMAND|XMIT)\b/, 'keyword.control'],
            // PGM= / PROC=
            [/\b(PGM|PROC)\s*=/, 'keyword.operator'],
            // Parameters
            [/\b(DSN|DSNAME|DISP|SPACE|DCB|UNIT|VOL|SYSOUT|CLASS|MSGCLASS|MSGLEVEL|REGION|TIME|COND|NOTIFY|LRECL|RECFM|BLKSIZE)\b/, 'variable'],
            // Quoted strings
            [/'[^']*'/, 'string'],
            // Numbers
            [/\b\d+\b/, 'number'],
            // Symbols &&, &
            [/&&?\w+/, 'variable.predefined'],
            // Operators
            [/[=,()]/, 'delimiter'],
            // End of line
            [/$/, '', '@pop'],
            // Rest
            [/./, ''],
        ],
        continuation: [
            [/\b(JOB|EXEC|DD|PROC|PEND|SET|IF|THEN|ELSE|ENDIF|INCLUDE|JCLLIB|OUTPUT)\b/, 'keyword.control'],
            [/\b(PGM|PROC)\s*=/, 'keyword.operator'],
            [/\b(DSN|DSNAME|DISP|SPACE|DCB|UNIT|VOL|SYSOUT|CLASS|MSGCLASS|MSGLEVEL|REGION|TIME|COND|NOTIFY|LRECL|RECFM|BLKSIZE)\b/, 'variable'],
            [/'[^']*'/, 'string'],
            [/\b\d+\b/, 'number'],
            [/&&?\w+/, 'variable.predefined'],
            [/[=,()]/, 'delimiter'],
            [/$/, '', '@pop'],
            [/./, ''],
        ],
    },
};

// ─── Custom Dark Theme ──────────────────────────────────────────────────────
const ZOWE_DARK_THEME = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818CF8' },
        { token: 'keyword.control', foreground: 'C792EA', fontStyle: 'bold' },
        { token: 'keyword.operator', foreground: '89DDFF' },
        { token: 'variable', foreground: '82AAFF' },
        { token: 'variable.predefined', foreground: 'F78C6C' },
        { token: 'string', foreground: 'C3E88D' },
        { token: 'number', foreground: 'F78C6C' },
        { token: 'delimiter', foreground: '89DDFF' },
    ],
    colors: {
        'editor.background': '#0a0a1a',
        'editor.foreground': '#eef0ff',
        'editor.lineHighlightBackground': '#151635',
        'editor.selectionBackground': '#818cf840',
        'editorCursor.foreground': '#818cf8',
        'editorLineNumber.foreground': '#5a5d8a',
        'editorLineNumber.activeForeground': '#818cf8',
        'editor.inactiveSelectionBackground': '#818cf820',
        'editorIndentGuide.background': '#1a1c45',
        'editorIndentGuide.activeBackground': '#818cf850',
    },
};

// ─── Custom Light Theme ─────────────────────────────────────────────────────
const ZOWE_LIGHT_THEME = {
    base: 'vs',
    inherit: true,
    rules: [
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '4f46e5' },
        { token: 'keyword.control', foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'keyword.operator', foreground: '0891b2' },
        { token: 'variable', foreground: '2563eb' },
        { token: 'variable.predefined', foreground: 'd97706' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'c2410c' },
        { token: 'delimiter', foreground: '0891b2' },
    ],
    colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#1e293b',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editor.selectionBackground': '#4f46e530',
        'editorCursor.foreground': '#4f46e5',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#4f46e5',
    },
};

// Register language and themes once
let registered = false;
function ensureRegistered() {
    if (registered) return;
    registered = true;
    monaco.languages.register({ id: JCL_LANGUAGE_ID });
    monaco.languages.setMonarchTokensProvider(JCL_LANGUAGE_ID, JCL_MONARCH_TOKENS);
    monaco.editor.defineTheme('zowe-dark', ZOWE_DARK_THEME);
    monaco.editor.defineTheme('zowe-light', ZOWE_LIGHT_THEME);

    // JCL folding: fold on JOB/EXEC/PROC boundaries
    monaco.languages.registerFoldingRangeProvider(JCL_LANGUAGE_ID, {
        provideFoldingRanges(model) {
            const lines = model.getLineCount();
            const ranges = [];
            const stepStarts = [];

            for (let i = 1; i <= lines; i++) {
                const line = model.getLineContent(i);
                // Detect step/job boundaries: //name EXEC or //name JOB
                if (/^\/\/\S+\s+(EXEC|JOB|PROC)\b/i.test(line)) {
                    stepStarts.push(i);
                }
            }

            // Create ranges between consecutive steps
            for (let i = 0; i < stepStarts.length; i++) {
                const start = stepStarts[i];
                const end = (i + 1 < stepStarts.length) ? stepStarts[i + 1] - 1 : lines;
                if (end > start) {
                    ranges.push({
                        start,
                        end,
                        kind: monaco.languages.FoldingRangeKind.Region,
                    });
                }
            }
            return ranges;
        },
    });
}

/**
 * MonacoEditor - A React wrapper around Monaco Editor for JES Explorer.
 * Supports JCL syntax highlighting, dark/light themes, read-only mode.
 */
class MonacoEditor extends React.Component {
    constructor(props) {
        super(props);
        this.containerRef = React.createRef();
        this.editor = null;
        this.resizeObserver = null;
        this.changeListener = null;
        this._suppressChangeEvent = false;
    }

    componentDidMount() {
        ensureRegistered();
        this.createEditor();
        // Auto-resize when container changes
        this.resizeObserver = new ResizeObserver(() => {
            if (this.editor) {
                this.editor.layout();
            }
        });
        if (this.containerRef.current) {
            this.resizeObserver.observe(this.containerRef.current);
        }
        // Listen for live settings changes from preferences panel
        this._onSettingsChanged = () => { this.applySettings(); };
        window.addEventListener('editor-settings-changed', this._onSettingsChanged);
        // Notify parent that editor is ready
        if (this.props.editorReady) {
            this.props.editorReady();
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.editor) return;

        // Update content if changed externally
        if (prevProps.content !== this.props.content) {
            const model = this.editor.getModel();
            if (model && model.getValue() !== this.props.content) {
                this._suppressChangeEvent = true;
                model.setValue(this.props.content || '');
                this._suppressChangeEvent = false;
            }
            // Always sync parent state when content prop changes (even if model was already correct)
            if (this.props.passContentToParent) {
                this.props.passContentToParent(this.props.content || '');
            }
        }

        // Update readonly
        if (prevProps.readonly !== this.props.readonly) {
            this.editor.updateOptions({ readOnly: this.props.readonly });
        }

        // Update theme
        if (prevProps.theme !== this.props.theme) {
            monaco.editor.setTheme(this.props.theme || 'zowe-light');
        }
    }

    componentWillUnmount() {
        window.removeEventListener('editor-settings-changed', this._onSettingsChanged);
        if (this.changeListener) {
            this.changeListener.dispose();
            this.changeListener = null;
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
    }

    applySettings() {
        if (!this.editor) return;
        const storedFontSize = getStorageItem(EDITOR_FONT_SIZE);
        const storedMinimap = getStorageItem(EDITOR_MINIMAP);
        const storedWordWrap = getStorageItem(EDITOR_WORD_WRAP);
        const storedLineNumbers = getStorageItem(EDITOR_LINE_NUMBERS);
        const storedRenderWhitespace = getStorageItem(EDITOR_RENDER_WHITESPACE);
        this.editor.updateOptions({
            fontSize: storedFontSize || 13,
            minimap: { enabled: storedMinimap !== false, maxColumn: 80 },
            wordWrap: storedWordWrap || 'off',
            lineNumbers: storedLineNumbers || 'on',
            renderWhitespace: storedRenderWhitespace || 'none',
        });
    }

    createEditor() {
        const { content, readonly, theme } = this.props;
        const container = this.containerRef.current;
        if (!container) return;

        // Read user preferences from localStorage
        const storedFontSize = getStorageItem(EDITOR_FONT_SIZE);
        const storedMinimap = getStorageItem(EDITOR_MINIMAP);
        const storedWordWrap = getStorageItem(EDITOR_WORD_WRAP);
        const storedLineNumbers = getStorageItem(EDITOR_LINE_NUMBERS);
        const storedRenderWhitespace = getStorageItem(EDITOR_RENDER_WHITESPACE);

        this.editor = monaco.editor.create(container, {
            value: content || '',
            language: JCL_LANGUAGE_ID,
            theme: theme || 'zowe-light',
            readOnly: readonly !== false,
            automaticLayout: false,
            minimap: { enabled: storedMinimap !== false, maxColumn: 80 },
            fontSize: storedFontSize || 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            fontLigatures: true,
            lineNumbers: storedLineNumbers || 'on',
            renderLineHighlight: 'line',
            scrollBeyondLastLine: true,
            wordWrap: storedWordWrap || 'off',
            wordWrapColumn: 80,
            rulers: [],
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true },
            padding: { top: 8 },
            renderWhitespace: storedRenderWhitespace || 'none',
            folding: true,
            foldingStrategy: 'auto',
            showFoldingControls: 'mouseover',
            find: {
                addExtraSpaceOnTop: false,
                autoFindInSelection: 'never',
                seedSearchStringFromSelection: 'selection',
            },
            scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
            },
            overviewRulerLanes: 0,
        });

        // Pass content changes back to parent (suppress during programmatic setValue)
        this.changeListener = this.editor.onDidChangeModelContent(() => {
            if (!this._suppressChangeEvent && this.props.passContentToParent) {
                this.props.passContentToParent(this.editor.getValue());
            }
        });

        // Ctrl+S keyboard shortcut to trigger save/submit
        this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            if (this.props.passContentToParent) {
                this.props.passContentToParent(this.editor.getValue());
            }
        });
    }

    render() {
        return (
            <div
                ref={this.containerRef}
                style={{ width: '100%', height: '100%', minHeight: '400px', background: 'var(--bg-base)' }}
            />
        );
    }
}

MonacoEditor.propTypes = {
    content: PropTypes.string,
    readonly: PropTypes.bool,
    theme: PropTypes.string,
    editorReady: PropTypes.func,
    passContentToParent: PropTypes.func,
};

MonacoEditor.defaultProps = {
    content: '',
    readonly: true,
    theme: 'zowe-light',
};

export default MonacoEditor;
