import Knex from 'knex'

// Alteações a serem realizadas no banco de dados
export async function up(knex: Knex) {
  return knex.schema.createTable('connections', table => {
    table.increments('id').primary()

    table.integer('user_id').notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
    
    table.timestamp('created_at')
      .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
      .notNullable()
  })
}

// Desfaz alterações
export async function down(knex: Knex) {
  return knex.schema.dropTable('connections')
}