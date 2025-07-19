'use client'

import React, { useState } from 'react'

interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  allDay: boolean
  categoryId: string
  location?: string
  reminder?: {
    enabled: boolean
    minutes: number
  };
  repeat?: RepeatConfig;
}

interface Category {
  id: string
  name: string
  color: string
}

interface EventFormProps {
  event?: Event | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (eventData: Omit<Event, 'id'>) => void
  categories: Category[]
  selectedDate?: Date
}

export default function EventFormModal({ 
  event, 
  isOpen, 
  onClose, 
  onSubmit, 
  categories,
  selectedDate 
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startDate: event?.startDate ? event.startDate.toISOString().slice(0, 16) :
                selectedDate ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) :
                new Date().toISOString().slice(0, 16),
    endDate: event?.endDate ? event.endDate.toISOString().slice(0, 16) :
             selectedDate ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000 + 3600000).toISOString().slice(0, 16) :
             new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    allDay: event?.allDay || false,
    categoryId: event?.categoryId || (categories[0]?.id || ''),
    location: event?.location || '',
    reminderEnabled: event?.reminder?.enabled || false,
    reminderMinutes: event?.reminder?.minutes || 15,
    // Repeat options
    repeatEnabled: false,
    repeatType: 'daily',
    repeatStartDate: selectedDate ? selectedDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    repeatEndDate: '',
    repeatStartTime: '09:00',
    repeatEndTime: '10:00',
    repeatDays: [] as string[] // For weekly repeat (not implemented yet)
  })

  const reminderOptions = [
    { value: 0, label: 'Khi sự kiện bắt đầu' },
    { value: 5, label: '5 phút trước' },
    { value: 15, label: '15 phút trước' },
    { value: 30, label: '30 phút trước' },
    { value: 60, label: '1 giờ trước' },
    { value: 1440, label: '1 ngày trước' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề sự kiện')
      return
    }

    let startDate: Date
    let endDate: Date

    if (formData.repeatEnabled) {
      // For repeat events, use repeat dates and times
      if (!formData.repeatStartDate || !formData.repeatEndDate) {
        alert('Vui lòng chọn ngày bắt đầu và kết thúc lặp lại')
        return
      }

      const repeatStartDate = new Date(formData.repeatStartDate)
      const repeatEndDate = new Date(formData.repeatEndDate)

      if (repeatEndDate <= repeatStartDate) {
        alert('Ngày kết thúc lặp lại phải sau ngày bắt đầu')
        return
      }

      // Validate time
      if (formData.repeatEndTime <= formData.repeatStartTime) {
        alert('Thời gian kết thúc phải sau thời gian bắt đầu')
        return
      }

      // Check for reasonable limits
      const days = Math.ceil((repeatEndDate.getTime() - repeatStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      if (days > 365) {
        alert('Không thể tạo quá 365 ngày lặp lại. Vui lòng chọn khoảng thời gian ngắn hơn.')
        return
      }

      if (days > 100 && !confirm(`Bạn sắp tạo sự kiện lặp lại trong ${days} ngày. Bạn có chắc chắn muốn tiếp tục?`)) {
        return
      }

      // Create start and end dates with times for the first occurrence
      startDate = new Date(`${formData.repeatStartDate}T${formData.repeatStartTime}`)
      endDate = new Date(`${formData.repeatStartDate}T${formData.repeatEndTime}`)
    } else {
      // For single events, use normal date/time
      startDate = new Date(formData.startDate)
      endDate = new Date(formData.endDate)

      if (endDate <= startDate) {
        alert('Thời gian kết thúc phải sau thời gian bắt đầu')
        return
      }
    }

    // Create single event (with or without repeat)
    const eventData: Omit<Event, 'id'> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      startDate,
      endDate,
      allDay: formData.allDay,
      categoryId: formData.categoryId,
      location: formData.location.trim() || undefined,
      reminder: formData.reminderEnabled ? {
        enabled: true,
        minutes: formData.reminderMinutes
      } : undefined,
      repeat: formData.repeatEnabled ? {
        type: formData.repeatType as 'daily' | 'weekly' | 'monthly',
        endDate: new Date(formData.repeatEndDate),
        dates: generateRepeatDates(formData)
      } : undefined
    }

    onSubmit(eventData)

    if (formData.repeatEnabled) {
      const dates = generateRepeatDates(formData)
      alert(`Đã tạo sự kiện lặp lại thành công! Sự kiện sẽ xuất hiện trong ${dates.length} ngày.`)
    }

    onClose()
  }

  // Function to generate repeat dates
  const generateRepeatDates = (data: typeof formData): Date[] => {
    const dates: Date[] = []

    if (data.repeatEnabled) {
      const startDate = new Date(data.repeatStartDate)
      const endDate = new Date(data.repeatEndDate)

      if (data.repeatType === 'daily') {
        let currentDate = new Date(startDate)

        while (currentDate <= endDate) {
          // Create date with the specified time
          const dateWithTime = new Date(`${currentDate.toISOString().slice(0, 10)}T${data.repeatStartTime}`)
          dates.push(dateWithTime)
          currentDate.setDate(currentDate.getDate() + 1)
        }
      }
      // TODO: Add weekly and monthly logic later
    }

    return dates
  }

  const handleAllDayChange = (checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        // Set to full day
        const start = new Date(prev.startDate)
        const end = new Date(prev.startDate)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        
        return {
          ...prev,
          allDay: true,
          startDate: start.toISOString().slice(0, 16),
          endDate: end.toISOString().slice(0, 16)
        }
      } else {
        return { ...prev, allDay: false }
      }
    })
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1e293b',
            margin: 0
          }}>
            {event ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
          </h2>
          
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.25rem'
            }}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Tiêu đề *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
              placeholder="Nhập tiêu đề sự kiện"
              required
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Danh mục
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* All Day Toggle - Only for non-repeat events */}
          {!formData.repeatEnabled && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={formData.allDay}
                  onChange={(e) => handleAllDayChange(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  Cả ngày
                </span>
              </label>
            </div>
          )}

          {/* Date/Time for Single Events */}
          {!formData.repeatEnabled && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Bắt đầu
                </label>
                <input
                  type={formData.allDay ? 'date' : 'datetime-local'}
                  value={formData.allDay ? formData.startDate.slice(0, 10) : formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Kết thúc
                </label>
                <input
                  type={formData.allDay ? 'date' : 'datetime-local'}
                  value={formData.allDay ? formData.endDate.slice(0, 10) : formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
            </div>
          )}

          {/* Date Range and Time for Repeat Events */}
          {formData.repeatEnabled && (
            <>
              {/* Date Range */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Ngày bắt đầu lặp *
                  </label>
                  <input
                    type="date"
                    value={formData.repeatStartDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeatStartDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Ngày kết thúc lặp *
                  </label>
                  <input
                    type="date"
                    value={formData.repeatEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeatEndDate: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                    min={formData.repeatStartDate}
                    required
                  />
                </div>
              </div>

              {/* Time Range */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Thời gian bắt đầu *
                  </label>
                  <input
                    type="time"
                    value={formData.repeatStartTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeatStartTime: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Thời gian kết thúc *
                  </label>
                  <input
                    type="time"
                    value={formData.repeatEndTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeatEndTime: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Location */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Địa điểm
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
              placeholder="Nhập địa điểm (tùy chọn)"
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="Mô tả sự kiện (tùy chọn)"
            />
          </div>

          {/* Reminder */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}>
              <input
                type="checkbox"
                checked={formData.reminderEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderEnabled: e.target.checked }))}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                Nhắc nhở
              </span>
            </label>
            
            {formData.reminderEnabled && (
              <select
                value={formData.reminderMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderMinutes: parseInt(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem'
                }}
              >
                {reminderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Repeat Options */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}>
              <input
                type="checkbox"
                checked={formData.repeatEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, repeatEnabled: e.target.checked }))}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                🔄 Lặp lại sự kiện
              </span>
            </label>

            {formData.repeatEnabled && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                {/* Repeat Type */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Loại lặp lại
                  </label>
                  <select
                    value={formData.repeatType}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeatType: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="daily">Hằng ngày</option>
                    <option value="weekly" disabled>Hằng tuần (sắp có)</option>
                    <option value="monthly" disabled>Hằng tháng (sắp có)</option>
                  </select>
                </div>

                {/* Preview */}
                {formData.repeatStartDate && formData.repeatEndDate && formData.repeatType === 'daily' && (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#dbeafe',
                    borderRadius: '6px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#1e40af',
                      fontWeight: '500',
                      marginBottom: '0.25rem'
                    }}>
                      📋 Xem trước:
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                      {(() => {
                        const start = new Date(formData.repeatStartDate)
                        const end = new Date(formData.repeatEndDate)
                        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

                        if (days > 365) {
                          return `⚠️ Quá nhiều ngày lặp lại (${days} ngày). Khuyến nghị tối đa 365 ngày.`
                        } else if (days > 30) {
                          return `Lặp lại trong ${days} ngày từ ${start.toLocaleDateString('vi-VN')} đến ${end.toLocaleDateString('vi-VN')} (${Math.ceil(days/30)} tháng)`
                        } else {
                          return `Lặp lại trong ${days} ngày từ ${start.toLocaleDateString('vi-VN')} đến ${end.toLocaleDateString('vi-VN')}`
                        }
                      })()}
                    </div>

                    <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.25rem' }}>
                      ⏰ Thời gian: {formData.repeatStartTime} - {formData.repeatEndTime} hằng ngày
                    </div>

                    {(() => {
                      const start = new Date(formData.repeatStartDate)
                      const end = new Date(formData.repeatEndDate)
                      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

                      if (days > 100) {
                        return (
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#dc2626',
                            marginTop: '0.5rem',
                            fontWeight: '500'
                          }}>
                            💡 Mẹo: Với nhiều ngày lặp lại, hãy cân nhắc tạo từng giai đoạn nhỏ hơn
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Hủy
            </button>
            
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {event ? 'Cập nhật' : 'Tạo sự kiện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
