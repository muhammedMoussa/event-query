const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const favicon = require('serve-favicon');
const path = require('path');

const app = express();
const events = [];

app.use(bodyParser.json());
app.use(favicon(path.join(__dirname,'assets','favicon.ico')));

app.get('/', (req, res, next) => {
    res.send('<a href="http://localhost:3000/graphql">Play With Api?</a>')
})

/* GraphQl Configuration */
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String
            description: String
            price: Float!
            date: String!
        }

        input EventInput {
            title: String
            description: String
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(input: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }`
    ),
    rootValue: {
        events: () => {
            return events;
        },
        createEvent: args => {
            const event = {
                _id: Math.random().toString(),
                title: args.input.title,
                description: args.input.description,
                price: args.input.price,
                date: new Date().toISOString()
            }
            events.push(event);
            return event;
        }
    },
    graphiql: true
}));

app.listen(3000);