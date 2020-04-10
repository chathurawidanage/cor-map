import { useContext } from 'react'
import { DataStoreContext} from './DataStoreContext'

export const useDataStore = () => useContext(DataStoreContext)