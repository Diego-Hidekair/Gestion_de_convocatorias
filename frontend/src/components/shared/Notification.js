// frontend/src/components/layout/Notification.js
import { Snackbar, Alert } from '@mui/material';
import { useContext } from 'react';
import NotificationContext from '../../context/NotificationContext';

const Notification = () => {
  const { notification, setNotification } = useContext(NotificationContext);

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={5000}
      onClose={() => setNotification(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={() => setNotification(null)} 
        severity={notification?.severity || 'info'}
        sx={{ width: '100%' }}
      >
        {notification?.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;