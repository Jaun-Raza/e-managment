import express from "express"
import { getUserData, logIn, signUp } from "../controllers/auth.js";
import { signToken, verifyToken } from '../middlewares/authMiddleware.js'
import { createEvent, editEvent, deleteEvent, getEvents, getMyEvents, eventDetail } from "../controllers/events.js";
import { buyTicket, getMyTickets } from "../controllers/ticket.js";

export const Router = express.Router();

Router.route('/').get((req, res) => {
    res.send("Hello Dear Fella!")
})

// Auth
Router.route('/auth/userData').get(verifyToken, getUserData);
// 
Router.route('/auth/signup').post(signUp);
Router.route('/auth/login').post(signToken, logIn);

// Events 
Router.route('/events/getEvents').get(getEvents);
Router.route('/events/getMyEvents').get(verifyToken, getMyEvents);
Router.route('/events/eventDetail').get(eventDetail);
// 
Router.route('/events/createEvent').post(verifyToken, createEvent);
Router.route('/events/editEvent').post(verifyToken, editEvent);
Router.route('/events/deleteEvent').post(verifyToken, deleteEvent);

// Tickets
Router.route('/tickets/getMyTickets').get(verifyToken, getMyTickets);
// 
Router.route('/tickets/buyTicket').post(verifyToken, buyTicket);