//Llamadas API genericas.

import { useState } from 'react'
import api from '../services/api'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async (method, url, data = null) => {
    setLoading(true)
    try {
      const response = await api[method](url, data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, fetchData }
}