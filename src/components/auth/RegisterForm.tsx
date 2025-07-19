'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'
import PasswordToggle from './PasswordToggle'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>
  onSwitchToLogin: () => void
  loading?: boolean
  className?: string
  error?: string | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onSwitchToLogin,
  loading = false,
  className
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  const handleFormSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error('Register error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = loading || isSubmitting

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            color: '#3b82f6',
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            📅 Schedule Manager
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Tạo tài khoản mới để bắt đầu sử dụng
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Name field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Họ và tên
            </label>
            <input
              id="name"
              type="text"
              placeholder="Nhập họ và tên"
              disabled={isLoading}
              {...register('name')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: isLoading ? '#f9fafb' : 'white',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!errors.name) {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }
              }}
              onBlur={(e) => {
                if (!errors.name) {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }
              }}
            />
            {errors.name && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                margin: 0
              }}>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              disabled={isLoading}
              {...register('email')}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: isLoading ? '#f9fafb' : 'white',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }
              }}
              onBlur={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }
              }}
            />
            {errors.email && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                margin: 0
              }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Mật khẩu
            </label>
            <PasswordToggle
              id="password"
              value={password}
              onChange={(value) => setValue('password', value)}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              disabled={isLoading}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                margin: 0
              }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Xác nhận mật khẩu
            </label>
            <PasswordToggle
              id="confirmPassword"
              value={confirmPassword}
              onChange={(value) => setValue('confirmPassword', value)}
              placeholder="Nhập lại mật khẩu"
              disabled={isLoading}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                margin: 0
              }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms and conditions */}
          <div style={{
            fontSize: '0.75rem',
            color: '#64748b',
            marginBottom: '2rem',
            lineHeight: 1.5
          }}>
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <button
              type="button"
              style={{
                color: '#3b82f6',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Điều khoản sử dụng
            </button>{' '}
            và{' '}
            <button
              type="button"
              style={{
                color: '#3b82f6',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Chính sách bảo mật
            </button>{' '}
            của chúng tôi.
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '1rem'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }
            }}
          >
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          {/* Switch to login */}
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              Đã có tài khoản?{' '}
            </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              disabled={isLoading}
              style={{
                color: '#3b82f6',
                background: 'none',
                border: 'none',
                textDecoration: 'underline',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Đăng nhập ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterForm
