const path = require('path');
const Database = require('better-sqlite3');
const db_path = path.join(__dirname, 'admin.db');
const db = require('./db');
const database = new Database(db_path, { verbose: console.log });
const hash = require('pbkdf2-password')()
db.settings.database = database;

const ADMIN_USER_TABLE = 'ADMIN_USERS';
const USERNAME_COLUMN = 'USERNAME';
const SALT_COLUMN = 'SALT';
const HASH_COLUMN = 'HASH';

function createAdminUserTable()
{
    db.settings.database = database;
    db.createTable(ADMIN_USER_TABLE, `CREATE TABLE IF NOT EXISTS ${ADMIN_USER_TABLE} (
        id INTEGER PRIMARY KEY,
        ${USERNAME_COLUMN} TEXT NOT NULL,
        ${SALT_COLUMN} TEXT NOT NULL,
        ${HASH_COLUMN} TEXT NOT NULL);`);
}

function insertAdminUser(username, password)
{
    db.settings.database = database;
    hash({password: password}, function(err, pass, salt, hash) {
        if(err){throw err;}
        db.insert(ADMIN_USER_TABLE, 
            [
                USERNAME_COLUMN, 
                SALT_COLUMN,
                HASH_COLUMN],
            [
                username, 
                salt,
                hash]);
    });
}

function updateAdminUsername(old_username, new_username)
{
    db.settings.database = database;
    db.update(
        ADMIN_USER_TABLE, 
        USERNAME_COLUMN, 
        new_username,
        true,
        USERNAME_COLUMN,
        old_username);
}

function updateAdminPassword(old_password_hash, new_password_hash)
{
    db.settings.database = database;
    db.update(
        ADMIN_USER_TABLE, 
        PASSWORD_COLUMN, 
        new_password_hash,
        true,
        PASSWORD_COLUMN,
        old_password_hash);
}

function adminUsername(username)
{
    db.settings.database = database;
    return db.read(ADMIN_USER_TABLE,
        USERNAME_COLUMN,
        username);
}

module.exports = {
    createAdminUserTable,
    insertAdminUser,
    updateAdminUsername,
    updateAdminPassword,
    adminUsername
}