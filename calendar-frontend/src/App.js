import React, { useState, useEffect } from "react";
import AddEventForm from "./components/AddEventForm/AddEventForm";
import WeeklyCalendar from "./components/WeeklyCalendar/WeeklyCalendar";
import CreateGroupForm from "./components/CreateGroupForm/CreateGroupForm";
import Modal from "./components/Modal/Modal"; // Presupunând că ai creat componenta Modal

function App() {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [groups, setGroups] = useState([]);

    // Stări pentru Navigare și UI
    const [activeView, setActiveView] = useState("calendar"); // calendar, friends, groups
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const handleCreateUser = async () => {
        const name = prompt("Username:");
        const email = prompt("Email:");
        if (!name || !email) return;
        try {
            const res = await fetch("http://localhost:8080/users", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name, email}),
            });
            await res.json();
            refreshAllData();
        } catch (err) {
            alert("Error creating user");
        }
    };

    const handleRequestFriend = async () => {
        const friendName = prompt("Username:");
        if (!friendName || !currentUser) return;
        try {
            const res = await fetch(`http://localhost:8080/users/${currentUser.id}/request-friend?friendName=${encodeURIComponent(friendName)}`, {method: "POST"});
            if (res.ok) alert("Request sent!");
            else alert("Error on sending.");
        } catch (err) {
            alert("Network error!");
        }
    };

    const handleResponse = async (requesterId, action) => {
        try {
            const res = await fetch(`http://localhost:8080/users/${currentUser.id}/${action}/${requesterId}`, {method: "POST"});
            if (res.ok) refreshAllData();
        } catch (err) {
            alert("Processing error.");
        }
    };

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
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(eventData),
            });
            if (res.ok) {
                refreshAllData();
                setIsEventModalOpen(false);
                setEditingEvent(null);
            }
        } catch (err) {
            alert("Error saving event");
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await fetch(`http://localhost:8080/events/${id}`, {method: "DELETE"});
            setEvents(events.filter((e) => e.id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    const openEditModal = (ev) => {
        setEditingEvent(ev);
        setIsEventModalOpen(true);
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)", // Fundal colorat vesel
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            paddingBottom: "100px" // Spațiu pentru navigarea de jos pe viitor
        }}>
            {/* Header cu efect de sticlă */}
            <header style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "15px 25px", background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100,
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)", borderBottom: "1px solid rgba(255, 255, 255, 0.3)"
            }}>
                <button onClick={() => setIsSidebarOpen(true)} style={{
                    fontSize: "28px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#333"
                }}>☰
                </button>
                <h1 style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    color: "#333",
                    fontWeight: "800",
                    letterSpacing: "-1px"
                }}>Social Calendar 🥂</h1>
                <select
                    value={currentUser?.id || ""}
                    onChange={(e) => {
                        const selected = users.find(u => u.id === Number(e.target.value));
                        setCurrentUser(selected);
                    }}
                    style={{
                        padding: "8px",
                        borderRadius: "12px",
                        border: "1px solid #ccc",
                        background: "#fff",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </header>

            {/* Meniul Lateral (Sidebar) */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.3)",
                    zIndex: 200,
                    backdropFilter: "blur(4px)"
                }}>
                    <aside onClick={e => e.stopPropagation()} style={{
                        width: "280px",
                        height: "100%",
                        background: "rgba(255, 255, 255, 0.95)",
                        padding: "30px 20px",
                        boxShadow: "10px 0 30px rgba(0,0,0,0.1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px"
                    }}>
                        <button onClick={() => setIsSidebarOpen(false)} style={{
                            alignSelf: "flex-end",
                            border: "none",
                            background: "none",
                            fontSize: "24px",
                            cursor: "pointer"
                        }}>✕
                        </button>
                        <h2 style={{color: "#FF6B6B"}}>Meniu 🍕</h2>
                        <nav style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                            <button onClick={() => {
                                setActiveView("calendar");
                                setIsSidebarOpen(false);
                            }} style={playfulNavStyle}>🚀 Our plans
                            </button>
                            <button onClick={() => {
                                setActiveView("friends");
                                setIsSidebarOpen(false);
                            }} style={playfulNavStyle}>🌈 My people
                            </button>
                            <button onClick={() => {
                                setActiveView("groups");
                                setIsSidebarOpen(false);
                            }} style={playfulNavStyle}>🏘️ Hangout Hubs
                            </button>
                            <hr style={{opacity: 0.2, margin: "10px 0"}}/>
                            <button onClick={handleCreateUser} style={{...playfulNavStyle, color: "#4ECDC4"}}>✨ Create
                                a new account
                            </button>
                        </nav>
                    </aside>
                </div>
            )}

            {currentUser ? (
                <main style={{padding: "20px", maxWidth: "900px", margin: "0 auto"}}>
                    {activeView === "calendar" && (
                        <div style={{animation: "fadeIn 0.5s ease"}}>
                            <div style={{display: "flex", justifyContent: "center", marginBottom: "25px"}}>
                                <button onClick={() => {
                                    setEditingEvent(null);
                                    setIsEventModalOpen(true);
                                }} style={mainFabStyle}>
                                    🔥 Plan something!
                                </button>
                            </div>
                            <div style={{
                                background: "rgba(255, 255, 255, 0.6)",
                                borderRadius: "24px",
                                padding: "10px",
                                backdropFilter: "blur(5px)"
                            }}>
                                <WeeklyCalendar events={events} onDelete={handleDeleteEvent} onEdit={openEditModal}/>
                            </div>
                        </div>
                    )}

                    {activeView === "friends" && (
                        <div style={{animation: "fadeIn 0.5s ease"}}>
                            {currentUser.pendingRequests?.length > 0 && (
                                <div style={{
                                    background: "#FFD93D",
                                    padding: "20px",
                                    borderRadius: "20px",
                                    marginBottom: "20px",
                                    boxShadow: "0 10px 0 #333",
                                    border: "2px solid #333"
                                }}>
                                    <h4 style={{margin: "0 0 15px 0"}}>🔔 Someone wants to hangout:</h4>
                                    {currentUser.pendingRequests.map(req => (
                                        <div key={req.id} style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            background: "white",
                                            padding: "10px",
                                            borderRadius: "12px",
                                            marginBottom: "10px"
                                        }}>
                                            <span style={{fontWeight: "bold"}}>{req.name}</span>
                                            <div>
                                                <button onClick={() => handleResponse(req.id, "accept-friend")} style={{
                                                    background: "#4CAF50",
                                                    color: "#fff",
                                                    border: "none",
                                                    padding: "8px 15px",
                                                    borderRadius: "10px",
                                                    marginRight: "5px",
                                                    cursor: "pointer"
                                                }}>Yeah!
                                                </button>
                                                <button onClick={() => handleResponse(req.id, "decline-friend")}
                                                        style={{
                                                            background: "#f44336",
                                                            color: "#fff",
                                                            border: "none",
                                                            padding: "8px 15px",
                                                            borderRadius: "10px",
                                                            cursor: "pointer"
                                                        }}>Not today
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{
                                background: "white",
                                padding: "25px",
                                borderRadius: "24px",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "20px"
                                }}>
                                    <h2 style={{margin: 0}}>👥 Group ({currentUser.friends?.length || 0})</h2>
                                    <button onClick={handleRequestFriend} style={{
                                        background: "#4ECDC4",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "15px",
                                        fontWeight: "bold",
                                        cursor: "pointer"
                                    }}>+ Add Friend
                                    </button>
                                </div>
                                {currentUser.friends?.length === 0 ? (
                                    <p style={{textAlign: "center", color: "#666"}}>It's a bit quiet here... Invite the crew!
                                         🍕</p>
                                ) : (
                                    currentUser.friends?.map(f => (
                                        <div key={f.id} style={{
                                            padding: "15px",
                                            borderBottom: "1px solid #f0f0f0",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px"
                                        }}>
                                            <div style={{
                                                width: "40px",
                                                height: "40px",
                                                background: "#FF6B6B",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontWeight: "bold"
                                            }}>{f.name[0]}</div>
                                            <span style={{fontWeight: "bold"}}>{f.name}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === "groups" && (
                        <div style={{
                            animation: "fadeIn 0.5s ease",
                            background: "white",
                            padding: "25px",
                            borderRadius: "24px"
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "20px"
                            }}>
                                <h2>🏘️ Hub-uri de Hangout</h2>
                                <button onClick={() => setIsGroupModalOpen(true)} style={{
                                    background: "#A594F9",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "15px",
                                    fontWeight: "bold",
                                    cursor: "pointer"
                                }}>Creează Hub
                                </button>
                            </div>
                            {groups.map(g => (
                                <div key={g.id} style={{
                                    padding: "15px",
                                    background: "#f8f9fa",
                                    borderRadius: "15px",
                                    marginBottom: "10px",
                                    border: "1px solid #eee"
                                }}>
                                    <strong style={{fontSize: "1.1rem"}}>✨ {g.name}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            ) : (
                <div style={{textAlign: "center", paddingTop: "100px", color: "#333"}}>
                    <h1 style={{fontSize: "3rem"}}>🍹 Chill & Plan</h1>
                    <p>Create a user!</p>
                </div>
            )}

            {/* MODALELE */}
            <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)}
                   title={editingEvent ? "Edit plan ✏️" : "What's the plan? 🔥"}>
                <AddEventForm onAdd={handleAddOrUpdateEvent} editingEvent={editingEvent} groups={groups}/>
            </Modal>

            <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title="New hangout group 🏘️">
                <CreateGroupForm currentUser={currentUser} onGroupCreated={() => {
                    refreshAllData();
                    setIsGroupModalOpen(false);
                }}/>
            </Modal>
        </div>
    );

// Stiluri ajutătoare
    const playfulNavStyle = {
        padding: "15px",
        textAlign: "left",
        background: "none",
        border: "none",
        fontSize: "1.1rem",
        cursor: "pointer",
        borderRadius: "15px",
        transition: "all 0.2s",
        fontWeight: "600",
        color: "#444"
    };
    const mainFabStyle = {
        background: "#FF6B6B",
        color: "#fff",
        border: "none",
        padding: "18px 35px",
        borderRadius: "50px",
        fontWeight: "800",
        fontSize: "1.1rem",
        cursor: "pointer",
        boxShadow: "0 10px 20px rgba(255,107,107,0.3)",
        transition: "transform 0.2s"
    };
}
// Stiluri ajutătoare pentru vibe-ul de "Hang Out"
const playfulNavStyle = {
    padding: "15px",
    textAlign: "left",
    background: "none",
    border: "none",
    fontSize: "1.1rem",
    cursor: "pointer",
    borderRadius: "15px",
    transition: "all 0.2s",
    fontWeight: "600",
    color: "#444"
};

const mainFabStyle = {
    background: "#FF6B6B",
    color: "#fff",
    border: "none",
    padding: "18px 35px",
    borderRadius: "50px",
    fontWeight: "800",
    fontSize: "1.1rem",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(255,107,107,0.3)",
    transition: "transform 0.2s"
};
export default App;