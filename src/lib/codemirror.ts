import CodeMirror from 'codemirror';
import setupEmmet, { EmmetConfig, EmmetEditor } from '@emmetio/codemirror-plugin';

import 'codemirror/addon/edit/closebrackets';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/sass/sass';
import 'codemirror/mode/haml/haml';
import 'codemirror/mode/slim/slim';
import 'codemirror/mode/pug/pug';

setupEmmet(CodeMirror);

export type EditorOptions = CodeMirror.EditorConfiguration & {
    emmet: Partial<EmmetConfig>,
    singleLine?: boolean
}

/**
 * Creates CodeMirror instance with Emmet support from given element
 */
export default function createEditor(target: HTMLElement, options: Partial<EditorOptions> = {}): EmmetEditor {
    const extraKeys: CodeMirror.KeyMap = {
        'Tab': 'emmetExpandAbbreviation',
        'Esc': 'emmetResetAbbreviation',
        'Enter': 'emmetInsertLineBreak',
        'Ctrl-E': 'emmetExpandAbbreviationAll',
        'Ctrl-.': 'emmetEnterAbbreviationMode',
        'Ctrl-W': 'emmetWrapWithAbbreviation',
        'Cmd-D': 'emmetBalance',
        'Ctrl-D': 'emmetBalanceInward',
        'Cmd-/': 'emmetToggleComment',
        'Cmd-Y': 'emmetEvaluateMath',
        'Ctrl-Left': 'emmetGoToPreviousEditPoint',
        'Ctrl-Right': 'emmetGoToNextEditPoint',
        'Ctrl-P': 'emmetGoToTagPair',
        'Ctrl-Up': 'emmetIncrementNumber1',
        'Alt-Up': 'emmetIncrementNumber01',
        'Ctrl-Alt-Up': 'emmetIncrementNumber10',
        'Ctrl-Down': 'emmetDecrementNumber1',
        'Alt-Down': 'emmetDecrementNumber01',
        'Ctrl-Alt-Down': 'emmetDecrementNumber10',
        'Ctrl-\'': 'emmetRemoveTag',
        'Shift-Ctrl-\'': 'emmetSplitJoinTag',
        'Shift-Ctrl-Right': 'emmetSelectNextItem',
        'Shift-Ctrl-Left': 'emmetSelectPreviousItem',
        'Shift-Enter': skipMultiline,
        'Cmd-Enter': skipMultiline,
    };

    const emmet: Partial<EmmetConfig> = {
        autoRenameTags: true,
        mark: true,
        preview: true,
        ...options.emmet
    };

    if (options.extraKeys && typeof options.extraKeys === 'object') {
        Object.assign(extraKeys, options.extraKeys);
    }


    options = {
        mode: 'text/html',
        ...options,
        extraKeys,
        emmet
    };

    const editor = target.nodeName === 'TEXTAREA'
        ? CodeMirror.fromTextArea(target as HTMLTextAreaElement, options)
        : CodeMirror(target, options);

    return editor as EmmetEditor;
}

/**
 * A key handler which will skip default action handler if editor is in single-line
 * editing mode
 */
function skipMultiline(cm: CodeMirror.Editor) {
    // @ts-ignore Custom option
    if (!cm.getOption('singleLine')) {
        return CodeMirror.Pass;
    }
}
