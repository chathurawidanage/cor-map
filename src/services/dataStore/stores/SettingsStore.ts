import { EventEmitter } from "../utils/EventEmitter"

export type DataStoreResource = 'dataStore' | 'userDataStore'

const joinPath = (...parts) => 
    parts.map(part => 
        part
            .replace(/^\/+/, '')
            .replace(/\/+$/, '')
    ).join('/')

export type BaseSettingsStoreInput = {
    engine: any, // TODO: Proper typings
    resource: DataStoreResource,
    namespace: string,
    item: string,
    defaults: any
}

export class SettingsStore {
    engine
    resource: DataStoreResource
    dataStoreId: string
    settings: any

    eventEmitter = new EventEmitter()

    constructor({
        engine,
        resource,
        namespace,
        item,
        defaults = {}
    }: BaseSettingsStoreInput) {
        this.engine = engine
        this.resource = resource
        this.dataStoreId = joinPath(namespace, item)
        this.settings = defaults
    }

    async initialize() {
        await this.refresh()
    }

    async create() {
        await this.engine.mutate({
            resource: `${this.resource}/${this.dataStoreId}`,
            type: 'create',
            data: this.settings
        })
    }

    async refresh() {
        const prevSettings = this.settings;
        try {
            const newSettings = await this.engine.query({
                settings: {
                    resource: this.resource,
                    id: this.dataStoreId,
                }
            })
    
            this.settings = newSettings.settings
        } catch (e) {
            if (e.details?.status === 404) {
                await this.create()
            } else {
                throw e;
            }
        }

        Object.keys(prevSettings).forEach(key => {
            if (prevSettings[key] !== this.settings[key]) {
                this.eventEmitter.emit(`change ${key}`, this.settings[key])
            }
        })
        this.eventEmitter.emit('change', this.settings)
    }
    
    get(key) {
        return this.settings[key]
    }
    async set(key, value) {
        const prevSettings = this.settings
        const newSettings = {
            ...this.settings,
            [key]: value
        }
        if (typeof value === 'undefined') {
            delete newSettings[key]
        }

        this.settings = newSettings
        this.eventEmitter.emit(`change ${key}`, value)
        this.eventEmitter.emit('change', this.settings)

        try {
            await this.engine.mutate({
                resource: this.resource,
                type: 'update',
                id: this.dataStoreId,
                data: this.settings
            })
        } catch (e) {
            this.settings = prevSettings
            this.eventEmitter.emit(`change ${key}`, this.get(key))
            this.eventEmitter.emit('change', this.settings)

            throw e
        }
    }

    subscribe(key, callback) {
        if (arguments.length === 1) {
            callback = arguments[0]
            this.eventEmitter.on('change', callback)
        } else {
            this.eventEmitter.on(`change ${key}`, callback)
        }
    }

    unsubscribe(key, callback) {
        if (arguments.length === 1) {
            callback = arguments[0]
            this.eventEmitter.off('change', callback)
        } else {
            this.eventEmitter.off(`change ${key}`, callback)
        }
    }
}
