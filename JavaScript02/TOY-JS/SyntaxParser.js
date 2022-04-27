import { scan } from "./LexParser.js"

let syntax = {
    Program: [["StatementList", "EOF"]],
    StatementList: [
        ["Statement"],
        ["StatementList", "Statement"]
    ],
    Statement: [
        ["ExpressionStatement"],
        ["IfStatement"],
        ["WhileStatement"],
        ["VariableDeclaration"],
        ["FunctionDeclaration"],
        ["Block"],
        ["BreakStatement"],
        ["ContinueStatement"]
    ],
    IfStatement: [
        ["if", "(", "Expression", ")", "Statement"]
    ],
    VariableDeclaration: [
        ["var", "Identifier", ";"],
        ["let", "Identifier", ";"]
    ],
    FunctionDeclaration: [
        ["function", "Identifier", "(", ")", "{", "StatementList", "}"]
    ],
    BreakStatement: ["break", ";"],
    ContinueStatement: ["continue", ";"],
    Block: [
        ["{", "StatementList", "}"],
        ["{", "}"]
    ],
    WhileStatement: [
        ["while", "(", "Expression", ")", "Statement"]
    ],
    ExpressionStatement: [
        ["Expression", ";"]
    ],
    Expression: [
        ["AssignmentExpression"]
    ],
    AssignmentExpression: [
        ["AdditiveExpression"]
    ],
    AdditiveExpression: [
        ["MultiplicativeExpression"],
        ["AdditiveExpression", "+", "MultiplicativeExpression"],
        ["AdditiveExpression", "-", "MultiplicativeExpression"]
    ],
    MultiplicativeExpression: [
        ["PrimaryExpression"],
        ["MultiplicativeExpression", "*", "PrimaryExpression"],
        ["MultiplicativeExpression", "/", "PrimaryExpression"]
    ],
    PrimaryExpression: [
        ["(", "Expression", ")"],
        ["Literal"],
        ["Identifier"]
    ],
    Literal: [
        ["Number"]
    ]
}

let hash = {}

function closure(state) {
    hash[JSON.stringify(state)] = state;
    let queue = [];
    for (let symbol in state) {
        if (symbol.match(/^\$/)) {
            return
        }
        queue.push(symbol)
    }
    while (queue.length) {
        let symbol = queue.shift();

        if (syntax[symbol]) {
            for (let rule of syntax[symbol]) {
                if (!state[rule[0]]) {
                    queue.push(rule[0])
                }
                let current = state
                for (let part of rule) {
                    if (!current[part]) {
                        current[part] = {}
                    }
                    current = current[part]
                }
                current.$reduceType = symbol;
                current.$reduceLength = rule.length;
            }
        }
    }
    for (let symbol in state) {
        if (symbol.match(/^\$/)) {
            return
        }
        if (hash[JSON.stringify(state[symbol])]) {
            state[symbol] = hash[JSON.stringify(state[symbol])]
        } else {
            closure(state[symbol])
        }
    }

}

let end = {
    $isEnd: true
}

let start = {
    "Program": end
}

closure(start);
let source = `
    let a;
`


function parse(source) {
    let stack = [start]
    let symbolStack = [];
    function reduce() {
        if (stack.length <= 0) {
            return
        }
        let state = stack[stack.length - 1];
        if (state.$reduceType) {
            let children = [];
            for (let i = 0; i < state.$reduceLength; i++) {
                stack.pop()
                children.push(symbolStack.pop());
            }

            return {
                type: state.$reduceType,
                children: children.reverse()
            };
        } else {
            throw new Error("unexpected token");
        }
    }

    function shift(symbol) {
        if (stack.length <= 0) {
            return
        }
        let state = stack[stack.length - 1];

        if (symbol.type in state) {
            stack.push(state[symbol.type])
            symbolStack.push(symbol)
        } else {

            shift(reduce());
            shift(symbol);
        }
    }

    for (let symbol of scan(source)) {
        shift(symbol)
    }
    return reduce()
}

let res = parse(source);

console.log(res)