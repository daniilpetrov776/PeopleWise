import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { PersonCardType } from '@/types/cards';

const DATABASE_NAME = 'peoplewise.db';

export const openDB = async (): Promise<SQLiteDatabase> => {
  // Открытие асинхронное в новых версиях expo-sqlite
  // Параметры: имя базы
  return SQLite.openDatabaseAsync(DATABASE_NAME);
}

export const initDB = async (): Promise<void> => {
  const db = await openDB();
  try {
    // Example: create a table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS person_cards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        birthday TEXT,
        description TEXT,
        photoPath TEXT
      );
    `);
  } catch (error) {
    throw error;
  }
}
// export const initDB = async (): Promise<void> => {
//   const db = await openDB();
//   try {
//     // Example: create a table if it doesn't exist
//     await db.execAsync(`
//       CREATE TABLE IF NOT EXISTS person_cards (
//         id TEXT PRIMARY KEY NOT NULL,
//         name TEXT NOT NULL,
//         birthday TEXT,
//         description TEXT,
//         photoPath TEXT
//       );
//     `);
//   } catch (error) {
//     throw error;
//   }
// }

export const getAllPersons = async (): Promise<PersonCardType[]> => {
  const db = await openDB();
  return new Promise(async (resolve, reject) => {
    try {
      const rows = await db.getAllAsync<PersonCardType>(`SELECT * FROM person_cards;`);
      resolve(rows);
    } catch (error) {
      reject(error);
    }
  });
}

// export const insertPerson = async (personCard: PersonCardType): Promise<void> => {
//   const db = await openDB();
//   const { id, name, birthday, description, photoPath } = personCard;
//   try {
//     await db.runAsync(
//       `INSERT INTO person_cards (id, name, birthday, description, photoPath) VALUES (?, ?, ?, ?, ?);`,
//       [
//         id ?? null,
//         name ?? null,
//         birthday instanceof Date ? birthday.toISOString() : birthday ?? null,
//         description ?? null,
//         photoPath ?? null
//       ]
//     );
//   } catch (error) {
//     throw error;
//   }
// }

export const insertOrReplacePerson = async (person: PersonCardType): Promise<void> => {
  const db = await openDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO person_cards
    (id, name, birthday, description, photoPath)
    VALUES (?, ?, ?, ?, ?);`,
    [
      person.id ?? null,
      person.name ?? null,
      person.birthday instanceof Date
        ? person.birthday.toISOString()
        : person.birthday ?? null,
      person.description ?? null,
      person.photoPath ?? null,
    ]
  );
};

export const updatePerson = async (personCard: PersonCardType): Promise<void> => {
  const db = await openDB();
  const { id, name, birthday, description, photoPath } = personCard;
  try {
    await db.runAsync(
      `UPDATE person_cards SET name = ?, birthday = ?, description = ?, photoPath = ? WHERE id = ?;`,
      [
        name ?? null,
        birthday instanceof Date ? birthday.toISOString() : birthday ?? null,
        description ?? null,
        photoPath ?? null,
        id
      ]
    );
  } catch (error) {
    throw error;
  }
}

export const deletePerson = async (id: string): Promise<void> => {
  const db = await openDB();
  try {
    await db.runAsync(
      `DELETE FROM person_cards WHERE id = ?;`,
      [id]
    );
  } catch (error) {
    throw error;
  }
}
