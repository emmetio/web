import { EmmetConfig } from '@emmetio/codemirror-plugin';
import { EmEditor } from '../em-editor/em-editor';
import { EmComponent } from '../../lib/types';

interface EmAbbreviationPreviewProps {
    mode: string;
    abbr: string;
    options: Partial<EmmetConfig>;
}

export type EmAbbreviationPreview = EmComponent<EmAbbreviationPreviewProps> & {
    refs: {
        abbr: EmEditor;
        preview: EmEditor;
    }
}

export function didRender(component: EmAbbreviationPreview) {
    handleAbbrChange(component);
}

export function handleAbbrChange(component: EmAbbreviationPreview) {
    const { abbr, preview } = component.refs;

    if (!abbr || !preview) {
        console.log('no preview yet');
        return;
    }

    const abbrValue = abbr.editor.getValue();

    try {
        console.log('will expand', abbrValue, preview.editor.emmetOptions());
        const snippet = preview.editor.expandAbbreviation(abbrValue);
        preview.editor.setValue(snippet);
    } catch (err) {
        preview.editor.setValue('');
    }
}
