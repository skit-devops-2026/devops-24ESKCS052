
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

// Maps notification types to readable titles.
const labels = {
    sos: 'SOS alert',
    alert: 'Attention',
    success: 'Update',
    reminder: 'Reminder',
    info: 'Information',
};

export default function NotificationsPage({ onRead, notify }) {
    // Stores notifications fetched from the backend.
    const [items, setItems] = useState(null);

    // Fetches all notifications from the API.
    const load = useCallback(
        () => api('/notifications').then(setItems),
        []
    );

    // Loads notifications when the component mounts.
    useEffect(() => {
        load().catch((e) => notify(e.message, 'error'));
    }, [load, notify]);

    // Marks all notifications as read and refreshes the list.
    const read = async () => {
        try {
            // Sends a request to mark every notification as read.
            await api('/notifications/read-all', {
                method: 'POST',
            });

            // Updates the unread notification count in the parent.
            onRead();

            // Refreshes the notification list.
            await load();

            notify('All notifications marked as read.');
        } catch (e) {
            notify(e.message, 'error');
        }
    };

    return (
        <div className="page-stack">
            {/* Page heading and mark-all-as-read action. */}
            <section className="page-title-row">
                <div>
                    <span className="eyebrow">STAY IN THE LOOP</span>

                    <h1>Notifications</h1>

                    <p className="muted">
                        Important updates and alerts for your care space.
                    </p>
                </div>

                <button
                    className="btn ghost"
                    onClick={read}
                    disabled={!items?.some((n) => !n.read)}
                >
                    ✓ Mark all as read
                </button>
            </section>

            {/* Displays the notification list or the appropriate empty/loading state. */}
            <section className="panel">
                <div className="panel-heading">
                    <div>
                        <span className="eyebrow">RECENT ACTIVITY</span>
                        <h2>Your updates</h2>
                    </div>

                    <span className="count-chip">
                        {items?.length || 0} notifications
                    </span>
                </div>

                {items?.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">♧</div>

                        <strong>You’re all caught up</strong>

                        <p>
                            New updates will appear here when available.
                        </p>
                    </div>
                ) : !items ? (
                    <div className="empty-state">
                        Loading notifications…
                    </div>
                ) : (
                    <div className="notification-list">
                        {items.map((n) => (
                            <article
                                key={n.id}
                                className={`notification-item ${n.read ? '' : 'unread'
                                    }`}
                            >
                                <div
                                    className={`notification-icon ${n.type || 'info'
                                        }`}
                                >
                                    {n.type === 'sos'
                                        ? '!'
                                        : n.type === 'success'
                                            ? '✓'
                                            : '♡'}
                                </div>

                                <div className="grow">
                                    <div className="notification-title-row">
                                        <strong>
                                            {labels[n.type] || 'Update'}
                                        </strong>

                                        {!n.read && (
                                            <span className="new-dot" />
                                        )}
                                    </div>

                                    <p>{n.text}</p>

                                    <small>
                                        {new Date(
                                            n.created_at
                                        ).toLocaleString('en-IN')}
                                    </small>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
