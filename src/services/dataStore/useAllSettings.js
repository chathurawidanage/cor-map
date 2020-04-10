import { useDataStore } from './useDataStore'
import { useMemo, useEffect, useState } from 'react'

export const useAllSettings = ({ global = false, ignoreUpdates = false } = {}) => {
    const dataStore = useDataStore()

    const settingsStore = global ? dataStore.globalSettings : dataStore.userSettings
    const [value, setValue] = useState(settingsStore.settings)

    const callbacks = useMemo(() => ({
        set: (key, value) => settingsStore.set(key, value),
    }), [dataStore])

    useEffect(() => {
        if (!ignoreUpdates) {
            const callback = newSettings => setValue(newSettings)
            settingsStore.subscribe(callback)
            return () => settingsStore.unsubscribe(callback)
        }
    }, [settingsStore, ignoreUpdates])
    
    return [value, callbacks]
}