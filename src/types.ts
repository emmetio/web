import { Component } from 'endorphin';
import { SyntaxType } from 'emmet';

export { SyntaxType } from 'emmet';
export { EmmetConfig, EmmetEditor, EmmetEditorOptions } from '@emmetio/codemirror-plugin';

export type EmComponent<P = any, S = any> = Component<P, S>;

export interface EmmetMap {
    [name: string]: string;
}

export interface EmmetMapDiff {
    [name: string]: string | null;
}

export type SnippetsDB<T = EmmetMap> = {
    [name in SyntaxType]: T;
}

// Types for configs

export type ConfigField = ConfigFieldBoolean | ConfigFieldString | ConfigFieldChoose;

export const enum ConfigFieldType {
    Boolean = 'boolean',
    Choose = 'choose',
    String = 'string',
}

export interface ConfigChooseValue {
    label: string;
    value: string;
}

export interface ConfigFieldBase {
    name: string;
    label: string;
    type: ConfigFieldType;
    comment?: string;
    children?: ConfigField[];
}

export interface ConfigFieldBoolean extends ConfigFieldBase {
    type: ConfigFieldType.Boolean;
    value: boolean;
}

export interface ConfigFieldString extends ConfigFieldBase {
    type: ConfigFieldType.String;
    value: string;
}

export interface ConfigFieldChoose extends ConfigFieldBase {
    type: ConfigFieldType.Choose;
    items: string[] | ConfigChooseValue[];
    value: string;
}
