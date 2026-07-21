'use client';

import { useEffect, useState } from 'react';
import { buildNewRecord } from './record-helpers';

type RecordEntry = {
  id: string;
  created_at: string;
  heart_rate: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  oxygen_saturation: number;
  blood_sugar: number;
  weight: number;
  liver_alt: number;
  liver_ast: number;
  kidney_creatinine: number;
  kidney_bun: number;
  cholesterol_total: number;
  cholesterol_hdl: number;
  cholesterol_ldl: number;
};

type VitalsFormState = {
  heart_rate?: string;
  systolic?: string;
  diastolic?: string;
  oxygen?: string;
  sugar?: string;
  weight?: string;
};

type PageKey = 'summary' | 'vitals' | 'workout' | 'history';

const demoRecord = {
  id: 'demo-record',
  created_at: new Date().toISOString(),
  heart_rate: 76,
  blood_pressure_systolic: 118,
  blood_pressure_diastolic: 76,
  oxygen_saturation: 98,
  blood_sugar: 94,
  weight: 72,
  liver_alt: 24,
  liver_ast: 22,
  kidney_creatinine: 0.9,
  kidney_bun: 16,
  cholesterol_total: 179,
  cholesterol_hdl: 54,
  cholesterol_ldl: 108
};

const olderDemoRecord = {
  id: 'older-demo-record',
  created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  heart_rate: 82,
  blood_pressure_systolic: 126,
  blood_pressure_diastolic: 84,
  oxygen_saturation: 96,
  blood_sugar: 102,
  weight: 79,
  liver_alt: 31,
  liver_ast: 29,
  kidney_creatinine: 1.1,
  kidney_bun: 19,
  cholesterol_total: 201,
  cholesterol_hdl: 46,
  cholesterol_ldl: 132
};

const extraDemoRecords = [
  {
    id: 'demo-record-2',
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    heart_rate: 74,
    blood_pressure_systolic: 116,
    blood_pressure_diastolic: 74,
    oxygen_saturation: 97,
    blood_sugar: 91,
    weight: 71,
    liver_alt: 23,
    liver_ast: 21,
    kidney_creatinine: 0.88,
    kidney_bun: 15,
    cholesterol_total: 174,
    cholesterol_hdl: 56,
    cholesterol_ldl: 103
  },
  {
    id: 'demo-record-3',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    heart_rate: 78,
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 78,
    oxygen_saturation: 98,
    blood_sugar: 96,
    weight: 72,
    liver_alt: 26,
    liver_ast: 24,
    kidney_creatinine: 0.92,
    kidney_bun: 16,
    cholesterol_total: 181,
    cholesterol_hdl: 55,
    cholesterol_ldl: 109
  }
];

export default function Dashboard() {
  const [records, setRecords] = useState<RecordEntry[]>([demoRecord, ...extraDemoRecords, olderDemoRecord]);
  const [form, setForm] = useState<VitalsFormState>({});
  const [activePage, setActivePage] = useState<PageKey>('summary');

  const pages: { id: PageKey; label: string; icon: string }[] = [
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'vitals', label: 'Your daily vitals', icon: '🩺' },
    { id: 'workout', label: 'Workout', icon: '🏋️' },
    { id: 'history', label: 'History', icon: '📋' }
  ];

  const workoutPlans = [
    {
      title: 'Warm-up',
      description: '5 minutes of light walking and mobility',
      reward: '🥉 50 coins',
      accent: 'from-amber-400 to-orange-500'
    },
    {
      title: 'Strength',
      description: '3 rounds of squats, push-ups, and planks',
      reward: '🥈 75 coins',
      accent: 'from-slate-400 to-slate-600'
    },
    {
      title: 'Cardio',
      description: '10 minutes of steady cycling or jogging',
      reward: '🥇 100 coins',
      accent: 'from-yellow-400 to-amber-500'
    },
    {
      title: 'Recovery',
      description: 'Stretching and breathing for 5 minutes',
      reward: '💎 120 coins',
      accent: 'from-cyan-400 to-blue-500'
    }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/records');
        const data: unknown = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setRecords(data as RecordEntry[]);
        } else {
          setRecords([demoRecord, ...extraDemoRecords, olderDemoRecord]);
        }
      } catch {
        setRecords([demoRecord, ...extraDemoRecords, olderDemoRecord]);
      }
    };

    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newRecord = buildNewRecord(form) as RecordEntry;

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });

      if (response.ok) {
        const savedRecord = (await response.json()) as RecordEntry;
        setRecords((prev) => [savedRecord || newRecord, ...prev]);
        setForm({});
        setActivePage('history');
        alert('Saved to PostgreSQL ✅');
        return;
      }
    } catch {
      // fall back to local demo mode if the API is unavailable
    }

    setRecords((prev) => [newRecord, ...prev]);
    setForm({});
    setActivePage('history');
    alert('Saved locally in demo mode ✅');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eef7ff,_#f8fafc_45%,_#eefbf4)] p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:flex-row">
        <div className="flex-1 space-y-6">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-sky-500 to-emerald-500 p-6 text-white shadow-2xl">
            <div className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-yellow-300 bg-gradient-to-br from-yellow-300 to-amber-500 text-sm font-bold text-amber-900 shadow-lg">
              92
            </div>
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-emerald-300/20 blur-2xl" />
            <div className="relative">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-3xl">👋</span>
                <h1 className="text-3xl font-bold">
                  Hello there!
                </h1>
              </div>
              <p className="text-lg font-medium text-blue-50">
                How are you feeling today?
              </p>
              <p className="mt-2 max-w-xl text-sm text-blue-100">
                Keep your routine focused on daily vitals, workouts, and history in one place.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                  Daily check-in
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                  Health snapshot
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                  Recent records
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl bg-white/80 p-3 shadow">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activePage === page.id
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="mr-2">{page.icon}</span>
                {page.label}
              </button>
            ))}
          </div>

          {activePage === 'summary' && (
            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Summary
              </p>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-700">Heart rate</p>
                  <p className="mt-1 text-xl font-semibold text-slate-800">{records[0]?.heart_rate ?? '—'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-700">Workout plan</p>
                  <p className="mt-1 text-xl font-semibold text-slate-800">Ready</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-slate-700">History</p>
                  <p className="mt-1 text-xl font-semibold text-slate-800">{records.length} entries</p>
                </div>
              </div>
            </div>
          )}

          {activePage === 'vitals' && (
            <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-blue-500">
                    Your daily vitals
                  </h2>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Daily check-in
                  </span>
                </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  placeholder="Heart Rate"
                  onChange={(e) => setForm({ ...form, heart_rate: e.target.value })}
                  className="rounded-lg border p-3"
                />

                <input
                  placeholder="Weight"
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="rounded-lg border p-3"
                />

                <input
                  placeholder="Systolic BP"
                  onChange={(e) => setForm({ ...form, systolic: e.target.value })}
                  className="rounded-lg border p-3"
                />

                <input
                  placeholder="Diastolic BP"
                  onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
                  className="rounded-lg border p-3"
                />

                <input
                  placeholder="Oxygen %"
                  onChange={(e) => setForm({ ...form, oxygen: e.target.value })}
                  className="rounded-lg border p-3"
                />

                <input
                  placeholder="Blood Sugar"
                  onChange={(e) => setForm({ ...form, sugar: e.target.value })}
                  className="rounded-lg border p-3"
                />

                <button className="col-span-1 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 py-3 font-semibold text-white shadow hover:opacity-95 md:col-span-2">
                  Save Record
                </button>
              </form>
            </div>
          )}

          {activePage === 'workout' && (
            <div className="rounded-2xl bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600">
                  Workout
                </p>
                <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                  Daily streak bonus
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-800">
                A simple plan for today
              </h2>
              <div className="mt-3 rounded-xl bg-purple-50 p-3 text-sm text-purple-700">
                3 habits completed • Keep going to unlock your next streak bonus
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {workoutPlans.map((plan) => (
                  <div key={plan.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{plan.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                      </div>
                      <div className={`rounded-full bg-gradient-to-r ${plan.accent} px-3 py-1 text-xs font-semibold text-white shadow`}>
                        {plan.reward}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-semibold">Smartwatch monitoring</p>
                <p className="mt-1">
                  Yes — this can be connected to Apple Health or Google Fit so your workout data, heart rate, and steps can be tracked automatically from a smartwatch.
                </p>
              </div>
            </div>
          )}

          {activePage === 'history' && (
            <div className="space-y-4">
              {records.length > 0 ? (
                records.map((r) => (
                  <div key={r.id} className="rounded-xl bg-white p-4 shadow">
                    <p className="text-gray-700">❤️ HR: {r.heart_rate}</p>
                    <p>🩸 BP: {r.blood_pressure_systolic}/{r.blood_pressure_diastolic}</p>
                    <p>🫁 O2: {r.oxygen_saturation}%</p>
                    <p>🍬 Sugar: {r.blood_sugar}</p>
                    <p>⚖️ Weight: {r.weight} kg</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white p-6 text-center text-slate-600 shadow">
                  No records yet. Add your first record to get started.
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}