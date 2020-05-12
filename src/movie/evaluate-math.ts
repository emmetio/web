import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  <p>Evaluate math: |</p>
</body>
</html>`;

export default function evaluateMathMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('“Evaluate Math Expression” action allows you to evaluate simple math expressions left to caret position',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        scene.type('10*3+5', { delay: 100 }),
        scene.wait(1000),
        scene.tooltip('Math expression should not contain any spaces',
            tooltipAnim({ wait: 3000, alignY: 'below' })),
        scene.wait(600),
        scene.run('emmetEvaluateMath'),
    ], { beforeDelay: 1000 });
}
