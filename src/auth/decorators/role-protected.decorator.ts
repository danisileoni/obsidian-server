import { type CustomDecorator, SetMetadata } from '@nestjs/common';
import { type ValidRoles } from '../interfaces/valid-roles.enum';

export const META_ROLES = 'roles';

export const RoleProtected = (
  ...args: ValidRoles[]
): CustomDecorator<string> => {
  return SetMetadata('role-protected', args);
};
