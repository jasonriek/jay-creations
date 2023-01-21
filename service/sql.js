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

const BLOG_THEME_TABLE = 'BLOG_THEME';
const BLOG_THEME_COL = 'THEME';

function createBlogTable(theme)
{
    theme = theme.trim().toUpperCase();
    db.createTable(BLOG_TABLE, `CREATE TABLE IF NOT EXISTS ${theme}_${BLOG_TABLE} (
        id INTEGER PRIMARY KEY,
        ${AUTHOR_COLUMN} TEXT NOT NULL,
        ${SUBJECT_COLUMN} TEXT NOT NULL,
        ${CONTENT_COLUMN} TEXT NOT NULL,
        ${CREATION_TIME_COLUMN} DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL);`);
}

function createBlogThemeTable()
{
    db.createTable(BLOG_THEME_TABLE, `CREATE TABLE IF NOT EXISTS ${BLOG_THEME_TABLE} (
        id INTEGER PRIMARY KEY,
        ${BLOG_THEME_COL} TEXT NOT NULL
    );`)
}

/*
function createAdminUserTable()
{
    db.createTable(ADMIN_USER_TABLE, `CREATE TABLE IF NOT EXISTS ${ADMIN_USER_TABLE} (
        id INTEGER PRIMARY KEY,
        ${USERNAME_COLUMN} TEXT NOT NULL,
        ${SALT_COLUMN} TEXT NOT NULL,
        ${HASH_COLUMN} TEXT NOT NULL);`);
}

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

function insertBlog(theme, subject, author, content)
{
    theme = theme.trim().toUpperCase();
    db.insert(`${theme}_${BLOG_TABLE}`, 
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

function checkIfBlogThemeExists(theme)
{
    return db.read(BLOG_THEME_TABLE, BLOG_THEME_COL, theme);
}

function insertBlogTheme(theme)
{
    db.insert(BLOG_THEME_TABLE, [BLOG_THEME_COL], [theme], false);
}

function getBlogThemes()
{
    let themes = db.readAll(BLOG_THEME_TABLE);
    console.log(themes);
    return themes;
}

function getBlogs(theme)
{
    theme = theme.trim().toUpperCase();
    return db.readAll(`${theme}_${BLOG_TABLE}`);
}

function getBlog(theme, id)
{
    theme = theme.trim().toUpperCase();
    return db.read(`${theme}_${BLOG_TABLE}`, 'id', id);
}

module.exports = {
    createBlogTable,
    insertBlog,
    getBlog,
    getBlogs,
    createBlogThemeTable,
    insertBlogTheme,
    getBlogThemes,
    checkIfBlogThemeExists
}