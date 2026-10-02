// ================================================================
// SRSContext.js - Local spaced-repetition review queue.
// Leitner-style: each vocab item (keyed by its audioKey) has a "box" (0-5)
// and a due date; correct recall promotes it to a longer interval, a miss
// drops it back to box 0. No backend/sync - device-local, like ProgressContext.
// ================================================================

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SRSContext = createContext();

export const useSRS = () => useContext(SRSContext);

const STORAGE_KEY = 'griot_srs_records'; // { [audioKey]: { yoruba, gloss, audioKey, box, dueDate } }

// Days until next review, indexed by box. Box 0 = "just missed it, try again
// tomorrow"; box 5 = "well known, check back in a month."
const BOX_INTERVAL_DAYS = [1, 2, 4, 7, 14, 30];

const todayIso = () => new Date().toISOString().slice(0, 10);
const addDaysIso = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export const SRSProvider = ({ children }) => {
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setRecords(raw ? JSON.parse(raw) : {});
      } catch (error) {
        console.error('Load SRS records error:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (next) => {
    setRecords(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  // Adds any not-yet-tracked vocab items to the review pool, due immediately
  // (so a word learned today can show up in today's review session). Call
  // this once a lesson containing these items is completed.
  const ensureTracked = async (items) => {
    let changed = false;
    const next = { ...records };

    for (const item of items) {
      if (!item.audioKey || next[item.audioKey]) continue;
      next[item.audioKey] = {
        yoruba: item.yoruba,
        gloss: item.gloss,
        audioKey: item.audioKey,
        box: 0,
        dueDate: todayIso(),
      };
      changed = true;
    }

    if (changed) await persist(next);
  };

  const getDueItems = (limit = 20) => {
    const today = todayIso();
    return Object.values(records)
      .filter((r) => r.dueDate <= today)
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0))
      .slice(0, limit);
  };

  const dueCount = Object.values(records).filter((r) => r.dueDate <= todayIso()).length;

  // Self-graded: `remembered` comes from the learner tapping "Got it" /
  // "Still learning" after revealing the answer, same as a physical flashcard.
  const gradeItem = async (audioKey, remembered) => {
    const record = records[audioKey];
    if (!record) return;

    const nextBox = remembered ? Math.min(record.box + 1, BOX_INTERVAL_DAYS.length - 1) : 0;
    const next = {
      ...records,
      [audioKey]: { ...record, box: nextBox, dueDate: addDaysIso(BOX_INTERVAL_DAYS[nextBox]) },
    };
    await persist(next);
  };

  return (
    <SRSContext.Provider value={{ loading, dueCount, getDueItems, gradeItem, ensureTracked }}>
      {children}
    </SRSContext.Provider>
  );
};
