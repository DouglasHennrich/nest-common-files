import { SetMetadata } from '@nestjs/common';

/// //////////////////////////
//  Public()
/// //////////////////////////
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/// //////////////////////////
//  GoogleAuth()
/// //////////////////////////
export const IS_GOOGLE_KEY = 'isGoogle';
export const GoogleAuth = () => SetMetadata(IS_GOOGLE_KEY, true);

/// //////////////////////////
//  PasskeyAuth()
/// //////////////////////////
export const IS_PASSKEY_KEY = 'isPasskey';
export const PasskeyAuth = () => SetMetadata(IS_PASSKEY_KEY, true);

/// //////////////////////////
//  BypassTermsOfUsoAndPrivacy()
/// //////////////////////////
export const IS_BYPASS_TERMS_KEY = 'isBypassTerms';
export const BypassTermsOfUsoAndPrivacy = () =>
  SetMetadata(IS_BYPASS_TERMS_KEY, true);
