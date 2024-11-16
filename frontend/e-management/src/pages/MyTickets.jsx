import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useGetMyTicketsQuery } from '../RTK/ApiRequests';
import Loader from '../components/Loader';

const MyTickets = ({ token }) => {
    const navigate = useNavigate(); 
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useGetMyTicketsQuery({ token, page });

    if (isLoading) return <Loader />;
    if (isError || !data?.success) return <Wrapper>Error fetching tickets</Wrapper>;
    if (data?.data?.events.length === 0) return <Wrapper>No tickets found</Wrapper>;

    return (
        <Wrapper>
            <GoBackButton onClick={() => navigate('/')}>Go Back</GoBackButton>
            <Title>My Tickets</Title>
            <TicketList>
                {data?.data?.events.map((event) => (
                    <TicketCard key={event._id}>
                        <CardTitle>{event.eventDetails.title}</CardTitle>
                        <CardInfo>
                            <p>{event.eventDetails.description}</p>
                            <p><strong>Date:</strong> {event.eventDetails.date}</p>
                            <p><strong>Time:</strong> {event.eventDetails.time}</p>
                            <p><strong>Location:</strong> {event.eventDetails.location}</p>
                            <p><strong>Slots:</strong> {event.eventDetails.eventSlots}</p>
                            <p style={{
                                color: event.eventDetails.eventStatus === 'pending' ? '#ffc107' : '#28a745'
                            }}>{event.eventDetails.eventStatus}</p>
                        </CardInfo>
                    </TicketCard>
                ))}
            </TicketList>
            <Pagination>
                <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                    Previous
                </button>
                <span>Page {page} of {data?.data?.totalPages}</span>
                <button onClick={() => setPage((prev) => (prev < data?.data?.totalPages ? prev + 1 : prev))} disabled={page === data?.data?.totalPages}>
                    Next
                </button>
            </Pagination>
        </Wrapper>
    );
};

const Wrapper = styled.section`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    color: #333;
    position: relative; 
`;

const Title = styled.h1`
    font-size: 5rem;
    margin-bottom: 20px;
    text-align: center;
    color: #ff6a00; 
`;

const GoBackButton = styled.button`
    position: absolute;
    top: 20px;
    left: 20px;
    padding: 10px 20px;
    background: #ff6a00;
    color: white;
    font-size: 1.5rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: #e55d00;
    }
`;

const TicketList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const TicketCard = styled.div`
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    
    &:hover {
        transform: translateY(-5px);
    }
`;

const CardTitle = styled.h2`
    font-size: 2.5rem;
    color: #ff6a00; 
    margin-bottom: 10px;
`;

const CardInfo = styled.div`
    font-size: 0.9rem;
    line-height: 1.6;

    p {
        margin: 5px 0;
    }

    strong {
        color: #555;
    }
`;

const Pagination = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;

    button {
        padding: 10px 15px;
        border: none;
        border-radius: 5px;
        background: #ff6a00; 
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
            background: #e55d00;
        }

        &:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
    }

    span {
        font-size: 1.5rem;
        color: #333;
    }
`;

export default MyTickets;
