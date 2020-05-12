import { SublimeTextConfig, EmComponent, ConfigFieldType, EmmetAction, SupportedEditor } from '../../types';
import { OptionField } from './em-config-options';
import defaults from '../../config/sublime-text.json';

import markAbbreviationMovie from '../../movie/mark-abbreviation';
import showTagPreview from '../../movie/show-tag-preview';
import toggleComment from '../../movie/toggle-comment';

interface EmConfigSTProps {
    config: SublimeTextConfig;
}

interface EmConfigSTState {
    fields: OptionField[];
    actions: EmmetAction[];
    defaults: SublimeTextConfig;
}

export type EmConfigST = EmComponent<EmConfigSTProps, EmConfigSTState>;

const actions: EmmetAction[] = [
    EmmetAction.Expand,
    EmmetAction.EnterMode,
    EmmetAction.Wrap,
    EmmetAction.Balance,
    EmmetAction.BalanceInward,
    EmmetAction.ToggleComment,
    EmmetAction.EvaluateMath,
    EmmetAction.NextEditPoint,
    EmmetAction.PrevEditPoint,
    EmmetAction.TagPair,
    EmmetAction.Increment1,
    EmmetAction.Increment10,
    EmmetAction.Increment01,
    EmmetAction.Decrement1,
    EmmetAction.Decrement10,
    EmmetAction.Decrement01,
    EmmetAction.RemoveTag,
    EmmetAction.SelectNext,
    EmmetAction.SelectPrev,
    EmmetAction.SplitJoinTag,
    EmmetAction.UpdateImageSize,
    EmmetAction.DataURL,
];

const fields: OptionField[] = [{
    name: 'auto_mark',
    type: ConfigFieldType.Boolean,
    label: 'Mark abbreviation',
    comment: 'Automatically mark Emmet abbreviation when typing text: marked abbreviation is highlighted with green underline. Works in a limited syntaxes only.',
    movie: markAbbreviationMovie,
    children: [{
        name: 'abbreviation_preview',
        label: 'Abbreviation preview',
        type: ConfigFieldType.Boolean,
        comment: 'Display expanded abbreviation preview when caret is inside marked abbreviation.'
    }, {
        name: 'tab_expand',
        type: ConfigFieldType.Boolean,
        label: 'Expand abbreviation with Tab key',
        comment: 'Expand <em>marked</em> abbreviation with <kbd>Tab</kbd> key. If this option disabled, use “Expand Abbreviation” action (see “Shortcuts” section).',
    }]
}, {
    name: 'tag_preview',
    type: ConfigFieldType.Boolean,
    label: 'Show tag preview',
    comment: 'When enabled, displays open tag preview when caret is inside closing tag.',
    movie: showTagPreview,
}, {
    name: 'comment',
    type: ConfigFieldType.Boolean,
    label: 'Override “Toggle Comment” action',
    comment: 'If enabled, calling default “Toggle Comment“ action when nothing is selected will comment entire tag or CSS section instead of current line. If you prefer default Sublime Text behavior, you can add another key binding for Emmet’s Toggle Comment action below.',
    movie: toggleComment
}];

export function state(): EmConfigSTState {
    return { fields, actions, defaults };
}

export function onSubmit(component: EmConfigST, evt: CustomEvent) {
    console.log('submit', evt.detail);
    component.store.updateEditorConfig(SupportedEditor.SublimeText, evt.detail);
}
