import { TAppAbility } from '../casl-ability.factory';

export interface IPolicyHandler {
  handle(ability: TAppAbility): boolean;
}

export type TPolicyHandler =
  | IPolicyHandler
  | ((ability: TAppAbility) => boolean);
