import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PdfFile extends BaseModel {
  @column({ isPrimary: true, serialize: (value) => Number(value) })
  declare id: number

  @column()
  declare filename: string

  @column({ serializeAs: 'original_name' })
  declare originalName: string | null

  @column()
  declare filepath: string

  @column()
  declare size: number | null

  @column()
  declare status: 'CREATED' | 'UPLOADED' | 'DELETED'

  @column.dateTime({ autoCreate: true, serializeAs: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updated_at' })
  declare updatedAt: DateTime | null

  @column.dateTime({ serializeAs: 'deleted_at' })
  declare deletedAt: DateTime | null
}