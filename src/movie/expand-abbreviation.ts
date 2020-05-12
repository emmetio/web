import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  main.page>h1+p|
</body>
</html>`;

export default function expandAbbreviationMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('Use “Expand Abbreviation” action to expand Emmet abbreviation left to caret position in <em>any</em> syntax',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(600),
        scene.run('emmetExpandAbbreviationAll'),
        scene.wait(1500),
        scene.tooltip('Use it as alternative of disabled “Mark abbreviation” option or in syntaxes not supported by Emmet',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
    ], { beforeDelay: 1000 });
}
