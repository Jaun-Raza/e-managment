import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    organizerDetails: {
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
    },
    eventDetails: {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        eventSlots: {
            type: Number,
            required: true
        },
        eventStatus: {
            type: String,
            required: true,
            default: "pending"
        },
    },
    attendees: {
        type: Array,
        default: [],
        required: true
    }
}, { timestamps: true })

export const Event = mongoose.model('Event', eventSchema)