import { InputType } from '@/lib/types';
import {
    defaultKeymap,
    deleteLine,
    history,
    historyKeymap,
    indentLess,
    indentMore,
    indentWithTab,
    moveLineDown,
    moveLineUp,
    redo,
    selectLine,
    undo
} from '@codemirror/commands';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { EditorState, Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import {
    crosshairCursor, drawSelection,
    dropCursor, EditorView, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, rectangularSelection
} from '@codemirror/view';
import React from 'react';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: InputType;
    isValid: boolean;
    validationError: string | null;
    theme?: 'light' | 'dark';
}

const CodeEditor: React.FC<CodeEditorProps> = ({
    value,
    onChange,
    language,
    isValid,
    validationError,
    theme = 'light'
}) => {
    const editorRef = React.useRef<HTMLDivElement | null>(null);
    const viewRef = React.useRef<EditorView | null>(null);
    const skipUpdateRef = React.useRef(false);
    const prevLanguageRef = React.useRef(language);
    const prevThemeRef = React.useRef(theme);

    React.useEffect(() => {
        if (!editorRef.current) return;

        const view = viewRef.current;
        const updateListener = EditorView.updateListener.of(update => {
            if (update.docChanged && !skipUpdateRef.current) {
                onChange(update.state.doc.toString());
            }
        });

        const extensions: Extension[] = [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            drawSelection(),
            dropCursor(),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            rectangularSelection(),
            crosshairCursor(),
            highlightActiveLine(),
            foldGutter(),
            history(),
            keymap.of([
                ...defaultKeymap,
                ...historyKeymap,
                ...foldKeymap,
                indentWithTab,
                { key: 'Mod-z', run: undo },
                { key: 'Mod-y', run: redo },
                { key: 'Shift-Mod-z', run: redo },
                { key: 'Ctrl-z', run: undo },
                { key: 'Ctrl-y', run: redo },
                { key: 'Tab', run: indentMore, shift: indentLess },
                { key: 'Mod-[', run: indentLess },
                { key: 'Mod-]', run: indentMore },
                { key: 'Mod-l', run: selectLine },
                { key: 'Mod-d', run: deleteLine },
                { key: 'Alt-ArrowUp', run: moveLineUp },
                { key: 'Alt-ArrowDown', run: moveLineDown },
            ]),
            EditorView.domEventHandlers({
                keydown: (event) => {
                    if (event.key === 'Tab') {
                        event.preventDefault();
                    }
                }
            }),
            EditorView.theme({
                '&': {
                    height: '300px',
                    fontSize: '14px'
                },
                '.cm-scroller': {
                    overflow: 'auto',
                    fontFamily: 'monospace'
                },
                '&.cm-focused': {
                    outline: 'none'
                },
                '.cm-line': {
                    padding: '0 4px',
                    lineHeight: '1.6'
                },
                '.cm-foldGutter': {
                    width: '14px'
                },
                '.cm-gutterElement': {
                    padding: '0 2px',
                    cursor: 'pointer'
                },
                '.cm-foldGutter .cm-gutterElement:hover': {
                    color: theme === 'dark' ? '#fff' : '#000'
                },
                '.cm-focused .cm-matchingBracket': {
                    backgroundColor: theme === 'dark' ? '#364652' : '#DCDCDC',
                    color: 'inherit'
                }
            }),
            EditorState.tabSize.of(2),
            EditorView.lineWrapping,
            language === InputType.json ? json() : yaml(),
            theme === 'dark' ? oneDark : [],
            updateListener
        ];

        if (!view) {
            const state = EditorState.create({
                doc: value,
                extensions
            });

            const newView = new EditorView({
                state,
                parent: editorRef.current
            });

            viewRef.current = newView;
        } else if (language !== prevLanguageRef.current || theme !== prevThemeRef.current) {
            // Only update if language or theme changed
            const state = EditorState.create({
                doc: view.state.doc,
                extensions
            });
            view.setState(state);
        }

        prevLanguageRef.current = language;
        prevThemeRef.current = theme;

        return () => {
            if (viewRef.current && !editorRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, [language, theme]); // Only re-run when language or theme changes

    // Handle external value changes
    React.useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        const currentValue = view.state.doc.toString();
        if (value !== currentValue) {
            skipUpdateRef.current = true;
            view.dispatch({
                changes: {
                    from: 0,
                    to: currentValue.length,
                    insert: value
                }
            });
            skipUpdateRef.current = false;
        }
    }, [value]);

    return (
        <div className="relative">
            <div
                ref={editorRef}
                className={`border rounded-md overflow-hidden ${!isValid ? 'border-red-500 dark:border-red-400' : 'border-border'}`}
            />
            {validationError && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 text-sm">
                    {validationError}
                </div>
            )}
        </div>
    );
};

export default CodeEditor;