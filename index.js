const express = require('express');
const path = require('path');
const body_parser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 50034;

/* Setup App */
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: false })); // <--- middleware configuration
app.use(body_parser.json());


app.get('/', (req, res) => {
    let context = {};
    res.render('index', context);
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