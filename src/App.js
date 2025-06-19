import React, { useState, useEffect } from 'react';
import { Plus, Pill, Clock, AlertTriangle, Check, X, Calendar } from 'lucide-react';

const MedicationTracker = () => {
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    pillCount: '',
    timesPerDay: 1,
    schedule: ['morning'],
    startDate: new Date().toISOString().split('T')[0],
    refillAlert: 7,
    takeWithFood: false,
    daysOfWeek: []
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedMeds = localStorage.getItem('medications');
    if (savedMeds) {
      setMedications(JSON.parse(savedMeds));
    }
  }, []);

  // Save to localStorage whenever medications change
  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
  }, [medications]);

  const timeSlots = ['morning', 'afternoon', 'evening', 'bedtime'];

  const daysOfWeek = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  const addMedication = () => {
    if (!newMed.name || !newMed.dosage || !newMed.pillCount || newMed.daysOfWeek.length === 0) return;
    
    const medication = {
      id: Date.now(),
      ...newMed,
      pillCount: parseInt(newMed.pillCount),
      timesPerDay: parseInt(newMed.timesPerDay),
      refillAlert: parseInt(newMed.refillAlert),
      doseTaken: {},
      createdAt: new Date().toISOString()
    };
    
    setMedications([...medications, medication]);
    setNewMed({
      name: '',
      dosage: '',
      pillCount: '',
      timesPerDay: 1,
      schedule: ['morning'],
      startDate: new Date().toISOString().split('T')[0],
      refillAlert: 7,
      takeWithFood: false,
      daysOfWeek: []
    });
    setShowAddForm(false);
  };

  const deleteMedication = (id) => {
    const medication = medications.find(med => med.id === id);
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${medication?.name}" from your tracker?\n\nThis action cannot be undone.`
    );
    
    if (confirmDelete) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const markDoseTaken = (medId, timeSlot, date) => {
    setMedications(medications.map(med => {
      if (med.id === medId) {
        const doseTaken = { ...med.doseTaken };
        if (!doseTaken[date]) doseTaken[date] = {};
        doseTaken[date][timeSlot] = !doseTaken[date][timeSlot];
        return { ...med, doseTaken };
      }
      return med;
    }));
  };

  const calculateDaysLeft = (med) => {
    const today = new Date();
    const startDate = new Date(med.startDate);
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const pillsUsed = daysPassed * med.timesPerDay;
    const pillsLeft = med.pillCount - pillsUsed;
    return Math.floor(pillsLeft / med.timesPerDay);
  };

  const needsRefill = (med) => {
    return calculateDaysLeft(med) <= med.refillAlert;
  };

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const isDoseTaken = (med, timeSlot) => {
    const today = getTodayString();
    return med.doseTaken[today]?.[timeSlot] || false;
  };

  const updateSchedule = (times) => {
    const schedules = {
      1: ['morning'],
      2: ['morning', 'evening'],
      3: ['morning', 'afternoon', 'evening'],
      4: ['morning', 'afternoon', 'evening', 'bedtime']
    };
    setNewMed({
      ...newMed,
      timesPerDay: times,
      schedule: schedules[times] || ['morning']
    });
  };

  const toggleDayOfWeek = (day) => {
    const currentDays = newMed.daysOfWeek;
    let newDays;
    
    if (currentDays.includes(day)) {
      // Remove day if already selected
      newDays = currentDays.filter(d => d !== day);
    } else {
      // Add day if not selected
      newDays = [...currentDays, day];
    }
    
    setNewMed({
      ...newMed,
      daysOfWeek: newDays
    });
  };

  const shouldShowToday = (med) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return med.daysOfWeek.includes(today);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">MedTracker</h1>
                <p className="text-gray-600">Stay on top of your medications</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Medication</span>
            </button>
          </div>
        </div>

        {/* Add Medication Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Medication</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={newMed.name}
                  onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Lisinopril"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10mg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Pills
                </label>
                <input
                  type="number"
                  value={newMed.pillCount}
                  onChange={(e) => setNewMed({...newMed, pillCount: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Times per Day
                </label>
                <select
                  value={newMed.timesPerDay}
                  onChange={(e) => updateSchedule(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>Once daily</option>
                  <option value={2}>Twice daily</option>
                  <option value={3}>Three times daily</option>
                  <option value={4}>Four times daily</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newMed.startDate}
                  onChange={(e) => setNewMed({...newMed, startDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refill Alert (days before)
                </label>
                <input
                  type="number"
                  value={newMed.refillAlert}
                  onChange={(e) => setNewMed({...newMed, refillAlert: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="7"
                />
              </div>
            </div>
            
            {/* Take with Food Toggle */}
            <div className="mt-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newMed.takeWithFood}
                  onChange={(e) => setNewMed({...newMed, takeWithFood: e.target.checked})}
                  className="w-5 h-5 text-blue-500 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Take with food</span>
              </label>
            </div>

            {/* Days of Week Selector */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Days of the week
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDayOfWeek(day.value)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      newMed.daysOfWeek.includes(day.value)
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select the days when you need to take this medication (at least one day required)
              </p>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addMedication}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Medication
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Refill Alerts */}
        {medications.some(med => needsRefill(med)) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <h3 className="text-lg font-medium text-red-800">Refill Alerts</h3>
            </div>
            <div className="mt-2">
              {medications.filter(med => needsRefill(med)).map(med => (
                <p key={med.id} className="text-red-700">
                  <strong>{med.name}</strong> - {calculateDaysLeft(med)} days remaining
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Medications List */}
        <div className="space-y-4">
          {medications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No medications added yet</h3>
              <p className="text-gray-500">Click "Add Medication" to get started tracking your prescriptions.</p>
            </div>
          ) : (
            medications.map(med => (
              <div key={med.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{med.name}</h3>
                    <p className="text-gray-600">{med.dosage} • {med.timesPerDay}x daily</p>
                    {med.takeWithFood && (
                      <p className="text-blue-600 text-sm">🥪 Take with food</p>
                    )}
                    <div className="flex items-center mt-2">
                      <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">
                        {calculateDaysLeft(med)} days remaining
                      </span>
                      {needsRefill(med) && (
                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          Refill Soon
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Days: {med.daysOfWeek.map(day => day.slice(0,3)).join(', ')}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMedication(med.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {shouldShowToday(med) ? (
                    med.schedule.map(timeSlot => (
                      <button
                        key={timeSlot}
                        onClick={() => markDoseTaken(med.id, timeSlot, getTodayString())}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isDoseTaken(med, timeSlot)
                            ? 'bg-green-100 border-green-500 text-green-800'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {isDoseTaken(med, timeSlot) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          <span className="capitalize text-sm font-medium">{timeSlot}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 md:col-span-4 text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No doses scheduled for today</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>All data is stored locally on your device for privacy.</p>
        </div>
      </div>
    </div>
  );
};

export default MedicationTracker;