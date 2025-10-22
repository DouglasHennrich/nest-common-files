export abstract class TEnvService {
  abstract get<T extends string>(key: T): any;
}