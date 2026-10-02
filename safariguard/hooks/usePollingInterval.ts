import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useIsFocused } from 'expo-router';

export function usePollingInterval(intervalMs: number = 5000, enabled: boolean = true): number | false {
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
    });
    return () => sub.remove();
  }, []);

  if (!enabled || !isFocused || appState !== 'active') {
    return false;
  }
  return intervalMs;
}
