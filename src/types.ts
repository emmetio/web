import { Component } from 'endorphin';
import { SyntaxType } from 'emmet';
import { Movie } from 'codemirror-movie';
import { EmmetEditor } from '@emmetio/codemirror-plugin';
import Store from './store';

export { SyntaxType } from 'emmet';
export { EmmetEditor, EmmetEditorOptions } from '@emmetio/codemirror-plugin';

export type MovieFactory = (editor: EmmetEditor) => Movie;
export type EmComponent<P = any, S = any> = Component<P, S> & { store: Store };

export interface EmmetMap {
    [name: string]: string;
}

export interface EmmetMapDiff {
    [name: string]: string | null;
}

export type SnippetsDB<T = EmmetMap> = {
    [name in SyntaxType]: T;
}

/**
 * Officially supported and configurable editors
 */
export const enum SupportedEditor {
    SublimeText = 'st',
    Nova = 'nova',
}

/**
 * Available Emmet actions
 */
export const enum EmmetAction {
    Expand = 'expand',
    ExpandAll = 'expandAll',
    EnterMode = 'enter',
    Wrap = 'wrap',
    Balance = 'balance',
    BalanceInward = 'balanceInward',
    ToggleComment = 'toggleComment',
    EvaluateMath = 'evaluateMath',
    NextEditPoint = 'nextEditPoint',
    PrevEditPoint = 'previousEditPoint',
    TagPair = 'tagPair',
    Increment1 = 'increment1',
    Increment10 = 'increment10',
    Increment01 = 'increment01',
    Decrement1 = 'decrement1',
    Decrement10 = 'decrement10',
    Decrement01 = 'decrement01',
    RemoveTag = 'removeTag',
    SelectNext = 'selectNext',
    SelectPrev = 'selectPrevious',
    SplitJoinTag = 'splitJoinTag',
    UpdateImageSize = 'updateImageSize',
    DataURL = 'dataURL',
}

// Emmet & editor config types

export interface EmmetConfig {
    /** Quotes to use in generated HTML attribute values */
    attributeQuotes: 'single' | 'double';
    /** Style for self-closing elements (like `<br>`) and boolean attributes */
    markupStyle: 'html' | 'xhtml' | 'xml';
    /**
     * Enable automatic tag commenting. When enabled, elements generated from Emmet
     * abbreviation with `id` and/or `class` attributes will receive a comment
     * with these attribute values
     */
    comments: boolean;
    /**
     * Commenting template. Default value is `\n<!-- /[#ID][.CLASS] -->`
     * Outputs everything between `[` and `]` only if specified attribute name
     * (written in UPPERCASE) exists in element. Attribute name is replaced with
     * actual value. Use `\n` to add a newline.
     */
    commentsTemplate?: string;
    /**
     * Enable BEM support. When enabled, Emmet will treat class names starting
     * with `-` as _element_ and with `_` as _modifier_ in BEM notation.
     * These class names will inherit `block` name from current or ancestor element.
     * For example, the abbreviation `ul.nav.nav_secondary>li.nav__item` can be
     * shortened to `ul.nav._secondary>li.-item` with this option enabled.
     */
    bem: boolean;
    /**
     * For stylesheet abbreviations, generate short HEX color values, if possible.
     * For example, `c#0` will be expanded to `color: #000;` instead of `color: #000000`.
     */
    shortHex?: boolean;
}

export type SublimeTextConfig = EditorConfig<SublimeTextConfigOptions>;

export interface SublimeTextConfigOptions {
    /** Enable abbreviation marking on typing text */
    auto_mark: boolean;
    /** Preview marked abbreviation */
    abbreviation_preview: boolean;
    /** Expand marked abbreviation with Tab */
    tab_expand: boolean;
    /** Preview open tag when caret is in closing part */
    tag_preview: boolean;
    /** Override Toggle Comments action */
    comment: boolean;
}

export interface EditorConfig<T = {}> {
    /** Editor-specific plugin options */
    options: Partial<T>;
    /** Action shortcuts */
    shortcuts: EditorShortcuts;
}

export type EditorShortcuts = { [action in EmmetAction]?: string };

// Types for configs

export type ConfigField<T = string> = ConfigFieldBoolean<T> | ConfigFieldString<T> | ConfigFieldChoose<T>;

export const enum ConfigFieldType {
    Boolean = 'boolean',
    Choose = 'choose',
    String = 'string',
}

export interface ConfigChooseValue {
    label: string;
    value: string;
}

export interface ConfigFieldBase<T = string> {
    name: T;
    label: string;
    type: ConfigFieldType;
    comment?: string;
    children?: ConfigField[];
    movie?: MovieFactory;
}

export interface ConfigFieldBoolean<T = string> extends ConfigFieldBase<T> {
    type: ConfigFieldType.Boolean;
    value: boolean;
}

export interface ConfigFieldString<T = string> extends ConfigFieldBase<T> {
    type: ConfigFieldType.String;
    value: string;
}

export interface ConfigFieldChoose<T = string> extends ConfigFieldBase<T> {
    type: ConfigFieldType.Choose;
    items: string[] | ConfigChooseValue[];
    value: string;
}
