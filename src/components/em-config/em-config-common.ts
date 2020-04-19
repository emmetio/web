import { Changes } from 'endorphin';
import { EmmetConfig } from '@emmetio/codemirror-plugin';
import defaultVariables from 'emmet/snippets/variables.json';
import markupSnippets from 'emmet/snippets/html.json';
import stylesheetSnippets from 'emmet/snippets/css.json';

import { ConfigField, EmmetMap, EmComponent, ConfigFieldType } from '../../lib/types';

interface DiffMap {
    [name: string]: string | null;
}

export interface EmConfigCommonProps {
    options: EmmetConfig;
    variables: EmmetMap;
    snippets: {
        markup?: EmmetMap;
        stylesheet?: EmmetMap;
    }
}

interface EmConfigCommonState {
    options?: Partial<EmmetConfig> | null;
    variables?: DiffMap | null;
    snippets?: {
        markup?: DiffMap | null;
        stylesheet?: DiffMap | null;
    },
    form: CommonConfigForm;
    editorConfig: Partial<EmmetConfig> | null;
}

export type EmConfigCommon = EmComponent<EmConfigCommonProps, EmConfigCommonState>;

interface CommonConfigForm {
    options: ConfigField[];
    variables: Map<string, string>;
    snippets: {
        markup: Map<string, string>;
        stylesheet: Map<string, string>;
    }
}

export function didChange(component: EmConfigCommon, { options, variables, snippets }: Changes<EmConfigCommonProps>) {
    // In case if any of the incoming props change (which means data was saved),
    // reset local state
    let { form } = component.state;
    if (options) {
        component.setState({
            options: null,
            editorConfig: options.current
        });
        form = {
            ...form,
            options: createOptions(component)
        };
    }

    if (variables) {
        component.setState({ variables: null });
        form = {
            ...form,
            variables: createMap(defaultVariables, variables.current)
        };
    }

    if (snippets) {
        component.setState({
            snippets: {
                markup: null,
                stylesheet: null
            }
        });
        form = {
            ...form,
            snippets: {
                markup: createMap(markupSnippets, snippets.current?.markup),
                stylesheet: createMap(markupSnippets, snippets.current?.stylesheet)
            }
        };
    }

    component.setState({ form });
}

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
    const value = elem.type === 'checkbox' ? elem.checked : elem.value;
    const { options, form } = component.state;

    const opt: Partial<EmmetConfig> = {
        ...options,
        [elem.name]: value
    }

    component.setState({
        options: opt,
        editorConfig: {
            ...component.props.options,
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

function createModel(component: EmConfigCommon): CommonConfigForm {
    return {
        options: createOptions(component),
        variables: createMap(defaultVariables, component.props.variables),
        snippets: {
            markup: createMap(markupSnippets, component.props.snippets?.markup),
            stylesheet: createMap(stylesheetSnippets, component.props.snippets?.stylesheet)
        }
    };
}

/**
 * Create map from given `base` and `user` objects. A `null` value in `user` will
 * remove value from actual map
 */
function createMap(base: EmmetMap, user?: EmmetMap | null): Map<string, string> {
    const result = new Map<string, string>();
    Object.keys(base).forEach(key => {
        result.set(key, base[key]);
    });

    if (user) {
        Object.keys(user).forEach(key => {
            if (user[key] == null) {
                result.delete(key);
            } else {
                result.set(key, user[key]);
            }
        });
    }

    return result;
}

function createOptions(component: EmConfigCommon): ConfigField[] {
    function value<K extends keyof EmmetConfig>(name: K, defaultValue: EmmetConfig[K]) {
        return getOptionValue(component, name, defaultValue);
    }

    return [{
        name: 'markupStyle',
        type: ConfigFieldType.Choose,
        label: 'Output code style',
        items: ['html', 'xhtml', 'xml'],
        value: value('markupStyle', 'html'),
        comment: 'Defines how self-closing tags (like <code>&lt;img&gt;</code> or <code>&lt;br&gt;</code>) and boolean attributes (like <code>disabled</code>) will look in generated code.'
    }, {
        name: 'attributeQuotes',
        label: 'Attribute value quotes',
        type: ConfigFieldType.Choose,
        items: ['double', 'single'],
        value: value('attributeQuotes', 'double')
    }, {
        name: 'comments',
        type: ConfigFieldType.Boolean,
        label: 'Enable tag commenting',
        value: value('comments', false),
        comment: 'If enabled, adds comment with tag details after closing tag of expanded abbreviation element, which contains either <code>id</code> and/or <code>class</code> attribute.',
        children: [{
            name: 'commentsTemplate',
            type: ConfigFieldType.String,
            label: 'Comment template',
            value: value('commentsTemplate', '\n<!-- /[#ID][.CLASS] -->') as string,
            comment: 'Outputs everything between <code>[</code> and <code>]</code> only if specified attribute name (written in UPPERCASE) exists in element. Attribute name is replaced with actual value. Use <code>\n</code> to add a newline.'
        }]
    }, {
        name: 'bem',
        type: ConfigFieldType.Boolean,
        label: 'BEM support',
        value: value('bem', false),
        comment: 'When enabled, Emmet will treat class names starting with <code>-</code> as <em>element</em> and with <code>_</code> as <em>modifier</em> in <a href="https://en.bem.info">BEM</a> notation. These class names will inherit <em>block</em> name from current or ancestor element. For example, the abbreviation <code>ul.nav.nav_secondary>li.nav__item</code> can be shortened to <code>ul.nav._secondary>li.-item</code> with this option enabled.'
    }, {
        name: 'shortHex',
        type: ConfigFieldType.Boolean,
        label: 'Use short HEX colors in CSS',
        value: value('shortHex', true) as boolean,
        comment: 'When enabled, tries to shorten generated HEX color values for CSS abbreviations. For example, <code>c#0</code> abbreviation can be expanded either to <code>color: #000;</code> or <code>color: #000000;</code>'
    }];
}

function getOptionValue<K extends keyof EmmetConfig>(component: EmConfigCommon, name: K, defaultValue: EmmetConfig[K]): EmmetConfig[K] {
    const { state, props } = component;
    if (state.options && name in state.options) {
        return (state.options as EmmetConfig)[name];
    }

    if (props.options && name in props.options) {
        return props.options[name];
    }

    return defaultValue;
}
