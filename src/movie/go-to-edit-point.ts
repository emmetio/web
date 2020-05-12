import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  <|div title="">
    <p></p>
    <div></div>
  </div>
</body>
</html>`;

export default function goToEditPointMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('“Select Next/Previous Edit Point” action moves caret to next/previous location where you’d likely enter something: empty attribute, between open and close tags and newline.',
            tooltipAnim({ wait: 6000, alignY: 'below' })),
        scene.wait(1000),
        scene.run('emmetGoToNextEditPoint', { times: 3, delay: 500 }),
    ], { beforeDelay: 1000 });
}
