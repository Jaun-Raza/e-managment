import React, { useState } from 'react';
import styled from 'styled-components';
import {
    useGetMyEventsQuery,
    useEventDetailQuery,
    useCreateEventMutation,
    useEditEventMutation,
    useDeleteEventMutation
} from '../RTK/ApiRequests';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const MyEvents = ({ token }) => {
    const [page, setPage] = useState(1);
    const [id, setId] = useState(null);
    const [errorText, setErrorText] = useState('');
    const [successText, setSuccessText] = useState('');
    const [popupType, setPopupType] = useState(null);
    const { data, isLoading, isError, refetch } = useGetMyEventsQuery({ token, page });
    const { data: singleEventData, isLoading: isDetailLoading } = useEventDetailQuery(id, { skip: !id });
    const [createEvent] = useCreateEventMutation();
    const [editEvent] = useEditEventMutation();
    const [deleteEvent] = useDeleteEventMutation();
    const navigate = useNavigate();

    const handleCreateEvent = async (eventData) => {
        const res = await createEvent({ token, eventDetails: eventData });
        if (!res.error) {
            setSuccessText(res.data.message);
            setTimeout(() => {
                setSuccessText('');
                refetch();
            }, 3000)
        } else {
            setErrorText(res.error.data.error);
            setTimeout(() => {
                setErrorText('');
            }, 3000)
        }
        setPopupType(null);
    };

    const handleEditEvent = async (eventData) => {
        if (window.confirm('Are you sure you want to edit this event?')) {
            const res = await editEvent({ token, id, eventDetails: eventData });
            if (!res.error) {
                setSuccessText(res.data.message);
                setTimeout(() => {
                    setSuccessText('');
                    refetch();
                }, 3000)
            } else {
                setErrorText(res.error.data.error);
                setTimeout(() => {
                    setErrorText('');
                }, 3000)
            }
            setPopupType(null);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            const res = await deleteEvent({ token, eventId });
            if (!res.error) {
                setSuccessText(res.data.message);
                setTimeout(() => {
                    setSuccessText('');
                    refetch();
                }, 3000)
            } else {
                setErrorText(res.error.data.error);
                setTimeout(() => {
                    setErrorText('');
                }, 3000)
            }
            setPopupType(null);
        }
    };

    if (isLoading) return <Loader />;
    if (isError) return <Wrapper>Error loading events.</Wrapper>;

    return (
        <Wrapper>
            <GoBackButton onClick={() => navigate('/')}>Go Back</GoBackButton>

            {successText && <ActionPopup type="success">{successText}</ActionPopup>}
            {errorText && <ActionPopup type="error">{errorText}</ActionPopup>}
            <CreateButton onClick={() => setPopupType('create')}>Create Event</CreateButton>
            <EventList>
                {
                    data?.data?.events?.length === 0 ? <h2>You don't have any events.</h2> : data?.data?.events.map((event) => (
                        <EventCard key={event._id}>
                            <CardTitle>{event.eventDetails.title}</CardTitle>
                            <CardActions>
                                <ActionButton onClick={() => {
                                    setId(event._id);
                                    setPopupType('details');
                                }}>
                                    View Attendees
                                </ActionButton>
                                <TrashIcon onClick={() => handleDeleteEvent(event._id)}>🗑️</TrashIcon>
                            </CardActions>
                        </EventCard>
                    ))
                }
            </EventList>
            {
                data?.data?.events?.length !== 0 && (
                    <Pagination>
                        <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                            Previous
                        </button>
                        <span>Page {page} of {data?.data?.totalPages}</span>
                        <button onClick={() => setPage((prev) => (prev < data?.data?.totalPages ? prev + 1 : prev))} disabled={page === data?.data?.totalPages}>
                            Next
                        </button>
                    </Pagination>
                )
            }


            {popupType === 'create' && (
                <Popup>
                    <PopupContent>
                        <CloseButton onClick={() => setPopupType(null)}>X</CloseButton>
                        <h2>Create Event</h2>
                        <EventForm onSubmit={handleCreateEvent} />
                    </PopupContent>
                </Popup>
            )}

            {popupType === 'edit' && (
                <Popup>
                    <PopupContent>
                        <CloseButton onClick={() => setPopupType(null)}>X</CloseButton>
                        <h2>Edit Event</h2>
                        <EventForm onSubmit={handleEditEvent} eventDetails={singleEventData?.eventDetails['eventDetails']} />
                    </PopupContent>
                </Popup>
            )}

            {popupType === 'details' && (
                <Popup>
                    <PopupContent>
                        <CloseButton onClick={() => setPopupType(null)}>X</CloseButton>
                        <h2>Event Details</h2>
                        {isDetailLoading ? (
                            <Loader />
                        ) : (
                            <>
                                <p><strong>Title:</strong> {singleEventData?.eventDetails['eventDetails'].title}</p>
                                <p><strong>Description:</strong> {singleEventData?.eventDetails['eventDetails'].description}</p>
                                <p><strong>Date:</strong> {singleEventData?.eventDetails['eventDetails'].date}</p>
                                <p><strong>Time:</strong> {singleEventData?.eventDetails['eventDetails'].time}</p>
                                <p><strong>Location:</strong> {singleEventData?.eventDetails['eventDetails'].location}</p>
                                <p><strong>Slots:</strong> {singleEventData?.eventDetails['attendees']?.length}/{singleEventData?.eventDetails['eventDetails'].eventSlots}</p>
                                <h3>Attendees:</h3>
                                {singleEventData?.eventDetails['attendees']?.map((attendee, index) => (
                                    <p key={index}>
                                        {attendee.buyerDets.username} ({attendee.buyerDets.email})
                                    </p>
                                ))}
                            </>
                        )}
                        <br />
                        <EditButton onClick={async () => {
                            setId(singleEventData?.eventDetails._id);
                            setPopupType('edit');
                        }}>
                            Edit
                        </EditButton>
                    </PopupContent>
                </Popup>
            )}
        </Wrapper>
    );
};

const Wrapper = styled.section`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    color: #333;
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

const CreateButton = styled.button`
    width: 100%;
    padding: 15px;
    background: #ff6a00;
    color: white;
    font-size: 1.5rem;
    border: none;
    border-radius: 5px;
    margin-bottom: 20px;
    cursor: pointer;

    &:hover {
        background: #e55d00;
    }
`;

const EventList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;

    h2 {
        text-align: center;
        font-size: 2.5rem;
        padding: 5em;
    }
`;

const EventCard = styled.div`
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CardTitle = styled.h2`
    font-size: 1.8rem;
    color: #333;
`;

const CardActions = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const ActionButton = styled.button`
    padding: 10px 15px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background: #0056b3;
    }
`;

const EditButton = styled(ActionButton)`
    background: #ff6a00;
    width: 100%;

    &:hover {
        background: #e55d00;
    }
`;

const TrashIcon = styled.span`
    cursor: pointer;
    font-size: 1.8rem;
    color: #dc3545;

    &:hover {
        color: #a71d2a;
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

        &:hover {
            background: #e55d00;
        }

        &:disabled {
            background: #ccc;
        }
    }

    span {
        font-size: 1.6rem;
    }
`;

const Popup = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center; 
`;

const PopupContent = styled.div`
    height: 80vh;
    overflow-y: auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
    position: relative;

    p {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    h2 {
        font-size: 3.5rem;
        font-weight: bold;
        color: #ff6a00;
    }
`;

const CloseButton = styled.button`
    background: transparent;
    border: none;
    font-size: 1.5rem;
    position: absolute;
    top: 10px;
    cursor: pointer;
    right: 10px;

    &:hover {
        color: #ff6a00;
    }
`;

const ActionPopup = styled.div`
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

const EventForm = ({ onSubmit, eventDetails }) => {
    const [formData, setFormData] = useState(eventDetails || {
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        eventSlots: 1,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <InputField>
                <Label>Title:</Label>
                <Input
                    type="text"
                    value={formData.title}
                    maxLength={10}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
            </InputField>

            <InputField>
                <Label>Description:</Label>
                <TextArea
                    value={formData.description}
                    maxLength={70}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </InputField>

            <InputField>
                <Label>Date:</Label>
                <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
            </InputField>

            <InputField>
                <Label>Time:</Label>
                <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
            </InputField>

            <InputField>
                <Label>Location:</Label>
                <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
            </InputField>

            <InputField>
                <Label>Slots:</Label>
                <Input
                    type="number"
                    value={formData.eventSlots}
                    onChange={(e) => setFormData({ ...formData, eventSlots: parseInt(e.target.value >= 1 ? e.target.value : 1) })}
                />
            </InputField>

            <SubmitButton type="submit">Submit</SubmitButton>
        </Form>
    );
};

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const InputField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const Label = styled.label`
    font-size: 1.5rem;
    color: #555;
`;

const Input = styled.input`
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 1.3rem;
    text-transform: unset;

    &:focus {
        border-color: #ff6a00;
    }
`;

const TextArea = styled.textarea`
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 1.3rem;
    resize: vertical;
    text-transform: unset;
`;

const SubmitButton = styled.button`
    padding: 10px;
    background: #ff6a00;
    color: white;
    font-size: 1.5rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background: #e55d00;
    }
`;

export default MyEvents;