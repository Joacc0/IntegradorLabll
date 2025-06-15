import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().email('Email inválido').required('Campo requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').required('Campo requerido'),
})

export const albumSchema = yup.object({
  title: yup.string().required('El título es obligatorio'),
  description: yup.string().max(500, 'Máximo 500 caracteres'),
})