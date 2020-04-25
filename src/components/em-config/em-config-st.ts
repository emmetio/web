import { notify } from 'endorphin/helpers';
import { SublimeTextConfig, SublimeTextConfigOptions, ConfigField, EmComponent, ConfigFieldType, EmmetAction, EditorShortcuts } from '../../types';
import { KeyValueList, updateField, keyValueListDiff } from './utils';
import defaultConfig from '../../config/sublime-text.json';
import actionLabels from '../../config/actions.json';

type EmConfigSTProps = SublimeTextConfig;

interface EmConfigSTState {
    options: ConfigField[];
    shortcuts: KeyValueList;
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

export function willMount(component: EmConfigST) {
    setupForm(component);
}

function setupForm(component: EmConfigST) {
    component.setState({
        options: createOptions(component),
        shortcuts: createShortcuts(component),
    });
}

/**
 * Handle value change in Options section
 */
export function onChangeOption(component: EmConfigST, evt: Event) {
    const elem = evt.target as HTMLInputElement;
    const name = elem.name;
    const value = elem.type === 'checkbox' ? elem.checked : elem.value;

    component.setState({
        options: updateField(component.state.options, name, value)
    });
}

export function onSubmit(component: EmConfigST) {
    notify(component, 'submit', calculateDiff(component));
}

export function onReset(component: EmConfigST) {
    setupForm(component);
}

function createOptions(component: EmConfigST): ConfigField<keyof SublimeTextConfigOptions>[] {
    function value<K extends keyof SublimeTextConfigOptions>(name: K) {
        return getOptionValue(component, name);
    }

    return [{
        name: 'auto_mark',
        type: ConfigFieldType.Boolean,
        label: 'Mark abbreviation',
        value: value('auto_mark'),
        comment: 'Automatically mark Emmet abbreviation when typing text: marked abbreviation is highlighted with green underline. Works in a limited syntaxes only.',
        children: [{
            name: 'abbreviation_preview',
            label: 'Abbreviation preview',
            type: ConfigFieldType.Boolean,
            value: value('abbreviation_preview'),
            comment: 'Display expanded abbreviation preview when caret is inside marked abbreviation.'
        }, {
            name: 'tab_expand',
            type: ConfigFieldType.Boolean,
            label: 'Expand abbreviation with Tab key',
            value: value('tab_expand'),
            comment: 'Expand <em>marked</em> abbreviation with <kbd>Tab</kbd> key. If this option disabled, use “Expand Abbreviation” action (see “Shortcuts” section).',
        }]
    }, {
        name: 'tag_preview',
        type: ConfigFieldType.Boolean,
        label: 'Open tag preview',
        value: value('tag_preview'),
        comment: 'When enabled, displays open tag preview when caret is inside closing tag.'
    }, {
        name: 'comment',
        type: ConfigFieldType.Boolean,
        label: 'Override “Toggle Comment” action',
        value: value('comment') as boolean,
        comment: 'If enabled, calling default “Toggle Comment“ action when nothing is selected will comment entire tag or CSS section instead of current line. If you prefer default Sublime Text behavior, you can add another key binding for Emmet’s Toggle Comment action below.'
    }];
}

function getOptionValue<K extends keyof SublimeTextConfigOptions>(component: EmConfigST, name: K): SublimeTextConfigOptions[K] {
    const { options } = component.props;
    if (options && name in options) {
        return options[name] as SublimeTextConfigOptions[K];
    }
    return (defaultConfig as SublimeTextConfigOptions)[name];
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
    const options: Partial<SublimeTextConfigOptions> = {};
    const { state } = component;
    state.options.forEach(opt => {
        if (opt.value !== defaultConfig[opt.name]) {
            options[opt.name] = opt.value;
        }
    });

    return {
        options,
        shortcuts: keyValueListDiff(state.shortcuts, {}) as EditorShortcuts
    };
}
