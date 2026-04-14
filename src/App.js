import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import surveyData from './data/questions.json';
import resultsData from './data/results.json';
import './App.css';


function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [viewId, setViewId] = useState(null); // 현재 보고 있는 결과 캐릭터 ID

const handleAnswer = (choice) => {
    setTimeout(() => {
      const newAnswers = [...userAnswers, choice];
      setUserAnswers(newAnswers);

      if (step < surveyData.questions.length - 1) {
        setStep(step + 1);
      } else {
        // 결과 계산 후 첫 번째 승자를 기본 뷰로 설정
        const scores = { paul: 0, timothy: 0, hannah: 0, nehemiah: 0, david: 0, barnabas: 0, abraham: 0, elijah: 0, ezra: 0, tabitha: 0 };
        newAnswers.forEach((c, i) => {
          const type = surveyData.scoreMap[`${i + 1}${c}`];
          if (type) scores[type] += 1;
        });
        const maxScore = Math.max(...Object.values(scores));
        const winners = Object.keys(scores).filter(key => scores[key] === maxScore);
        
        setViewId(winners[0]); // 첫 번째 동점자를 먼저 보여줌
        setShowResult(true);
      }
    }, 250);
  };

const calculateResult = () => {
    const scores = {
      paul: 0, timothy: 0, hannah: 0, nehemiah: 0, david: 0,
      barnabas: 0, abraham: 0, elijah: 0, ezra: 0, tabitha: 0
    };

    userAnswers.forEach((choice, index) => {
      const qNum = index + 1;
      const key = `${qNum}${choice}`;
      const type = surveyData.scoreMap[key];
      if (type) scores[type] += 1;
    });

    // 최고 점수가 몇 점인지 찾기
    const maxScore = Math.max(...Object.values(scores));
    
    // 최고 점수를 받은 모든 인물들의 키(id)를 찾기
    const winners = Object.keys(scores).filter(key => scores[key] === maxScore);
    
    // 첫 번째 인물을 메인 결과로 가져오기
    const mainResult = { ...resultsData[winners[0]] };
    
    // 만약 동점자가 있다면, 메인 결과 외의 사람 이름을 따로 저장하기
    const otherNames = winners.slice(1).map(key => resultsData[key].personName);
    mainResult.others = otherNames; // 결과 객체에 동점자 이름 리스트 추가
    
    return mainResult;
  };

  const saveAsImage = async () => {
    const target = document.querySelector(".result-page"); // 결과 영역 선택
    if (!target) return;
  
    try {
      const canvas = await html2canvas(target, {
        useCORS: true, // 외부 이미지(결과 캐릭터 등) 허용
        backgroundColor: "#fbf9f2", // 아이보리 배경색 강제 지정
        scale: 2, // 고해상도 저장을 위해 2배 확대
      });
  
      const image = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.createElement("a");
      link.download = "test-result.jpg";
      link.href = image;
      link.click();
    } catch (error) {
      console.error("이미지 저장 실패:", error);
      alert("이미지 저장 중 오류가 발생했습니다.");
    }
  };
  
// 1. 결과 화면
if (showResult) {
    // 1. 모든 동점자 찾기
    const scores = { paul: 0, timothy: 0, hannah: 0, nehemiah: 0, david: 0, barnabas: 0, abraham: 0, elijah: 0, ezra: 0, tabitha: 0 };
    userAnswers.forEach((choice, index) => {
      const type = surveyData.scoreMap[`${index + 1}${choice}`];
      if (type) scores[type] += 1;
    });
    const maxScore = Math.max(...Object.values(scores));
    const winners = Object.keys(scores).filter(key => scores[key] === maxScore);
    
    // 2. 현재 선택된 인물의 데이터 가져오기
    const result = resultsData[viewId || winners[0]];
    const handleRetry = () => window.location.reload();

    return (
      <div className="container result-page">
        <div className="result-header">
          {/* 🚀 동점자 전환 버튼 (2명 이상일 때만 표시) */}
          {winners.length > 1 && (
            <div className="winner-tabs">
              <p style={{fontSize: '0.8rem', color: '#888', marginBottom: '8px'}}>공동 1위 성향이 있어요! 클릭해서 확인해보세요.</p>
              <div style={{display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px'}}>
                {winners.map(id => (
                  <button 
                    key={id}
                    onClick={() => setViewId(id)}
                    className={`tab-btn ${viewId === id ? 'active' : ''}`}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: viewId === id ? 'none' : '1px solid #ddd',
                      backgroundColor: viewId === id ? 'var(--primary-color)' : 'white',
                      color: viewId === id ? 'white' : '#666',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {resultsData[id].personName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="sub-type-label">{result.type}</p> 
          <div className="summary-badge">
            <span><strong>대표인물:</strong> {result.personName}</span>
            <span className="divider">|</span>
            <span><strong>강점:</strong> {result.strengths}</span>
          </div>
          <h1 className="main-quote">"{result.quote}"</h1>
        </div>

        {/* 이미지, 상세 설명 등은 기존과 동일하게 result 변수를 사용하므로 그대로 유지됩니다 */}
        <div className="result-image">
          <img src={process.env.PUBLIC_URL + `/images/${result.image}`} alt={result.id} />
        </div>

        <div className="section-box desc-box">
          <p className="main-desc">{result.desc}</p>
        </div>

        <div className="section-box person-box">
          <p>{result.personDesc}</p>
        </div>

        <div className="info-grid">
          <div className="info-card feature-card">
            <h4>당신의 특징</h4>
            <ul>{result.features.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>
          <div className="info-card warning-card">
            <h4>주의할 점:</h4>
            <ul>{result.warnings.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </div>
        </div>

        <div className="bible-verse-footer"><p>{result.verse}</p></div>

        <div className="result-actions">
            <button className="save-btn" onClick={saveAsImage}>이미지로 저장</button>
            <button className="retry-btn" onClick={handleRetry}>다시하기</button>
        </div>
      </div>
    );
  }

  // 2. 메인 화면 (public/images/main.png 사용)
  if (!isStarted) {
    return (
      <div className="container main-page">
        <div className="main-content">
          <img 
            src={process.env.PUBLIC_URL + '/images/main.png'} 
            alt="성경 인물 테스트" 
            className="main-banner-horizontal" 
          />
          <button className="start-btn" onClick={() => setIsStarted(true)}>
            START
          </button>
        </div>
      </div>
    );
  }

  // 3. 테스트 진행 화면
  const currentQ = surveyData.questions[step];

  return (
    <div className="container test-page">
      {/* 🚀 상단에 작게 보여줄 배너 이미지 추가 */}
      <img 
        src={process.env.PUBLIC_URL + '/images/main.png'} 
        alt="성경 인물 테스트" 
        className="test-top-banner" 
      />
          
      <div className="question-content">
        
        {/* 1. 질문 번호 (Q3) */}
        <span className="question-number">Q{currentQ.id}</span>
        
        {/* 2. 질문 선택 버튼 */}
        <div className="answer-buttons" key={step}>  {/* <--- 여기에 key={step} 추가! */}
          <button className="ans-btn" onClick={() => handleAnswer('A')}>{currentQ.A}</button>
          <button className="ans-btn" onClick={() => handleAnswer('B')}>{currentQ.B}</button>
        </div>
  
        {/* 3. 진행바 (버튼 아래로 이동) */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${((step + 1) / surveyData.questions.length) * 100}%` }}></div>
        </div>
  
        {/* 4. 진행도 숫자 (3 / 40) */}
        <p className="step-indicator">{step + 1} / {surveyData.questions.length}</p>
        
      </div>
    </div>
  );
}

export default App;
