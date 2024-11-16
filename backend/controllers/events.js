import { Event } from '../models/Event.js';
import { User } from '../models/User.js';

import nodemailer from 'nodemailer';
import cron from 'node-cron'

export async function createEvent(req, res) {
    const { token, eventDetails } = req.body;

    const user = await User.findOne({ "tokens.token": token }).select("email username")

    const newEvent = new Event({
        organizerDetails: {
            email: user.email,
            username: user.username
        },
        eventDetails
    });

    try {
        newEvent.save();
        return res.status(200).json({ success: true, message: "Event is successfully created." });
    } catch (error) {
        console.log(err)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function editEvent(req, res) {
    const { id, eventDetails } = req.body;

    try {
        await Event.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    [`eventDetails`]: eventDetails
                }
            },
            { new: true }
        )

        return res.status(200).json({ success: true, message: "Event is successfully updated." });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function deleteEvent(req, res) {
    const { eventId } = req.body;

    try {
        await Event.findOneAndDelete({ _id: eventId });

        return res.status(200).json({ success: true, message: "Event is successfully deleted." });
    } catch (error) {
        console.log(err)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function getEvents(req, res) {
    const { page, limit = 20 } = req.query;

    try {
        const events = await Event
            .find({})
            .select("_id eventDetails attendees.length")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)

        const eventCount = await Event.countDocuments({});

        return res.status(200).json({
            success: false, data: {
                events,
                totalPages: Math.ceil(eventCount / limit)
            }
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function getMyEvents(req, res) {
    const { token, page, limit = 10 } = req.query;

    try {
        const user = await User.findOne({ "tokens.token": token }).select("email")
        const events = await Event
            .find({ "organizerDetails.email": user.email })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)

        const eventCount = await Event.countDocuments({});

        return res.status(200).json({
            success: true, data: {
                events,
                totalPages: Math.ceil(eventCount / limit)
            }
        })
    } catch (error) {
        console.log(err)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function eventDetail(req, res) {
    const { eventId } = req.query;

    try {
        const eventDets = await Event.findOne(
            { _id: eventId },
        )

        if (!eventDets) {
            return res.status(404).json({ success: false, error: "Event not found." });
        }

        return res.status(200).json({ success: true, eventDetails: eventDets });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

cron.schedule('0 0 * * * *', async () => {
    console.log('Checking/Sending notifications...');

    const currentDate = new Date();
    const oneDayAhead = new Date(currentDate);

    oneDayAhead.setDate(currentDate.getDate() + 1);

    oneDayAhead.setHours(0, 0, 0, 0);

    const oneDayAheadISO = oneDayAhead.toLocaleString();  
    const oneDayAheadDate = `${oneDayAheadISO.slice(6, 10)}-${oneDayAheadISO.slice(0, 2)}-${oneDayAheadISO.slice(3, 5)}`;

    try {
        const oneDayAheadEventsAttendeesEmails = await Event.find({"eventDetails.date": oneDayAheadDate})

        const emailConfig = {
            service: 'gmail',
            auth: {
                user: process.env.USER,
                pass: process.env.PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        };

        const transporter = nodemailer.createTransport(emailConfig);
        
        for (const events of oneDayAheadEventsAttendeesEmails) {
            const sendEmailPromises = events.attendees.map(async (obj) => {
                const message = {
                    from: "'Event Manager' <noreply@gmail.com>",
                    to: obj.buyerDets.email,
                    subject: "Reminder: Your Event is Tomorrow!",
                    html: `
                        <html>
                        <body style="font-family: Google Sans;">
                            <h2>Hi ${obj.buyerDets.username},</h2>
                            <p>This is a friendly reminder that the event you purchased a ticket for is happening tomorrow!</p>
                            <p><strong>Event Details:</strong></p>
                            <ul>
                                <li><strong>Event Name:</strong> ${events.eventDetails.title}</li>
                                <li><strong>Date:</strong> ${events.eventDetails.date}</li>
                                <li><strong>Time:</strong> ${events.eventDetails.time}</li>
                                <li><strong>Location:</strong> ${events.eventDetails.location}</li>
                            </ul>
                            <p>We look forward to seeing you there!</p>
                            <p>If you have any questions or need further assistance, feel free to reply to this email or contact our support team.</p>
                            <p>Best regards,</p>
                            <p><strong>Event Manager Team</strong></p>
                        </body>
                        </html>
                    `
                };
                
    
                return transporter.sendMail(message);
            });
    
            await Promise.all(sendEmailPromises);
        }

        console.log('Sent notifications...');
    } catch (err) {
        console.error('Error during sending notifications:', err);
    }
});

cron.schedule('0 0 * * * *', async () => {
    console.log('Checking pending events...');

    const currentDate = new Date();

    try {
        
        await Event.find({"eventDetails.date": currentDate.toISOString().slice(0, 10)}).then((foundEvents) => {
            for (const events of foundEvents) {
                events.eventDetails.eventStatus = "Completed"
                events.save();
            }
        })
        console.log('Handled pending events...');
    } catch (err) {
        console.error('Error during sending notifications:', err);
    }
});