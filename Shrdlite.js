(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Parser", "./Interpreter", "./Planner"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Parser_1 = require("./Parser");
    var Interpreter_1 = require("./Interpreter");
    var Planner_1 = require("./Planner");
    /********************************************************************************
    ** Shrdlite
    
    This module contains toplevel functions for the interaction loop, and
    the pipeline that calls the parser, the interpreter and the planner.
    
    You should do some minor changes to the function 'parseUtteranceIntoPlan'.
    Everything else can be leaved as they are.
    ********************************************************************************/
    /* Generic function that takes an utterance and returns a plan. It works according to the following pipeline:
     * - first it parses the utterance (Parser.ts)
     * - then it interprets the parse(s) (Interpreter.ts)
     * - then it creates plan(s) for the interpretation(s) (Planner.ts)
     *
     * Each of the modules Parser.ts, Interpreter.ts and Planner.ts
     * defines its own version of interface Result, which in the case
     * of Interpreter.ts and Planner.ts extends the Result interface
     * from the previous module in the pipeline. In essence, starting
     * from ParseResult, each module that it passes through adds its
     * own result to this structure, since each Result is fed
     * (directly or indirectly) into the next module.
     *
     * There are two sources of ambiguity: a parse might have several
     * possible interpretations, and there might be more than one plan
     * for each interpretation. In the code there are commented placeholders
     * that you can fill in to decide what to do in each case.
     * These placeholders are marked PLACEHOLDER.
     *
     * @param world: The current world.
     * @param utterance: The string that represents the command.
     * @returns: A plan in the form of a stack of strings, where each element
     *           is either a robot action, like "p" (for pick up) or "r" (for going right),
     *           or a system utterance in English that describes what the robot is doing.
     */
    function parseUtteranceIntoPlan(world, utterance) {
        var parses, interpretations, plans;
        try {
            // Call the parser with the utterance
            world.printDebugInfo("Parsing utterance: \"" + utterance + "\"");
            parses = Parser_1.parse(utterance);
            if (typeof (parses) === "string") {
                world.printError("[Parsing failure]", parses);
                return null;
            }
            // Print the parse results
            world.printDebugInfo("Found " + parses.length + " parses");
            parses.forEach(function (result, n) {
                world.printDebugInfo("  (" + n + ") " + result.parse.toString());
            });
        }
        catch (err) {
            world.printError("[ERROR during parsing] This should not happen", err);
            return null;
        }
        try {
            // Call the interpreter for all parses
            interpretations = Interpreter_1.interpret(parses, world.currentState);
            if (typeof (interpretations) === "string") {
                world.printError("[Interpretation failure]", interpretations);
                return null;
            }
            // Print the interpretations
            world.printDebugInfo("Found " + interpretations.length + " interpretations");
            interpretations.forEach(function (result, n) {
                world.printDebugInfo("  (" + n + ") " + result.interpretation.toString());
            });
        }
        catch (err) {
            world.printError("[ERROR during interpretation] This should not happen", err);
            return null;
        }
        if (interpretations.length > 1) {
            // PLACEHOLDER:
            // several interpretations were found -- how should this be handled?
            // should we throw an ambiguity error?
            // ... throw new Error("Ambiguous utterance");
            // or should we let the planner decide?
        }
        try {
            // Call the planner for all interpretations
            plans = Planner_1.plan(interpretations, world.currentState);
            if (typeof (plans) === "string") {
                world.printError("[Planning failure]:", plans);
                return null;
            }
            // Print the resulting plans
            world.printDebugInfo("Found " + plans.length + " plans");
            plans.forEach(function (result, n) {
                world.printDebugInfo("  (" + n + ") " + result.plan.toString());
            });
        }
        catch (err) {
            world.printError("[ERROR during planning]", err);
            return null;
        }
        // PLACEHOLDER:
        // several plans were found -- how should this be handled?
        // this means that we have several interpretations,
        // should we throw an ambiguity error?
        // ... throw new Error("Ambiguous utterance");
        // or should we select the interpretation with the shortest plan?
        var plan_cost = Number.POSITIVE_INFINITY;
        for (var i = 0; i < plans.length; i++) {
            if (plans[i].plan.length < plan_cost) {
                plan_cost = plans[i].plan.length;
                var finalPlan = plans[i].plan;
            }
        }
        // ... plans.sort((a, b) => {return a.length - b.length});
        // Print the final plan
        world.printDebugInfo("Final plan: " + finalPlan.join(", "));
        return finalPlan;
    }
    exports.parseUtteranceIntoPlan = parseUtteranceIntoPlan;
    // A convenience function that recognizes strings of the form "p r r d l p r d".
    // You don't have to change this function.
    function splitStringIntoPlan(planstring) {
        var theplan = planstring.trim().split(/\s+/);
        var actions = { p: "Picking", d: "Dropping", l: "Going left", r: "Going right", b: "Going backward", f: "Going forward" };
        for (var i = theplan.length - 1; i >= 0; i--) {
            if (!actions[theplan[i]]) {
                return null;
            }
            theplan.splice(i, 0, actions[theplan[i]]);
        }
        return theplan;
    }
    exports.splitStringIntoPlan = splitStringIntoPlan;
});
