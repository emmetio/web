import { SyntaxType } from 'emmet';
import defaultVariables from 'emmet/snippets/variables.json';
import markupSnippets from 'emmet/snippets/html.json';
import stylesheetSnippets from 'emmet/snippets/css.json';
import { EmmetConfig } from '@emmetio/codemirror-plugin';

import { ConfigField, EmmetMap, EmComponent, ConfigFieldType } from '../../lib/types';
import { escapeString, unescapeString } from '../../lib/utils';
import { SubmitEvent } from './em-config-key-value';

type KeyValueList = KeyValueItem[];

interface KeyValueItem {
    id: number;
    key: string;
    value: string;
}

interface SnippetsSection {
    id: SyntaxType;
    label: string;
    comment: string;
    selected?: boolean;
}

export interface EmConfigCommonProps {
    faux: boolean;
    // options: EmmetConfig;
    // variables: EmmetMap;
    // snippets: {
    //     markup?: EmmetMap;
    //     stylesheet?: EmmetMap;
    // }
}

interface EmConfigCommonState {
    options: ConfigField[];
    variables: KeyValueList;
    snippets: {
        markup: KeyValueList;
        stylesheet: KeyValueList;
    };
    editorConfig: Partial<EmmetConfig> | null;
    snippetsSections: SnippetsSection[];
}

export type EmConfigCommon = EmComponent<EmConfigCommonProps, EmConfigCommonState>;

let idCounter = 0;

// TODO Move to store?
/**
 * Default Emmet config
 */
const defaultConfig: EmmetConfig = {
    mark: true,
    preview: true,
    autoRenameTags: true,
    markTagPairs: true,
    markupStyle: 'html',
    attributeQuotes: 'double',
    previewOpenTag: false,
    comments: false,
    commentsTemplate: '\n<!-- /[#ID][.CLASS] -->',
    bem: false,
    shortHex: true
};

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
    component.setState({
        options: createOptions(component),
        variables: createKeyValueList(defaultVariables),
        snippets: {
            markup: createKeyValueList(markupSnippets),
            stylesheet: createKeyValueList(stylesheetSnippets)
        },
        snippetsSections
    });
    updateEditorConfig(component);
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

/**
 * Creates key-value list for editing from given object hash.
 * Each value is supplied with `id` key to identify given item in UI list
 */
function createKeyValueList(map: EmmetMap): KeyValueList {
    const result: KeyValueList = [];
    Object.keys(map).forEach(key => {
        result.push(createKeyValueItem(key, map[key]));
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
    return defaultConfig[name];
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

function updateKeyValueListOnSubmit(items: KeyValueList, event: SubmitEvent<KeyValueItem>): KeyValueList {
    const ix = items.findIndex(item => item.id === event.detail.item.id);
    if (ix !== -1) {
        const { key, value } = event.detail;
        items = [...items];

        if (!key.trim()) {
            // Empty key: remove value
            items.splice(ix, 1);
        } else {
            items[ix] = {
                ...items[ix],
                key: key.trim(),
                value: value.trim(),
            };
        }
    }

    return items;
}

function updateEditorConfig(component: EmConfigCommon) {
    component.setState({
        editorConfig: getEditorConfig(component)
    });
}

function getEditorConfig(component: EmConfigCommon): Partial<EmmetConfig> {
    const config: Partial<EmmetConfig> = {};
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

function keyValueListToMap(list: KeyValueList): EmmetMap {
    const result: EmmetMap = {};
    list.forEach(item => result[item.key] = item.value);
    return result;
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
