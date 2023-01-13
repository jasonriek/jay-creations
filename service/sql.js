const db = require('./db');
//const hash = require('pbkdf2-password')()

const BLOG_TABLE = 'BLOG';
const AUTHOR_COLUMN = 'AUTHOR'
const SUBJECT_COLUMN = 'SUBJECT';
const CONTENT_COLUMN = 'CONTENT';
const CREATION_TIME_COLUMN = 'CREATION_TIME';

const ADMIN_USER_TABLE = 'ADMIN_USERS';
const USERNAME_COLUMN = 'USERNAME';
const SALT_COLUMN = 'SALT';
const HASH_COLUMN = 'HASH';

function createBlogTable()
{
    db.createTable(ADMIN_USER_TABLE, `CREATE TABLE IF NOT EXISTS ${BLOG_TABLE} (
        id INTEGER PRIMARY KEY,
        ${AUTHOR_COLUMN} TEXT NOT NULL,
        ${SUBJECT_COLUMN} TEXT NOT NULL,
        ${CONTENT_COLUMN} TEXT NOT NULL,
        ${CREATION_TIME_COLUMN} DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL);`);
}

function createAdminUserTable()
{
    db.createTable(ADMIN_USER_TABLE, `CREATE TABLE IF NOT EXISTS ${ADMIN_USER_TABLE} (
        id INTEGER PRIMARY KEY,
        ${USERNAME_COLUMN} TEXT NOT NULL,
        ${SALT_COLUMN} TEXT NOT NULL,
        ${HASH_COLUMN} TEXT NOT NULL);`);
}

/*
function insertAdminUser(username, password)
{
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
    return db.read(ADMIN_USER_TABLE,
        USERNAME_COLUMN,
        username);
}

*/

function insertBlog(subject, author, content)
{
    db.insert(BLOG_TABLE, 
        [
            SUBJECT_COLUMN,
            AUTHOR_COLUMN,
            CONTENT_COLUMN,
            CREATION_TIME_COLUMN
        ], 
        [
            subject,
            author,
            content
        ], true);
}

function getBlogs()
{
    return db.readAll(BLOG_TABLE);
}

function getBlog(id)
{
    return db.read(BLOG_TABLE, 'id', id);
}

module.exports = {
    createBlogTable,
    insertBlog,
    getBlog,
    getBlogs
}