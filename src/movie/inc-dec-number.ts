import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  Number: 1|
</body>
</html>`;

export default function incDecNumberMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('A set of increment/decrement actions allows you to quickly update number under caret by 0.1, 1 and 10',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        scene.run('emmetIncrementNumber10', { times: 3, delay: 300 }),
        scene.wait(1000),
        scene.run('emmetDecrementNumber1', { times: 3, delay: 300 }),
        scene.wait(1000),
        scene.run('emmetDecrementNumber01', { times: 3, delay: 300 }),
    ], { beforeDelay: 1000 });
}
