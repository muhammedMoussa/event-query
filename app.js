const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const favicon = require('serve-favicon');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(favicon(path.join(__dirname,'assets','favicon.ico')));

app.get('/', (req, res, next) => {
    res.send('<a href="http://localhost:3000/graphql">Play With Api?</a>')
})

/* GraphQl Configuration */
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }`
    ),
    rootValue: {
        events: () => {
            return ['AI', 'BI', 'ML']
        },
        createEvent: args => {
            const eventName = args.name;
            return eventName;
        }
    },
    graphiql: true
}));

app.listen(3000);