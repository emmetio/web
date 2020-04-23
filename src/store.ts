import { Store } from 'endorphin';
import { EmmetMapDiff, EmmetConfig, SnippetsDB, SupportedEditor, SublimeTextConfig } from './types';

export interface CommonConfig {
    options?: Partial<EmmetConfig>;
    variables?: EmmetMapDiff;
    snippets?: SnippetsDB<EmmetMapDiff>
}

export interface DataModel {
    commonConfig: CommonConfig;
    editor: {
        [SupportedEditor.SublimeText]: SublimeTextConfig;
    }
}

export default class EmmetStore extends Store<DataModel> {
    constructor() {
        super();
        const data = localStorage.getItem('_store');
        if (data) {
            this.set(JSON.parse(data));
        }
    }

    updateCommonConfig(commonConfig: CommonConfig) {
        this.set({
            ...this.get(),
            commonConfig
        });

        localStorage.setItem('_store', JSON.stringify(this.get()));
    }
}
