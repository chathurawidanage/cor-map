import { useDataStore } from './useDataStore'
import { useMemo, useEffect, useState } from 'react'

export const useSetting = (id, { global = false, ignoreUpdates = false } = {}) => {
    const dataStore = useDataStore()

    const settingsStore = global ? dataStore.globalSettings : dataStore.userSettings
    const [value, setValue] = useState(settingsStore.get(id))

    const callbacks = useMemo(() => ({
        set: value => settingsStore.set(id, value)
    }), [dataStore])

    useEffect(() => {
        if (!ignoreUpdates) {
            const callback = newSettings => setValue(newSettings)
            settingsStore.subscribe(id, callback)
            return () => settingsStore.unsubscribe(id, callback)
        }
    }, [settingsStore, ignoreUpdates])
    
    return [value, callbacks]
}