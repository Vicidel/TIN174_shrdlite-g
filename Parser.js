(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Types", "./Grammar", "./lib/nearley"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Types_1 = require("./Types");
    var Grammar_1 = require("./Grammar");
    var nearley = require("./lib/nearley");
    /********************************************************************************
    ** Parser
    
    This module parses a command given as a string by the user into a
    list of possible parses, each of which contains an object of type 'Command'.
    
    You don't have to edit this file.
    ********************************************************************************/
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    /* The main parse function.
     *
     * @param input: A string with the input from the user.
     * @returns: A list of parse results, each containing an object of type 'Command'.
     *           If there's a parsing error, it returns a string with a description of the error.
     */
    function parse(input) {
        var NearleyParser = (typeof window !== "undefined") ? window.nearley.Parser : nearley.Parser;
        // The grammar does not recognise uppercase, whitespace or punctuation,
        // so we make it lowercase and remove all whitespace and punctuation:
        var parsestr = input.toLowerCase().replace(/\W/g, "");
        try {
            var results = new NearleyParser(Grammar_1.grammar.ParserRules, Grammar_1.grammar.ParserStart).feed(parsestr).results;
        }
        catch (err) {
            if ('offset' in err) {
                return "Parsing failed after " + err.offset + " characters";
            }
            else {
                throw err;
            }
        }
        if (!results.length) {
            return 'Parsing failed, incomplete input';
        }
        // We need to clone the Nearley parse result, because some parts can be shared with other parses
        return results.map(function (res) { return new Types_1.ShrdliteResult(input, res.clone()); });
    }
    exports.parse = parse;
});
