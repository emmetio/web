import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  <div|>
    <p>Toggle Comment action demo</p>
  </div>
</body>
</html>`;

export default function toggleCommentMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('When caret is inside open or close tag, “Toggle Comment” action will comment full tag instead of current line',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(600),
        scene.run('emmetToggleComment'),
        scene.wait(1500),
        scene.tooltip('Run “Toggle Comment” again to uncomment tag', tooltipAnim({ wait: 2000, alignY: 'below' })),
        scene.wait(600),
        scene.run('emmetToggleComment')
    ], { beforeDelay: 1000 });
}
