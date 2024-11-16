import { Event } from '../models/Event.js';
import { User } from '../models/user.js';

export async function buyTicket(req, res) {
    const { id, token, isVip } = req.body;
    try {

        const buyerDets = await User.findOne({ "tokens.token": token });


        await Event.findOne({ _id: id }).then((foundEvent) => {
            if (!foundEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }

            if (foundEvent.eventDetails.eventStatus !== 'pending') {
                return res.status(400).json({ success: false, error: 'Event is already completed!' });
            }

            if (buyerDets.email === foundEvent.organizerDetails.email) {
                return res.status(400).json({ success: false, error: 'You cannot buy tickets for your own event' });
            }

            const isAttendeeExisted = foundEvent.attendees.filter((currElem) => {
                return currElem.buyerDets.email === buyerDets.email
            })

            if (isAttendeeExisted.length !== 0) {
                return res.status(400).json({ success: true, error: 'You have already bought a ticket for this' })
            }

            let increasedEventSlot = foundEvent.attendees.length + 1;
            console.log(increasedEventSlot)
            if (increasedEventSlot <= foundEvent.eventDetails.eventSlots) {

                foundEvent.attendees.push({
                    buyerDets: {
                        username: buyerDets.username,
                        email: buyerDets.email
                    },
                    isVip
                })

                foundEvent.save();
                return res.status(200).json({ success: true, message: `You successfully got a ${isVip ? 'VIP' : 'general'} ticket.` });
            } else {
                return res.status(400).json({ success: false, error: 'Event is fully booked' });
            }

        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

export async function getMyTickets(req, res) {
    const { token, page, limit = 10 } = req.query;

    try {
        const user = await User.findOne({ "tokens.token": token }).select("email")
        const events = await Event
            .find({
                attendees: {
                    $elemMatch: { "buyerDets.email": user.email }
                }
            })
            .select("_id eventDetails")
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
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: "Something went wrong, try again later." });
    }
}

// optional

export async function refundTicket(req, res) {

}