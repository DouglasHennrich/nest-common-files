import { AccountUserTypeEnum } from '../accounts/models/account.struct';

type TUserTypeWithAdmin = keyof typeof AccountUserTypeEnum | 'ADMIN';

const tempPermissions = [
  'addresses:manage',
  'agendas:manage',
  'careAssignments:manage',
  'customizations:manage',
  'financials:manage',
  'foods:manage',
  'patients:manage',
  'resources:manage',
  'secretaries:manage',
];

export const DEFAULT_PERMISSIONS: Record<TUserTypeWithAdmin, string[]> = {
  ADMIN: ['all'],
  NUTRITIONIST: ['nutritionists:manage', ...tempPermissions],
  OCCUPATIONAL_THERAPIST: ['occupational_therapists:write', ...tempPermissions],
  PSYCHOLOGIST: ['psychologists:write', ...tempPermissions],
  SPEECH_THERAPIST: ['speech_therapists:write', ...tempPermissions],

  //
  PATIENT: ['patients:manage'],
  RESPONSABLE: [
    'responsables:manage',
    'patients:manage',
    'careAssignments:manage',
    'resources:read',
  ],
  SECRETARY: [
    'secretaries:manage',
    'responsables:manage',
    'agendas:manage',
    'patients:manage',
    'careAssignments:manage',
    'financials:manage',
  ],
};
