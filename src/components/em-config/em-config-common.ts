import { EmmetConfig } from '@emmetio/codemirror-plugin';
import defaultVariables from 'emmet/snippets/variables.json';
import markupSnippets from 'emmet/snippets/html.json';
import stylesheetSnippets from 'emmet/snippets/css.json';

import { ConfigField, EmmetMap, EmComponent, ConfigFieldType } from '../../lib/types';
import { escapeString, unescapeString } from '../../lib/utils';
import { SubmitEvent } from './em-config-key-value';

type KeyValueList = KeyValueItem[];

interface KeyValueItem {
    id: number;
    key: string;
    value: string;
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
    options?: Partial<EmmetConfig> | null;
    form: CommonConfigForm;
    editorConfig: Partial<EmmetConfig> | null;
}

export type EmConfigCommon = EmComponent<EmConfigCommonProps, EmConfigCommonState>;

interface CommonConfigForm {
    options: ConfigField[];
    variables: KeyValueList;
    snippets: {
        markup: KeyValueList;
        stylesheet: KeyValueList;
    }
}

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

export function willMount(component: EmConfigCommon) {
    component.setState({
        form: createModel(component)
    });
}

/**
 * Handle value change in Options section
 */
export function onChangeOption(component: EmConfigCommon, evt: Event) {
    const elem = evt.target as HTMLInputElement;
    const name = elem.name;
    const value = elem.type === 'checkbox' ? elem.checked : elem.value;
    const { options, form } = component.state;

    const opt: Partial<EmmetConfig> = {
        ...options,
        [name]: name === 'commentsTemplate' ? unescapeString(value as string) : value
    };

    component.setState({
        options: opt,
        editorConfig: {
            ...defaultConfig,
            ...opt
        }
    });

    component.setState({
        form: {
            ...form,
            options: createOptions(component)
        }
    });
}

export function onVariableAdd(component: EmConfigCommon) {
    let { variables } = component.state.form;
    variables = [...variables];
    variables.unshift(createKeyValueItem('', ''));

    component.setState({
        form: {
            ...component.state.form,
            variables
        }
    });
}

export function onVariableSubmit(component: EmConfigCommon, evt: SubmitEvent) {
    let { variables } = component.state.form;

    const ix = variables.findIndex(item => item.key === evt.detail.originalKey);
    if (ix !== -1) {
        variables = [...variables];

        if (!evt.detail.key.trim()) {
            // Empty key: remove variable
            variables.splice(ix, 1);
        } else {
            variables[ix] = {
                ...variables[ix],
                key: evt.detail.key,
                value: evt.detail.value,
            };
        }

        component.setState({
            form: {
                ...component.state.form,
                variables
            }
        });
    }
}

export function onVariableRemove(id: number, component: EmConfigCommon) {
    let { variables } = component.state.form;
    const ix = variables.findIndex(item => item.id === id);
    if (ix !== -1) {
        variables = [...variables];
        variables.splice(ix, 1);
        component.setState({
            form: {
                ...component.state.form,
                variables
            }
        });
    }
}

function createModel(component: EmConfigCommon): CommonConfigForm {
    return {
        options: createOptions(component),
        variables: createKeyValueList(defaultVariables),
        snippets: {
            markup: createKeyValueList(markupSnippets),
            stylesheet: createKeyValueList(stylesheetSnippets)
        }
    };
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
    const { state } = component;
    if (state.options && name in state.options) {
        return (state.options as EmmetConfig)[name];
    }

    return defaultConfig[name];
}
