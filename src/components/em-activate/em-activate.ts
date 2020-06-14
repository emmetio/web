import { EmComponent, SupportedEditor } from '../../types';
export { default as copyToClipboard} from '../../lib/clipboard';

interface EmActivateProps {
    editorId: SupportedEditor;
}

interface EmActivateState {
    code: string;
}

export type EmActivate = EmComponent<EmActivateProps, EmActivateState>;

export function state(): EmActivateState {
    return { code: 'e37d9d0f8e691d4' };
}
