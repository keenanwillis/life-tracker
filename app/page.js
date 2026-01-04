// File: app/page.js
// Copy this ENTIRE file and paste it into your GitHub repo at: app/page.js

"use client"
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Check } from 'lucide-react';

const storage = {
  get: (key) => {
    if (typeof window === 'undefined') return null;
    try {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    } catch (error) {
      return null;
    }
  },
  set: (key, value) => {
    if (typeof window === 'undefined') return null;
    try {
      localStorage.setItem(key, value);
      return { key, value };
    } catch (error) {
      console.error('Error saving:', error);
      return null;
    }
  }
};

export default function LifeTrackerApp() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const result = storage.get('tracker-data');
      if (result && result.value) {
        setData(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Starting fresh');
    }
    setLoading(false);
  };

  const saveData = (newData) => {
    setData(newData);
    try {
      storage.set('tracker-data', JSON.stringify(newData));
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const getDateKey = (date) => date.toISOString().split('T')[0];

  const getDayData = (date) => {
    const key = getDateKey(date);
    if (data[key]) return data[key];
    
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevData = data[getDateKey(prevDate)];
    
    return {
      date: key,
      work: {
        eisenhower: {
          doIt: prevData?.work?.eisenhower?.doIt?.filter(t => !t.completed) || [],
          schedule: prevData?.work?.eisenhower?.schedule?.filter(t => !t.completed) || [],
          getHelp: prevData?.work?.eisenhower?.getHelp?.filter(t => !t.completed) || [],
          getRidOf: prevData?.work?.eisenhower?.getRidOf?.filter(t => !t.completed) || []
        },
        bigThree: [
          { text: '', completed: false },
          { text: '', completed: false },
          { text: '', completed: false }
        ],
        outreach: {
          calls: [false, false, false, false, false, false, false, false, false, false],
          emails: [false, false, false, false, false, false, false, false, false, false]
        },
        parkingLot: ''
      },
      health: {
        meals: { breakfast: false, lunch: false, dinner: false },
        mobility: null,
        movement: [],
        hygiene: null,
        meds: { taken: null, what: '' }
      },
      personal: {
        eisenhower: {
          doIt: prevData?.personal?.eisenhower?.doIt?.filter(t => !t.completed) || [],
          schedule: prevData?.personal?.eisenhower?.schedule?.filter(t => !t.completed) || [],
          getHelp: prevData?.personal?.eisenhower?.getHelp?.filter(t => !t.completed) || [],
          getRidOf: prevData?.personal?.eisenhower?.getRidOf?.filter(t => !t.completed) || []
        },
        bigThree: [
          { text: '', completed: false },
          { text: '', completed: false },
          { text: '', completed: false }
        ],
        goals: {
          expressWife: null,
          expressSon: null,
          keptPromises: null,
          read15Min: null,
          actHealthy: null,
          dailyDevotional: null,
          meditate5Min: null
        },
        parkingLot: ''
      },
      reflection: {
        rose: '',
        bud: '',
        thorn: '',
        laugh: '',
        gratitude: ['', '', '']
      }
    };
  };

  const updateDayData = (updates) => {
    const key = getDateKey(currentDate);
    const dayData = getDayData(currentDate);
    saveData({ ...data, [key]: { ...dayData, ...updates } });
  };

  const navigateDay = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + delta);
    setCurrentDate(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const dayData = getDayData(currentDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Life Tracker - Daily View</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Daily Tracker</h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigateDay(-1)} 
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-medium text-gray-700 min-w-[300px] text-center">
                {formatDate(currentDate)}
              </span>
              <button 
                onClick={() => navigateDay(1)} 
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        <WorkSection dayData={dayData} updateDayData={updateDayData} />
        <HealthSection dayData={dayData} updateDayData={updateDayData} />
        <PersonalSection dayData={dayData} updateDayData={updateDayData} />
        <ReflectionSection dayData={dayData} updateDayData={updateDayData} />
      </div>
    </div>
  );
}

function WorkSection({ dayData, updateDayData }) {
  const getQuadrantStyles = (color) => {
    const styles = {
      red: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-800', labelBg: 'bg-red-200' },
      blue: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-800', labelBg: 'bg-blue-200' },
      yellow: { border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-800', labelBg: 'bg-yellow-200' },
      gray: { border: 'border-gray-200', bg: 'bg-gray-50', text: 'text-gray-800', labelBg: 'bg-gray-200' }
    };
    return styles[color];
  };

  const quadrants = [
    { key: 'doIt', label: 'Do It Today', color: 'red', sublabel: 'Urgent & Important' },
    { key: 'schedule', label: 'Schedule It', color: 'blue', sublabel: 'Important, Not Urgent' },
    { key: 'getHelp', label: 'Get Help', color: 'yellow', sublabel: 'Urgent, Not Important' },
    { key: 'getRidOf', label: 'Get Rid Of', color: 'gray', sublabel: 'Neither' }
  ];

  const addTask = (q) => {
    const newEisenhower = { ...dayData.work.eisenhower };
    newEisenhower[q] = [...newEisenhower[q], { text: '', completed: false }];
    updateDayData({ ...dayData, work: { ...dayData.work, eisenhower: newEisenhower } });
  };

  const updateTask = (q, i, field, value) => {
    const newEisenhower = { ...dayData.work.eisenhower };
    newEisenhower[q] = [...newEisenhower[q]];
    newEisenhower[q][i] = { ...newEisenhower[q][i], [field]: value };
    updateDayData({ ...dayData, work: { ...dayData.work, eisenhower: newEisenhower } });
  };

  const removeTask = (q, i) => {
    const newEisenhower = { ...dayData.work.eisenhower };
    newEisenhower[q] = newEisenhower[q].filter((_, idx) => idx !== i);
    updateDayData({ ...dayData, work: { ...dayData.work, eisenhower: newEisenhower } });
  };

  const updateBigThree = (i, field, value) => {
    const newBigThree = [...dayData.work.bigThree];
    newBigThree[i] = { ...newBigThree[i], [field]: value };
    updateDayData({ ...dayData, work: { ...dayData.work, bigThree: newBigThree } });
  };

  const toggleOutreach = (type, i) => {
    const newOutreach = { ...dayData.work.outreach };
    newOutreach[type] = [...newOutreach[type]];
    newOutreach[type][i] = !newOutreach[type][i];
    updateDayData({ ...dayData, work: { ...dayData.work, outreach: newOutreach } });
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Work - Eisenhower Matrix</h2>
        <div className="grid grid-cols-2 gap-4">
          {quadrants.map((quad) => {
            const styles = getQuadrantStyles(quad.color);
            return (
              <div key={quad.key} className={`border-2 ${styles.border} rounded-lg p-4 ${styles.bg}`}>
                <h3 className={`font-semibold ${styles.text} mb-3 flex justify-between`}>
                  {quad.label}
                  <span className={`text-xs ${styles.labelBg} px-2 py-1 rounded`}>{quad.sublabel}</span>
                </h3>
                <div className="space-y-2">
                  {dayData.work.eisenhower[quad.key].map((task, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded group">
                      <button onClick={() => updateTask(quad.key, i, 'completed', !task.completed)} className="text-green-600 hover:text-green-700">
                        <Check size={16} />
                      </button>
                      <input
                        type="text"
                        value={task.text}
                        onChange={(e) => updateTask(quad.key, i, 'text', e.target.value)}
                        className={`flex-1 text-sm bg-transparent outline-none ${task.completed ? 'line-through text-gray-500' : ''}`}
                        placeholder="Add task..."
                      />
                      <button onClick={() => removeTask(quad.key, i)} className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addTask(quad.key)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                    <Plus size={16} /> Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Big 3 (Must-Do's Today)</h2>
        <div className="space-y-3">
          {dayData.work.bigThree.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <input type="checkbox" checked={item.completed} onChange={(e) => updateBigThree(i, 'completed', e.target.checked)} className="mt-1 w-5 h-5 rounded border-gray-300" />
              <input type="text" value={item.text} onChange={(e) => updateBigThree(i, 'text', e.target.value)} placeholder={`Must-do #${i + 1}`} className={`flex-1 p-2 border rounded ${item.completed ? 'line-through text-gray-500 bg-gray-50' : ''}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Net New Outreach</h2>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium text-gray-700">Prospecting Calls</h3>
            <span className="text-sm text-gray-500">{dayData.work.outreach.calls.filter(Boolean).length}/10 completed</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {dayData.work.outreach.calls.map((checked, i) => (
              <button key={i} onClick={() => toggleOutreach('calls', i)} className={`w-10 h-10 rounded border-2 font-semibold transition-colors ${checked ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <h3 className="font-medium text-gray-700">Prospecting Emails</h3>
            <span className="text-sm text-gray-500">{dayData.work.outreach.emails.filter(Boolean).length}/10 completed</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {dayData.work.outreach.emails.map((checked, i) => (
              <button key={i} onClick={() => toggleOutreach('emails', i)} className={`w-10 h-10 rounded border-2 font-semibold transition-colors ${checked ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400 hover:border-gray-400'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Parking Lot</h2>
        <textarea value={dayData.work.parkingLot} onChange={(e) => updateDayData({ ...dayData, work: { ...dayData.work, parkingLot: e.target.value } })} placeholder="Jot down notes, ideas, or thoughts from the day..." className="w-full p-3 border rounded-lg resize-y min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>
  );
}

function HealthSection({ dayData, updateDayData }) {
  const toggleMeal = (meal) => {
    const newMeals = { ...dayData.health.meals };
    newMeals[meal] = !newMeals[meal];
    updateDayData({ ...dayData, health: { ...dayData.health, meals: newMeals } });
  };

  const setMobility = (value) => updateDayData({ ...dayData, health: { ...dayData.health, mobility: value } });
  const setHygiene = (value) => updateDayData({ ...dayData, health: { ...dayData.health, hygiene: value } });

  const addWorkout = () => {
    const newMovement = [...dayData.health.movement, { type: 'Lift', duration: '', unit: 'minutes' }];
    updateDayData({ ...dayData, health: { ...dayData.health, movement: newMovement } });
  };

  const updateWorkout = (i, field, value) => {
    const newMovement = [...dayData.health.movement];
    newMovement[i] = { ...newMovement[i], [field]: value };
    if (field === 'type') newMovement[i].unit = ['Spin', 'Run', 'Walk'].includes(value) ? 'miles' : 'minutes';
    updateDayData({ ...dayData, health: { ...dayData.health, movement: newMovement } });
  };

  const removeWorkout = (i) => {
    const newMovement = dayData.health.movement.filter((_, idx) => idx !== i);
    updateDayData({ ...dayData, health: { ...dayData.health, movement: newMovement } });
  };

  const updateMeds = (field, value) => {
    const newMeds = { ...dayData.health.meds, [field]: value };
    updateDayData({ ...dayData, health: { ...dayData.health, meds: newMeds } });
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Health - Meals</h2>
        <div className="space-y-3">
          {['breakfast', 'lunch', 'dinner'].map((meal) => (
            <label key={meal} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={dayData.health.meals[meal]} onChange={() => toggleMeal(meal)} className="w-5 h-5 rounded border-gray-300" />
              <span className="text-gray-700 capitalize">{meal}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Mobility</h2>
        <div className="flex flex-col gap-2">
          <span className="text-gray-700 mb-2">Did You Stretch?</span>
          <div className="flex gap-4">
            {[true, false].map(v => (
              <button key={v ? 'yes' : 'no'} onClick={() => setMobility(v)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${dayData.health.mobility === v ? v ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'}`}>
                <span className="text-2xl">{v ? '😊' : '😞'}</span>
                <span className="font-medium">{v ? 'Yes' : 'No'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Movement</h2>
        <div className="space-y-3">
          {dayData.health.movement.map((workout, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg group">
              <select value={workout.type} onChange={(e) => updateWorkout(i, 'type', e.target.value)} className="px-3 py-2 border rounded bg-white">
                {['Lift', 'Spin', 'Run', 'Basketball', 'Golf', 'Walk', 'Other'].map(t => <option key={t}>{t}</option>)}
              </select>
              <input type="number" value={workout.duration} onChange={(e) => updateWorkout(i, 'duration', e.target.value)} placeholder="Duration" className="w-24 px-3 py-2 border rounded" step="0.1" />
              <span className="text-gray-600">{workout.unit}</span>
              <button onClick={() => removeWorkout(i)} className="ml-auto text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100">
                <X size={18} />
              </button>
            </div>
          ))}
          <button onClick={addWorkout} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
            <Plus size={16} /> Add Workout
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Hygiene</h2>
        <div className="flex flex-col gap-2">
          <span className="text-gray-700 mb-2">Did You Shower Today?</span>
          <div className="flex gap-4">
            {[true, false].map(v => (
              <button key={v ? 'yes' : 'no'} onClick={() => setHygiene(v)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${dayData.health.hygiene === v ? v ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'}`}>
                <span className="text-2xl">{v ? '😊' : '😞'}</span>
                <span className="font-medium">{v ? 'Yes' : 'No'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Meds</h2>
        <label className="flex items-center gap-3 cursor-pointer mb-3">
          <input type="checkbox" checked={dayData.health.meds.taken === true} onChange={(e) => updateMeds('taken', e.target.checked ? true : null)} className="w-5 h-5 rounded border-gray-300" />
          <span className="text-gray-700">Did You Take Anything Today?</span>
        </label>
        {dayData.health.meds.taken && (
          <input type="text" value={dayData.health.meds.what} onChange={(e) => updateMeds('what', e.target.value)} placeholder="What did you take?" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        )}
      </div>
    </div>
  );
}

function PersonalSection({ dayData, updateDayData }) {
  const getQuadrantStyles = (color) => {
    const styles = {
      red: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-800', labelBg: 'bg-red-200' },
      blue: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-800', labelBg: 'bg-blue-200' },
      yellow: { border: 'border-yellow-200', bg: 'bg-yellow-50', text: 'text-yellow-800', labelBg: 'bg-yellow-200' },
      gray: { border: 'border-gray-200', bg: 'bg-gray-50', text: 'text-gray-800', labelBg: 'bg-gray-200' }
    };
    return styles[color];
  };

  const quadrants = [
    { key: 'doIt', label: 'Do It Today', color: 'red', sublabel: 'Urgent & Important' },
    { key: 'schedule', label: 'Schedule It', color: 'blue', sublabel: 'Important, Not Urgent' },
    { key: 'getHelp', label: 'Get Help', color: 'yellow', sublabel: 'Urgent, Not Important' },
    { key: 'getRidOf', label: 'Get Rid Of', color: 'gray', sublabel: 'Neither' }
  ];

  const goals = [
    { key: 'expressWife', label: 'Express Affection with Wife', type: '3-option' },
    { key: 'expressSon', label: 'Express Affection with Son', type: '3-option' },
    { key: 'keptPromises', label: 'Kept Promises to Myself', type: 'boolean' },
    { key: 'read15Min', label: 'Read for 15 Minutes', type: 'boolean' },
    { key: 'actHealthy', label: 'Act Like a Healthy Person Today', type: 'boolean' },
    { key: 'dailyDevotional', label: 'Daily Devotional?', type: 'boolean' },
    { key: 'meditate5Min', label: 'Meditate for 5 Minutes?', type: 'boolean' }
  ];

  const addTask = (q) => {
    const newEisenhower = { ...dayData.personal.eisenhower };
    newEisenhower[q] = [...newEisenhower[q], { text: '', completed: false }];
    updateDayData({ ...dayData, personal: { ...dayData.personal, eisenhower: newEisenhower } });
  };

  const updateTask = (q, i, field, value) => {
    const newEisenhower = { ...dayData.personal.eisenhower };
    newEisenhower[q] = [...newEisenhower[q]];
    newEisenhower[q][i] = { ...newEisenhower[q][i], [field]: value };
    updateDayData({ ...dayData, personal: { ...dayData.personal, eisenhower: newEisenhower } });
  };

  const removeTask = (q, i) => {
    const newEisenhower = { ...dayData.personal.eisenhower };
    newEisenhower[q] = newEisenhower[q].filter((_, idx) => idx !== i);
    updateDayData({ ...dayData, personal: { ...dayData.personal, eisenhower: newEisenhower } });
  };

  const updateBigThree = (i, field, value) => {
    const newBigThree = [...dayData.personal.bigThree];
    newBigThree[i] = { ...newBigThree[i], [field]: value };
    updateDayData({ ...dayData, personal: { ...dayData.personal, bigThree: newBigThree } });
  };

  const updateGoal = (key, val) => {
    const newGoals = { ...dayData.personal.goals, [key]: val };
    updateDayData({ ...dayData, personal: { ...dayData.personal, goals: newGoals } });
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal - Eisenhower Matrix</h2>
        <div className="grid grid-cols-2 gap-4">
          {quadrants.map((quad) => {
            const styles = getQuadrantStyles(quad.color);
            return (
              <div key={quad.key} className={`border-2 ${styles.border} rounded-lg p-4 ${styles.bg}`}>
                <h3 className={`font-semibold ${styles.text} mb-3 flex justify-between`}>
                  {quad.label}
                  <span className={`text-xs ${styles.labelBg} px-2 py-1 rounded`}>{quad.sublabel}</span>
                </h3>
                <div className="space-y-2">
                  {dayData.personal.eisenhower[quad.key].map((task, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded group">
                      <button onClick={() => updateTask(quad.key, i, 'completed', !task.completed)} className="text-green-600">
                        <Check size={16} />
                      </button>
                      <input type="text" value={task.text} onChange={(e) => updateTask(quad.key, i, 'text', e.target.value)} className={`flex-1 text-sm bg-transparent outline-none ${task.completed ? 'line-through text-gray-500' : ''}`} placeholder="Add task..." />
                      <button onClick={() => removeTask(quad.key, i)} className="text-red-500 opacity-0 group-hover:opacity-100">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addTask(quad.key)} className="flex items-center gap-2 text-sm text-gray-500">
                    <Plus size={16} /> Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Big 3 (Must-Do's Today)</h2>
        <div className="space-y-3">
          {dayData.personal.bigThree.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <input type="checkbox" checked={item.completed} onChange={(e) => updateBigThree(i, 'completed', e.target.checked)} className="mt-1 w-5 h-5 rounded border-gray-300" />
              <input type="text" value={item.text} onChange={(e) => updateBigThree(i, 'text', e.target.value)} placeholder={`Must-do #${i + 1}`} className={`flex-1 p-2 border rounded ${item.completed ? 'line-through text-gray-500 bg-gray-50' : ''}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Goal Trackers</h2>
        <div className="space-y-4">
          {goals.map((goal, idx) => (
            <div key={goal.key} className={`flex flex-col gap-2 ${idx < goals.length - 1 ? 'pb-4 border-b' : ''}`}>
              <span className="text-gray-700 font-medium">{goal.label}</span>
              <div className="flex gap-3">
                {goal.type === '3-option' ? (
                  <>
                    {['positive', 'neutral', 'negative'].map((v) => (
                      <button key={v} onClick={() => updateGoal(goal.key, v)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${dayData.personal.goals[goal.key] === v ? v === 'positive' ? 'border-green-500 bg-green-50 text-green-700' : v === 'neutral' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-500'}`}>
                        <span className="text-2xl">{v === 'positive' ? '😊' : v === 'neutral' ? '😐' : '😞'}</span>
                        <span className="font-medium capitalize">{v}</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {[true, false].map((v) => (
                      <button key={v ? 'yes' : 'no'} onClick={() => updateGoal(goal.key, v)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${dayData.personal.goals[goal.key] === v ? v ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-500'}`}>
                        <span className="text-2xl">{v ? '😊' : '😞'}</span>
                        <span className="font-medium">{v ? 'Yes' : 'No'}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Parking Lot</h2>
        <textarea value={dayData.personal.parkingLot} onChange={(e) => updateDayData({ ...dayData, personal: { ...dayData.personal, parkingLot: e.target.value } })} placeholder="Jot down notes, ideas, or thoughts from the day..." className="w-full p-3 border rounded-lg resize-y min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>
  );
}

function ReflectionSection({ dayData, updateDayData }) {
  const reflection = dayData.reflection || { rose: '', bud: '', thorn: '', laugh: '', gratitude: ['', '', ''] };

  const updateReflection = (field, value) => {
    updateDayData({ ...dayData, reflection: { ...reflection, [field]: value } });
  };

  const updateGratitude = (index, value) => {
    const newGratitude = [...reflection.gratitude];
    newGratitude[index] = value;
    updateDayData({ ...dayData, reflection: { ...reflection, gratitude: newGratitude } });
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Daily Reflection</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🌹 What was today's Rose? (highlight of the day)</label>
            <textarea value={reflection.rose} onChange={(e) => updateReflection('rose', e.target.value)} placeholder="What was the best part of your day?" className="w-full p-3 border rounded-lg resize-y min-h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🌱 What was today's Bud? (something you're looking forward to)</label>
            <textarea value={reflection.bud} onChange={(e) => updateReflection('bud', e.target.value)} placeholder="What are you excited about or looking forward to?" className="w-full p-3 border rounded-lg resize-y min-h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🌵 What was today's Thorn? (challenge or difficulty)</label>
            <textarea value={reflection.thorn} onChange={(e) => updateReflection('thorn', e.target.value)} placeholder="What was challenging or difficult today?" className="w-full p-3 border rounded-lg resize-y min-h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">😂 What's one thing that made you laugh?</label>
            <textarea value={reflection.laugh} onChange={(e) => updateReflection('laugh', e.target.value)} placeholder="What brought you joy or made you smile today?" className="w-full p-3 border rounded-lg resize-y min-h-20 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">🙏 What are 3 things you're grateful for?</label>
            <div className="space-y-3">
              {reflection.gratitude.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-500 font-medium">{i + 1}.</span>
                  <input type="text" value={item} onChange={(e) => updateGratitude(i, e.target.value)} placeholder={`Gratitude #${i + 1}`} className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
