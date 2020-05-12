import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  |
</body>
</html>`;

export default function enterAbbreviationModeMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('Use “Enter Abbreviation Mode” to explicitly start Emmet abbreviation capturing.',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(600),
        scene.run('emmetEnterAbbreviationMode'),
        scene.wait(1000),
        scene.tooltip('A special indicator appears: everything you type will be treated as abbreviation with syntax validation and interactive preview',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        scene.type('ul.nav>li.item*4'),
        scene.tooltip('Hit <kbd>Tab</kbd> key to expand abbreviation, <kbd>Esc</kbd> to remove it, including text you’ve entered.',
            tooltipAnim({ wait: 5000 })),
        scene.run('emmetExpandAbbreviation'),
    ], { beforeDelay: 1000 });
}
