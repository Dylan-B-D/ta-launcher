import React, { useEffect, useState } from 'react';
import { Notification, Progress, Box } from '@mantine/core';
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
    const [progress, setProgress] = useState(0);

    // 2s timer (20*100) to close the notification
    useEffect(() => {
        if (visible) {
            setProgress(0);
            const timer = setInterval(() => {
                setProgress((oldProgress) => {
                    if (oldProgress >= 100) {
                        clearInterval(timer);
                        onClose();
                        return 0;
                    }
                    return oldProgress + 1;
                });
            }, 20);

            return () => {
                clearInterval(timer);
            };
        }
    }, [visible, onClose]);

    if (!visible) return null;

    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20, maxWidth: '30%', zIndex: 1000 }}>
            <Box style={{ position: 'relative' }}>
                <Notification
                    icon={icon || <IconX />}
                    title={title}
                    color={color}
                    onClose={onClose}
                    style={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        paddingBottom: '20px'
                    }}
                >
                    {message}
                </Notification>
                <Progress 
                    value={progress} 
                    color={color}
                    size="xs"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderBottomLeftRadius: 'inherit',
                        borderBottomRightRadius: 'inherit'
                    }}
                />
            </Box>
        </div>
    );
};

export default NotificationPopup;