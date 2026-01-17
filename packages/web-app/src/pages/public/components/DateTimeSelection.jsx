import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { fetchPublicAvailability, updateBookingData } from '@shared/store/slices/publicBookingSlice';

const DateTimeSelection = ({ businessCode, onNext, onBack }) => {
  const dispatch = useDispatch();

  // Obtener estado de Redux
  const {
    availability,
    bookingData,
    isLoadingAvailability,
    availabilityError
  } = useSelector(state => state.publicBooking);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Cargar disponibilidad cuando cambie el mes o los datos de booking
  useEffect(() => {
    if (businessCode && bookingData.service?.id && bookingData.specialist?.id) {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      dispatch(fetchPublicAvailability({
        businessCode,
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          serviceId: bookingData.service.id,
          specialistId: bookingData.specialist.id
        }
      }));
    }
  }, [currentMonth, businessCode, bookingData.service?.id, bookingData.specialist?.id, dispatch]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    const dateTime = {
      date: selectedDate.toISOString().split('T')[0],
      time: time.time,
      specialistId: bookingData.specialist.id,
      specialistName: time.specialistName,
      branchId: time.branchId,
      branchName: time.branchName,
      branchAddress: time.branchAddress
    };
    console.log('✅ DateTimeSelection - Fecha/hora seleccionada:', dateTime);
    dispatch(updateBookingData({ dateTime }));
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availability[dateStr] && availability[dateStr].length > 0;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const availableTimes = selectedDate ? availability[selectedDate.toISOString().split('T')[0]] || [] : [];

  if (!bookingData.service || !bookingData.specialist) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Primero selecciona un servicio y especialista</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 hover:text-blue-800 underline"
        >
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Selecciona fecha y hora
        </h2>
        <p className="text-gray-600">
          Elige cuándo quieres tu {bookingData.service?.name?.toLowerCase() || 'servicio'} con {bookingData.specialist?.name || 'el especialista'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <h3 className="font-semibold text-gray-900">
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <div key={index} className="aspect-square">
                  {date ? (
                    <button
                      onClick={() => !isPast(date) && isDateAvailable(date) && handleDateSelect(date)}
                      disabled={isPast(date) || !isDateAvailable(date)}
                      className={`w-full h-full flex items-center justify-center text-sm rounded-lg transition-colors ${
                        isPast(date)
                          ? 'text-gray-300 cursor-not-allowed'
                          : !isDateAvailable(date)
                          ? 'text-gray-400 cursor-not-allowed'
                          : selectedDate && date.toDateString() === selectedDate.toDateString()
                          ? 'bg-blue-600 text-white'
                          : isToday(date)
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {isLoadingAvailability && (
            <div className="text-center mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Cargando disponibilidad...</p>
            </div>
          )}

          {availabilityError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{availabilityError}</p>
            </div>
          )}
        </div>

        {/* Time Slots */}
        <div>
          {selectedDate ? (
            <div>
              <h3 className="font-medium text-gray-900 mb-4">
                Horarios disponibles para {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h3>

              {availableTimes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableTimes.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSelect(slot)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedTime && selectedTime.time === slot.time && selectedTime.branchId === slot.branchId
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold text-lg">{slot.time}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="font-medium">{slot.branchName}</div>
                        <div className="text-xs text-gray-500">{slot.branchAddress}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Selecciona una fecha para ver los horarios disponibles</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Volver
        </button>
        <button
          onClick={onNext}
          disabled={!bookingData.dateTime}
          className={`px-6 py-2 rounded-lg font-medium ${
            bookingData.dateTime
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default DateTimeSelection;