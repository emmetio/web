import { notify } from 'endorphin/helpers';
import { SublimeTextConfig, SublimeTextConfigOptions, EmComponent, ConfigFieldType, EmmetAction, EditorShortcuts, MovieFactory } from '../../types';
import { KeyValueList, keyValueListDiff } from './utils';
import optionsDefaults from '../../config/sublime-text.json';
import actionLabels from '../../config/actions.json';
import { OptionField } from './em-config-options';

import markAbbreviationMovie from '../../movie/mark-abbreviation';
import showTagPreview from '../../movie/show-tag-preview';

type EmConfigSTProps = SublimeTextConfig;

interface EmConfigSTState {
    options: Partial<SublimeTextConfigOptions>;
    optionsForm: OptionField[];
    optionsDefaults: SublimeTextConfigOptions;
    shortcuts: KeyValueList;
    movie?: MovieFactory | null;
}

export type EmConfigST = EmComponent<EmConfigSTProps, EmConfigSTState>;

const supportedActions: EmmetAction[] = [
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

const optionsForm: OptionField[] = [{
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
    comment: 'If enabled, calling default “Toggle Comment“ action when nothing is selected will comment entire tag or CSS section instead of current line. If you prefer default Sublime Text behavior, you can add another key binding for Emmet’s Toggle Comment action below.'
}];

export function willMount(component: EmConfigST) {
    setupForm(component);
}

function setupForm(component: EmConfigST) {
    component.setState({
        options: {},
        optionsDefaults,
        optionsForm,
        shortcuts: createShortcuts(component),
    });
}

export function onSubmit(component: EmConfigST) {
    notify(component, 'submit', calculateDiff(component));
}

export function onReset(component: EmConfigST) {
    setupForm(component);
}

export function onPlayMovie(component: EmConfigST, evt: CustomEvent) {
    component.setState({ movie: evt.detail.movie });
}

export function onStopMovie(component: EmConfigST, evt: CustomEvent) {
    // TODO Delayed reset
    // component.setState({ movie: null });
}

function createShortcuts(component: EmConfigST): KeyValueList {
    const { shortcuts } = component.props;
    return supportedActions.map(action => {
        return {
            id: action,
            key: actionLabels[action],
            value: shortcuts && shortcuts[action] || ''
        };
    });
}

/**
 * Calculates diff from given component’s state against default values
 */
function calculateDiff(component: EmConfigST): SublimeTextConfig {
    const { options, shortcuts } = component.state;

    return {
        options,
        shortcuts: keyValueListDiff(shortcuts, {}) as EditorShortcuts
    };
}
