'use strict'
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use('public', express.static('./public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');


// ----------------------
// ------- Routes -------
// ----------------------
app.get('/', homeFun);
app.get('/home', homeFun2);
app.post('/favo', favFun1);
app.get('/favo2', favFun2);
app.get('/details/:id', detailsFun);
app.put('/update/:id', updateFun);
app.delete('/delete/:id', deleteFun);
// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------

app.get('/', homeFun);
function homeFun(req, res) {
    res.render('home1');
}



function homeFun2(req, res) {
    const url = 'http://hp-api.herokuapp.com/api/characters';
    superagent.get(url).then(data => {
        let harry = data.body.map(newData => {
            return new Harry(newData)
        });
        res.render('home', { ejsData: harry });
    }).catch(error => console.log(`00Could not connect to database\n${error}`));
};

function Harry(val) {
    this.image = val.image || 'no image found';
    this.name = val.name;
    this.patronus = val.patronus;
    this.alive = val.alive;
}


// -----------------------------------
// --- CRUD Pages Routes functions ---
// -----------------------------------
function favFun1(req, res) {
    const sql = 'INSERT INTO users (image,name,patronus,alive) VALUES ($1,$2,$3,$4);';
    const values = [req.body.image, req.body.name, req.body.patronus, req.body.alive];

    client.query(sql, values).then(data => {
        console.log(data);
        res.redirect('/favo2');
    }).catch(error => console.log(`0Could not connect to database\n${error}`));
}


function favFun2(req, res) {
    const sql = 'SELECT * FROM users;';

    client.query(sql).then(data => {
        console.log(data, 'hhhhhhh');
        res.render('fav', { ejsData2: data.rows });
    }).catch(error => console.log(`1Could not connect to database\n${error}`));
}

//details 
function detailsFun(req, res) {
    const sql = 'SELECT * FROM users WHERE id=$1;';
    const values = [req.params.id];

    client.query(sql, values).then(dataX => {
        res.render('details', { ejsData3: dataX.rows[0] });
    }).catch(error => console.log(`2Could not connect to database\n${error}`));
}


//Update Function
function updateFun(req, res) {
    const sql = 'UPDATE users SET image=$1, name=$2, patronus=$3, alive=$4 WHERE id=$5;';
    const safeValues = [req.body.image, req.body.name, req.body.patronus, req.body.alive, req.params.id];

    client.query(sql, safeValues).then(data => {
        res.redirect(`/details/${req.params.id}`);
    }).catch(error => console.log(`3Could not connect to database\n${error}`));

}


//Delete Function
function deleteFun(req, res) {
    const sql = 'DELETE FROM users WHERE id=$1;';
    const values = [req.params.id];

    client.query(sql, values).then(data => {
        res.redirect('/favo2')
    }).catch(error => console.log(` 4Could not connect to database\n${error}`));
}




// Express Runtime
client.connect().then(() => {
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));
