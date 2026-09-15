/**
 * Base repository abstraction ensuring clean decoupling between
 * business services and data stores (Google Sheets now, PostgreSQL later).
 */
export interface BaseRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'> | T): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T>;
  delete?(id: ID): Promise<boolean>;
}
