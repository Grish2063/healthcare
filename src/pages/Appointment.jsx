import { useState, useEffect, useCallback, useRef } from 'react';

const Appointment_Types =[
    {value: 'checkup', label:'Checkup', color: 'blue'   },
    {value: 'followup', label:'Follow-up', color: 'green' },
    {value: 'urgent',label: 'Urgent' , color: 'amber'  },
    {value: 'procedure', label: 'Procedure', color:'purple'},
    {value: 'lab', label: 'Lab', color:'gray'},

];

const Durations = ['15 minutes', '30 minutes', '45 minutes', '1 hr', '1.5hr', '2hr'];

