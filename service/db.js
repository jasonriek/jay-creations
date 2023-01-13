const path = require('path');
const db_path = path.join(__dirname, 'jc.db');
const Database = require('better-sqlite3');
const database = new Database(db_path, { verbose: console.log });

// Creates a single SQLite table
function createTable(table_name, sql) {
    try {
        const table_create_query = database.prepare(sql);
        table_create_query.run();
        console.log(`Successful creation of "${table_name}" table!`);
    }
    catch(error){return console.error(error)}
}

// SETUP the  C.R.U.D  (*** CREATE * READ * UPDATE * DELETE ***) 
// ----------------------------------------------------------------------------------------------

// *CREATE ->
// Insert a row into a specified table in the database.
function insert(table_name, columns, values, append_datetime=false) {
    try {
        let value_place_holder = values.map(function (value) {return '?';});
        let sql = '';
        if(append_datetime) {
            sql = `INSERT INTO ${table_name} (${columns.join(',')}) VALUES (${value_place_holder.join(',')},DATETIME('now'));`;
        }
        else {
                sql = `INSERT INTO ${table_name} (${columns.join(',')}) VALUES (${value_place_holder.join(',')});`;
        }
        const insert_query = database.prepare(sql);
        insert_query.run(values);
    }
    catch(error){return console.error(error);}
}

// *READ ->
// Read a row from specified column and condition.
function read(table_name, condition_column, condition_value) {
    try {
        const sql = `SELECT * FROM ${table_name} WHERE ${condition_column} = ?;`;
        const read_query = database.prepare(sql);
        let row = read_query.get([condition_value]);
        return row;
    }
    catch(error){return console.error(error);}
}

// READ ALL
// Read whole table
function readAll(table_name) {
    try {
        const sql = `SELECT * FROM ${table_name};`;
        const read_query = database.prepare(sql);
        let rows = read_query.all([condition_value]);
        return rows;
    }
    catch(error){return console.error(error);}
}

// *UPDATE ->
// Updates a value from specified column and condition.
function update(table_name, update_column, update_value, has_condition=false, condition_column=null, condition_value=null) {
    try {
        let sql = '';
        if(has_condition) {
            sql = `UPDATE ${table_name} SET ${update_column} = ? WHERE ${condition_column} = ?;`;
        } 
        else {
            sql = `UPDATE ${table_name} SET ${update_column} = ?`;
        }

        const update_query = database.prepare(sql);
        if(has_condition) {
            update_query.run([update_value, condition_value]);
        }
        else {
            update_query.run([update_value]);
        }   
    }
    catch(error){console.error(error);}
}

// *DELETE ->
// Delete a row from the table that meets the condition value.
function remove(table_name, condition_column, condition_value) {
    try {
        const delete_query = database.prepare(`DELETE FROM ${table_name} WHERE ${condition_column} = ?;`);
        delete_query.run([condition_value]);
    }
    catch(error){return console.error(error);}
}
// ----------------------------------------------------------------------------------------------

module.exports = {
    createTable,
    insert,
    read,
    readAll,
    update,
    remove,
    database
}