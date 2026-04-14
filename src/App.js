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

  const handleAnswer = (choice) => {
    const newAnswers = [...userAnswers, choice];
    setUserAnswers(newAnswers);

    if (step < surveyData.questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
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

    const winnerKey = Object.keys(scores).reduce((a, b) => 
      scores[a] >= scores[b] ? a : b
    );
    
    return resultsData[winnerKey];
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
  const result = calculateResult();
  
  // 리로딩 함수 (다시하기용)
  const handleRetry = () => window.location.reload();

  return (
    <div className="container result-page">
      <div className="result-header">
        <p className="sub-type-label">{result.type}</p> 
        <div className="summary-badge">
          <span><strong>대표인물:</strong> {result.personName}</span>
          <span className="divider">|</span>
          <span><strong>강점:</strong> {result.strengths}</span>
        </div>
        <h1 className="main-quote">"{result.quote}"</h1>
      </div>

      <div className="result-image">
        <img 
          src={process.env.PUBLIC_URL + `/images/${result.id}.png`} 
          alt={result.id} 
          onError={(e) => e.target.style.display='none'} 
        />
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
          <ul>
            {result.features.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
        <div className="info-card warning-card">
          <h4>주의할 점:</h4>
          <ul>
            {result.warnings.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="bible-verse-footer">
        <p>{result.verse}</p>
      </div>

      {/* 🚀 버튼 그룹: 이미지 저장 버튼을 위로, 다시하기를 아래로 배치 */}
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
      {/* 질문 콘텐츠 전체를 감싸는 컨테이너 */}
      <div className="question-content">
        
        {/* 1. 질문 번호 (Q3) */}
        <span className="question-number">Q{currentQ.id}</span>
        
        {/* 2. 질문 선택 버튼 */}
        <div className="answer-buttons">
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
