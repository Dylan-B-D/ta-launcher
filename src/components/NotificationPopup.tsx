import React, { useEffect, useState, useCallback } from "react";
import { Notification, Progress, Box } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface NotificationPopupProps {
  visible: boolean;
  message: string;
  title: string;
  color: string;
  onClose: () => void;
  icon: JSX.Element | null;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  visible,
  message,
  title,
  color,
  onClose,
  icon,
}) => {
  const [progress, setProgress] = useState(0);

  const closeNotification = useCallback(() => {
    setProgress(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          return oldProgress + 1;
        });
      }, 40);

      const closeTimer = setTimeout(() => {
        closeNotification();
      }, 4000); // 4 seconds

      return () => {
        clearInterval(timer);
        clearTimeout(closeTimer);
      };
    }
  }, [visible, closeNotification]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        maxWidth: "40%",
        zIndex: 1000,
      }}
    >
      <Box style={{ position: "relative" }}>
        <Notification
          icon={icon || <IconX />}
          title={title}
          color={color}
          onClose={closeNotification}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            paddingBottom: "20px",
          }}
        >
          {message}
        </Notification>
        <Progress
          value={progress}
          color={color}
          size="xs"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderBottomLeftRadius: "inherit",
            borderBottomRightRadius: "inherit",
          }}
        />
      </Box>
    </div>
  );
};

export default NotificationPopup;
