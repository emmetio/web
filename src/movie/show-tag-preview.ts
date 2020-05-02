import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';
import { EmmetConfig } from '@emmetio/codemirror-plugin';

const code = `<html>
<body>
  <sect|ion class="main">
    <div id="page" title="Sample page">
      <p>Hello world</p>
    </div>
  </section>
</body>
</html>`;

export default function markAbbreviationMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    // @ts-ignore Emmet editor supports this option
    const options = editor.getOption('emmet');
    // @ts-ignore Emmet editor supports this option
    editor.setOption('emmet', {
        ...options,
        previewOpenTag: true
    } as EmmetConfig);

    return createMovie(editor, scene => [
        // scene.moveTo({ line: 2, ch: 10 }),
        scene.moveTo({ line: 5, ch: 7 }),
        scene.wait(600),
        scene.tooltip('When caret is inside closing tag, displays preview of its open pair if it contains attributes',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.moveTo({ line: 6, ch: 7 }),
        scene.wait(600),
        scene.moveTo({ line: 7, ch: 5 })
    ], { beforeDelay: 1000 });
}
