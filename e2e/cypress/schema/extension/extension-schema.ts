import { ObjectSchema, versionSchemas } from '@cypress/schema-tools';

const extensionApiSchema100: ObjectSchema = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  example: {
    extension: 'https://download-link.zip',
  },
  schema: {
    title: 'extensionApiSchema',
    type: 'object',
    required: ['extension', 'version'],
    properties: {
      extension: {
        type: 'string',
      },
      version: {
        type: 'string',
      },
    },
    additionalProperties: false,
  },
};

export default versionSchemas(extensionApiSchema100);
