import Knex from 'knex'

// Alteações a serem realizadas no banco de dados
export async function up(knex: Knex) {
  return knex.schema.createTable('class_schedule', table => {
    table.increments('id').primary()
    table.integer('week_day').notNullable()
    table.integer('from').notNullable()
    table.integer('to').notNullable()

    table.integer('class_id').notNullable()
      .references('id')
      .inTable('classes')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
  })
}

// Desfaz alterações
export async function down(knex: Knex) {
  return knex.schema.dropTable('class_schedule')
}