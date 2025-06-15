import { useEffect, useState } from 'react'
import { useAuth } from "../../context/AuthContext";
import { getNotifications, markAsRead } from '../../services/notificationService'
import { io } from 'socket.io-client'

const NotificationCenter = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getNotifications()
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.isRead).length)
    }
    
    if (user) {
      fetchNotifications()
      
      // Configurar Socket.io
      const socket = io(import.meta.env.VITE_API_URL)
      socket.emit('joinUserRoom', user._id)
      
      socket.on('newFriendRequest', (data) => {
        setNotifications(prev => [data, ...prev])
        setUnreadCount(prev => prev + 1)
      })
      
      socket.on('newComment', (data) => {
        setNotifications(prev => [data, ...prev])
        setUnreadCount(prev => prev + 1)
      })

      return () => socket.disconnect()
    }
  }, [user])

  const handleMarkAsRead = async (id) => {
    await markAsRead(id)
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    )
    setUnreadCount(prev => prev - 1)
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 relative"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-10">
          <div className="py-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-700">No hay notificaciones</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`px-4 py-2 text-sm ${!notification.isRead ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-100 cursor-pointer`}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <p className="font-medium">{notification.sender?.firstName} {notification.sender?.lastName}</p>
                  <p className="text-gray-600">{notification.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter