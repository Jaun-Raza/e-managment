import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const Api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BACKEND_URL,
        prepareHeaders: (headers, { pageParam }) => {
            if (pageParam) {
                headers.set('page', String(pageParam));
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        // Auth Requests
        getUserData: builder.query({
            query: (email) => `auth/userData?email=${email}`,
        }),
        signUp: builder.mutation({
            query: (data) => ({
                url: 'auth/signup',
                method: 'POST',
                body: data,
            }),
        }),
        login: builder.mutation({
            query: (data) => ({
                url: 'auth/login',
                method: 'POST',
                body: data,
            }),
        }),

        // Events Requests
        getEvents: builder.query({
            query: (data) => `events/getEvents?page=${data.page}`,
        }),
        getMyEvents: builder.query({
            query: (data) => ({
                url: `events/getMyEvents?token=${data.token}&page=${data.page}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${data.token}`
                }
            }),
        }),
        eventDetail: builder.query({
            query: (eventId) => `events/eventDetail?eventId=${eventId}`,
        }),
        createEvent: builder.mutation({
            query: (data) => ({
                url: 'events/createEvent',
                method: 'POST',
                body: data,
                headers: {
                    Authorization: `Bearer ${data.token}`
                }
            }),
        }),
        editEvent: builder.mutation({
            query: (data) => ({
                url: 'events/editEvent',
                method: 'POST',
                body: data,
                headers: {
                    Authorization: `Bearer ${data.token}`
                }
            }),
        }),
        deleteEvent: builder.mutation({
            query: (data) => ({
                url: 'events/deleteEvent',
                method: 'POST',
                body: data,
                headers: {
                    Authorization: `Bearer ${data.token}`
                }
            }),
        }),

        // Tickets Requests
        getMyTickets: builder.query({
            query: (data) => ({
                url: `tickets/getMyTickets?token=${data.token}&page=${data.page}`,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${data.token}`
                }
            }),
        }),
        buyTicket: builder.mutation({
            query: (data) => ({
                url: 'tickets/buyTicket',
                method: 'POST',
                body: data,
                headers: {
                    Authorization: `Bearer ${data.token}`
                }
            }),
        }),
    }),
});

export const {
    useGetUserDataQuery,
    useSignUpMutation,
    useLoginMutation,
    useGetEventsQuery,
    useGetMyEventsQuery,
    useEventDetailQuery,
    useCreateEventMutation,
    useEditEventMutation,
    useDeleteEventMutation,
    useGetMyTicketsQuery,
    useBuyTicketMutation,
} = Api;
