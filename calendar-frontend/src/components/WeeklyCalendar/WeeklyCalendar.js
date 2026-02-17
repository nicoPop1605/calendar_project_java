import React from "react";
import styles from "./WeeklyCalendar.module.css";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeeklyCalendar({ events, onDelete, onEdit }) {
    const eventsByDay = daysOfWeek.reduce((acc, day) => {
        acc[day] = [];
        return acc;
    }, {});

    events.forEach((event) => {
        const date = new Date(event.startDateTime);
        const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
        eventsByDay[dayName].push(event);
    });

    const getOverlappingEventIds = (dayEvents) => {
        const overlappingIds = new Set();
        for (let i = 0; i < dayEvents.length; i++) {
            for (let j = i + 1; j < dayEvents.length; j++) {
                const e1 = dayEvents[i];
                const e2 = dayEvents[j];
                const start1 = new Date(e1.startDateTime);
                const end1 = new Date(e1.endDateTime);
                const start2 = new Date(e2.startDateTime);
                const end2 = new Date(e2.endDateTime);
                if (start1 < end2 && start2 < end1) {
                    overlappingIds.add(e1.id);
                    overlappingIds.add(e2.id);
                }
            }
        }
        return overlappingIds;
    };

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.hoursColumn}>
                {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className={styles.hourLine}>{i}:00</div>
                ))}
            </div>

            {daysOfWeek.map((day) => {
                const dayEvents = eventsByDay[day];
                const overlappingIds = getOverlappingEventIds(dayEvents);

                return (
                    <div key={day} className={styles.dayColumn}>
                        <div className={styles.dayHeader}>{day}</div>
                        {Array.from({ length: 24 }, (_, i) => (
                            <div key={i} className={styles.hourLine}></div>
                        ))}

                        {dayEvents.map((event) => {
                            const start = new Date(event.startDateTime);
                            const end = new Date(event.endDateTime);
                            const top = start.getHours() * 60 + start.getMinutes();
                            const height = (end - start) / (1000 * 60);

                            const isOverlapping = overlappingIds.has(event.id);

                            return (
                                <div
                                    key={event.id}
                                    className={`${styles.eventBlock} ${isOverlapping ? styles.eventOverlap : styles.eventNormal}`}
                                    style={{ top: `${top}px`, height: `${height}px` }}
                                >
                                    <div>
                                        <strong>{event.title}</strong>
                                        <div className={styles.time}>
                                            {start.getHours()}:{start.getMinutes().toString().padStart(2, "0")} -
                                            {end.getHours()}:{end.getMinutes().toString().padStart(2, "0")}
                                        </div>
                                    </div>
                                    <div className={styles.buttons}>
                                        <button onClick={() => onEdit(event)}>Edit</button>
                                        <button onClick={() => onDelete(event.id)}>Delete</button>
                                    </div>
                                </div>

                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}

export default WeeklyCalendar;
