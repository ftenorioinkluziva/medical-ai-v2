import { pgTable, uuid, varchar, integer, text, json, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

// Documents table
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // File Info
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(), // pdf, image/png, etc
  fileSize: integer('file_size').notNull(), // bytes
  documentType: varchar('document_type', { length: 100 }).notNull(), // lab_report, bioimpedance, prescription, etc

  // Document Date (real exam/document date, not upload date)
  documentDate: timestamp('document_date'), // Data real do exame/documento extraída de structuredData

  // Extracted Data
  extractedText: text('extracted_text'),
  structuredData: json('structured_data'),

  // Processing Status
  processingStatus: varchar('processing_status', { length: 50 })
    .notNull()
    .default('pending'), // pending, processing, completed, failed
  processingError: text('processing_error'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
