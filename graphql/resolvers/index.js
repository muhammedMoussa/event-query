const bcrybt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const user = async userId => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    }
    catch(error) {
        throw error
    };
};

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: {$in: eventIds} })
        events.map(event => {
            return {
                ...event._doc,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            };
        });
        return events;
    }
    catch (error) {
        throw error
    }
}

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => {
                return {
                    ...event._doc,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            });
        }
        catch(error) {
            throw error
        }
    },
    createEvent: async args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: new Date().toISOString(),
            creator: '5cc1b9cd1fd09c242f2c2c8e'
        });
        let createdEvent;
        try {
            const res = await event.save();
            createdEvent = {
                ...res._doc,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, res.creator),
            };
            const creator = await User.findById('5cc1b9cd1fd09c242f2c2c8e');
            if(!creator) {
                throw new Error('Creator not found!')
            }
            creator.createdEvents.push(event);
            await creator.save();
            return createdEvent;
        }
        catch( error) {
            console.error(error);
            throw error;
        }
    },
    createUser: async args => {
        try {
            const fetchedUser = await User.findOne({ email: args.userInput.email});
            if(fetchedUser) {
                throw new Error('User already exists.')
            }
            const hashedPass = await bcrybt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPass
            })
            const res = await user.save();
            return { ...res._doc, password: null }
        }
        catch(error) {
            throw error
        };
    }
}