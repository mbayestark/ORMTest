const { mysqlTable, serial, varchar, int, timestamp } = require('drizzle-orm/mysql-core');

const books = mysqlTable('books', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  isbn: varchar('isbn', { length: 13 }).notNull().unique(),
  publication_year: int('publication_year'),
  genre: varchar('genre', { length: 100 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

module.exports = { books };