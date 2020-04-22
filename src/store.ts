import { Store } from 'endorphin';
import { EmmetMapDiff, EmmetConfig, SnippetsDB } from './types';

export interface EmmetCommonConfig {
    options?: Partial<EmmetConfig>;
    variables?: EmmetMapDiff;
    snippets?: SnippetsDB<EmmetMapDiff>
}

export interface DataModel {
    commonConfig: EmmetCommonConfig
}

export default class EmmetStore extends Store<DataModel> {
    constructor() {
        super();
        const data = localStorage.getItem('_store');
        if (data) {
            this.set(JSON.parse(data));
        }
    }

    updateCommonConfig(commonConfig: EmmetCommonConfig) {
        this.set({
            ...this.get(),
            commonConfig
        });

        localStorage.setItem('_store', JSON.stringify(this.get()));
    }
}
