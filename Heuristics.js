(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Interpreter"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Interpreter_1 = require("./Interpreter");
    // this function deconstructs the DNFFormula and calls H on each literal, and then returns the final heuristics value
    function heuristics(interpretation, state) {
        // randomly return zero sometimes to avoid getting stuck in local minima
        if (Math.random() > 0.9) {
            return 0;
        }
        var h = 0;
        var conj_H_values = [];
        for (var _i = 0, _a = interpretation.conjuncts; _i < _a.length; _i++) {
            var conj = _a[_i];
            var lit_H_values = [];
            for (var _b = 0, _c = conj.literals; _b < _c.length; _b++) {
                var literal = _c[_b];
                var H_val = H(literal, state);
                lit_H_values.push(H_val);
            }
            if (lit_H_values.length > 0) {
                // sum to make heuristics greedier
                var sum = lit_H_values.reduce(function (a, b) { return a + b; }, 0);
                conj_H_values.push(sum);
            }
        }
        if (conj_H_values.length > 0) {
            h = Math.min.apply(null, conj_H_values);
        }
        return h;
    }
    exports.heuristics = heuristics;
    var position = (function () {
        function position(stack, depth) {
            this.stack = stack;
            this.depth = depth;
        }
        ;
        return position;
    }());
    function find_object(object, holding, stacks) {
        var stack = -1; // stack here is just a number that identifies which stack it is, it shouldn't be a copy of the stack 
        var shallowestDepth = -1;
        if (object == holding) {
            shallowestDepth = 0;
            var pos = new position(stack, shallowestDepth);
            return pos;
        }
        else {
            for (var x = 0; x < stacks.length; x++) {
                for (var y = 0; y < stacks[x].length; y++) {
                    for (var z = stacks[x][y].length - 1; z > -1; z--) {
                        if (stacks[x][y][z] == object) {
                            shallowestDepth = stacks[x][y].length - z;
                            stack = x * 100 + y; // assuming there are fewer than 100 stacks in y direction
                            var pos = new position(stack, shallowestDepth);
                            return pos;
                        }
                    }
                }
            }
            var pos = new position(stack, shallowestDepth);
            return pos;
        }
    }
    // the real "heuristics": calculates the heuristics value based on the literal and world state
    function H(lit, state) {
        var rel = lit.relation;
        if (lit.args.length == 1) {
            if (Interpreter_1.current_relation(state, rel, lit.args[0]) == true) {
                return 0; // relation already holds
            }
        }
        else {
            if (Interpreter_1.current_relation(state, rel, lit.args[0], lit.args[1]) == true) {
                return 0; // relation already holds
            }
        }
        var heuristic = 0;
        if (rel == "holding") {
            var pos1 = find_object(lit.args[0], state.holding, state.stacks);
            var depth1 = pos1.depth;
            heuristic = 2 * depth1 - 1;
        }
        else if (rel == "above" || lit.args[1] == "floor") {
            var pos1 = find_object(lit.args[0], state.holding, state.stacks);
            var depth1 = pos1.depth;
            heuristic = 2 * depth1; // if depth starts counting from 1 for top of stack
        }
        else if (rel == "under") {
            var pos2 = find_object(lit.args[1], state.holding, state.stacks);
            var depth2 = pos2.depth;
            heuristic = 2 * depth2;
        }
        else {
            var pos1 = find_object(lit.args[0], state.holding, state.stacks);
            var stack1 = pos1.stack;
            var depth1 = pos1.depth;
            var pos2 = find_object(lit.args[1], state.holding, state.stacks);
            var stack2 = pos2.stack;
            var depth2 = pos2.depth;
            if (rel == "leftof" || rel == "rightof" || rel == "behind" || rel == "before" || rel == "beside") {
                heuristic = 2 * Math.min(depth1, depth2);
            }
            else if (stack1 == stack2) {
                heuristic = 2 * Math.max(depth1, depth2);
            }
            else {
                heuristic = 2 * (depth1 + depth2) - 2;
            }
        }
        return heuristic;
    }
    exports.H = H;
});
