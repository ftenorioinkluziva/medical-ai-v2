/**
 * JSON Schema to Zod Converter
 * Converts JSON Schema definitions to Zod schemas for runtime validation
 * Used by dynamic product generators (weekly plans + recommendations)
 */

import { z } from 'zod'

export type JSONSchema = {
  type?: string
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
  required?: string[]
  enum?: any[]
  description?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  default?: any
  $ref?: string
  definitions?: Record<string, JSONSchema>
  $defs?: Record<string, JSONSchema>
}

/**
 * Resolve $ref references in JSON Schema
 * Supports both #/definitions/... and #/$defs/... formats
 */
function resolveRef(ref: string, rootSchema: JSONSchema): JSONSchema {
  // Remove leading #/
  const path = ref.replace(/^#\//, '')
  const parts = path.split('/')

  let current: any = rootSchema
  for (const part of parts) {
    if (!current[part]) {
      throw new Error(`Cannot resolve $ref: ${ref}. Path "${part}" not found.`)
    }
    current = current[part]
  }

  return current as JSONSchema
}

/**
 * Convert JSON Schema to Zod schema
 * Supports: primitives, objects, arrays, enums, nested structures, $ref
 */
export function jsonSchemaToZod(schema: JSONSchema, rootSchema?: JSONSchema): z.ZodTypeAny {
  // Use current schema as root if not provided
  const root = rootSchema || schema

  // Handle $ref first
  if (schema.$ref) {
    const resolvedSchema = resolveRef(schema.$ref, root)
    return jsonSchemaToZod(resolvedSchema, root)
  }

  // Handle enum (can be any type)
  if (schema.enum) {
    return z.enum(schema.enum as [string, ...string[]])
  }

  // Type is now optional due to $ref support
  if (!schema.type) {
    throw new Error('Schema must have either "type" or "$ref" property')
  }

  switch (schema.type) {
    case 'string':
      return buildStringSchema(schema)

    case 'number':
    case 'integer':
      return buildNumberSchema(schema)

    case 'boolean':
      return z.boolean()

    case 'array':
      return buildArraySchema(schema, root)

    case 'object':
      return buildObjectSchema(schema, root)

    default:
      throw new Error(`Unsupported JSON Schema type: ${schema.type}`)
  }
}

/**
 * Build Zod string schema with constraints
 */
function buildStringSchema(schema: JSONSchema): z.ZodString {
  let zodSchema = z.string()

  if (schema.description) {
    zodSchema = zodSchema.describe(schema.description)
  }

  if (schema.minLength !== undefined) {
    zodSchema = zodSchema.min(schema.minLength)
  }

  if (schema.maxLength !== undefined) {
    zodSchema = zodSchema.max(schema.maxLength)
  }

  if (schema.pattern) {
    zodSchema = zodSchema.regex(new RegExp(schema.pattern))
  }

  return zodSchema
}

/**
 * Build Zod number schema with constraints
 */
function buildNumberSchema(schema: JSONSchema): z.ZodNumber {
  let zodSchema = z.number()

  if (schema.description) {
    zodSchema = zodSchema.describe(schema.description)
  }

  if (schema.minimum !== undefined) {
    zodSchema = zodSchema.min(schema.minimum)
  }

  if (schema.maximum !== undefined) {
    zodSchema = zodSchema.max(schema.maximum)
  }

  // For integer type, ensure it's an integer
  if (schema.type === 'integer') {
    zodSchema = zodSchema.int()
  }

  return zodSchema
}

/**
 * Build Zod array schema
 */
function buildArraySchema(schema: JSONSchema, rootSchema: JSONSchema): z.ZodArray<any> {
  if (!schema.items) {
    throw new Error('Array schema must have "items" property')
  }

  const itemsSchema = jsonSchemaToZod(schema.items, rootSchema)
  let zodSchema = z.array(itemsSchema)

  if (schema.description) {
    zodSchema = zodSchema.describe(schema.description)
  }

  return zodSchema
}

/**
 * Build Zod object schema
 */
function buildObjectSchema(schema: JSONSchema, rootSchema: JSONSchema): z.ZodObject<any> {
  if (!schema.properties) {
    throw new Error('Object schema must have "properties"')
  }

  const shape: Record<string, z.ZodTypeAny> = {}
  const required = new Set(schema.required || [])

  // Convert each property
  for (const [key, propSchema] of Object.entries(schema.properties)) {
    let propZodSchema = jsonSchemaToZod(propSchema, rootSchema)

    // Make optional if not in required array
    if (!required.has(key)) {
      propZodSchema = propZodSchema.optional()
    }

    shape[key] = propZodSchema
  }

  let zodSchema = z.object(shape)

  if (schema.description) {
    zodSchema = zodSchema.describe(schema.description)
  }

  return zodSchema
}

/**
 * Validate JSON Schema structure
 * Returns { valid: true } or { valid: false, error: string }
 */
export function validateJsonSchema(schema: any): { valid: boolean; error?: string } {
  try {
    // Check if it's an object
    if (!schema || typeof schema !== 'object') {
      return { valid: false, error: 'Schema must be an object' }
    }

    // Check if it has a type
    if (!schema.type) {
      return { valid: false, error: 'Schema must have a "type" property' }
    }

    // Validate type value
    const validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object']
    if (!validTypes.includes(schema.type)) {
      return { valid: false, error: `Invalid type: ${schema.type}. Must be one of: ${validTypes.join(', ')}` }
    }

    // Type-specific validation
    if (schema.type === 'array' && !schema.items) {
      return { valid: false, error: 'Array schema must have "items" property' }
    }

    if (schema.type === 'object' && !schema.properties) {
      return { valid: false, error: 'Object schema must have "properties" property' }
    }

    // Try to convert to Zod (this will throw if there are issues)
    jsonSchemaToZod(schema)

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    }
  }
}

/**
 * Convert Zod schema to JSON Schema (reverse operation)
 * Useful for seeding - converts existing Zod schemas to JSON Schema format
 */
export function zodToJsonSchema(zodSchema: any): JSONSchema {
  // If it's a primitive type (string), throw error
  if (typeof zodSchema === 'string') {
    throw new Error(`Received string "${zodSchema}" instead of schema object`)
  }

  // If it's already a JSON Schema object with properties but no _def, return it
  if (zodSchema && typeof zodSchema === 'object' && zodSchema.type && zodSchema.properties && !zodSchema._def) {
    return zodSchema as JSONSchema
  }

  if (!zodSchema || typeof zodSchema !== 'object' || !zodSchema._def) {
    console.error('Invalid schema received:', zodSchema)
    throw new Error('Invalid Zod schema: missing _def property')
  }

  // Support both old (_def.typeName) and new (_def.type or .type) Zod versions
  const zodType = zodSchema._def.typeName || zodSchema._def.type || zodSchema.type

  if (!zodType) {
    throw new Error(`Zod schema missing type identifier`)
  }

  // Handle wrapper types first (unwrap them)
  if (zodType === 'ZodOptional' || zodType === 'optional') {
    return zodToJsonSchema(zodSchema._def.innerType)
  }

  if (zodType === 'ZodNullable' || zodType === 'nullable') {
    return zodToJsonSchema(zodSchema._def.innerType)
  }

  if (zodType === 'ZodDefault' || zodType === 'default') {
    const schema = zodToJsonSchema(zodSchema._def.innerType)
    schema.default = zodSchema._def.defaultValue?.() || zodSchema._def.default
    return schema
  }

  if (zodType === 'ZodEffects' || zodType === 'ZodPipeline' || zodType === 'effects' || zodType === 'pipeline') {
    // For effects/transforms, use the underlying schema
    return zodToJsonSchema(zodSchema._def.schema || zodSchema._def.in)
  }

  // Handle branded types
  if (zodType === 'ZodBranded' || zodType === 'branded') {
    return zodToJsonSchema(zodSchema._def.type)
  }

  // Handle described types (extract description)
  if (zodType === 'ZodDescription' || zodType === 'description') {
    const schema = zodToJsonSchema(zodSchema._def.innerType)
    schema.description = zodSchema._def.description
    return schema
  }

  // Handle primitive and complex types
  switch (zodType) {
    case 'ZodString':
    case 'string': {
      const schema: JSONSchema = { type: 'string' }
      if (zodSchema.description) schema.description = zodSchema.description
      return schema
    }

    case 'ZodNumber':
    case 'number': {
      const schema: JSONSchema = { type: 'number' }
      if (zodSchema.description) schema.description = zodSchema.description
      return schema
    }

    case 'ZodBoolean':
    case 'boolean': {
      const schema: JSONSchema = { type: 'boolean' }
      if (zodSchema.description) schema.description = zodSchema.description
      return schema
    }

    case 'ZodEnum':
    case 'enum':
      return {
        type: 'string',
        enum: zodSchema._def.values || zodSchema._def.options,
      }

    case 'ZodArray':
    case 'array': {
      // Get the element schema - be careful not to get the string "type"
      let elementSchema = zodSchema._def.element

      // Fallback to other locations if not found
      if (!elementSchema || typeof elementSchema === 'string') {
        elementSchema = zodSchema._def.type
      }

      // Last resort - check direct .element property (but skip if it's not an object)
      if ((!elementSchema || typeof elementSchema === 'string') && zodSchema.element && typeof zodSchema.element === 'object') {
        elementSchema = zodSchema.element
      }

      if (!elementSchema || typeof elementSchema !== 'object') {
        throw new Error(`Array schema missing valid element definition. Got: ${typeof elementSchema}`)
      }

      return {
        type: 'array',
        items: zodToJsonSchema(elementSchema),
      }
    }

    case 'ZodObject':
    case 'object': {
      const shapeGetter = zodSchema._def.shape
      const shape = typeof shapeGetter === 'function' ? shapeGetter() : shapeGetter
      const properties: Record<string, JSONSchema> = {}
      const required: string[] = []

      for (const [key, propSchema] of Object.entries(shape)) {
        const propZodSchema = propSchema as any
        const propType = propZodSchema._def?.typeName || propZodSchema._def?.type || propZodSchema.type

        // Check if required (not optional)
        if (propType !== 'ZodOptional' && propType !== 'optional') {
          required.push(key)
        }

        // Convert the property (this will handle wrappers recursively)
        properties[key] = zodToJsonSchema(propZodSchema)
      }

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
      }
    }

    default:
      throw new Error(`Unsupported Zod type for conversion: ${zodType}`)
  }
}
