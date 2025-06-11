import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
        reset(res.data.profile);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      const res = await api.patch('/users/me', { profile: data });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input 
        {...register('firstName')}
        placeholder="Nombre"
      />
      <input 
        {...register('lastName')} 
        placeholder="Apellido"
      />
      <textarea 
        {...register('bio')} 
        placeholder="Biografía"
      />
      <button type="submit">Guardar Cambios</button>
    </form>
  );
};

export default ProfilePage;