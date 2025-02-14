const calendarService = require('../services/calendarService');

const getEvents = async (req, res) => {
    const { day } = req.params;

    try {
        const events = await calendarService.getEventsForDay(day);
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).send('Error fetching events');
    }
};

const createEvent = async (req, res) => {
    const { summary, description, startTime, endTime } = req.body;

    try {
        const event = await calendarService.createEvent(summary, description, startTime, endTime);
        res.status(200).json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).send('Error creating event');
    }
};

const createEventBooking = async ({ summary, description, startTime, endTime }) => {
    try {
        const event = await calendarService.createEvent(summary, description, startTime, endTime);
        return event;  // You can return the event to handle it further if needed
    } catch (error) {
        console.error('Error creating event:', error);
        throw new Error('Error creating event');
    }
};

module.exports = { getEvents, createEvent, createEventBooking };
