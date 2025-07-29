// Main application logic
let scormInitialized = false;
let tincan; // Declare globally

// Initialize SCORM when page loads
document.addEventListener('DOMContentLoaded', function () {
    tincan = new TinCan({
        recordStores: [{
            endpoint: "https://hearts-in-the-middle--oodles--lrs.lrs.io/xapi/",
            username: "d02f3981-4bc4-4b82-b920-9a02c3dfe2ea",
            password: "a656781a-a6bb-41d7-b871-9bdcc0876d1a",
            allowFail: false
        }],
        actor: {
            name: "Shashank",
            mbox: "mailto:shashank.shukla@oodles.io"
        }
    });

    console.log(tincan);
    // Initialize SCORM
    if (window.scorm) {
        scormInitialized = window.scorm.initialize();
        if (scormInitialized) {
            window.scorm.setValue('cmi.completion_status', 'incomplete');
            window.scorm.commit();
        }
    }

    // Setup initial state
    showScreen('welcome-screen');
});

// Screen management
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// Assessment functions
function startAssessment() {
    window.assessment.reset();
    showScreen('question-screen');
    displayQuestion();
    updateProgress();

    if (typeof tincan === 'undefined') {
        console.error("TinCan object is not defined!");
        return;
    }

    if (typeof tincan !== 'undefined' && tincan.sendStatement) {
        console.log(tincan)
        tincan.sendStatement({
            verb: {
                id: "http://adlnet.gov/expapi/verbs/started",
                display: { "en-US": "started" }
            },
            object: {
                id: "http://yourdomain.com/activities/child-safety-assessment",
                definition: {
                    name: { "en-US": "Child Safety Assessment" },
                    description: { "en-US": "A simple assessment to check child safety awareness." }
                },
                objectType: "Activity"
            }
        }, function (err, response) {
            if (err) {
                console.error("xAPI 'started' statement error:", err);
            } else {
                console.log("xAPI 'started' statement sent successfully", response);
            }
        });
    }
}

function displayQuestion() {
    const question = window.assessment.getCurrentQuestion();
    const questionText = document.getElementById('question-text');
    const answerOptions = document.getElementById('answer-options');
    const currentQ = document.getElementById('current-q');
    const totalQ = document.getElementById('total-q');

    // Update question text and counter
    questionText.textContent = question.text;
    currentQ.textContent = window.assessment.currentQuestion + 1;
    totalQ.textContent = window.assessment.totalQuestions;

    // Clear previous options
    answerOptions.innerHTML = '';

    // Create answer options
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'answer-option';
        optionDiv.textContent = option.text;
        optionDiv.onclick = () => selectAnswer(option.value, optionDiv);

        // Check if this option was previously selected
        if (window.assessment.answers[window.assessment.currentQuestion] === option.value) {
            optionDiv.classList.add('selected');
        }

        answerOptions.appendChild(optionDiv);
    });

    updateNavigationButtons();
}

function selectAnswer(value, element) {
    // Remove selection from all options
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => option.classList.remove('selected'));

    // Add selection to clicked option
    element.classList.add('selected');

    // Store the answer
    window.assessment.selectAnswer(value);

    const currentQuestion = window.assessment.getCurrentQuestion();
    if (typeof tincan === 'undefined') {
        console.error("TinCan object is not defined!");
        return;
    }

    if (typeof tincan !== 'undefined') {
        tincan.sendStatement({
            verb: {
                id: "http://adlnet.gov/expapi/verbs/answered",
                display: { "en-US": "answered" }
            },
            object: {
                id: `http://yourdomain.com/questions/q${currentQuestion.id}`,
                definition: {
                    name: { "en-US": currentQuestion.text },
                    description: { "en-US": "User selected an answer for this question" }
                },
                objectType: "Activity"
            },
            result: {
                response: value.toString()
            }
        }, function (err, response) {
            if (err) {
                console.error("xAPI 'answered' statement error:", err);
            } else {
                console.log("xAPI 'answered' statement sent successfully", response);
            }
        });
    }


    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.disabled = !window.assessment.canGoPrevious();
    nextBtn.disabled = !window.assessment.canGoNext();

    // Update next button text for last question
    if (window.assessment.currentQuestion === window.assessment.totalQuestions - 1) {
        nextBtn.textContent = 'Finish';
    } else {
        nextBtn.textContent = 'Next';
    }
}

function nextQuestion() {
    if (!window.assessment.canGoNext()) return;

    if (window.assessment.isComplete()) {
        showResults();
    } else {
        window.assessment.nextQuestion();
        displayQuestion();
        updateProgress();
    }
}

function previousQuestion() {
    if (!window.assessment.canGoPrevious()) return;

    window.assessment.previousQuestion();
    displayQuestion();
    updateProgress();
}

function updateProgress() {
    const progress = document.getElementById('progress');
    const percentage = ((window.assessment.currentQuestion + 1) / window.assessment.totalQuestions) * 100;
    progress.style.width = percentage + '%';
}

function showResults() {
    const results = window.assessment.getResults();
    const resultsContent = document.getElementById('results-content');

    // Create results HTML
    let resultClass = `results-${results.score.level}`;
    let emoji = results.score.level === 'low' ? '😊' :
        results.score.level === 'moderate' ? '😐' : '😟';

    resultsContent.innerHTML = `
        <div class="${resultClass}">
            <h3>${emoji} Assessment Complete</h3>
            <p><strong>${results.message}</strong></p>
            <h4>Things to remember:</h4>
            <ul>
                ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    `;

    // Update SCORM data
    if (scormInitialized) {
        window.scorm.setScore(100 - results.score.percentage);
        window.scorm.setCompletionStatus('completed');
        window.scorm.setSuccessStatus('passed');
        window.scorm.setSessionTime(results.sessionTime);

        const score = results.score.percentage;

        if (typeof tincan === 'undefined') {
            console.error("TinCan object is not defined!");
            return;
        }

        if (typeof tincan !== 'undefined') {
            tincan.sendStatement({
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/completed",
                    display: { "en-US": "completed" }
                },
                object: {
                    id: "http://yourdomain.com/activities/child-safety-assessment",
                    definition: {
                        name: { "en-US": "Child Safety Assessment" },
                        description: { "en-US": "Completion of the child safety awareness assessment" }
                    },
                    objectType: "Activity"
                },
                result: {
                    score: {
                        scaled: score / 100,
                        raw: score,
                        min: 0,
                        max: 100
                    },
                    completion: true,
                    success: score <= 60 ? false : true
                }
            }, function (err, response) {
                if (err) {
                    console.error("xAPI 'completed' statement error:", err);
                } else {
                    console.log("xAPI 'completed' statement sent successfully", response);
                }
            });
        }


        // Store assessment data (non-identifiable)
        window.scorm.setValue('cmi.suspend_data', JSON.stringify({
            completed_at: new Date().toISOString(),
            score_level: results.score.level,
            question_count: window.assessment.totalQuestions
        }));

        window.scorm.commit();
    }

    showScreen('results-screen');
}

function restartAssessment() {
    window.assessment.reset();
    showScreen('welcome-screen');
}

// Handle window close/navigation
window.addEventListener('beforeunload', function () {
    if (scormInitialized) {
        window.scorm.terminate();
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function () {
    if (scormInitialized && document.visibilityState === 'hidden') {
        window.scorm.commit();
    }
});