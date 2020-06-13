import { Changes } from 'endorphin';
import { EmComponent } from '../../types';

interface SegmentedValue {
    label: string;
    value: string;
}

interface EmSegmentedControlProps {
    name: string;
    value?: string;
    items: string[] | SegmentedValue[];
}

interface EmSegmentedControlState {
    selected: number;
}

interface EmSegmentedControlExtend {
    value: string | null;
    selected: number;
    readonly name: string;
}

export type EmSegmentedControl = EmComponent<EmSegmentedControlProps, EmSegmentedControlState> & EmSegmentedControlExtend;

export const extend: EmSegmentedControlExtend = {
    get name() {
        return (this as EmSegmentedControl).props.name;
    },

    get value(): string | null {
        const sel = (this as EmSegmentedControl).selected;
        if (sel !== -1) {
            const value = (this as EmSegmentedControl).props.items[sel];
            return typeof value === 'string' ? value : value.value;
        }
        return null;
    },

    set value(val: string | null) {
        this.selected = val != null ? findIndex((this as EmSegmentedControl).props.items, val) : -1;
    },

    get selected() {
        return (this as EmSegmentedControl).state.selected;
    },

    set selected(value: number) {
        (this as EmSegmentedControl).setState({ selected: value });
    }
}

export function state(): EmSegmentedControlState {
    return { selected: -1 };
}

export function didChange(component: EmSegmentedControl, { value }: Changes<EmSegmentedControlProps>) {
    if (value) {
        component.setState({
            selected: findIndex(component.props.items, value.current!)
        });
    }
}

/**
 * Looks for item index in given data set
 */
function findIndex(items: string[] | SegmentedValue[], value: string): number {
    return items.findIndex((item: string | SegmentedValue) => typeof item === 'string' ? item === value : item.value === value);
}
