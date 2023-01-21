const express = require('express');
const path = require('path');
const body_parser = require('body-parser');
const fs = require('fs');
const db = require('./service/sql');
const multer = require('multer');
const app = express();
const port = 50034;

/* Setup App */
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: false })); // <--- middleware configuration
app.use(body_parser.json());
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, `${__dirname}/public/images/blog`);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

app.get('/', (req, res) => {
    let context = {};
    const DEFAULT_THEME = 'PHILOSOPHY';
    db.createBlogThemeTable();
    db.createBlogTable(DEFAULT_THEME);
    if(!db.checkIfBlogThemeExists(DEFAULT_THEME)) {
        db.insertBlogTheme(DEFAULT_THEME);
    }
    res.render('index', context);
});

app.get('/blog/:theme/:id', (req, res) => {
    let blog_id = req.params.id;
    let blog_theme = req.params.theme;
    let blog = db.getBlog(blog_theme, blog_id);
    let context = {
        theme: blog_theme,
        subject: blog.SUBJECT,
        author: blog.AUTHOR,
        content: blog.CONTENT,
        creation_time: blog.CREATION_TIME
    };
    res.render('blog', context);
});

app.get('/blog_write', (req, res) => {
    let themes = db.getBlogThemes();
    let context = {themes: themes};
    res.render('blog_write', context);
});

app.post('/blog_write', upload.array('FILES'), (req, res) => {
    let subject = req.body.SUBJECT;
    let author = req.body.AUTHOR;
    let content = req.body.CONTENT;
    let theme = req.body.THEME;
    console.log(theme);
    db.insertBlog(theme, subject, author, content);
    res.redirect('/');
});

app.get('/solutions', (req, res) => {
    let context = {};
    res.render('solutions', context);
});

app.get('/videos', (req, res) => {
    let context = {};
    res.render('videos', context);
});

app.get('/projects/jmap', (req, res) => {
    let context = {};
    res.render('jmap', context);
});

app.get('/projects/jmap/:map_name', (req, res) => {
    let map_name = req.params.map_name;
    let context = {map_name: map_name};
    res.render('jmap_loaded', context);
});

app.post('/projects/jmap/:map_name', (req, res) => {
    let json = req.body;
    let json_string = JSON.stringify(json, null, 3);
    let map_name = req.params.map_name;
    fs.writeFile(`${__dirname}/public/data/${map_name}.json`, json_string, (err) => {
        if(err) {
            console.log(err);
            res.send(err.message);
        }
        else {
            console.log(`${map_name}.json wrote succesfully!`);
            res.send(`${map_name}.json wrote succesfully!`);
        }
    });
});

app.get('/projects/jmap/:map_name/data', function(req, res){
    let map_name = req.params.map_name;
    fs.readFile(`${__dirname}/public/data/${map_name}.json`, (err, data) => {
        if(err){res.send(err.message);}
        res.send(data);
    });
});

app.get('/misc/budget', (req, res) => {

    const budget_page = path.join(__dirname, 'misc/budget.html');
    res.sendFile(budget_page);

});

app.listen(port, () => {
    console.log(`App listening at 192.168.0.13 on port ${port}`);
});