import { createContext } from 'react'
import { DataStore } from './stores/DataStore'

export const DataStoreContext = createContext<DataStore | undefined>(undefined)