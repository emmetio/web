import { Changes } from 'endorphin';
import { notify } from 'endorphin/helpers';
import KeyCodes from './KeyCodes';
import { EmComponent } from '../../types';

interface EmShortcutRecorderProps {
    value?: string;
    isMac: boolean;
}

interface EmShortcutRecorderState {
    recording?: boolean;
    value?: string | null;
    representedValue: string;
}

export type EmShortcutRecorder = EmComponent<EmShortcutRecorderProps, EmShortcutRecorderState>;

/** Currently recorded component */
let target: EmShortcutRecorder | null = null;

const pcCharMap = {
    'meta': 'Win',
    'ctrl': 'Ctrl',
    'alt': 'Alt',
    'shift': 'Shift',
    'enter': 'Enter',
    'tab': 'Tab',
    'left': '←',
    'right': '→',
    'up': '↑',
    'down': '↓'
};

const macCharMap = {
    ...pcCharMap,
    'ctrl': '⌃',
    'meta': '⌘',
    'shift': '⇧',
    'alt': '⌥',
    'enter': '⏎',
    'tab': '⇥',
};

export const events = {
    click(component: EmShortcutRecorder) {
        if (!component.state.recording) {
            beginRecord(component);
        }
    }
}

export function didChange(component: EmShortcutRecorder, { value }: Changes<EmShortcutRecorderProps>) {
    if (value && component === target) {
        stopRecord(component);
    }
}

export function willRender(component: EmShortcutRecorder) {
    const shortcut = component.state.recording
        ? component.state.value
        : component.props.value;

    const representedValue = representShortcut(shortcut || '', component.props.isMac);
    component.setState({ representedValue });
}

export function willUnmount(component: EmShortcutRecorder) {
    if (component === target) {
        stopRecord(component);
    }
}

/**
 * Starts shortcut recorder for given component
 */
export function beginRecord(component: EmShortcutRecorder) {
    if (target) {
        stopRecord(target);
    }

    target = component;
    document.addEventListener('keyup', captureKeyStroke);
    document.addEventListener('keydown', captureKeyStroke);
    component.setState({ recording: true });
}

/**
 * Stops shortcut recording for given component
 */
export function stopRecord(component: EmShortcutRecorder, valid?: boolean) {
    document.removeEventListener('keyup', captureKeyStroke);
    document.removeEventListener('keydown', captureKeyStroke);
    const { value } = component.state;
    component.setState({
        recording: false,
        value: null
    });

    if (valid) {
        notify(component, 'submit', { value });
    }

    target = null;
}

function captureKeyStroke(evt: KeyboardEvent) {
    if (!target) {
        return;
    }

    const { keyCode } = evt;
    evt.preventDefault();

    if (keyCode === 8 /* Esc */) {
        stopRecord(target);
        return;
    }

    const parts: string[] = [];
    if (evt.metaKey) {
        parts.push('meta');
    }

    if (evt.shiftKey) {
        parts.push('shift');
    }

    if (evt.ctrlKey) {
        parts.push('ctrl');
    }

    if (evt.altKey) {
        parts.push('alt');
    }

    if (keyCode in KeyCodes) {
        parts.push(KeyCodes[keyCode]);
    }

    target.setState({ value: parts.join('+') });

    if (keyCode in KeyCodes && evt.type === 'keydown') {
        // Current key can be used for shortcut.
        // For sanity sake, allow single-code shortcut for limited keys: F1-F12
        const valid = (keyCode >= 112 && keyCode <= 123) || parts.length > 1;
        stopRecord(target, valid);
    }
}

/**
 * Returns user-friendly representation of give shortcut
 */
function representShortcut(shortcut: string, isMac?: boolean): string {
    const map = isMac ? macCharMap : pcCharMap;
    if (!shortcut) {
        return '';
    }

    const parts = shortcut.split('+').map(chunk => {
        return map[chunk.toLowerCase()] || capitalize(chunk);
    });

    return parts.join(isMac ? '' : '+');
}

function capitalize(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
}
