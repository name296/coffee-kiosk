import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EntryPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 진입점에서 할 작업들:
    // 1. 초기화 작업
    console.log("🚀 앱 진입점 - 초기화 중...");
    
    // 2. 조건 체크 (예: 영업시간, 점검모드 등)
    // const isOperating = checkOperatingHours();
    // if (!isOperating) {
    //   navigate("/closed");
    //   return;
    // }
    
    // 3. 첫 페이지로 이동
    // 즉시 이동하거나, 로딩 후 이동
    const timer = setTimeout(() => {
      navigate("/first", { replace: true });
    }, 100); // 0.1초 후 이동 (또는 즉시: 0)

    return () => clearTimeout(timer);
  }, [navigate]);

  // 로딩 화면 또는 빈 화면
  return (
    <div className="max-width" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#fafafa'
    }}>
      {/* 로딩 스피너나 로고를 넣을 수 있음 */}
      <div style={{ fontSize: '4rem', color: '#8c532c' }}>
        Loading...
      </div>
    </div>
  );
};

export default EntryPage;

