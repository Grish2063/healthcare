import { useState, useEffect, useCallback, useRef } from 'react';
import NewAppointmentModal from '../../../../Downloads/NewAppointmentModal';

const Appointment_Types =[
    {value: 'checkup', label:'Checkup', color: 'blue'   },
    {value: 'followup', label:'Follow-up', color: 'green' },
    {value: 'urgent',label: 'Urgent' , color: 'amber'  },
    {value: 'procedure', label: 'Procedure', color:'purple'},
    {value: 'lab', label: 'Lab', color:'gray'},

];

const Durations = ['15 minutes', '30 minutes', '45 minutes', '1 hr', '1.5hr', '2hr'];

const Priority_Options = [
    {value: 'routine',label: 'Routine', className: 'nam-pill-routine' },
    {value: 'urgent', label: 'Urgent', className: 'nam-pill-urgent'},
    {value: 'emergency', label: 'Emergency', className: 'nam-pill-emergency'},
    
];

//Time Duration

const Time_Slots = [
    {time: '9:00 AM', available: true},
    {time: '9:30 AM', available: true},
    {time: '10:00 AM', available: false},
    {time: '10:30 AM', available: true},
    {time: '11:00 AM', available: true},
    {time: '11:30 AM', available: false},
    {time: '2:00 PM', available: true},
    {time: '2:30 PM', available: true},
];

// Appointment Type option colors

const TYPE_COLOR = {
  blue:   { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
  green:  { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' },
  amber:  { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
  purple: { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9' },
  gray:   { bg: '#f8fafc', border: '#94a3b8', text: '#475569' },
};

// Required Fields that needs to be filled

const Required = ['patientId', 'doctorId', 'date', 'timeSlot', 'appointmentType'];


// Validation of form
function Validate(form){
    const errors = {};
    if(!form.patientId) errors.patientId = 'Select a patient';
    if(!form.doctorId) errors.doctorId = 'Assign a doctor';
    if(!form.date) errors.date = 'Pick a date';
    if(!form.timeSlot) errors.timeSlot = 'Choose an available slot';
    if(!form.appointmentType) errors.appointmentType = 'Select an appointment type';
    return errors;
    
}
export default NewAppointmentModal;



