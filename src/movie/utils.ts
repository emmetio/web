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
        animationShow: 'show-tooltip 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        animationHide: 'show-tooltip 0.3s reverse',
        attach(editor, tooltip, pos, opt) {
            const px = editor.cursorCoords(pos, 'local');
            editor.getWrapperElement().parentNode!.appendChild(tooltip);

            const { alignX, alignY } = opt;
            const { offsetWidth, offsetHeight } = tooltip;

            if (alignX === 'center') {
                tooltip.style.left = `${px.left - offsetWidth / 2}px`;
            } else if (alignX === 'right') {
                tooltip.style.left = `${px.left - offsetWidth}px`;
            } else {
                tooltip.style.left = `${px.left}px`;
            }

            if (alignY === 'above') {
                tooltip.style.top = `${px.top - offsetHeight}px`;
            } else {
                tooltip.style.top = `${px.bottom}px`;
            }

            tooltip.style.width = `${offsetWidth}px`;
        },
        ...options
    };
}
