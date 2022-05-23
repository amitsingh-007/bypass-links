import { combineSchemas } from '@cypress/schema-tools';
import extensionSchema from './extension-schema';

export default combineSchemas(extensionSchema);
