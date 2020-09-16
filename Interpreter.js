(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Types"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Types_1 = require("./Types");
    /********************************************************************************
    ** Interpreter
    
    The goal of the Interpreter module is to interpret a sentence
    written by the user in the context of the current world state.
    In particular, it must figure out which objects in the world,
    i.e. which elements in the 'objects' field of WorldState, correspond
    to the ones referred to in the sentence.
    
    Moreover, it has to derive what the intended goal state is and
    return it as a logical formula described in terms of literals, where
    each literal represents a relation among objects that should
    hold. For example, assuming a world state where "a" is a ball and
    "b" is a table, the command "put the ball on the table" can be
    interpreted as the literal ontop(a,b). More complex goals can be
    written using conjunctions and disjunctions of these literals.
     
    In general, the module can take a list of possible parses and return
    a list of possible interpretations, but the code to handle this has
    already been written for you. The only part you need to implement is
    the core interpretation function, namely 'interpretCommand', which
    produces a single interpretation for a single command.
    
    You should implement the function 'interpretCommand'.
    ********************************************************************************/
    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types
    /** Top-level function for the Interpreter.
     * It calls 'interpretCommand' for each possible parse of the command.
     * You don't have to change this function.
     *
     * @param parses: List of parses produced by the Parser.
     * @param currentState: The current state of the world.
     * @returns: List of interpretation results, which are the parse results augmented
     *           with interpretations. Each interpretation is represented by a DNFFormula.
     *           If there's an interpretation error, it returns a string with a description of the error.
     */
    function interpret(parses, currentState) {
        var errors = [];
        var interpretations = [];
        parses.forEach(function (result) {
            var intp = interpretCommand(result.parse, currentState);
            if (typeof (intp) === "string") {
                errors.push(intp);
            }
            else {
                result.interpretation = intp;
                interpretations.push(result);
            }
        });
        if (interpretations.length) {
            return interpretations;
        }
        else {
            // merge all errors into one
            return errors.join(" ; ");
        }
    }
    exports.interpret = interpret;
    /* The core interpretation function.
     * The code here is just a template; you should rewrite this function entirely.
     * In this template, the code produces a dummy interpretation which is
     * not connected to the input 'cmd'. Your version of the function should
     * analyse 'cmd' in order to figure out what interpretation to return.
     *
     * Note that you should not change the API (type) of this function, only its body.
     *
     * @param cmd: An object of type 'Command'.
     * @param state: The current state of the world.
     * @returns: A DNFFormula representing the interpretation of the user's command.
     *           If there's an interpretation error, it returns a string with a description of the error.
     */
    // --- 1. Which Command?
    function interpretCommand(cmd, state) {
        if (cmd instanceof Types_1.TakeCommand)
            return interpretTake(cmd, state);
        if (cmd instanceof Types_1.DropCommand)
            return interpretDrop(cmd, state);
        if (cmd instanceof Types_1.MoveCommand)
            return interpretMove(cmd, state);
        return "";
    }
    function interpretTake(cmd, state) {
        var objectsToTake = selectEntities(cmd.entity, state);
        if (objectsToTake.length == 0)
            return "";
        var result = new Types_1.DNFFormula();
        for (var _i = 0, objectsToTake_1 = objectsToTake; _i < objectsToTake_1.length; _i++) {
            var obj = objectsToTake_1[_i];
            if (obj == "floor")
                continue;
            result.conjuncts.push(new Types_1.Conjunction([new Types_1.Literal("holding", [obj])]));
        }
        if (result.conjuncts.length == 0)
            return "";
        return result;
    }
    function interpretDrop(cmd, state) {
        if (state.holding === null)
            return "";
        var objectToDrop = state.holding;
        var whereToDrop = selectEntities(cmd.location.entity, state);
        var result = resolveList([objectToDrop], cmd.location.relation, whereToDrop, state, 'any', cmd.location.entity.quantifier);
        return result;
    }
    function interpretMove(cmd, state) {
        var objectToMove = selectEntities(cmd.entity, state);
        var whereToMove = selectEntities(cmd.location.entity, state);
        var result = resolveList(objectToMove, cmd.location.relation, whereToMove, state, cmd.entity.quantifier, cmd.location.entity.quantifier);
        return result;
    }
    /**
     * Removes all elements along a specified row and column in a 2D array,
     * and returns the resulting 2D array.
     * @param {t[][]} A
     * @param {number} row
     * @param {number} col
     * @returns {t[][]}
     */
    function removeRowAndCol(A, row, col) {
        if (A.length < 2)
            return [];
        // Constructs B (a copy of A) to avoid alterations of A
        var B = [];
        for (var i = 0; i < A.length; i++) {
            B.push([]);
            for (var j = 0; j < A[i].length; j++) {
                B[i].push(A[i][j]);
            }
        }
        // Removes specified row and column from B
        for (var i_1 = 0; i_1 < B.length; i_1++) {
            if (i_1 == row)
                B.splice(i_1, 1);
            if (!B[i_1])
                continue;
            for (var j_1 = 0; j_1 < B[i_1].length; j_1++) {
                if (j_1 == col)
                    B[i_1].splice(j_1, 1);
            }
        }
        return B;
    }
    /**
     * Returns a 2D literals array, where each element is a unique pair of object identifiers.
     * The first identifier is taken from obj1 and the second from obj2.
     * @param {string[]} obj1
     * @param {string} relation
     * @param {string[]} obj2
     * @param {WorldState} state
     * @returns {Literals[][]}
     */
    function buildAllLiterals(obj1, relation, obj2, state) {
        var literals = [];
        for (var i = 0; i < obj1.length; i++) {
            for (var j = 0; j < obj2.length; j++) {
                if (literals.length <= i)
                    literals.push([]);
                if (obj1[i] == obj2[j])
                    continue;
                if (physical_laws(relation, state.objects[obj1[i]], state.objects[obj2[j]])) {
                    literals[i].push(new Types_1.Literal(relation, [obj1[i], obj2[j]]));
                }
                else {
                    literals[i].push(null);
                }
            }
        }
        return literals;
    }
    /**
     * Returns a transposed 2D literals array.
     * @param {Literal[][]} literals
     * @returns {Literal[][]}
     */
    function transposeMatrix(literals) {
        var transposedLiterals = [];
        for (var i = 0; i < literals.length; i++) {
            for (var j = 0; j < literals[i].length; j++) {
                if (transposedLiterals.length <= j) {
                    transposedLiterals.push([]);
                }
                transposedLiterals[j].push(literals[i][j]);
            }
        }
        return transposedLiterals;
    }
    /**
     * Returns a conjunction array of all possible conjunctions for which every object identifier in obj2 has a relation
     * to a unique object identifier in obj1. Pass the parameter transpose as true to instead make every object identifier in obj1
     * have a relation to a unique object identifier in obj2.
     * @param {string[]} obj1
     * @param {string} relation
     * @param {string[]} obj2
     * @param {WorldState} state
     * @param {boolean} transpose
     * @returns {Conjunction[]}
     */
    function buildConjunctionsFromAllCombinedLiterals(obj1, relation, obj2, state, transpose) {
        if (transpose === void 0) { transpose = false; }
        var conjuncts = [];
        var literals = buildAllLiterals(obj1, relation, obj2, state);
        literals = transpose ? transposeMatrix(literals) : literals;
        conjuncts = combineAllValidLiterals(literals, conjuncts);
        conjuncts.forEach(function (conj) { return conj.literals.reverse(); });
        return conjuncts;
    }
    /**
     * Returns all possible conjunctions from choosing elements in each column of a 2D array of literals,
     *  where none of the elements share a common row (similar to finding all solutions for the Eight Queen Problem)
     * @param {Literal[][]} literals
     * @param {Conjunction[]} conjuncts
     * @returns {Conjunction[]}
     */
    function combineAllValidLiterals(literals, conjuncts) {
        // Returns new conjunction for deepest recursion
        if (literals.length == 0 || literals[0].length == 0)
            return [new Types_1.Conjunction()];
        var conjTemp = []; // Temporarily stores new conjunctions
        var MAX_NUMBER_OF_CONJUNCTS = 10; // Prevent factorial growth 
        for (var i = 0; i < literals.length; i++) {
            if (literals[i][0] == null)
                continue; // Checks for null pointer
            // Removes current row and column from literals to create a reduced array.
            // Passing 0 as third argument to always remove the left most column.
            var reducedLiterals = removeRowAndCol(literals, i, 0);
            // Passing reduced array of literals for deeper recursion
            // Temporarily stores the return value
            var tempResult = combineAllValidLiterals(reducedLiterals, conjuncts);
            // Appends current literal to all conjunctions of tempResult 
            tempResult.forEach(function (conj) { return conj.literals.push(literals[i][0]); });
            // Makes conjTemp a copy of tempResult, but creates new references, since
            // we don't want different conjunctions to reference to the same literals 
            tempResult.forEach(function (conj) { return conjTemp.push(new Types_1.Conjunction(conj.literals)); });
            if (conjTemp.length > MAX_NUMBER_OF_CONJUNCTS)
                break;
        }
        conjuncts = [];
        conjTemp.forEach(function (conj) { return conjuncts.push(conj); });
        return conjuncts;
    }
    /**
     * Returns a conjunction array where each conjunction holds a literal array, where each element
     * consists of a pair of object identifiers. Literal arrays in all conjunctions are populated by
     * successively choosing one element in obj1 and building all combinations with elements in obj2.
     * @param {string[]} obj1
     * @param {string} relation
     * @param {string[]} obj2
     * @param {WorldState} state
     * @param {boolean} allLiteralsInOneConjuntion
     * @returns {conjunction[]}
     */
    function buildConjunctions(obj1, relation, obj2, state, allLiteralsInOneConjuntion) {
        if (allLiteralsInOneConjuntion === void 0) { allLiteralsInOneConjuntion = false; }
        var conjuncts = [];
        for (var _i = 0, obj1_1 = obj1; _i < obj1_1.length; _i++) {
            var o1 = obj1_1[_i];
            for (var _a = 0, obj2_1 = obj2; _a < obj2_1.length; _a++) {
                var o2 = obj2_1[_a];
                if (o1 != o2 && physical_laws(relation, state.objects[o1], state.objects[o2])) {
                    if (allLiteralsInOneConjuntion && conjuncts.length > obj1.indexOf(o1)) {
                        conjuncts[obj1.indexOf(o1)].literals.push(new Types_1.Literal(relation, [o1, o2]));
                    }
                    else {
                        conjuncts.push(new Types_1.Conjunction([new Types_1.Literal(relation, [o1, o2])]));
                    }
                }
            }
        }
        return conjuncts;
    }
    /**
     * Returns a new conjunction that holds a literal array containing all literals from all
     * literal arrays of each conjunction in the passed conjunction array.
     * @param {Conjunction[]} conjuncts
     * @returns {Conjunction[]}
     */
    function mergeConjunctions(conjuncts) {
        var conj = new Types_1.Conjunction();
        for (var i = 0; i < conjuncts.length; i++) {
            conjuncts[i].literals.forEach(function (lit) { return conj.literals.push(lit); });
        }
        return [conj];
    }
    /**
     * Returns a DNFFormula with interpretations of a parse of an utterance, or an empty string if no valid interpretation is found.
     * @param {string[]} obj1
     * @param {string} relation
     * @param {string[]} obj2
     * @param {WorldState} state
     * @param {string} quantifier1
     * @param {string} quantifier2
     * @returns {string | DNFFormula}
     */
    function resolveList(obj1, relation, obj2, state, quantifier1, quantifier2) {
        var result = new Types_1.DNFFormula();
        // Uses object quantifiers and relations between objects to decide how to build an interpretation (conjunction array).
        // Relations 'inside' and 'ontop' differs from all other relations because an object can only have one other object inside or on top of it.
        // The commented numbers after the cases are refering to testcases in InterpreterTestCases. 
        switch (quantifier1) {
            case 'any':
                switch (quantifier2) {
                    case 'any': // 0 -> 38 (not 30, 31, 35)
                    case 'the':
                        result.conjuncts = buildConjunctions(obj1, relation, obj2, state);
                        break;
                    case 'all':
                        switch (relation) {
                            case 'inside': // 42
                            case 'ontop':
                                if (obj1.length < obj2.length)
                                    return "";
                                result.conjuncts = buildConjunctionsFromAllCombinedLiterals(obj1, relation, obj2, state);
                                break;
                            default:
                                result.conjuncts = buildConjunctions(obj1, relation, obj2, state, true);
                                result.conjuncts.forEach(function (conj) { return conj.literals.length < obj2.length ? result.conjuncts.splice(result.conjuncts.indexOf(conj), 1) : null; });
                                break;
                        }
                        break;
                }
                break;
            case 'all':
                switch (quantifier2) {
                    case 'any':
                        switch (relation) {
                            case 'beside':
                                var literals = buildAllLiterals(obj2, relation, obj1, state);
                                literals.forEach(function (literal) { return literal.forEach(function (literal) { return literal.args.sort(); }); });
                                literals.forEach(function (literal) { return result.conjuncts.push(new Types_1.Conjunction(literal)); });
                                break;
                            case 'inside': // 43
                            case 'ontop':
                                if (obj1.length > obj2.length)
                                    return "";
                                result.conjuncts = buildConjunctionsFromAllCombinedLiterals(obj1, relation, obj2, state, true);
                                break;
                            default:
                                var literals = buildAllLiterals(obj1, relation, obj2, state);
                                literals = transposeMatrix(literals);
                                literals.forEach(function (lits) { return lits.some(function (lit) { return lit == null; }) ? null : result.conjuncts.push(new Types_1.Conjunction(lits)); });
                        }
                        break;
                    case 'all':
                        switch (relation) {
                            case 'beside':
                                result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                                break;
                            case 'inside': // 51
                            case 'ontop':
                                if (obj1.length != obj2.length)
                                    return "";
                                result.conjuncts = buildConjunctionsFromAllCombinedLiterals(obj1, relation, obj2, state);
                                break;
                            default:
                                result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                        }
                        break;
                    case 'the':
                        switch (relation) {
                            case 'beside':
                                result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                                break;
                            case 'inside': // 53
                            case 'ontop':
                                result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                                break;
                            default:
                                result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                        }
                        break;
                }
                break;
            case 'the':
                switch (quantifier2) {
                    case 'any':
                        result.conjuncts = buildConjunctions(obj1, relation, obj2, state);
                        break;
                    case 'all':
                        switch (relation) {
                            case 'inside':
                            case 'ontop':
                                if (obj2.length != 1)
                                    return "";
                                result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                                break;
                            default:
                                result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                        }
                        break;
                    case 'the':
                        result.conjuncts = buildConjunctions(obj1, relation, obj2, state);
                        break;
                }
                break;
        }
        if (result.conjuncts.length == 0) {
            return ""; // returns empty string if no interpretation (conjunction) is created
        }
        else {
            return result;
        }
    }
    function selectEntities(entity, state) {
        // console.log("selectEntities(" + entity.toString() + ", ... )");
        var result = [];
        if (entity.object instanceof Types_1.SimpleObject)
            result = selectSimpleObjects(entity.object, state);
        if (entity.object instanceof Types_1.RelativeObject)
            result = selectRelativeObjects(entity.object, state);
        // Fail if "the" doesn't have an exact match
        if (entity.quantifier == "the" && result.length != 1)
            result = [];
        return result;
    }
    exports.selectEntities = selectEntities;
    function selectSimpleObjects(simpleObject, state) {
        // console.log("selectSimpleObjects(" + simpleObject.toString() + ", ... )");
        // Check separately for floor object, not in world
        if (simpleObject.form == "floor")
            return ["floor"];
        // Check each object in the world for match
        var result = [];
        for (var objID in state.objects) {
            var testObject = state.objects[objID];
            if (simpleObject.color != null && simpleObject.color != testObject.color)
                continue;
            if (simpleObject.form != "anyform" && simpleObject.form != testObject.form)
                continue;
            if (simpleObject.size != null && simpleObject.size != testObject.size)
                continue;
            result.push(objID);
        }
        return result;
    }
    function selectRelativeObjects(relativeObject, state) {
        // console.log("selectRelativeObjects(" + relativeObject.toString() + ", ... )");
        var thisObjectID = [];
        // Simple check first, no recursion if simple object does not exist
        if (relativeObject.object instanceof Types_1.SimpleObject) {
            thisObjectID = selectSimpleObjects(relativeObject.object, state);
            if (thisObjectID == [])
                return [];
        }
        var otherObjectID = selectEntities(relativeObject.location.entity, state);
        if (otherObjectID == [])
            return [];
        if (relativeObject.object instanceof Types_1.RelativeObject) {
            // console.log();
            // console.log("RelativeObject has weird recursion! This shouldn't happen?");
            // console.log();
            thisObjectID = selectRelativeObjects(relativeObject.object, state);
            if (thisObjectID == [])
                return [];
        }
        var result = [];
        for (var _i = 0, thisObjectID_1 = thisObjectID; _i < thisObjectID_1.length; _i++) {
            var obj1 = thisObjectID_1[_i];
            for (var _a = 0, otherObjectID_1 = otherObjectID; _a < otherObjectID_1.length; _a++) {
                var obj2 = otherObjectID_1[_a];
                if (current_relation(state, relativeObject.location.relation, obj1, obj2)) {
                    result.push(obj1);
                    break;
                }
            }
        }
        return result;
    }
    function current_relation(state, relation, obj1, obj2) {
        // holding
        if (relation == 'holding' && state.holding == obj1) {
            return true;
        }
        // ontop
        if (relation == 'ontop' && state.objects[obj2].form != 'box' && state.objects[obj2].form != 'cup') {
            for (var row = 0; row < state.stacks.length; row++) {
                for (var col = 0; col < state.stacks[row].length; col++) {
                    for (var height = 0; height < state.stacks[row][col].length; height++) {
                        if (obj1 == state.stacks[row][col][height])
                            return obj2 == state.stacks[row][col][height - 1] || (obj2 == 'floor' && height == 0);
                    }
                }
            }
            return false;
        }
        // inside
        if (relation == 'inside' && (state.objects[obj2].form == 'box' || state.objects[obj2].form == 'cup')) {
            for (var row = 0; row < state.stacks.length; row++) {
                for (var col = 0; col < state.stacks[row].length; col++) {
                    for (var height = 0; height < state.stacks[row][col].length; height++) {
                        if (obj1 == state.stacks[row][col][height])
                            return obj2 == state.stacks[row][col][height - 1];
                    }
                }
            }
        }
        // above
        if (relation == 'above') {
            var found = false;
            for (var row = 0; row < state.stacks.length; row++) {
                for (var col = 0; col < state.stacks[row].length; col++) {
                    for (var height = 0; height < state.stacks[row][col].length; height++) {
                        if (obj2 == state.stacks[row][col][height]) {
                            found = true;
                        }
                        if (found && obj1 == state.stacks[row][col][height]) {
                            return true;
                        }
                    }
                    if (found) {
                        return false;
                    }
                }
            }
        }
        // under
        if (relation == 'under') {
            for (var row = 0; row < state.stacks.length; row++) {
                for (var col = 0; col < state.stacks[row].length; col++) {
                    for (var height = 0; height < state.stacks[row][col].length; height++) {
                        if (obj1 == state.stacks[row][col][height]) {
                            found = true;
                        }
                        if (found && obj2 == state.stacks[row][col][height]) {
                            return true;
                        }
                    }
                    if (found) {
                        return false;
                    }
                }
            }
        }
        // lateral relations
        for (var row = 0; row < state.stacks.length; row++) {
            for (var col = 0; col < state.stacks[row].length; col++) {
                for (var height = 0; height < state.stacks[row][col].length; height++) {
                    if (obj2 == state.stacks[row][col][height]) {
                        var row2 = row;
                        var col2 = col;
                    }
                    if (obj1 == state.stacks[row][col][height]) {
                        var row1 = row;
                        var col1 = col;
                    }
                }
            }
        }
        // beside
        if (relation == 'beside') {
            var dist = Math.abs(row1 - row2) + Math.abs(col1 - col2);
            return dist == 1;
        }
        // leftof
        if (relation == 'leftof') {
            return row1 == row2 && col1 < col2;
        }
        // rightof
        if (relation == 'rightof') {
            return row1 == row2 && col1 > col2;
        }
        // before
        if (relation == 'before') {
            return row1 > row2 && col1 == col2;
        }
        // behind
        if (relation == 'behind') {
            return row1 < row2 && col1 == col2;
        }
        return false;
    }
    exports.current_relation = current_relation;
    function physical_laws(relation, obj1, obj2) {
        // relation can be : leftof, rightof, inside, ontop, under, beside or above
        // returns true physicals laws are good
        var result_bool = true;
        /*
        list of things to check :
    
        XX things must be 'inside' of a box
        XX boxes cannot contain py, planks, boxes of same size
        XX balls must be inside of a box or on the floor
        XX small boxes cannot be 'ontop' of small bricks or any py
        XX larges boxes cannot be 'ontop' of large py
        XX larges objects cannot be 'ontop' of or 'above' small objects
        XX for the last 3, also check the reciproque with 'under'
        no rules for leftof, rightof, beside
        XX balls cannot support anything
        */
        /*
        note for cups
    
        small cups can contain small cups and small balls
        large cups can contain any ball and any cup
        */
        // floor cannot be as obj1
        if (obj1.form == 'floor')
            return false;
        // floor cannot be with these relations with anything
        if (relation == 'leftof' || relation == 'rightof' || relation == 'beside' || relation == 'under') {
            if (obj2.form == 'floor')
                return false;
        }
        if (relation == 'inside') {
            // things must be inside of a box or a cup
            if (obj2.form != 'box' && obj2.form != 'cup')
                return false;
            // boxes and cups cannot contain pyramids, planks and boxes of same size
            if (obj2.size == 'small')
                if (obj2.form == 'cup') {
                    if (obj1.size == 'large' || obj1.form == 'plank' || obj1.form == 'pyramid' || obj1.form == 'box')
                        return false;
                }
                else {
                    if (obj1.size == 'large' || obj1.form == 'plank' || obj1.form == 'pyramid' || obj1.form == 'box' || obj1.form == 'cup')
                        return false;
                }
            // no large pyramids, planks and boxes can be inside something
            if (obj1.size == 'large')
                if (obj2.form == 'cup') {
                    if (obj1.form == 'plank' || obj1.form == 'pyramid' || obj1.form == 'box')
                        return false;
                }
                else {
                    if (obj1.form == 'plank' || obj1.form == 'pyramid' || obj1.form == 'box' || obj1.form == 'cup')
                        return false;
                }
        }
        if (relation == 'ontop' && obj2.form != 'floor') {
            // nothing can go ontop of a box or a cup
            if (obj2.form == 'box' || obj2.form == 'cup')
                return false;
            // balls cannot go ontop of other balls
            if (obj1.form == 'ball' || obj2.form == 'ball')
                return false;
            if (obj2.size == 'small') {
                // no large ontop of a small
                if (obj1.size == 'large')
                    return false;
                // no boxes or cups ontop of small py and brick
                if (obj1.form == 'box' || obj1.form == 'cup')
                    if (obj2.form == 'pyramid' || obj2.form == 'brick')
                        return false;
            }
            // no large boxes or cups ontop of any pyramids
            if ((obj1.form == 'box' || obj1.form == 'cup') && obj1.size == 'large' && obj2.form == 'pyramid')
                return false;
        }
        if (relation == 'under') {
            // balls cannot be under anything
            if (obj1.form == 'ball')
                return false;
            // small cannot be under large
            if (obj1.size == 'small')
                if (obj2.size == 'large')
                    return false;
        }
        if (relation == 'above') {
            // balls cannot be under anything
            if (obj2.form == 'ball')
                return false;
            // small cannot be under large
            if (obj2.size == 'small')
                if (obj1.size == 'large')
                    return false;
        }
        return result_bool;
    }
    exports.physical_laws = physical_laws;
});
