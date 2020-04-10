export type SettingSimpleKeyType = 'string' | 'number' | 'boolean';
export type SettingArrayKeyType = 'array'
export type SettingKeyType = SettingSimpleKeyType | SettingArrayKeyType

interface SettingKeyBase {
    type: SettingKeyType
    required: boolean
}
export interface SettingSimpleKey extends SettingKeyBase {
    type: SettingSimpleKeyType
    default?: any // TODO: templated type?
}
export interface SettingArrayKey extends SettingKeyBase {
    type: SettingArrayKeyType,
    shareable: boolean
}

export type SettingKey = SettingSimpleKey | SettingArrayKey

export type SettingsConfig = {
    initialize: boolean
    namespace: string
    keys: Record<string, SettingKey>
}

// export type DataStoreResource = 'dataStore' | 'userDataStore'