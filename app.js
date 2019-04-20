const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const favicon = require('serve-favicon');
const path = require('path');
const mongoose = require('mongoose');
const bcrybt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());
app.use(favicon(path.join(__dirname,'assets','favicon.ico')));

const user = userId => {
    return User.findById(userId)
        .then(user => {
            return {
                ...user._doc,
                // createdEvents: events.bind(this, user._doc.createdEvents)
            };
        })
        .catch(error => {
            throw error
        });
}

// const events = eventIds => {
//     return Event.find({ _id: {$in: eventIds} })
//         .then(events => {
//             return events.map(event => {
//                 return {
//                     ...event._doc,
//                     creator: user.bind(this, event.creator)
//                 };
//             });
//         })
//         .catch(error => {
//             throw error
//         })
// }

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
            creator: User
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvent: [Event!]
        }

        input EventInput {
            title: String
            description: String
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }`
    ),
    rootValue: {
        events: () => {
           return  Event.find().populate('creator')
            .then(events => {
                return events.map(event => {
                    return {
                        ...event._doc,
                        creator: user.bind(this, event._doc.creator)
                    }
                })
            })
        },
        createEvent: args => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: args.eventInput.price,
                date: new Date().toISOString(),
                creator: '5cbb76188096133eebd722be'
            });
            let createdEvent;
            return event
                .save()
                .then( res => {
                    createdEvent = { ...res._doc };
                    return User.findById('5cbb76188096133eebd722be');
                })
                .then(user => {
                    if(!user) {
                        throw new Error('Creator not found!')
                    }
                    user.createdEvents.push(event);
                    return user.save();
                })
                .then( res => {
                    return createdEvent;
                })
                .catch( error => {
                    console.error(error);
                    throw error;
                });
        },
        createUser: args => {
            return User.findOne({ email: args.userInput.email})
                .then(user => {
                    if(user) {
                        throw new Error('User already exists.')
                    }
                    return bcrybt.hash(args.userInput.password, 12)
                })
                .then( hashedPass => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPass
                    });
                    return user.save();
                })
                .then( res => {
                    return { ...res._doc, password: null }
                })
                .catch( error => {
                    throw error
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