import { SetMetadata } from '@nestjs/common';
import { TPolicyHandler } from '../models/polict.struct';

export const CHECK_POLICIES_KEY = 'check_policy';

export const CheckPolicies = (...handlers: TPolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
