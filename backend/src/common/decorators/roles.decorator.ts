import { SetMetadata } from '@nestjs/common';
import { Role } from '../../auth/interfaces/user-session.interface';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: (Role | string)[]) =>
  SetMetadata(
    ROLES_KEY,
    roles.map((r) => r.toString().toUpperCase()),
  );
