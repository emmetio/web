import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<head>
  <style>
    .image {
      background: url('pic.jpg');
    }
  </style>
</head>
<body>
  <h1>Update Image Size demo</h1>
  <img| src="pic.jpg" />
</body>
</html>`;

export default function updateImageSizeMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('“Update Image Size” action writes image dimensions into context element. In HTML, it’s an <code>&lt;img&gt;</code> tag.',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        (ed, next) => {
            ed.replaceRange(' width="100" height="150"', { line: 10, ch: 20 }, { line: 10, ch: 20 });
            next();
        },
        scene.wait(1000),
        scene.moveTo({ line: 4, ch: 23 }),
        scene.wait(1000),
        scene.tooltip('In CSS, it’s a property with <code>url()</code> value',
            tooltipAnim({ wait: 3000, alignY: 'below' })),
        scene.wait(1000),
        (ed, next) => {
            ed.replaceRange('\n      width: 100px;\n      height: 150px;', { line: 4, ch: 33 }, { line: 4, ch: 33 });
            next();
        },
    ], { beforeDelay: 1000 });
}
