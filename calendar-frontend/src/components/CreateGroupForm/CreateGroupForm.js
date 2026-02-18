import React, { useState } from "react";

function CreateGroupForm({ currentUser, onGroupCreated }) {
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    const handleCheckboxChange = (friend) => {
        if (selectedMembers.find(m => m.id === friend.id)) {
            setSelectedMembers(selectedMembers.filter(m => m.id !== friend.id));
        } else {
            setSelectedMembers([...selectedMembers, friend]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Construim grupul folosind numele și lista de membri selectați plus creatorul
        const newGroup = {
            name: groupName,
            members: [...selectedMembers, currentUser]
        };

        const res = await fetch("http://localhost:8080/groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newGroup)
        });

        if (res.ok) {
            alert("Grup creat!");
            setGroupName("");
            setSelectedMembers([]);
            onGroupCreated();
        }
    };

    return (
        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", margin: "10px 0", backgroundColor: "#fff" }}>
            <h3>Creează un Grup Nou</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nume Grup"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    style={{ marginBottom: "10px", padding: "5px", width: "100%" }}
                />
                <h4>Invită prieteni:</h4>
                <div style={{ maxHeight: "150px", overflowY: "auto", marginBottom: "10px", border: "1px solid #eee", padding: "5px" }}>
                    {/* Filtrare: Afișăm doar prietenii utilizatorului logat */}
                    {currentUser.friends && currentUser.friends.length > 0 ? (
                        currentUser.friends.map(friend => (
                            <div key={friend.id} style={{ marginBottom: "5px" }}>
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.some(m => m.id === friend.id)}
                                    onChange={() => handleCheckboxChange(friend)}
                                /> {friend.name}
                            </div>
                        ))
                    ) : (
                        <p style={{ fontSize: "0.9em", color: "#666" }}>Nu ai niciun prieten adăugat încă.</p>
                    )}
                </div>
                <button type="submit" disabled={!groupName} style={{ cursor: "pointer" }}>
                    Creează grupul
                </button>
            </form>
        </div>
    );
}

export default CreateGroupForm;