import { EmComponent } from '../../types';

interface IScopeItem {
	id: string;
	label: string;
}

export type EmScopePicker = EmComponent<IEmScopePickerProps, IEmScopePickerState>;

interface IEmScopePickerProps {
	selected: string;
}

interface IEmScopePickerState {
	globalScopes: IScopeItem[];
}

export function props(): IEmScopePickerProps {
	return {
		selected: null
	};
}

export function state(): IEmScopePickerState {
	return {
		globalScopes: [
			{ id: 'markup', label: 'All markup syntaxes' },
			{ id: 'stylesheet', label: 'All stylesheet syntaxes' }
		]
	};
}
