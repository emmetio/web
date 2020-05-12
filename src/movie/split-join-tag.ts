import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  <main|>
    <h1>Split/Join Tag demo</h1>
    <p>Lorem ipsum dolor sit amet</p>
  </main>
</body>
</html>`;

export default function splitJoinMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('“Split/Join Tag” action converts tag between self-closing state and state with closing tag. Converting to self-closing state removes tag contents.',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        scene.run('emmetSplitJoinTag'),
        scene.wait(1000),
        scene.moveTo({ line: 2, ch: 7 }),
        scene.wait(1000),
        scene.run('emmetSplitJoinTag'),
    ], { beforeDelay: 1000 });
}
