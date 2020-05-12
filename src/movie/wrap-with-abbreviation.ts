import createMovie, { Movie, Scene } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  |item 1
  item 2
  item 3
</body>
</html>`;

interface WrapPanel extends HTMLElement {
    emmet: {
        submit(): void;
        cancel(): void;
        update(): void;
    }
}

export default function expandAbbreviationMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('“Wrap With Abbreviation” action allows you to wrap select text with abbreviation: it will be inserted into deepest element',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(600),
        scene.select({ line: 4, ch: 8 }),
        scene.run('emmetWrapWithAbbreviation'),
        scene.wait(1000),
        typeWrapAbbreviation('main>p'),
        scene.wait(1000),
        submitWrap(),
        scene.wait(1500),
        scene.run('undo'),
        scene.wait(1000),
        scene.tooltip('You can also wrap individual lines by marking repeated element with <code>*</code>',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.run('emmetWrapWithAbbreviation'),
        scene.wait(1000),
        typeWrapAbbreviation('ul>li*>a'),
        scene.wait(2000),
        submitWrap(),
    ], { beforeDelay: 1000 });
}

/**
 * Types given abbreviation into Wrap With Abbreviation input panel
 */
function typeWrapAbbreviation(abbr: string): Scene {
    return function typeWrapAbbreviationScene(editor, next, timer) {
        const chars = String(abbr).split('');
        const delay = 60;
        const panel = getPanel(editor);
        const input = panel.querySelector('input')!;
        input.readOnly = true;

        timer(function perform() {
            input.value += chars.shift()!;
            panel.emmet.update();

            if (chars.length) {
                timer(perform, delay);
            } else {
                next();
            }
        }, 100);
    };
}

function submitWrap(): Scene {
    return (editor, next) => {
        getPanel(editor).emmet.submit();
        next();
    }
}

function getPanel(editor: CodeMirror.Editor): WrapPanel {
    return editor.getWrapperElement().querySelector('.emmet-panel') as WrapPanel;
}
