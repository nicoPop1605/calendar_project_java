import React, { useState, useEffect } from "react";
import styles from "./AddEventForm.module.css";

function AddEventForm({ onAdd, editingEvent, groups }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDateTime, setStartDateTime] = useState("");
    const [endDateTime, setEndDateTime] = useState("");
    const [location, setLocation] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");

    useEffect(() => {
        if (editingEvent) {
            setTitle(editingEvent.title);
            setDescription(editingEvent.description);
            setStartDateTime(editingEvent.startDateTime);
            setEndDateTime(editingEvent.endDateTime);
            setLocation(editingEvent.location)
            setSelectedGroupId(editingEvent.group?.id || "");
        } else {
            setTitle("");
            setDescription("");
            setStartDateTime("");
            setEndDateTime("");
            setLocation("");
            setSelectedGroupId("");
        }
    }, [editingEvent]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !description || !startDateTime || !endDateTime || !location) return;

        onAdd({
            title,
            description,
            startDateTime,
            endDateTime,
            location,
            group: selectedGroupId ? { id: Number(selectedGroupId) } : null
        });

        if (!editingEvent) {
            setTitle("");
            setDescription("");
            setStartDateTime("");
            setEndDateTime("");
            setLocation("");

        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={styles.input}
            />
            <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className={styles.input}
            />
            <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                required
                className={styles.input}
            />
            <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                required
                className={styles.input}
            />
            <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className={styles.input}
            />

            <select
                className={styles.input}
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
            >
                <option value="">Eveniment Personal (Niciun grup)</option>
                {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                ))}
            </select>
            <button type="submit" className={styles.button}>
                {editingEvent ? "Update Event" : "Add Event"}
            </button>
        </form>
    );
}

export default AddEventForm;
