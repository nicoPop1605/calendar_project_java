import React, { useState, useEffect } from "react";
import AddEventForm from "./components/AddEventForm/AddEventForm";
import WeeklyCalendar from "./components/WeeklyCalendar/WeeklyCalendar";
import CreateGroupForm from "./components/CreateGroupForm/CreateGroupForm";

function App() {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [groups, setGroups] = useState([]);

    // 1. Fetch inițial (Evenimente, Grupuri, Utilizatori)
    const refreshAllData = async () => {
        try {
            const [evRes, userRes, groupRes] = await Promise.all([
                fetch("http://localhost:8080/events"),
                fetch("http://localhost:8080/users"),
                fetch("http://localhost:8080/groups")
            ]);

            const evData = await evRes.json();
            const userData = await userRes.json();
            const groupData = await groupRes.json();

            setEvents(Array.isArray(evData) ? evData : []);
            setUsers(Array.isArray(userData) ? userData : []);
            setGroups(Array.isArray(groupData) ? groupData : []);

            // Actualizăm currentUser dacă era deja selectat cineva
            if (currentUser) {
                const updatedMe = userData.find(u => u.id === currentUser.id);
                if (updatedMe) setCurrentUser(updatedMe);
            } else if (userData.length > 0) {
                setCurrentUser(userData[0]);
            }
        } catch (err) {
            console.error("Error loading data:", err);
        }
    };

    useEffect(() => {
        refreshAllData();
    }, []);

    // 2. Gestiune Utilizatori
    const handleCreateUser = async () => {
        const name = prompt("Username:");
        const email = prompt("Email:");
        if (!name || !email) return;

        try {
            const res = await fetch("http://localhost:8080/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });
            const newUser = await res.json();
            setUsers([...users, newUser]);
            setCurrentUser(newUser);
        } catch (err) {
            alert("Error creating user");
        }
    };

    // 3. Gestiune Prieteni (Fluxul de Cerere/Acceptare)
    const handleRequestFriend = async () => {
        const friendName = prompt("Introdu numele de utilizator al prietenului:");
        if (!friendName || !currentUser) return;

        try {
            const res = await fetch(`http://localhost:8080/users/${currentUser.id}/request-friend?friendName=${encodeURIComponent(friendName)}`, {
                method: "POST"
            });
            if (res.ok) {
                alert("Cerere de prietenie trimisă!");
            } else {
                const msg = await res.text();
                alert("Eroare: " + msg);
            }
        } catch (err) {
            alert("Eroare de rețea!");
        }
    };

    const handleResponse = async (requesterId, action) => {
        try {
            const res = await fetch(`http://localhost:8080/users/${currentUser.id}/${action}/${requesterId}`, {
                method: "POST"
            });
            if (res.ok) {
                refreshAllData(); // Reîncărcăm totul pentru a vedea noul prieten
            }
        } catch (err) {
            alert("Eroare la procesarea cererii.");
        }
    };

    // 4. Gestiune Evenimente
    const handleAddOrUpdateEvent = async (eventData) => {
        try {
            let url = "http://localhost:8080/events";
            let method = "POST";
            if (editingEvent) {
                url += `/${editingEvent.id}`;
                method = "PUT";
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eventData),
            });

            if (res.ok) {
                const data = await res.json();
                if (editingEvent) {
                    setEvents(events.map((e) => (e.id === data.id ? data : e)));
                    setEditingEvent(null);
                } else {
                    setEvents([...events, data]);
                }
            }
        } catch (err) {
            alert("Error saving event");
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await fetch(`http://localhost:8080/events/${id}`, { method: "DELETE" });
            setEvents(events.filter((e) => e.id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header */}
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "#f8f9fa", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                <h1 style={{ margin: 0 }}>Social Calendar</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={handleCreateUser}>+ Utilizator Nou</button>
                    <div style={{ borderLeft: "1px solid #ccc", paddingLeft: "15px" }}>
                        <label>Logged in as: </label>
                        <select
                            value={currentUser?.id || ""}
                            onChange={(e) => setCurrentUser(users.find(u => u.id === Number(e.target.value)))}
                        >
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            {currentUser ? (
                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "20px" }}>

                    {/* Sidebar Social */}
                    <aside>
                        {/* Secțiune Cereri Pendinte (Apare doar dacă ai cereri) */}
                        {currentUser.pendingRequests && currentUser.pendingRequests.length > 0 && (
                            <div style={{ padding: "15px", background: "#fff3e0", borderRadius: "8px", marginBottom: "20px", border: "1px solid #ffe0b2" }}>
                                <h4 style={{ margin: "0 0 10px 0" }}>🔔 Cereri noi:</h4>
                                {currentUser.pendingRequests.map(req => (
                                    <div key={req.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "14px" }}>{req.name}</span>
                                        <div>
                                            <button onClick={() => handleResponse(req.id, "accept-friend")} style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "2px 5px", marginRight: "3px", cursor: "pointer" }}>Ok</button>
                                            <button onClick={() => handleResponse(req.id, "decline-friend")} style={{ background: "#f44336", color: "#fff", border: "none", padding: "2px 5px", cursor: "pointer" }}>X</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Listă Prieteni */}
                        <div style={{ padding: "15px", background: "#e8f5e9", borderRadius: "8px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                <h3 style={{ margin: 0 }}>👥 Prieteni ({currentUser.friends?.length || 0})</h3>
                                <button onClick={handleRequestFriend} style={{ background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", padding: "5px 10px", cursor: "pointer" }}>+ Add</button>
                            </div>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                {currentUser.friends?.map(f => (
                                    <li key={f.id} style={{ padding: "8px 0", borderBottom: "1px solid #c8e6c9", fontSize: "14px" }}>
                                        <strong>{f.name}</strong>
                                    </li>
                                ))}
                                {(!currentUser.friends || currentUser.friends.length === 0) && <li style={{ fontSize: "13px", color: "#666" }}>Nu ai prieteni încă.</li>}
                            </ul>
                        </div>

                        <CreateGroupForm currentUser={currentUser} onGroupCreated={refreshAllData} />
                    </aside>

                    {/* Main Area */}
                    <main>
                        <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                            <AddEventForm onAdd={handleAddOrUpdateEvent} editingEvent={editingEvent} groups={groups} />
                            <hr style={{ margin: "25px 0", border: "0", borderTop: "1px solid #eee" }} />
                            <WeeklyCalendar events={events} onDelete={handleDeleteEvent} onEdit={(ev) => setEditingEvent(ev)} />
                        </div>
                    </main>

                </div>
            ) : (
                <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <h2>Bun venit! Creează un utilizator pentru a începe.</h2>
                </div>
            )}
        </div>
    );
}

export default App;