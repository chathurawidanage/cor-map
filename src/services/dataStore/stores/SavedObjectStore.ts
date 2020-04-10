import uuid from "uuid4";
import { SettingsStore, DataStoreResource } from "./SettingsStore";

type SavedObjectStoreInput = {
    engine,
    resource: DataStoreResource,
    namespace: string,
    item: string
}
export class SavedObjectStore extends SettingsStore {
    constructor({ engine, resource, namespace, item }: SavedObjectStoreInput) {
        super({ engine, resource, namespace, item, defaults: {} })
    }

    has(id) {
        return Object.keys(this.settings).includes(id)
    }

    async add(object) {
        if (typeof object !== 'object') {
            throw new Error(`Only objects are allowed in the SavedObjectStore, received ${object}`)
        }
        const id = uuid()

        const newObject = {
            ...object,
            id
        }

        await this.set(id, newObject)

        return newObject
    }
    async update(id, object) {
        const objectToAdd = typeof object === 'object' ? {
            ...this.get(id),
            ...object
        } : object
        await this.set(id, objectToAdd)
        return objectToAdd
    }
    async replace(id, object) {
        await this.set(id, object)
    }
    async remove(id) {
        await this.set(id, undefined) // TODO: Soft delete
    }
}