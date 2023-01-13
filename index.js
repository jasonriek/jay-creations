const express = require('express');
const path = require('path');
const body_parser = require('body-parser');
const fs = require('fs');
const db = require('./service/sql');
const app = express();
const port = 50034;

/* Setup App */
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: false })); // <--- middleware configuration
app.use(body_parser.json());
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

app.get('/', (req, res) => {
    let context = {};
    db.createBlogTable();
    res.render('index', context);
});

app.get('/blog/:id', (req, res) => {
    let blog_id = req.params.id
    let blog = db.getBlog(blog_id);
    let context = {
        subject: blog.SUBJECT,
        author: blog.AUTHOR,
        content: blog.CONTENT,
        creation_time: blog.CREATION_TIME
    };
    res.render('blog', context);
});

app.get('/blog_write', (req, res) => {
    let context = {};
    res.render('blog_write', context);
});

app.post('/blog_write', (req, res) => {
    let subject = req.body.SUBJECT;
    let author = req.body.AUTHOR;
    let content = req.body.CONTENT;
    console.log(subject);
    console.log(author);
    console.log(content);
    db.insertBlog(subject, author, content);
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

app.get('/projects/jmap/conciousness', (req, res) => {
    let context = {};
    res.render('jmap_loaded', context);
});

app.post('/projects/jmap/conciousness', (req, res) => {
    let json = req.body;
    let json_string = JSON.stringify(json, null, 3);
    fs.writeFile(`${__dirname}/public/data/consciousness.json`, json_string, (err) => {
        if(err) {
            console.log(err);
            res.send(err.message);
        }
        else {
            console.log('conciousness.json wrote succesfully!');
            res.send('conciousness.json wrote succesfully!');
        }
    });
});

app.get('/projects/jmap/conciousness/data', function(req, res){
    fs.readFile(`${__dirname}/public/data/consciousness.json`, (err, data) => {
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