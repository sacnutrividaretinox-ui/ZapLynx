// db.js
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

// Definição do arquivo JSON onde os dados ficarão
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { instancias: [], mensagens: [] });

// Inicializa o banco
await db.read();
db.data ||= { instancias: [], mensagens: [] };
await db.write();

export default db;
