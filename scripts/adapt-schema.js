// Utilitaire pour adapter le schéma Prisma en fonction du provider
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Pour SQLite, supprimer les types natifs non supportés
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
  console.log('Adaptation du schéma pour SQLite...');
  
  // Supprimer @db.Text
  schema = schema.replace(/@db\.Text/g, '');
  
  // Remplacer Decimal par Float pour SQLite
  schema = schema.replace(/Decimal\s+@db\.Decimal\(\d+,\d+\)/g, 'Float');
  
  // Sauvegarder le schéma adapté
  fs.writeFileSync(schemaPath, schema);
  console.log('Schéma adapté pour SQLite');
} else {
  console.log('Schéma configuré pour MySQL/PostgreSQL');
}