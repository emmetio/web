import { Changes } from 'endorphin';
import { notify } from 'endorphin/helpers';
import { EmmetConfig as CMEmmetConfig } from '@emmetio/codemirror-plugin';
import defaultVariables from 'emmet/snippets/variables.json';
import markupSnippets from 'emmet/snippets/html.json';
import stylesheetSnippets from 'emmet/snippets/css.json';
import defaultConfig from '../../config/common.json';

import { EmmetConfig, ConfigField, EmmetMap, EmmetMapDiff, EmComponent, ConfigFieldType, SyntaxType, SnippetsDB } from '../../types';
import { escapeString, unescapeString } from '../../lib/utils';
import { CommonConfig } from '../../store';
import {
    keyValueListToMap, updateKeyValueListOnSubmit, keyValueListDiff,
    KeyValueList, SubmitEvent, KeyValueItem
} from './utils';

interface SnippetsSection {
    id: SyntaxType;
    label: string;
    comment: string;
    selected?: boolean;
}

export type EmConfigCommonProps = CommonConfig;

interface EmConfigCommonState {
    options: ConfigField[];
    variables: KeyValueList;
    snippets: SnippetsDB<KeyValueList>;
    editorConfig: Partial<EmmetConfig> | null;
    snippetsSections: SnippetsSection[];
}

export type EmConfigCommon = EmComponent<EmConfigCommonProps, EmConfigCommonState>;

let idCounter = 0;

const snippetsSections: SnippetsSection[] = [{
    id: 'markup',
    label: 'Markup',
    comment: 'Markup snippets are predefined Emmet abbreviations: create a short name for a larger abbreviation or define shape of element (default attributes, self-closing, etc.)',
    selected: true
}, {
    id: 'stylesheet',
    label: 'Stylesheet',
    comment: 'Stylesheet snippets could be arbitrary text or shortcuts for CSS properties (should be a word or start with <code>name:</code>). In latter case, you can write abbreviations with embedded values like <code>p10-20</code>. CSS properties can contain values, separated by <code>|</code>, which will be used in abbreviation resolving or as default value if abbreviation has no embedded value.',
    selected: false
}];


export function willMount(component: EmConfigCommon) {
    setupForm(component);
}

export function willUpdate(component: EmConfigCommon, { options, variables, snippets }: Changes<EmConfigCommonProps>) {
    if (options || variables || snippets) {
        setupForm(component);
    }
}

/**
 * Handle value change in Options section
 */
export function onChangeOption(component: EmConfigCommon, evt: Event) {
    const elem = evt.target as HTMLInputElement;
    const name = elem.name;
    const value = elem.type === 'checkbox' ? elem.checked : elem.value;
    const { options: curOptions } = component.state;

    const options = updateField(curOptions, name, value);

    if (options !== curOptions) {
        component.setState({ options });
        updateEditorConfig(component);
    }
}

export function onVariableAdd(component: EmConfigCommon) {
    const { variables } = component.state;
    updateVariables(component, [createKeyValueItem('', ''), ...variables]);
}

export function onVariableSubmit(component: EmConfigCommon, evt: SubmitEvent<KeyValueItem>) {
    const { variables } = component.state;
    const nextVariables = updateKeyValueListOnSubmit(variables, evt);
    if (variables !== nextVariables) {
        updateVariables(component, nextVariables);
    }
}

export function onVariableRemove(id: number, component: EmConfigCommon) {
    let { variables } = component.state;
    const ix = variables.findIndex(item => item.id === id);
    if (ix !== -1) {
        variables = [...variables];
        variables.splice(ix, 1);
        updateVariables(component, variables);
    }
}

export function onSelectSnippetsSection(sectionId: SyntaxType, component: EmConfigCommon) {
    const sectionList = component.state.snippetsSections;
    const curSection = currentSection(component);
    if (curSection && curSection.id !== sectionId) {
        component.setState({
            snippetsSections: sectionList.map(s => ({ ...s, selected: s.id === sectionId }))
        });
    }
}

export function onSnippetAdd(component: EmConfigCommon) {
    const curSection = currentSection(component);
    if (curSection) {
        const snippets = component.state.snippets[curSection.id];
        updateSnippets(component, curSection.id, [createKeyValueItem('', ''), ...snippets]);
    }
}

export function onSnippetRemove(id: number, component: EmConfigCommon) {
    const curSection = currentSection(component);
    if (curSection) {
        const snippets = component.state.snippets[curSection.id].slice();
        const ix = snippets.findIndex(s => s.id === id);
        if (ix !== -1) {
            snippets.splice(ix, 1);
            updateSnippets(component, curSection.id, snippets);
        }
    }
}

export function onSnippetSubmit(component: EmConfigCommon, evt: SubmitEvent<KeyValueItem>) {
    const curSection = currentSection(component);
    if (curSection) {
        const prevSnippets = component.state.snippets[curSection!.id];
        const nextSnippets = updateKeyValueListOnSubmit(prevSnippets, evt);
        if (prevSnippets !== nextSnippets) {
            updateSnippets(component, curSection.id, nextSnippets);
        }
    }
}

export function onSubmit(component: EmConfigCommon) {
    notify(component, 'submit', calculateDiff(component));
}

export function onReset(component: EmConfigCommon) {
    setupForm(component);
}

/**
 * Creates key-value list for editing from given object hash.
 * Each value is supplied with `id` key to identify given item in UI list
 */
function createKeyValueList(map: EmmetMap, diff?: EmmetMapDiff): KeyValueList {
    const result: KeyValueList = [];
    Object.keys(map).forEach(key => {
        let value: string | null = map[key];
        if (diff && key in diff) {
            value = diff[key];
        }

        if (value !== null) {
            result.push(createKeyValueItem(key, value));
        }
    });

    return result;
}

function createKeyValueItem(key: string, value: string): KeyValueItem {
    return { id: idCounter++, key, value };
}

function createOptions(component: EmConfigCommon): ConfigField[] {
    function value<K extends keyof EmmetConfig>(name: K) {
        return getOptionValue(component, name);
    }

    return [{
        name: 'markupStyle',
        type: ConfigFieldType.Choose,
        label: 'Output code style',
        items: ['html', 'xhtml', 'xml'],
        value: value('markupStyle'),
        comment: 'Defines how self-closing tags (like <code>&lt;img&gt;</code> or <code>&lt;br&gt;</code>) and boolean attributes (like <code>disabled</code>) will look in generated code.'
    }, {
        name: 'attributeQuotes',
        label: 'Attribute value quotes',
        type: ConfigFieldType.Choose,
        items: ['double', 'single'],
        value: value('attributeQuotes')
    }, {
        name: 'comments',
        type: ConfigFieldType.Boolean,
        label: 'Tag comments',
        value: value('comments'),
        comment: 'If enabled, adds comment with tag details after closing tag of expanded abbreviation element, which contains either <code>id</code> and/or <code>class</code> attribute.',
        children: [{
            name: 'commentsTemplate',
            type: ConfigFieldType.String,
            label: 'Comment template',
            value: escapeString(value('commentsTemplate') as string),
            comment: 'Outputs everything between <code>[</code> and <code>]</code> only if specified attribute name (written in UPPERCASE) exists in element. Attribute name is replaced with actual value. Use <code>\n</code> to add a newline.'
        }]
    }, {
        name: 'bem',
        type: ConfigFieldType.Boolean,
        label: 'BEM support',
        value: value('bem'),
        comment: 'When enabled, Emmet will treat class names starting with <code>-</code> as <em>element</em> and with <code>_</code> as <em>modifier</em> in <a href="https://en.bem.info">BEM</a> notation. These class names will inherit <em>block</em> name from current or ancestor element. For example, the abbreviation <code>ul.nav.nav_secondary>li.nav__item</code> can be shortened to <code>ul.nav._secondary>li.-item</code> with this option enabled.'
    }, {
        name: 'shortHex',
        type: ConfigFieldType.Boolean,
        label: 'Use short HEX colors in CSS',
        value: value('shortHex') as boolean,
        comment: 'When enabled, tries to shorten generated HEX color values for CSS abbreviations. For example, <code>c#0</code> abbreviation can be expanded either to <code>color: #000;</code> or <code>color: #000000;</code>'
    }];
}

function getOptionValue<K extends keyof EmmetConfig>(component: EmConfigCommon, name: K): EmmetConfig[K] {
    const { options } = component.props;
    if (options && name in options) {
        return options[name] as EmmetConfig[K];
    }
    return (defaultConfig as EmmetConfig)[name];
}

/**
 * Returns currently selected snippets section
 */
function currentSection(component: EmConfigCommon): SnippetsSection | undefined {
    return component.state.snippetsSections.find(s => s.selected);
}

function updateSnippets(component: EmConfigCommon, key: string, value: KeyValueList) {
    const { snippets } = component.state;
    component.setState({
        snippets: {
            ...snippets,
            [key]: value
        }
    });
    updateEditorConfig(component);
}

function updateVariables(component: EmConfigCommon, variables: KeyValueList) {
    component.setState({ variables });
    updateEditorConfig(component);
}

function updateEditorConfig(component: EmConfigCommon) {
    component.setState({
        editorConfig: getEditorConfig(component)
    });
}

function getEditorConfig(component: EmConfigCommon): Partial<CMEmmetConfig> {
    const config: Partial<CMEmmetConfig> = {};
    const { options, snippets } = component.state;
    const variables = keyValueListToMap(component.state.variables);

    const walkFields = (fields: ConfigField[]) => {
        fields.forEach(field => {
            config[field.name] = field.name === 'commentsTemplate'
                ? unescapeString(field.value as string)
                : field.value;

            if (field.children) {
                walkFields(field.children);
            }
        })
    }

    walkFields(options);

    config.config = {
        markup: {
            variables,
            snippets: keyValueListToMap(snippets.markup)
        },
        stylesheet: {
            variables,
            snippets: keyValueListToMap(snippets.stylesheet)
        }
    };

    return config;
}



function updateField(fields: ConfigField[], name: string, value: string | boolean): ConfigField[] {
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (field.name === name) {
            fields = [...fields];
            fields[i] = { ...field, value } as ConfigField;
            break;
        }

        if (field.children) {
            const children = updateField(field.children, name, value);
            if (children !== field.children) {
                fields = [...fields];
                fields[i] = { ...field, children } as ConfigField;
                break;
            }
        }
    }

    return fields;
}

/**
 * Calculates diff from given component’s state against default values
 */
function calculateDiff(component: EmConfigCommon): CommonConfig {
    const options: Partial<EmmetConfig> = {};
    const { state } = component;
    state.options.forEach(opt => {
        if (opt.value !== defaultConfig[opt.name]) {
            options[opt.name] = opt.value;
        }
    });

    return {
        options,
        variables: keyValueListDiff(state.variables, defaultVariables),
        snippets: {
            markup: keyValueListDiff(state.snippets.markup, markupSnippets),
            stylesheet: keyValueListDiff(state.snippets.stylesheet, stylesheetSnippets)
        }
    };
}

function setupForm(component: EmConfigCommon) {
    const { variables, snippets } = component.props;
    component.setState({
        options: createOptions(component),
        variables: createKeyValueList(defaultVariables, variables),
        snippets: {
            markup: createKeyValueList(markupSnippets, snippets?.markup),
            stylesheet: createKeyValueList(stylesheetSnippets, snippets?.stylesheet)
        },
        snippetsSections
    });
    updateEditorConfig(component);
}
