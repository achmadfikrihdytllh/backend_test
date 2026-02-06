// database/migrations/xxx_create_pdf_files_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pdf_files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('uuid')
      
      table.string('filename', 255).notNullable()
      table.string('original_name', 255).nullable()
      table.string('filepath', 500).notNullable()
      table.bigInteger('size').nullable()
      table.enum('status', ['CREATED', 'UPLOADED', 'DELETED'])
           .notNullable()
           .defaultTo('CREATED')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}