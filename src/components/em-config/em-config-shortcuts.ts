import { Changes } from 'endorphin';
import { notify } from 'endorphin/helpers';
import { KeyValueList, updateKeyValueList } from './utils';
import { EmComponent, EmmetAction, MovieFactory } from '../../types';

import expandAbbreviationMovie from '../../movie/expand-abbreviation';
import enterAbbreviationModeMovie from '../../movie/enter-abbreviation-mode';
import wrapWithAbbreviationMovie from '../../movie/wrap-with-abbreviation';
import balanceMovie from '../../movie/balance';
import balanceInwardMovie from '../../movie/balance-inward';
import toggleCommentMovie from '../../movie/toggle-comment';
import evaluateMathMovie from '../../movie/evaluate-math';
import goToEditPointMovie from '../../movie/go-to-edit-point';
import incDecNumberMovie from '../../movie/inc-dec-number';
import removeTagMovie from '../../movie/remove-tag';
import selectItemMovie from '../../movie/select-item';
import splitJoinMovie from '../../movie/split-join-tag';
import updateImageSizeMovie from '../../movie/update-image-size';
import convertDataURLMovie from '../../movie/convert-data-url';

const ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
const isMac = ios || /Mac/.test(navigator.platform);

export type ShortcutMovies = { [action in EmmetAction]?: MovieFactory | null };

interface EmConfigShortcutsProps {
    shortcuts: KeyValueList;
    movies?: ShortcutMovies;
}

interface EmConfigShortcutsState {
    isMac: boolean;
    movies: ShortcutMovies;
    conflicts?: string[];
}

const defaultMovies: ShortcutMovies = {
    [EmmetAction.Expand]: expandAbbreviationMovie,
    [EmmetAction.EnterMode]: enterAbbreviationModeMovie,
    [EmmetAction.Wrap]: wrapWithAbbreviationMovie,
    [EmmetAction.Balance]: balanceMovie,
    [EmmetAction.BalanceInward]: balanceInwardMovie,
    [EmmetAction.ToggleComment]: toggleCommentMovie,
    [EmmetAction.EvaluateMath]: evaluateMathMovie,
    [EmmetAction.NextEditPoint]: goToEditPointMovie,
    [EmmetAction.PrevEditPoint]: goToEditPointMovie,
    [EmmetAction.Increment1]: incDecNumberMovie,
    [EmmetAction.Increment10]: incDecNumberMovie,
    [EmmetAction.Increment01]: incDecNumberMovie,
    [EmmetAction.Decrement1]: incDecNumberMovie,
    [EmmetAction.Decrement10]: incDecNumberMovie,
    [EmmetAction.Decrement01]: incDecNumberMovie,
    [EmmetAction.RemoveTag]: removeTagMovie,
    [EmmetAction.SelectNext]: selectItemMovie,
    [EmmetAction.SelectPrev]: selectItemMovie,
    [EmmetAction.SplitJoinTag]: splitJoinMovie,
    [EmmetAction.UpdateImageSize]: updateImageSizeMovie,
    [EmmetAction.DataURL]: convertDataURLMovie,
};

export function state(): EmConfigShortcutsState {
    return { isMac, movies: defaultMovies };
}

export type EmConfigShortcuts = EmComponent<EmConfigShortcutsProps, EmConfigShortcutsState>;

export function didChange(component: EmConfigShortcuts, { shortcuts, movies }: Changes<EmConfigShortcutsProps>) {
    if (shortcuts) {
        component.setState({ conflicts: getConflicts(shortcuts.current || []) });
    }

    if (movies) {
        component.setState({
            movies: {
            ...defaultMovies,
            ...movies.current
            }
        });
    }
}

export function onSubmit(action: string, component: EmConfigShortcuts, evt: CustomEvent) {
    const { shortcuts } = component.props;
    const updated = updateKeyValueList(shortcuts, action, evt.detail.value);
    if (updated !== shortcuts) {
        notify(component, 'update', updated);
    }
}

export function onClear(action: string, component: EmConfigShortcuts) {
    const { shortcuts } = component.props;
    const updated = updateKeyValueList(shortcuts, action, '');
    if (updated !== shortcuts) {
        notify(component, 'update', updated);
    }
}

function getConflicts(shortcuts: KeyValueList): string[] {
    const lookup = new Map<string, string[]>();
    shortcuts.forEach(item => {
        if (item.value) {
            if (!lookup.has(item.value)) {
                lookup.set(item.value, [item.id as string]);
            } else {
                lookup.get(item.value)!.push(item.id as string);
            }
        }
    });

    let conflicts: string[] = [];
    lookup.forEach(actions => {
        if (actions.length > 1) {
            conflicts = conflicts.concat(actions);
        }
    });

    return conflicts;
}
