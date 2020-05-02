import { emit } from 'endorphin/helpers';
import actionLabels from '../../config/actions.json';
import { EditorConfig, MovieFactory, EmComponent, EmmetAction, EditorShortcuts } from '../../types';
import { EmMovie } from '../em-movie/em-movie';
import { OptionField } from './em-config-options';
import { KeyValueList } from './utils';

interface Options {
    [name: string]: string | boolean | number;
}

type Config = EditorConfig<Options>;

interface EmConfigEditorProps {
    config?: Config;
    defaults: Config;
    fields: OptionField[];
    actions?: EmmetAction[];
};

interface EmConfigEditorState {
    options: Partial<{}>;
    shortcuts: KeyValueList;
    movie?: MovieFactory | null;
}

export type EmConfigEditor = EmComponent<EmConfigEditorProps, EmConfigEditorState> & {
    refs: {
        movie: EmMovie
    }
};

export function willMount(component: EmConfigEditor) {
    setupForm(component);
}

function setupForm(component: EmConfigEditor) {
    component.setState({
        options: component.props.config?.options || {},
        shortcuts: createShortcuts(component),
    });
}

export function onSubmit(component: EmConfigEditor) {
    emit(component, 'submit', calculateDiff(component));
}

export function onReset(component: EmConfigEditor) {
    setupForm(component);
}

export function onPlayMovie(component: EmConfigEditor, evt: CustomEvent) {
    const { movie } = evt.detail;
    if (component.state.movie === movie) {
        // Setting the same movie: handle as replay request
        component.refs.movie.replay();
    } else {
        component.setState({ movie });
    }
}

function createShortcuts(component: EmConfigEditor): KeyValueList {
    const { config, defaults, actions } = component.props;
    if (!actions) {
        return [];
    }

    return actions.map(action => {
        let value: string | undefined;

        if (config && config.shortcuts && action in config.shortcuts) {
            value = config.shortcuts[action];
        } else if (defaults.shortcuts) {
            value = defaults.shortcuts[action];
        }

        return {
            id: action,
            key: actionLabels[action],
            value: value || ''
        };
    });
}

/**
 * Calculates diff from given component’s state against default values
 */
function calculateDiff(component: EmConfigEditor): Config {
    const { options, shortcuts } = component.state;
    const { defaults } = component.props;

    return {
        options,
        shortcuts: shortcutsDiff(shortcuts, defaults.shortcuts)
    };
}

function shortcutsDiff(list: KeyValueList, source: EditorShortcuts): EditorShortcuts {
    const result: EditorShortcuts = {};

    // Find updated values
    list.forEach(item => {
        const changed = item.id in source
            ? item.value !== source[item.id]
            : !!item.value
        if (changed) {
            result[item.id] = item.value || null;
        }
    });

    return result;
}
