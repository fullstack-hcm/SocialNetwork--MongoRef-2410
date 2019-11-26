let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
let app = express();
let expressSession = require('express-session');
/**
 * internal import
 */
let { USER_ROUTE } = require('./routes/User');

app.use(expressSession({
    secret: 'MERN2410',
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 10 * 60 * 1000 // milli
    }
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views/');

app.use('/user', USER_ROUTE);

app.get('/', (req, res) => {
    res.json({ message: 'server connected' });
});

let uri = `mongodb://localhost/mongo_ref_2410_2`;

mongoose.connect(uri);
mongoose.connection.once('open', () => {
    console.log(`mongodb connected`);
    app.listen(3000, () => console.log(`server start at port 3000`));
});
