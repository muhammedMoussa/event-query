const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const favicon = require('serve-favicon');
const path = require('path');
const mongoose = require('mongoose');

const isAuth = require('./middleware/is-auth');
const graphiqlSchema = require('./graphql/schema/index');
const graphiqlResolvers = require('./graphql/resolvers/index');

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
});
app.use(isAuth);
app.use(favicon(path.join(__dirname,'assets','favicon.ico')));

app.get('/', (req, res, next) => {
    res.send('<a href="http://localhost:3003/graphql">Play With Api?</a>')
})

/* GraphQl Configuration */
app.use('/graphql', graphqlHttp({
    schema: graphiqlSchema,
    rootValue: graphiqlResolvers,
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-lcraj.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,{ useNewUrlParser: true })
.then( () => {
    app.listen(3003);
}).catch( error => {
    console.error(error);
})