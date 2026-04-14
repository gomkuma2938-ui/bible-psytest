import React, { useState } from 'react';
import surveyData from './data/questions.json';
import resultsData from './data/results.json'; // 수정됨
import './App.css';

function App() {
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

  if (showResult) {
    const result = calculateResult();
    return (
      <div className="container result-page">
        <div className="result-header">
          {/* subType 대신 통합된 type 사용 */}
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
            src={`/images/${result.id}.png`} 
            alt={result.id} 
            onError={(e) => e.target.style.display='none'} 
          />
        </div>

        <div className="section-box desc-box">
          <p className="main-desc">{result.desc}</p>
        </div>

        <div className="section-box person-box">
          <h3>성경 속 {result.personName}</h3> {/* person 필드 대신 personName 사용 */}
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

        <button className="retry-btn" onClick={() => window.location.reload()}>
          테스트 다시하기
        </button>
      </div>
    );
  }

  const currentQ = surveyData.questions[step];
  return (
    <div className="container test-page">
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${((step + 1) / surveyData.questions.length) * 100}%` }}
        ></div>
      </div>
      
      <div className="question-content">
        <span className="question-number">Q{currentQ.id}</span>
        <div className="answer-buttons">
          <button className="ans-btn" onClick={() => handleAnswer('A')}>
            {currentQ.A}
          </button>
          <button className="ans-btn" onClick={() => handleAnswer('B')}>
            {currentQ.B}
          </button>
        </div>
      </div>

      <p className="step-indicator">{step + 1} / {surveyData.questions.length}</p>
    </div>
  );
}

export default App;
