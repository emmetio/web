import { SceneTooltipOptions } from 'codemirror-movie/dist/widgets/tooltip';
import { EmmetEditor } from '../types';

/**
 * Initial editor setup: inserts given text and places caret at the
 * location of `|` character in text
 */
export function setupEditor(editor: EmmetEditor, code: string) {
    let caret = code.length;
    if (code.includes('|')) {
        const parts = code.split('|');
        caret = parts[0].length;
        code = parts.join('');
    }

    editor.setValue(code);
    editor.setCursor(editor.posFromIndex(caret));
}

export function tooltipAnim(options: Partial<SceneTooltipOptions>): Partial<SceneTooltipOptions> {
    return {
        animationShow: 'show-tooltip 0.3s',
        animationHide: 'show-tooltip 0.3s reverse',
        ...options
    };
}
