import React from "react";
import styles from "./EventList.module.css";

function EventList({ events, onDelete, onEdit }) {
    return (
        <div>
            <h2>Events</h2>
            {events.length === 0 ? (
                <p>No events yet.</p>
            ) : (
                <ul className={styles.list}>
                    {events.map((event) => (
                        <li key={event.id} className={styles.eventItem}>
                            <div>
                                <strong>{event.title}</strong>
                                <p>{event.description}</p>
                                <p>
                                    {new Date(event.startDateTime).toLocaleString()} -{" "}
                                    {new Date(event.endDateTime).toLocaleString()}
                                </p>
                            </div>
                            <div className={styles.buttons}>
                                <button onClick={() => onEdit(event)}>Edit</button>
                                <button onClick={() => onDelete(event.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default EventList;
