
export const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const normalizeKey = (key: string) => {
    if (key === ' ') return 'Space';
    if (key.length === 1) return key.toLowerCase();
    return key;
};

export const formatShortcut = (shortcut: string) => {
    if (!shortcut) return '';
    return shortcut
        .replace('Mod', isMac ? 'Cmd' : 'Ctrl')
        .replace('Meta', 'Cmd')
        .replace('Control', 'Ctrl')
        .replace('Shift', 'Shift')
        .replace('Alt', 'Alt')
        .split('+')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' + ');
};

export const matchHotkey = (e: KeyboardEvent, shortcut: string) => {
    if (!shortcut) return false;
    
    // Parse the shortcut definition
    const parts = shortcut.split('+');
    const targetKey = normalizeKey(parts[parts.length - 1]);
    const modifiers = parts.slice(0, -1);

    // Normalize event key
    const eventKey = normalizeKey(e.key);
    
    // Check key match
    if (eventKey !== targetKey) return false;

    // Check Modifier States
    const hasMeta = e.metaKey;
    const hasCtrl = e.ctrlKey;
    const hasShift = e.shiftKey;
    const hasAlt = e.altKey;

    const reqMeta = modifiers.includes('Meta') || (modifiers.includes('Mod') && isMac);
    const reqCtrl = modifiers.includes('Ctrl') || (modifiers.includes('Mod') && !isMac);
    const reqShift = modifiers.includes('Shift');
    const reqAlt = modifiers.includes('Alt');

    return hasMeta === reqMeta && hasCtrl === reqCtrl && hasShift === reqShift && hasAlt === reqAlt;
};

export const recordHotkey = (e: KeyboardEvent): string | null => {
    // Prevent recording just modifiers
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return null;

    const parts = [];
    
    // Standardize modifier order
    if (e.metaKey) parts.push('Meta');
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    
    // Key
    let key = e.key;
    if (key === ' ') key = 'Space';
    if (key.length === 1) key = key.toLowerCase();
    
    parts.push(key);
    return parts.join('+');
};
