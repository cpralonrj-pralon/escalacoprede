const fs = require('fs');
const postgres = require('postgres');

const sqlFile = fs.readFileSync('supabase_schema.sql', 'utf8');

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:SENHA@db.yyjflsyaokosmfouvxbj.supabase.co:5432/postgres';
const sql = postgres(databaseUrl, { ssl: 'require' });

async function run() {
    try {
        console.log('Executando script SQL...');
        await sql.unsafe(sqlFile);
        console.log('Script SQL executado com sucesso!');
    } catch (error) {
        console.error('Erro ao executar SQL:', error);
    } finally {
        await sql.end();
    }
}

run();
