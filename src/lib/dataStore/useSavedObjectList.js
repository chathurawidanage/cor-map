import { useDataStore } from './useDataStore'
import { useMemo, useEffect, useState } from 'react'

const flattenDictionary = dict => Object.entries(dict).map(([id, obj]) => ({
    id,
    ...obj
}))

export const useSavedObjectList = ({ global = false, ignoreUpdates = false } = {}) => {
    const dataStore = useDataStore()

    const objectStore = global ? dataStore.globalSavedObjects : dataStore.userSavedObjects
    const [list, setList] = useState(flattenDictionary(objectStore.settings))

    const callbacks = useMemo(() => ({
        add: object => objectStore.add(object),
        update: (id, object) => objectStore.update(id, object),
        replace: (id, object) => objectStore.replace(id, object),
        remove: id => objectStore.remove(id)
    }), [dataStore])

    useEffect(() => {
        if (!ignoreUpdates) {
            const callback = newSettings => setList(flattenDictionary(newSettings))
            objectStore.subscribe(callback)
            return () => objectStore.unsubscribe(callback)
        }
    }, [objectStore, ignoreUpdates])
    
    return [list, callbacks]
}