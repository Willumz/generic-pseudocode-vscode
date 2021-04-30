"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const index = {
    "keyword": [
        "test",
        "test3"
    ]
};
const tokenCodes = new Map();
tokenCodes.set("keyword", 0);
const tokenTypesLegend = ["keyword"];
const tokenModifiersLegend = [];
const legend = new vscode.SemanticTokensLegend(tokenTypesLegend, tokenModifiersLegend);
function activate(context) {
    context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider({ language: "pseudocode" }, new DocumentSemanticTokensProvider(), legend));
}
exports.activate = activate;
class DocumentSemanticTokensProvider {
    async provideDocumentSemanticTokens(document, token) {
        var documentText = document.getText();
        var tokens = this.extractTokens(this.cleanText(documentText));
        const builder = new vscode.SemanticTokensBuilder();
        tokens.forEach(val => {
            builder.push(val.line, val.startCharacter, val.length, val.type);
        });
        return builder.build();
    }
    // TODO: Extract tokens from cleaned text
    extractTokens(text) {
        var tokens = [];
        var lines = text.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var re = /([A-Z]|[a-z])+/g;
            var matches = lines[i].matchAll(re);
            var match = matches.next();
            while (!match.done) {
                //console.log(match.value);
                var matchType = this.determineType(match.value[0]);
                if (matchType !== -1 && match.value.index !== undefined)
                    tokens.push({
                        line: i,
                        startCharacter: match.value.index,
                        length: match.value[0].length,
                        type: matchType
                    });
                match = matches.next();
            }
        }
        console.log(tokens);
        return tokens;
    }
    // Remove string literals
    // Replaces the contents of strings (including the '"' but excluding any instances of '\n' or '\r') with '#'
    cleanText(text) {
        var cleaned = "";
        var inString = false;
        var isEscaped = false;
        for (var i = 0; i < text.length; i++) {
            var skip = false;
            if (text[i] === '"' && !isEscaped) {
                inString = !inString;
                skip = true;
            }
            if (text[i] === "\\" && inString)
                isEscaped = !isEscaped;
            if (text[i] !== "\\")
                isEscaped = false;
            // console.log(
            //     `text[i]:${text[i]} isEscaped:${isEscaped} inString:${inString} skip:${skip}`
            // );
            if (inString || skip) {
                if (text[i] === "\n" || text[i] === "\r")
                    cleaned += text[i];
                else
                    cleaned += "#";
                continue;
            }
            cleaned += text[i];
        }
        return cleaned;
    }
    determineType(tokenText) {
        var typeNum = -1;
        console.log(tokenText);
        Object.keys(index).forEach(typeVal => {
            console.log(typeVal);
            if (index[typeVal].includes(tokenText)) {
                console.log("yes");
                var code = tokenCodes.get(typeVal);
                console.log(code);
                if (code !== undefined)
                    typeNum = code;
            }
        });
        return typeNum;
    }
}
