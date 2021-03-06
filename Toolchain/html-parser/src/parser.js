let currentToken = null
let currentAttribute = null
let stack
let currentTextNode = null

function emit(token) {
    let top = stack[stack.length - 1]
    if (token.type == "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: []
        }
        element.tagName = token.tagName
        for (let p in token) {
            if (p != "type" || p != "tagName") {
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

        top.children.push(element)
        if (!token.isSelfClosing) {
            stack.push(element)
        }
        currentTextNode = null
    } else if (token.type == "endTag") {
        if (top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!")
        } else {
            stack.pop()
        }
        currentTextNode = null
    } else if (token.type == "text") {
        if (currentTextNode == null) {
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content
    }
}

const EOF = Symbol("EOF");

function data(c) {
    if (c == "<") {
        return tagOpen
    } else if (c == EOF) {
        emit({ type: "EOF" })
        return
    } else {
        emit({ type: "text", content: c })
        return data
    }
}
function tagOpen(c) {
    if (c == "/") {
        return endTagOpen
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "startTag",
            tagName: ""
        }
        return tagName(c)
    } else {
        emit({ type: "text", content: c })
        return data
    }
}
function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c == "/") {
        return selfClosingStartTag
    } else if (c.match(/^[A-Z]$/)) {
        currentToken.tagName += c
        return tagName
    } else if (c == ">") {
        emit(currentToken)
        return data
    } else {
        currentToken.tagName += c
        return tagName
    }
}
function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c)
    } else if (c == "=") {

    } else {
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c)
    }
}
function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c)
    } else if (c == "=") {
        return beforeAttributeValue
    } else if (c == "\u0000" || c == "\"" || c == "'" || c == "<") {

    } else {
        currentAttribute.name += c
        return attributeName
    }
}
function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName
    } else if (c == "/") {
        return selfClosingStartTag
    } else if (c == "=") {
        return beforeAttributeValue
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c == EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c)
    }
}
function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return beforeAttributeValue
    } else if (c == "\"") {
        return doubleQuoteAttributeValue
    } else if (c == "\'") {
        return singleQuoteAttributeValue
    } else if (c == ">") {
        return data
    } else {
        return UnquotedAttributeValue(c)
    }
}
function doubleQuoteAttributeValue(c) {
    if (c == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuoteAttributeValue
    } else if (c == "\u0000" || c == EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuoteAttributeValue
    }
}
function singleQuoteAttributeValue(c) {
    if (c == "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuoteAttributeValue
    } else if (c == "\u0000" || c == EOF) {

    } else {
        currentAttribute.value += c
        return singleQuoteAttributeValue
    }
}
function afterQuoteAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if (c == "/") {
        return selfClosingStartTag
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c == EOF) {

    } else {
        throw new Error("unexpected character \"" + c + "\"");
    }
}
function UnquotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    } else if (c == "/") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c == "\u0000" || c == "\"" || c == "'" || c == "<" || c == "=" || c == "`" || c == EOF) {

    } else {
        currentAttribute.value += c
        return UnquotedAttributeValue
    }
}
function selfClosingStartTag(c) {
    if (c == ">") {
        currentToken.isSelfClosing = true
        emit(currentToken)
        return data
    } else {

    }
}
function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName: ""
        }
        return tagName(c)
    } else {

    }
}

export function parseHTML(html) {
    stack = [{ type: "document", children: [] }]
    currentToken = null;
    currentAttribute = null;
    currentTextNode = null;
    let state = data
    for (let c of html) {
        state = state(c)
    }
    state = state(EOF)
    return stack[0]
}