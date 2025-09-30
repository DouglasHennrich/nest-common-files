import {
  MongoAbility,
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  ForcedSubject,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

export const PERMISSIONS = {
  ACTIONS: ['manage', 'read', 'write', 'delete'],
  RESOURCES: [
    'all',
    'addresses',
    'agendas',
    'careAssignments',
    'customizations',
    'financials',
    'foods',
    'nutritionists',
    'patients',
    'resources',
    'responsables',
    'secretaries',
  ],
} as const;
export type TPermissionsActions = (typeof PERMISSIONS.ACTIONS)[number];
export type TPermissionsSubjects = (typeof PERMISSIONS.RESOURCES)[number];

type TAppAbilities = [
  (typeof PERMISSIONS.ACTIONS)[number],
  (
    | (typeof PERMISSIONS.RESOURCES)[number]
    | ForcedSubject<Exclude<(typeof PERMISSIONS.RESOURCES)[number], 'all'>>
  ),
];

export type TAppAbility = MongoAbility<TAppAbilities>;

@Injectable()
export class CaslAbilityFactory {
  defineAbility(currentUser: { permissions: string[] }): TAppAbility {
    const { can, build } = new AbilityBuilder<TAppAbility>(createMongoAbility);

    if (currentUser.permissions.includes('all')) {
      can('manage', 'all');

      //
    } else {
      currentUser.permissions.forEach((permission: string) => {
        const [subject, action] = permission.split(':') as [
          TAppAbilities[1],
          TAppAbilities[0],
        ];

        if (action === 'write') {
          can('write', subject as any);
          can('read', subject as any); // "write" implies "read"
        } else {
          can(action, subject as any);
        }
      });
    }

    return build({
      detectSubjectType: (item: any) =>
        item.constructor as ExtractSubjectType<TPermissionsSubjects>,
    });
  }
}
