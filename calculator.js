let calculatorState;

document.addEventListener('DOMContentLoaded', () => {
    calculatorState = {
        isComplete: false,
        inputEl: document.getElementById('input_span'),
        resultEl: document.getElementById('result_span'),
    };

    document.querySelector('table').addEventListener('click', (e) => {
        if (e.target.tagName === 'TD' && !e.target.classList.contains('bg_black')) {
            const inputValue = e.target.textContent.trim();
            processInput(inputValue);
        }
    });

    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if(isValidKey(key)) {
            processInput(key);
        }
    });
});

function processInput(value) {
    if (isInvalidOperator(value)) return;

    if (calculatorState.isComplete) {
        handleClear(isOperator(value));
    }

    switch (value) {
        case 'Enter':
        case '=':
            isOperator(getLastInput()) || handleEqual();
            break;
        case 'Escape':
        case 'AC':
            handleClear();
            break;
        case 'Backspace':
        case '〈':
            handleBackspace();
            break;
        case '.':
            handleDot(value);
            break;
        default:
            if (value === '*') value = '×';
            if (value === '/') value = '÷';
            handleDefault(value);
    }
}

function getLastInput() {
    return calculatorState.inputEl.textContent.trim().slice(-1);
}

function isInvalidOperator(value) {
    const lastInput = getLastInput();
    return (isOperator(lastInput) ||  lastInput === ".") && isOperator(value);
}

function isValidKey(key) {
    return isNumber(key) || isOperator(key) || ['=', 'Enter', 'Backspace', 'Escape', '.'].includes(key);
}

function isNumber(value) {
    return /^\d+$/.test(value);
}

function isOperator(value) {
    return ["×", "÷", "+", "-", "*", "/"].includes(value);
}

function handleEqual() {
    const { inputEl, resultEl } = calculatorState;
    const postfix = infixToPostfix(inputEl.textContent);
    const result = evaluatePostfix(postfix);
    calculatorState.isComplete = true;
    resultEl.textContent = result;
}

function handleClear(isOperator = false) {
    const { inputEl, resultEl } = calculatorState;
    if (isOperator) {
        inputEl.textContent = resultEl.textContent;
    } else {
        inputEl.textContent = '';
    }

    resultEl.textContent = '';
    calculatorState.isComplete = false;
}

function handleBackspace() {
    const expression = calculatorState.inputEl.textContent;
    calculatorState.inputEl.textContent = expression.slice(0, -1);
}

function handleDot(value) {
    let expression = calculatorState.inputEl.textContent;
    if (expression && !expression.endsWith('.')) {
        calculatorState.inputEl.textContent += value;
    }
}

function handleDefault(value) {
    let expression = calculatorState.inputEl.textContent;

    if (expression === '' && (isOperator(value) || value === '0')) {
        return;
    }
    
    expression += value;
    calculatorState.inputEl.textContent = expression;
}

function infixToPostfix(expression) {
    const precedence = {
        '+': 1,
        '-': 1,
        '×': 2,
        '÷': 2
    };

    const stack = [];
    const output = [];
    const tokens = expression.match(/\d+(\.\d+)?|\+|\-|\×|\÷/g);

    tokens.forEach(token => {
        if (/\d+(\.\d+)?/.test(token)) {
            output.push(token);
        } else if (token in precedence) {
            while (stack.length && precedence[stack[stack.length - 1]] >= precedence[token]) {
                output.push(stack.pop());
            }
            stack.push(token);
        }
    });

    while (stack.length) {
        output.push(stack.pop());
    }

    return output.join(' ');
}

function evaluatePostfix(expression) {
    const stack = [];
    const tokens = expression.split(' ');

    tokens.forEach(token => {
        if (/\d/.test(token)) {
            stack.push(parseFloat(token));
        } else {
            const secondOperand = stack.pop();
            const firstOperand = stack.pop();
            switch (token) {
                case '+':
                    stack.push(firstOperand + secondOperand);
                    break;
                case '-':
                    stack.push(firstOperand - secondOperand);
                    break;
                case '×':
                    stack.push(firstOperand * secondOperand);
                    break;
                case '÷':
                    if (secondOperand === 0) {
                        alert("0으로 나눌 수 없습니다.");
                        handleClear();
                        return;
                    } else {
                        stack.push(firstOperand / secondOperand);
                    }
                    break;
            }
        }
    });

    return stack.pop();
}
