import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Loader from '../components/Loader';
import { useGetEventsQuery, useBuyTicketMutation } from '../RTK/ApiRequests';
import { FaTicketAlt, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const Home = ({ token }) => {
  const [page, setPage] = useState(1);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [buyTicket] = useBuyTicketMutation();
  const navigate = useNavigate();

  const buyTicketFunc = async (ticketType, eventId) => {
    if (window.confirm(`Are you sure you want to buy the ${ticketType} ticket?`)) {
      const res = await buyTicket({
        id: eventId,
        token,
        isVip: ticketType === 'VIP',
      });
      if (!res.error) {
        setSuccessText(res.data.message);
        setTimeout(() => setSuccessText(''), 3000);
      } else {
        setErrorText(res.error.data.error);
        setTimeout(() => setErrorText(''), 3000);
      }
    }
  };

  const handleLogout = async () => {
    await Cookies.remove('tok-uid');
    window.location.href='/auth'
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = now.toLocaleDateString(undefined, options);
      const formattedTime = now.toLocaleTimeString();
      setCurrentDateTime(`${formattedDate} | ${formattedTime}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data, isLoading, isError } = useGetEventsQuery({ page });

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !data?.data?.events.length) {
    return <Wrapper>No events found!</Wrapper>;
  }

  const { events, totalPages } = data.data;

  return (
    <Wrapper>
      <Header>
        <DateTime>{currentDateTime}</DateTime>
        <NavButtons>
          <Button onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </Button>
          <Button onClick={() => navigate('/my-events')}>
            <FaCalendarAlt /> My Events
          </Button>
          <Button onClick={() => navigate('/tickets')}>
            <FaTicketAlt /> Tickets
          </Button>
        </NavButtons>
      </Header>
      <h1>Welcome To The Latest Events</h1>
      {successText && <Popup type="success">{successText}</Popup>}
      {errorText && <Popup type="error">{errorText}</Popup>}
      <CardContainer>
        {events.map((event) => (
          <Card key={event._id}>
            <Title>{event.eventDetails.title}</Title>
            <Description>{event.eventDetails.description}</Description>
            <Details>
              <span>
                <strong>Date:</strong> {event.eventDetails.date}
              </span>
              <span>
                <strong>Time:</strong> {event.eventDetails.time}
              </span>
              <span>
                <strong>Location:</strong> {event.eventDetails.location}
              </span>
              <span>
                <strong>Slots:</strong> {event.attendees.length}/{event.eventDetails.eventSlots}
              </span>
              <Status status={event.eventDetails.eventStatus}>
                {event.eventDetails.eventStatus}
              </Status>
            </Details>
            <Buttons>
              <Button onClick={() => buyTicketFunc('General', event._id)}>
                General Ticket
              </Button>
              <Button onClick={() => buyTicketFunc('VIP', event._id)} variant="vip">
                VIP Ticket
              </Button>
            </Buttons>
          </Card>
        ))}
      </CardContainer>
      <Pagination>
        <button disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
          Next
        </button>
      </Pagination>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  font-size: 3rem;
  padding: 2rem;
  text-align: center;

  h1 {
    color: #ff6a00;
    margin-bottom: 2rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const DateTime = styled.div`
  font-size: 1.5rem;
  color: #495057;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  background-color: ${(props) => (props.variant === 'vip' ? '#ff6a00' : '#007bff')};
  color: white;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.variant === 'vip' ? '#d55400' : '#0056b3')};
  }

  svg {
    font-size: 1.2rem;
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 2rem;
  margin: 2rem 0;
`;

const Card = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: left;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 50rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #343a40;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 1.3rem;
  color: #6c757d;
  margin-bottom: 1rem;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1.3rem;
  color: #495057;

  span {
    strong {
      color: #212529;
    }
  }
`;

const Status = styled.span`
  font-weight: bold;
  color: ${(props) => (props.status === 'pending' ? '#ffc107' : '#28a745')};
`;

const Buttons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Popup = styled.div`
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${(props) => (props.type === 'success' ? '#28a745' : '#dc3545')};
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Pagination = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    background-color: #ff6a00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background-color: #d55400;
    }
  }

  span {
    font-size: 1.5rem;
    color: #495057;
  }
`;

export default Home;
