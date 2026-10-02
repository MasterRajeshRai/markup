'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { CmsModule } from '@/lib/modules-service';
import { REGISTERED_MODULES } from '@/lib/modules-service';

interface ModulesContextType {
  modules: CmsModule[];
  enabledModuleIds: Set<string>;
  isModuleEnabled: (moduleId: string) => boolean;
  toggleModule: (moduleId: string, targetState?: boolean) => Promise<boolean>;
  bulkUpdateModules: (states: Record<string, boolean>) => Promise<boolean>;
  loading: boolean;
  counts: {
    total: number;
    active: number;
    inactive: number;
    core: number;
  };
  refreshModules: () => Promise<void>;
}

const defaultEnabledIds = new Set(
  REGISTERED_MODULES.filter((m) => m.enabled).map((m) => m.id)
);

const ModulesContext = createContext<ModulesContextType>({
  modules: REGISTERED_MODULES,
  enabledModuleIds: defaultEnabledIds,
  isModuleEnabled: (id: string) => defaultEnabledIds.has(id),
  toggleModule: async () => false,
  bulkUpdateModules: async () => false,
  loading: false,
  counts: {
    total: REGISTERED_MODULES.length,
    active: defaultEnabledIds.size,
    inactive: REGISTERED_MODULES.length - defaultEnabledIds.size,
    core: REGISTERED_MODULES.filter((m) => m.isCore).length,
  },
  refreshModules: async () => {},
});

export const useModules = () => useContext(ModulesContext);

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const [modules, setModules] = useState<CmsModule[]>(REGISTERED_MODULES);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/modules');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setModules(json.data);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch modules state, using local defaults', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const enabledModuleIds = useMemo(() => {
    return new Set(modules.filter((m) => m.enabled).map((m) => m.id));
  }, [modules]);

  const isModuleEnabled = useCallback(
    (moduleId: string): boolean => {
      const mod = modules.find((m) => m.id === moduleId);
      if (!mod) return false;
      if (mod.isCore) return true;
      return mod.enabled;
    },
    [modules]
  );

  const toggleModule = useCallback(
    async (moduleId: string, targetState?: boolean): Promise<boolean> => {
      const current = modules.find((m) => m.id === moduleId);
      if (!current) return false;
      if (current.isCore) return true; // Cannot disable core

      const nextState = targetState !== undefined ? targetState : !current.enabled;

      // Optimistic update
      setModules((prev) =>
        prev.map((m) => (m.id === moduleId ? { ...m, enabled: nextState } : m))
      );

      try {
        const res = await fetch('/api/v1/modules', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId, enabled: nextState }),
        });

        if (!res.ok) {
          // Revert on error
          setModules((prev) =>
            prev.map((m) => (m.id === moduleId ? { ...m, enabled: current.enabled } : m))
          );
          return false;
        }

        const data = await res.json();
        if (data.data) {
          setModules((prev) =>
            prev.map((m) => (m.id === moduleId ? data.data : m))
          );
        }
        return true;
      } catch (err) {
        // Revert on network error
        setModules((prev) =>
          prev.map((m) => (m.id === moduleId ? { ...m, enabled: current.enabled } : m))
        );
        return false;
      }
    },
    [modules]
  );

  const bulkUpdateModules = useCallback(
    async (states: Record<string, boolean>): Promise<boolean> => {
      // Optimistic update
      setModules((prev) =>
        prev.map((m) =>
          states[m.id] !== undefined && !m.isCore
            ? { ...m, enabled: states[m.id] }
            : m
        )
      );

      try {
        const res = await fetch('/api/v1/modules', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ states }),
        });

        if (!res.ok) {
          fetchModules();
          return false;
        }

        const data = await res.json();
        if (data.data) {
          setModules(data.data);
        }
        return true;
      } catch {
        fetchModules();
        return false;
      }
    },
    [fetchModules]
  );

  const counts = useMemo(() => {
    const active = modules.filter((m) => m.enabled).length;
    const core = modules.filter((m) => m.isCore).length;
    return {
      total: modules.length,
      active,
      inactive: modules.length - active,
      core,
    };
  }, [modules]);

  const value = useMemo(
    () => ({
      modules,
      enabledModuleIds,
      isModuleEnabled,
      toggleModule,
      bulkUpdateModules,
      loading,
      counts,
      refreshModules: fetchModules,
    }),
    [
      modules,
      enabledModuleIds,
      isModuleEnabled,
      toggleModule,
      bulkUpdateModules,
      loading,
      counts,
      fetchModules,
    ]
  );

  return <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>;
}
