const express = require('express');
const path = require('path');
const session = require('express-session');
const login_routes = require('./routes/login');
const body_parser = require('body-parser');
const fs = require('fs');
const db = require('./service/sql');
const multer = require('multer');
//const Gtts = require('gtts');
//const { exec } = require('child_process');
const app = express();
const port = 50034;

/* Setup App */
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: false })); // <--- middleware configuration
app.use(body_parser.json());
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
app.use(session({
    resave: false, // Do not save session if unmodified
    saveUninitialized: false, // Do not create a session until something is stored
    secret: '$$$$SHHHH321987__AJKLSECTRE%$@__'
}));

app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    let err = req.session.error;
    let msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) {res.locals.message = `<p class="msg error">${err}</p>`;}
    if (msg) {res.locals.message = `<p class="msg success">${msg}</p>`;}
    next();
})

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, `${__dirname}/public/images/blog`);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

// LOGIN ROUTES
app.get('/login', login_routes.login_get);
app.get('/logout', login_routes.logout_get);
app.post('/login', login_routes.login_post);

app.get('/blog_write', login_routes.restrict, (req, res) => {
    let themes = db.getBlogThemes();
    let context = {themes: themes};
    res.render('blog_write', context);
});

app.post('/blog_write', (req, res) => {
    let subject = req.body.SUBJECT;
    let author = req.body.AUTHOR;
    let content = req.body.CONTENT;
    let theme = req.body.THEME;
    console.log(theme);
    db.insertBlog(theme, subject, author, content);
    res.redirect('/');
});

app.post('/blog_write/image_upload', upload.single('IMAGE'), (req, res, next) => {
    console.log(JSON.stringify(req.body));
    let image = req.file;
    
    if(!image) {
        const error = new Error('Please choose a file!');
        error.httpStatusCode = 400;
        return next(error);
    }
    let data = JSON.stringify({dest: image.destination});
    console.log(data)
    res.send(data);
});

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
    let blog_count = db.getBlogCount(blog_theme);
    let context = {
        id: blog_id,
        blog_count: blog_count,
        theme: blog_theme,
        subject: blog.SUBJECT,
        author: blog.AUTHOR,
        content: blog.CONTENT,
        creation_time: blog.CREATION_TIME
    };
    res.render('blog', context);
});

/*
app.post('/blog/listen/:theme/:id', (req, res) => {
    let blog_id = req.params.id;
    let blog_theme = req.params.theme;
    let blog = db.getBlog(blog_theme, blog_id);
    let context = {
        id: blog_id,
        theme: blog_theme,
        subject: blog.SUBJECT,
        author: blog.AUTHOR,
        content: blog.CONTENT,
        creation_time: blog.CREATION_TIME
    };
    res.render('blog', context);
    let gtts = new Gtts(context.content.toString(), "en");
    let listen_filename = `${__dirname}/public/data/listen.mp3`;
    //gtts.save(listen_filename, function (err, result) {
        if(err) { throw new Error(err); }
    //    exec(`play '${listen_filename}'`);
    //});
    //console.log(context.content.toString());
   
});
*/


app.get('/solutions', (req, res) => {
    let context = {};
    res.render('solutions', context);
});

app.get('/videos', (req, res) => {
    let context = {};
    res.render('videos', context);
});

app.get('/music', (req, res) => {
    let context = {};
    res.render('music', context);
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

if(module.children) {
    app.listen(port, () => {
        console.log(`App listening at 192.168.0.13 on port ${port}`);
    });
}
