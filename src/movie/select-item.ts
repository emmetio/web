import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  |<main class="page inner">
    <h1>Select next/previous item demo</h1>
    <p>Lorem ipsum dolor sit amet</p>
  </main>
</body>
</html>`;

const css = `|body {
  margin: 10px;
  color: black;
}

main {
  padding: 15px;
}`;

export default function selectItemMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('“Select Next/Previous Item” action selects contents of important code fragments right or left to caret.',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        scene.tooltip('In HTML, it’s a tag name, full attribute and attribute value. If value is space-separated, also selects its parts.',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        scene.run('emmetSelectNextItem', { times: 6, delay: 300 }),
        scene.wait(1000),
        (ed, next) => {
            editor.setOption('mode', 'text/css');
            setupEditor(ed, css);
            next();
        },
        scene.wait(1000),
        scene.tooltip('In CSS, it’s a selector, full property and property value',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        scene.run('emmetSelectNextItem', { times: 8, delay: 300 }),
    ], { beforeDelay: 1000 });
}
