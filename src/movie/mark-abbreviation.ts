import createMovie, { Movie } from 'codemirror-movie';
import { EmmetEditor } from '../types';
import { setupEditor, tooltipAnim } from './utils';

const code = `<html>
<body>
  |
</body>
</html>`;
/* With “Mark Abbreviation” option enabled, Emmet captures
  abbreviation as you type text in some known syntaxes like
  HTML or CSS. It marked with subtle underline.
  When abbreviation becomes <em>complex</em> (contains more
  than one element), displays expanded preview. */

export default function markAbbreviationMovie(editor: EmmetEditor): Movie {
    setupEditor(editor, code);
    return createMovie(editor, scene => [
        scene.type('ul.nav'),
        scene.tooltip('Underline indicates Emmet captured word as abbreviation', tooltipAnim({ wait: 1000 })),
        scene.type('>.item'),
        scene.tooltip('When abbreviation becomes complex (contains more that one element), preview is displayed', tooltipAnim({ wait: 1000 })),
        scene.type('>span'),
        scene.tooltip('In marked abbreviation, hit Tab key to expand it', tooltipAnim({ wait: 1000 })),
        scene.wait(600),
        scene.run('emmetExpandAbbreviation')
    ], { beforeDelay: 300 });
}
