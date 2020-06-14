import { SupportedEditor, EmComponent } from '../../../types';
import { tab, Tab } from '../../em-tabs/em-tabs';

type ComponentWithTabs = EmComponent<{}, { tabs: Tab[] }>;
type SelectTabEvent = CustomEvent<Tab>;

export function createConfigTabs(id: SupportedEditor, component: EmComponent) {
    const { activation } = component.store.get();
    const activated = activation && id in activation && activation[id].length > 0;

    return [
        tab('install', 'Install', !activated),
        tab('activate', 'Activate'),
        tab('common', 'Emmet config', activated),
        tab('plugin', 'Plugin config'),
    ];
}

export function onSelectTab(component: ComponentWithTabs, event: SelectTabEvent) {
    const selectedTab = event.detail;
    let { tabs } = component.state;
    const curTab = tabs.find(t => t.selected);
    if (!curTab || curTab.id !== selectedTab.id) {
        tabs = component.state.tabs.map(t => ({
            ...t,
            selected: t.id === selectedTab.id
        }));
    }

    component.setState({ tabs });
}
