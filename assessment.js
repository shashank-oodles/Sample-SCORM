// Child Safety Assessment Questions
const questions = [
    {
        id: 1,
        text: "How do you usually feel when you're at home?",
        options: [
            { value: 0, text: "😊 Happy and safe" },
            { value: 1, text: "😐 Okay most of the time" },
            { value: 2, text: "😟 Worried or scared sometimes" },
            { value: 3, text: "😢 Scared or upset often" }
        ]
    },
    {
        id: 2,
        text: "When you make a mistake or do something wrong, what usually happens?",
        options: [
            { value: 0, text: "My parents talk to me calmly and help me learn" },
            { value: 1, text: "I get in trouble but nothing too bad" },
            { value: 2, text: "I get yelled at or punished harshly" },
            { value: 3, text: "I get hit or hurt physically" }
        ]
    },
    {
        id: 3,
        text: "Do your parents usually make sure you have what you need?",
        options: [
            { value: 0, text: "Yes, I always have food, clothes, and a place to sleep" },
            { value: 1, text: "Usually, but sometimes we run out of things" },
            { value: 2, text: "Sometimes I don't have enough food or clean clothes" },
            { value: 3, text: "Often I don't have what I need" }
        ]
    },
    {
        id: 4,
        text: "How do your parents usually talk to you?",
        options: [
            { value: 0, text: "With kind and loving words" },
            { value: 1, text: "Normal, like most parents" },
            { value: 2, text: "Sometimes they say mean things that hurt my feelings" },
            { value: 3, text: "They often say things that make me feel bad about myself" }
        ]
    },
    {
        id: 5,
        text: "If you're hurt or sick, what happens?",
        options: [
            { value: 0, text: "My parents take care of me and get help if needed" },
            { value: 1, text: "They usually help me feel better" },
            { value: 2, text: "Sometimes they don't seem to notice or care" },
            { value: 3, text: "They often don't help me when I'm hurt or sick" }
        ]
    },
    {
        id: 6,
        text: "Are there times when adults touch you in ways that make you uncomfortable?",
        options: [
            { value: 0, text: "No, never" },
            { value: 1, text: "Sometimes, but it might be by accident" },
            { value: 2, text: "Yes, and it makes me feel uncomfortable" },
            { value: 3, text: "Yes, and I've been told to keep it secret" }
        ]
    },
    {
        id: 7,
        text: "How often do your parents spend time with you?",
        options: [
            { value: 0, text: "We spend good time together regularly" },
            { value: 1, text: "Sometimes, when they're not busy" },
            { value: 2, text: "Not very often, they're usually doing other things" },
            { value: 3, text: "Almost never, I'm often alone or with others" }
        ]
    },
    {
        id: 8,
        text: "When you're scared or upset, what happens?",
        options: [
            { value: 0, text: "My parents comfort me and help me feel better" },
            { value: 1, text: "They usually try to help" },
            { value: 2, text: "They sometimes get annoyed with me" },
            { value: 3, text: "They get angry or tell me to stop" }
        ]
    },
    {
        id: 9,
        text: "Do you ever see or hear your parents fighting in scary ways?",
        options: [
            { value: 0, text: "No, they don't fight in front of me" },
            { value: 1, text: "Sometimes they argue, but not scary" },
            { value: 2, text: "Yes, they sometimes fight and it scares me" },
            { value: 3, text: "Yes, they fight a lot and it's very scary" }
        ]
    },
    {
        id: 10,
        text: "Are there adults in your life who you feel safe talking to?",
        options: [
            { value: 0, text: "Yes, I have several adults I trust" },
            { value: 1, text: "Yes, at least one or two" },
            { value: 2, text: "Maybe one person" },
            { value: 3, text: "No, I don't feel safe talking to adults" }
        ]
    },
    {
        id: 11,
        text: "Do you get to do things that kids your age usually do?",
        options: [
            { value: 0, text: "Yes, I can play and do activities like other kids" },
            { value: 1, text: "Most of the time" },
            { value: 2, text: "Sometimes, but not as much as I'd like" },
            { value: 3, text: "No, I have to take care of adults or miss out on kid activities" }
        ]
    },
    {
        id: 12,
        text: "Overall, how safe do you feel in your home?",
        options: [
            { value: 0, text: "Very safe and loved" },
            { value: 1, text: "Pretty safe most of the time" },
            { value: 2, text: "Sometimes unsafe or worried" },
            { value: 3, text: "Often unsafe or scared" }
        ]
    }
];

class ChildSafetyAssessment {
    constructor() {
        this.currentQuestion = 0;
        this.answers = [];
        this.startTime = Date.now();
        this.totalQuestions = questions.length;
    }

    getCurrentQuestion() {
        return questions[this.currentQuestion];
    }

    selectAnswer(value) {
        this.answers[this.currentQuestion] = value;
    }

    hasAnswer() {
        return this.answers[this.currentQuestion] !== undefined;
    }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            return true;
        }
        return false;
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            return true;
        }
        return false;
    }

    canGoPrevious() {
        return this.currentQuestion > 0;
    }

    canGoNext() {
        return this.hasAnswer();
    }

    isComplete() {
        return this.currentQuestion === this.totalQuestions - 1 && this.hasAnswer();
    }

    calculateScore() {
        const totalScore = this.answers.reduce((sum, answer) => sum + answer, 0);
        const maxScore = this.totalQuestions * 3;
        const percentage = (totalScore / maxScore) * 100;
        
        return {
            raw: totalScore,
            percentage: Math.round(percentage),
            level: this.getSafetyLevel(percentage)
        };
    }

    getSafetyLevel(percentage) {
        if (percentage <= 25) {
            return 'low';
        } else if (percentage <= 60) {
            return 'moderate';
        } else {
            return 'high';
        }
    }

    getResults() {
        const score = this.calculateScore();
        const sessionTime = Date.now() - this.startTime;
        
        let message, recommendations;
        
        switch (score.level) {
            case 'low':
                message = "Your answers suggest you feel safe and cared for at home. That's wonderful!";
                recommendations = [
                    "Keep talking to the adults you trust",
                    "Remember that you can always ask for help if you need it",
                    "Continue to share your feelings with people who care about you"
                ];
                break;
            case 'moderate':
                message = "Your answers suggest there might be some things at home that worry you sometimes.";
                recommendations = [
                    "It's important to talk to a trusted adult about your feelings",
                    "Consider speaking with a teacher, school counselor, or relative",
                    "Remember that asking for help is always okay",
                    "Your feelings matter and you deserve to feel safe"
                ];
                break;
            case 'high':
                message = "Your answers suggest you might not feel safe at home. This is very important.";
                recommendations = [
                    "Please talk to a trusted adult right away - a teacher, counselor, or relative",
                    "You can call the Childhelp Hotline: 1-800-422-4453",
                    "Remember: This is not your fault",
                    "You deserve to be safe and protected",
                    "There are people who can help you"
                ];
                break;
        }
        
        return {
            score,
            message,
            recommendations,
            sessionTime
        };
    }

    reset() {
        this.currentQuestion = 0;
        this.answers = [];
        this.startTime = Date.now();
    }
}

// Global assessment instance
window.assessment = new ChildSafetyAssessment();