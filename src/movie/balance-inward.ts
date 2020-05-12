import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  <div>
    <p>Balance Inward |action demo</p>
  </div>
</body>
</html>`;

export default function balanceInwardMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.tooltip('“Balance” action allows you to quickly select context block: tag in HTML or section in CSS',
            tooltipAnim({ wait: 5000, alignY: 'below' })),
        scene.wait(1000),
        scene.run('emmetBalanceInward'),
        scene.wait(1000),
        scene.tooltip('Run action multiple times to narrow down selection to first child block',
            tooltipAnim({ wait: 4000, alignY: 'above', pos: { line: 3, ch: 15 } })),
        scene.wait(1000),
        scene.moveTo({ line: 1, ch: 3 }),
        scene.wait(1000),
        scene.run('emmetBalanceInward', { times: 5, delay: 400 }),
    ], { beforeDelay: 1000 });
}
