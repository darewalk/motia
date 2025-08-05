import fs from 'fs'
import * as path from 'path'
import { StateAdapter, StateItem, StateItemsInput } from '../state-adapter'
import { filterItem, inferType } from './utils'

export type FileAdapterConfig = {
  adapter: 'default'
  filePath: string
}

export class FileStateAdapter implements StateAdapter {
  // private readonly filePath: string
  private readonly baseDir: string

  constructor(config: FileAdapterConfig) {
    // this.filePath = path.join(config.filePath, 'motia.state.json')
    this.baseDir = config.filePath
    
    // this.init()
  }

  private getFilePath(traceId: string){
    return path.join(this.baseDir, `${traceId}.state.json`)
  }

  private init(traceId: string) {
    // const dir = this.filePath.replace('motia.state.json', '')
    const filePath = this.getFilePath(traceId)
    const dir = this.baseDir

    try {
      fs.realpathSync(dir)
    } catch {
      fs.mkdirSync(dir, { recursive: true })
    }

    try {
      fs.readFileSync(filePath, 'utf-8')
    } catch {
      fs.writeFileSync(filePath, JSON.stringify({}), 'utf-8')
    }
  }

  async getGroup<T>(traceId: string): Promise<T[]> {
    const data = this._readFile(traceId)

    return Object.entries(data)
      .filter(([key]) => key.startsWith(traceId))
      .map(([, value]) => JSON.parse(value) as T)
  }

  async get<T>(traceId: string, key: string): Promise<T | null> {
    const data = this._readFile(traceId)
    const fullKey = this._makeKey(traceId, key)

    return data[fullKey] ? (JSON.parse(data[fullKey]) as T) : null
  }

  async set<T>(traceId: string, key: string, value: T) {
    const data = this._readFile(traceId)
    const fullKey = this._makeKey(traceId, key)

    data[fullKey] = JSON.stringify(value)

    this._writeFile(traceId, data)

    return value
  }

  async delete<T>(traceId: string, key: string): Promise<T | null> {
    const data = this._readFile(traceId)
    const fullKey = this._makeKey(traceId, key)
    const value = await this.get<T>(traceId, key)

    if (value) {
      delete data[fullKey]
      this._writeFile(traceId, data)
    }

    return value
  }

  async clear(traceId: string) {
    const data = this._readFile(traceId)
    const pattern = this._makeKey(traceId, '')

    for (const key in data) {
      if (key.startsWith(pattern)) {
        delete data[key]
      }
    }

    this._writeFile(traceId, data)
  }

  async keys(traceId: string) {
    const data = this._readFile(traceId)
    return Object.keys(data)
      .filter((key) => key.startsWith(this._makeKey(traceId, '')))
      .map((key) => key.replace(this._makeKey(traceId, ''), ''))
  }

  async traceIds() {
    return []
    // const data = this._readFile()
    // const traceIds = new Set<string>()

    // Object.keys(data).forEach((key) => traceIds.add(key.split(':')[0]))

    // return Array.from(traceIds)
  }

  async cleanup() {
    // No cleanup needed for file system
  }

  async items(input: StateItemsInput): Promise<StateItem[]> {
    return []
    // const data = this._readFile()

    // return Object.entries(data)
    //   .map(([key, value]) => {
    //     const [groupId, itemKey] = key.split(':')
    //     const itemValue = JSON.parse(value)
    //     return { groupId, key: itemKey, value: itemValue, type: inferType(itemValue) }
    //   })
    //   .filter((item) => (input.groupId ? item.groupId === input.groupId : true))
    //   .filter((item) => (input.filter ? filterItem(item, input.filter) : true))
  }

  private _makeKey(traceId: string, key: string) {
    return `${traceId}:${key}`
  }

  private _readFile(traceId: string): Record<string, string> {
    const filePath = this.getFilePath(traceId)
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content)
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.init(traceId)
        const content = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(content)
      }
      return {}
    }
  }

  private _writeFile(traceId: string, data: unknown) {
    const filePath = this.getFilePath(traceId)

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.init(traceId)
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
        return
      }
    }
  }
}
