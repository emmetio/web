import { EmEditor } from '../em-editor/em-editor';
import { EmComponent, EmmetConfig } from '../../types';

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

export function didMount(component: EmAbbreviationPreview) {
    requestAnimationFrame(() => handleAbbrChange(component));
}

export function didUpdate(component: EmAbbreviationPreview) {
    handleAbbrChange(component);
}

export function handleAbbrChange(component: EmAbbreviationPreview) {
    const { abbr, preview } = component.refs;

    if (!abbr || !preview) {
        return;
    }

    const abbrValue = abbr.editor.getValue();

    try {
        const snippet = preview.editor.expandAbbreviation(abbrValue);
        preview.editor.setValue(snippet);
    } catch (err) {
        preview.editor.setValue('');
    }
}
