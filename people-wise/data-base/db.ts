import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase, SQLiteBindValue } from 'expo-sqlite';
import { PersonCardType } from '@/types/cards';

// Константы
const DATABASE_NAME = 'peoplewise.db';
const DB_VERSION = 1;

// Интерфейс репозитория
interface IPersonRepository {
  getAll(): Promise<PersonCardType[]>;
  getById(id: string): Promise<PersonCardType | null>;
  create(person: PersonCardType): Promise<void>;
  update(person: PersonCardType): Promise<void>;
  delete(id: string): Promise<void>;
}

// Валидация данных
const validatePerson = (person: PersonCardType): boolean => {
  if (!person.name || typeof person.name !== 'string') return false;
  if (
    person.birthday &&
    typeof person.birthday !== 'string' &&
    !(person.birthday instanceof Date)
  ) return false;
  if (person.description && typeof person.description !== 'string') return false;
  if (person.photoPath && typeof person.photoPath !== 'string') return false;
  return true;
};

// Класс для работы с базой данных
class SQLitePersonRepository implements IPersonRepository {
  private db: SQLiteDatabase | null = null;

  public async getDB(): Promise<SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    }
    return this.db;
  }

  async getAll(): Promise<PersonCardType[]> {
    try {
      const db = await this.getDB();
      return await db.getAllAsync<PersonCardType>('SELECT * FROM person_cards;');
    } catch (error) {
      console.error('[DB ERROR] getAll:', error);
      throw new Error('Failed to get all persons');
    }
  }

  async getById(id: string): Promise<PersonCardType | null> {
    try {
      const db = await this.getDB();
      const result = await db.getAllAsync<PersonCardType>(
        'SELECT * FROM person_cards WHERE id = ?;',
        [id]
      );
      return result[0] || null;
    } catch (error) {
      console.error('[DB ERROR] getById:', error);
      throw new Error('Failed to get person by id');
    }
  }

  async create(person: PersonCardType): Promise<void> {
    if (!validatePerson(person)) {
      throw new Error('Invalid person data');
    }

    try {
      const db = await this.getDB();
      const query = `INSERT INTO person_cards (id, name, birthday, description, photoPath)
                    VALUES (?, ?, ?, ?, ?);`;
      const params: SQLiteBindValue[] = [
        person.id || null,
        person.name,
        person.birthday instanceof Date ? person.birthday.toISOString() : person.birthday || null,
        person.description || null,
        person.photoPath || null,
      ];
      await db.runAsync(query, params);
    } catch (error) {
      console.error('[DB ERROR] create:', error);
      throw new Error('Failed to create person');
    }
  }

  async update(person: PersonCardType): Promise<void> {
    if (!validatePerson(person)) {
      throw new Error('Invalid person data');
    }

    try {
      const db = await this.getDB();
      const query = `UPDATE person_cards
                    SET name = ?, birthday = ?, description = ?, photoPath = ?
                    WHERE id = ?;`;
      const params: SQLiteBindValue[] = [
        person.name,
        person.birthday instanceof Date ? person.birthday.toISOString() : person.birthday || null,
        person.description || null,
        person.photoPath || null,
        person.id,
      ];
      await db.runAsync(query, params);
    } catch (error) {
      console.error('[DB ERROR] update:', error);
      throw new Error('Failed to update person');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const query = 'DELETE FROM person_cards WHERE id = ?;';
      await db.runAsync(query, [id]);
    } catch (error) {
      console.error('[DB ERROR] delete:', error);
      throw new Error('Failed to delete person');
    }
  }
}

// Инициализация базы данных
export const initDB = async (): Promise<void> => {
  const repository = new SQLitePersonRepository();
  const db = await repository.getDB();

  try {
    // Создание таблицы
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS person_cards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        birthday TEXT,
        description TEXT,
        photoPath TEXT
      );
    `);

    // Создание индексов
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_person_name ON person_cards(name);');
    await db.runAsync('CREATE INDEX IF NOT EXISTS idx_person_birthday ON person_cards(birthday);');
  } catch (error) {
    console.error('[DB ERROR] initDB:', error);
    throw new Error('Failed to initialize database');
  }
};

// Экспорт репозитория
export const personRepository = new SQLitePersonRepository();

// Экспорт типов
export type { IPersonRepository };
