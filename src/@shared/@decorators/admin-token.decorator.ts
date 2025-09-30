import { ADMIN_TOKEN_KEY } from '@/modules/authenticate/guard/admin-token.guard';
import { SetMetadata } from '@nestjs/common';

export const AdminToken = () => SetMetadata(ADMIN_TOKEN_KEY, true);
