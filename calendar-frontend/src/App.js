import React, { useState, useEffect } from "react";
import AddEventForm from "./components/AddEventForm/AddEventForm";
import WeeklyCalendar from "./components/WeeklyCalendar/WeeklyCalendar";

function App() {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]); // Listă pentru toți utilizatorii
    const [currentUser, setCurrentUser] = useState(null); // Utilizatorul "logat"
    const [editingEvent, setEditingEvent] = useState(null);

    // Fetch events la start
    useEffect(() => {
        // Luăm evenimentele
        fetch("http://localhost:8080/events")
            .then((res) => res.json())
            .then((data) => setEvents(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error fetching events:", err));

        // Luăm utilizatorii (va trebui să ai UserController gata în backend)
        fetch("http://localhost:8080/users")
            .then((res) => res.json())
            .then((data) => {
                const userList = Array.isArray(data) ? data : [];
                setUsers(userList);
                if (userList.length > 0) setCurrentUser(userList[0]); // Auto-login cu primul
            })
            .catch((err) => console.error("Error fetching users:", err));
    }, []);


    const handleCreateUser = async () => {
        const name = prompt("Introdu numele utilizatorului:");
        const email = prompt("Introdu email-ul:");
        if (!name || !email) return;

        try {
            const res = await fetch("http://localhost:8080/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }), // Trimitem datele către modelul User
            });
            const newUser = await res.json();
            setUsers([...users, newUser]);
            setCurrentUser(newUser);
        } catch (err) {
            alert("Eroare la crearea utilizatorului");
        }
    };

    // Funcție unică pentru add sau update
    const handleAddOrUpdateEvent = async (eventData) => {
        try {
            let url = "http://localhost:8080/events";
            let method = "POST";

            if (editingEvent) {
                const numericId = Number(editingEvent.id);
                if (isNaN(numericId)) throw new Error("Invalid event ID");

                url += `/${numericId}`;
                method = "PUT";
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eventData),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText);
            }

            const data = await res.json();

            if (editingEvent) {
                // update lista locală
                setEvents(events.map((e) => (e.id === data.id ? data : e)));
                setEditingEvent(null);
            } else {
                setEvents([...events, data]);
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            const numericId = Number(id); // ✅ asigurăm că e număr
            if (isNaN(numericId)) throw new Error("Invalid event ID");

            const res = await fetch(`http://localhost:8080/events/${numericId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");
            setEvents(events.filter((e) => e.id !== numericId));
        } catch (err) {
            alert(err.message);
        }
    };


    const handleEditEvent = (event) => {
        setEditingEvent(event);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "#f0f0f0", padding: "10px", borderRadius: "8px" }}>
                <h1>Calendar Social</h1>

                <div>
                    <button onClick={handleCreateUser} style={{ marginRight: "10px" }}>+ Utilizator Nou</button>
                    <label>Logat ca: </label>
                    <select
                        value={currentUser?.id || ""}
                        onChange={(e) => setCurrentUser(users.find(u => u.id === Number(e.target.value)))}
                    >
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            </div>

            {currentUser ? (
                <>
                    <AddEventForm onAdd={handleAddOrUpdateEvent} editingEvent={editingEvent} />
                    <WeeklyCalendar events={events} onDelete={handleDeleteEvent} onEdit={handleEditEvent} />
                </>
            ) : (
                <p>Te rugăm să creezi un utilizator pentru a începe.</p>
            )}
        </div>
    );
}

export default App;
