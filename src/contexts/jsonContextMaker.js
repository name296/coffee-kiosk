// ============================================================================
// JSON 기반 자동 Context 생성 유틸리티
// JSON 파일을 로드하여 자동으로 Context를 생성하고 관리
// ============================================================================

import React, { useState, useEffect, useMemo, createContext } from "react";

/**
 * JSON 파일 기반 Context 생성 함수
 * @param {string} jsonPath - JSON 파일 경로
 * @param {string} contextName - Context 이름 (디버깅용)
 * @param {Object} defaultValue - 기본값
 * @returns {Object} { Context, Provider, useHook }
 */
export const createJsonContext = (jsonPath, contextName = 'JsonContext', defaultValue = {}) => {
  const Context = createContext(defaultValue);

  const Provider = ({ children }) => {
    const [data, setData] = useState(defaultValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch(jsonPath);
          
          if (!response.ok) {
            console.warn(`[${contextName}] ${jsonPath} not found (${response.status}), using default value`);
            setData(defaultValue);
            setLoading(false);
            return;
          }
          
          // Content-Type 확인
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.warn(`[${contextName}] ${jsonPath} is not JSON (${contentType}), using default value`);
            setData(defaultValue);
            setLoading(false);
            return;
          }
          
          const jsonData = await response.json();
          setData(jsonData);
        } catch (err) {
          // HTML 응답 등 JSON 파싱 실패 시
          if (err instanceof SyntaxError) {
            console.warn(`[${contextName}] ${jsonPath} returned non-JSON content, using default value`);
          } else {
            console.error(`[${contextName}] Failed to load ${jsonPath}:`, err);
          }
          setError(err);
          setData(defaultValue);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [jsonPath]);

    const value = useMemo(() => ({
      data,
      loading,
      error,
    }), [data, loading, error]);

    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  };

  const useHook = () => {
    const context = React.useContext(Context);
    if (context === undefined) {
      throw new Error(`use${contextName} must be used within a ${contextName}Provider`);
    }
    return context;
  };

  return {
    Context,
    Provider,
    useHook,
  };
};

