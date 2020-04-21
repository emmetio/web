import { Component } from 'endorphin';

export type ParseModeError = Error & { ch?: number };
export type EmComponent<P = any, S = any> = Component<P, S>;

export interface EmmetOptions {
    markupStyle: 'html' | 'xhtml' | 'xml';
    attributeQuotes: 'single' | 'double';
    comments: boolean;
    commentsTemplate: string;
    bem: boolean;
    shortHex: boolean;
}

export interface EmmetMap {
    [name: string]: string;
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
