import { Store } from 'endorphin';
import { EmmetMapDiff, EmmetConfig, SnippetsDB, SupportedEditor, SublimeTextConfig, EditorConfig, ActivationEntry } from './types';

export interface CommonConfig {
    options?: Partial<EmmetConfig>;
    variables?: EmmetMapDiff;
    snippets?: SnippetsDB<EmmetMapDiff>
}

export interface DataModel {
    commonConfig: CommonConfig;
    editor: {
        [SupportedEditor.SublimeText]: SublimeTextConfig;
    },
    activation: {
        [key in SupportedEditor]: ActivationEntry[]
    }
}

export default class EmmetStore extends Store<DataModel> {
    constructor() {
        super();
        const data = localStorage.getItem('_store');
        if (data) {
            this.set({
                ...JSON.parse(data),
                activation: {
                    [SupportedEditor.SublimeText]: [{
                        id: '123456',
                        access: Date.now(),
                        created: Date.now() - 24 * 60 * 60 * 1000
                    }]
                }
            });
        }
    }

    updateCommonConfig(commonConfig: CommonConfig) {
        this.set({
            ...this.get(),
            commonConfig
        });

        this.flush();
    }

    updateEditorConfig(editor: SupportedEditor, config: EditorConfig) {
        const allEditors = this.get().editor;
        const editorConfig = allEditors && allEditors[editor] || {};

        this.set({
            ...this.get(),
            editor: {
                ...allEditors,
                [editor]: {
                    ...editorConfig,
                    ...config
                }
            }
        });
        this.flush();
    }

    private flush() {
        localStorage.setItem('_store', JSON.stringify(this.get()));
    }
}
