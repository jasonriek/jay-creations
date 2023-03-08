const db = require('./db');
db.settings.database = db.database;
//const hash = require('pbkdf2-password')()

const BLOG_TABLE = 'BLOG';
const AUTHOR_COLUMN = 'AUTHOR'
const SUBJECT_COLUMN = 'SUBJECT';
const CONTENT_COLUMN = 'CONTENT';
const CREATION_TIME_COLUMN = 'CREATION_TIME';

const BLOG_THEME_TABLE = 'BLOG_THEME';
const BLOG_THEME_COL = 'THEME';

function createBlogTable(theme)
{
    db.settings.database = db.database;
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
    db.settings.database = db.database;
    db.createTable(BLOG_THEME_TABLE, `CREATE TABLE IF NOT EXISTS ${BLOG_THEME_TABLE} (
        id INTEGER PRIMARY KEY,
        ${BLOG_THEME_COL} TEXT NOT NULL
    );`)
}


function insertBlog(theme, subject, author, content)
{
    db.settings.database = db.database;
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
    db.settings.database = db.database;
    return db.read(BLOG_THEME_TABLE, BLOG_THEME_COL, theme);
}

function insertBlogTheme(theme)
{
    db.settings.database = db.database;
    db.insert(BLOG_THEME_TABLE, [BLOG_THEME_COL], [theme], false);
}

function getBlogThemes()
{
    db.settings.database = db.database;
    let themes = db.readAll(BLOG_THEME_TABLE);
    console.log(themes);
    return themes;
}

function getBlogs(theme)
{
    db.settings.database = db.database;
    theme = theme.trim().toUpperCase();
    return db.readAll(`${theme}_${BLOG_TABLE}`);
}

function getBlogIDs(theme) 
{
    db.settings.database = db.database;
    theme = theme.trim().toUpperCase();
    return db.readFieldsAll(`${theme}_${BLOG_TABLE}`, ['id']);
}

function getBlogCount(theme)
{
    db.settings.database = db.database;
    theme = theme.trim().toUpperCase();
    return db.readAll(`${theme}_${BLOG_TABLE}`).length;
}

function getBlog(theme, id)
{
    db.settings.database = db.database;
    theme = theme.trim().toUpperCase();
    return db.read(`${theme}_${BLOG_TABLE}`, 'id', id);
}

module.exports = {
    createBlogTable,
    insertBlog,
    getBlog,
    getBlogs,
    getBlogCount,
    createBlogThemeTable,
    insertBlogTheme,
    getBlogThemes,
    getBlogIDs,
    checkIfBlogThemeExists
}