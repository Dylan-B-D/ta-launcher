import { Notification } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

interface NotificationPopupProps {
    visible: boolean;
    message: string;
    title: string;
    color: string;
    onClose: () => void;
    icon: JSX.Element | null;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ visible, message, title, color, onClose, icon }) => {
    if (!visible) return null;

    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20, maxWidth: '30%', zIndex: 1000 }}>
            <Notification
                icon={icon || <IconX />}
                title={title}
                color={color}
                onClose={onClose}
                style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}
            >
                {message}
            </Notification>
        </div>
    );
};

export default NotificationPopup;