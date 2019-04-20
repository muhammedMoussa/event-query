const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const favicon = require('serve-favicon');
const path = require('path');
const mongoose = require('mongoose');
const Event = require('./models/event');

const app = express();

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
           return  Event.find().then(events => {
                return events.map(event => {
                    return { ...event._doc }
                })
            })
        },
        createEvent: args => {
            const event = new Event({
                title: args.input.title,
                description: args.input.description,
                price: args.input.price,
                date: new Date().toISOString()
            })
            return event
                .save().then( res => {
                    return { ...res._doc };
                }).catch( error => {
                    console.error(error);
                    throw error;
                });
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-lcraj.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,{ useNewUrlParser: true })
.then( () => {
    app.listen(3000);
}).catch( error => {
    console.error(error);
})