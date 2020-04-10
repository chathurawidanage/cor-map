import { SavedObjectStore } from "./SavedObjectStore";
import { SettingsStore } from "./SettingsStore";

export class DataStore {
    globalSettings: SettingsStore
    userSettings: SettingsStore
    userSavedObjects: SavedObjectStore
    globalSavedObjects: SavedObjectStore

    constructor({ engine, namespace, defaultGlobalSettings, defaultUserSettings }) {
        this.globalSettings = new SettingsStore({
            engine,
            resource: 'dataStore',
            namespace,
            item: 'settings',
            defaults: defaultGlobalSettings 
        })
        this.userSettings = new SettingsStore({
            engine,
            resource: 'userDataStore',
            namespace,
            item: 'settings',
            defaults: defaultUserSettings
        })
        
        this.userSavedObjects = new SavedObjectStore({
            engine,
            resource: 'userDataStore',
            namespace,
            item: 'savedObjects',
        })
        this.globalSavedObjects = new SavedObjectStore({ 
            engine,
            resource: 'dataStore',
            namespace,
            item: 'savedObjects'
        })
    }

    async initialize() {
        await Promise.all([
            this.globalSettings.initialize(),
            this.userSettings.initialize(),
            this.userSavedObjects.initialize(),
            this.globalSavedObjects.initialize(),
        ])
    }

    async shareSavedObject(id) {
        if (this.userSavedObjects.has(id)) {
            // TODO: Handle errors
            await this.globalSavedObjects.update(id, this.userSavedObjects.get(id))
            await this.userSavedObjects.remove(id)
        }
    }

    async unshareSavedObject(id) {
        if (this.globalSavedObjects.has(id)) {
            // TODO: Handle errors
            await this.userSavedObjects.update(id, this.globalSavedObjects.get(id))
            await this.globalSavedObjects.remove(id)
        }
    }
}
