import { useDataStore } from './useDataStore'
import { useMemo, useEffect, useState } from 'react'

export const useSavedObject = (id, { ignoreUpdates = false } = {}) => {
    const dataStore = useDataStore()

    const global = !dataStore?.userSavedObjects.has(id)
    const objectStore = global ? dataStore?.globalSavedObjects : dataStore?.userSavedObjects
    const [value, setValue] = useState(objectStore?.get(id))

    const callbacks = useMemo(() => ({
        update: (object) => objectStore?.update(id, object),
        replace: (object) => objectStore?.replace(id, object),
        remove: () => objectStore?.remove(id),
        share: () => dataStore?.shareSavedObject(id),
        unshare: () => dataStore?.unshareSavedObject(id),
    }), [dataStore])

    useEffect(() => {
        if (!ignoreUpdates) {
            const callback = newValue => setValue(newValue)
            objectStore?.subscribe(id, callback)
            return () => objectStore?.unsubscribe(id, callback)
        }
    }, [objectStore, ignoreUpdates])
    
    return [value, callbacks]
}