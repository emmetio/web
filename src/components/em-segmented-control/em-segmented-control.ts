import { Changes } from 'endorphin';
import { EmComponent } from '../../lib/types';

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
    get name(this: EmSegmentedControl) {
        return this.props.name;
    },

    get value(this: EmSegmentedControl): string | null {
        const sel = this.selected;
        if (sel !== -1) {
            const value = this.props.items[sel];
            return typeof value === 'string' ? value : value.value;
        }
        return null;
    },

    set value(val: string | null) {
        this.selected = val != null ? findIndex(this.props.items, val) : -1;
    },

    get selected(this: EmSegmentedControl) {
        return this.state.selected;
    },

    set selected(value: number) {
        this.setState({ selected: value });
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
