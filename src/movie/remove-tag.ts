import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  <main| class="page">
    <h1>Remove tag demo</h1>
    <p>Lorem ipsum dolor sit amet</p>
  </main>
</body>
</html>`;

export default function removeTagMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('“Remove Tag” action quickly removes tag under caret and updates indentation of its contents.',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        scene.run('emmetRemoveTag'),
    ], { beforeDelay: 1000 });
}
