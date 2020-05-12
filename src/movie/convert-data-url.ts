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
  <h1>Convert to data:URL demo</h1>
  <img src="|pic.png" />
</body>
</html>`;

export default function convertDataURLMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('“Convert to data:URL” action converts image to its data:URL representation and vice versa: you can save data:URL back to binary file.',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        (ed, next) => {
            ed.replaceRange('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARK5CYII=', { line: 10, ch: 12 }, { line: 10, ch: 19 });
            ed.setCursor({ line: 10, ch: 12 });
            next();
        },
        scene.wait(1000),
        scene.jumpTo({ line: 4, ch: 23 }),
        scene.wait(1000),
        scene.tooltip('Works for CSS values as well',
            tooltipAnim({ wait: 3000, alignY: 'below' })),
        scene.wait(1000),
        (ed, next) => {
            ed.replaceRange('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARK5CYII=', { line: 4, ch: 23 }, { line: 4, ch: 30 });
            ed.setCursor({ line: 4, ch: 23 });
            next();
        },
    ], { beforeDelay: 1000 });
}
