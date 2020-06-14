export interface Tab {
    id: string | number;
    label: string;
    selected?: boolean;
    badge?: number;
}

/**
 * Tab item factory
 */
export function tab(id: string, label: string, selected = false, badge?: number): Tab {
    return { id, label, selected, badge };
}
