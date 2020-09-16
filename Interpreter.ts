
import {WorldState} from "./World";

import {
    ShrdliteResult,
    Command, TakeCommand, DropCommand, MoveCommand, WhereisCommand,
    Location, Entity,
    Object, RelativeObject, SimpleObject,
    DNFFormula, Conjunction, Literal,
} from "./Types";

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

export function interpret(parses : ShrdliteResult[], currentState : WorldState) : string | ShrdliteResult[] {
    var errors : string[] = [];
    var interpretations : ShrdliteResult[] = [];
    parses.forEach((result) => {
        var intp : string | DNFFormula = interpretCommand(result.parse, currentState);
        if (typeof(intp) === "string") {
            errors.push(intp);
        } else {
            result.interpretation = intp;
            interpretations.push(result);
        }
    });
    if (interpretations.length) {
        return interpretations;
    } else {
        // merge all errors into one
        return errors.join(" ; ");
    }
}


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
function interpretCommand(cmd : Command, state : WorldState) : string | DNFFormula {
    if (cmd instanceof TakeCommand)
        return interpretTake(cmd as TakeCommand, state);
    if (cmd instanceof DropCommand)
        return interpretDrop(cmd as DropCommand, state);
    if (cmd instanceof MoveCommand)
        return interpretMove(cmd as MoveCommand, state);
    return "";
}

function interpretTake(cmd : TakeCommand, state : WorldState) : string | DNFFormula {
    var objectsToTake : string[] = selectEntities(cmd.entity, state);
    if (objectsToTake.length == 0)
        return "";
    var result = new DNFFormula();
    for (var obj of objectsToTake) {
        if (obj == "floor") continue;
        result.conjuncts.push(
            new Conjunction(
                [new Literal("holding", [obj])]
            )
        );
    }
    if (result.conjuncts.length == 0)
        return "";
    return result;
}

function interpretDrop(cmd : DropCommand, state : WorldState) : string | DNFFormula {
    if (state.holding === null)
        return "";
    var objectToDrop = state.holding;
    var whereToDrop = selectEntities(cmd.location.entity, state);
    var result = resolveList([objectToDrop], cmd.location.relation, whereToDrop, state, 'any', cmd.location.entity.quantifier);
    return result;
}

function interpretMove(cmd : MoveCommand, state : WorldState) : string | DNFFormula {
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
function removeRowAndCol<t>(A : t[][], row : number, col : number) : t[][] {
    if(A.length < 2) 
        return [];

    // Constructs B (a copy of A) to avoid alterations of A
    var B : t[][] = [];
    for(var i = 0; i < A.length; i++) {
        B.push([]);
        for(var j = 0; j < A[i].length; j++) {
            B[i].push(A[i][j]);
        }
    }
    
    // Removes specified row and column from B
    for(let i = 0; i < B.length; i++) {
        if(i == row) 
            B.splice(i, 1);
            if(!B[i]) continue;
        for(let j = 0; j < B[i].length; j++) {
            if(j == col)
                B[i].splice(j,1)
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
function buildAllLiterals(obj1 : string[], relation : string, obj2 : string[], state : WorldState) : Literal[][] {
    var literals : Literal[][] = [];
    for (var i = 0; i < obj1.length; i++) {
        for (var j = 0; j < obj2.length; j++) {
                if(literals.length <= i) literals.push([]); 
                
            if (obj1[i] == obj2[j]) continue;
            if(physical_laws(relation, state.objects[obj1[i]], state.objects[obj2[j]])) {
                literals[i].push(new Literal(relation, [obj1[i], obj2[j]]));
            } else {
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
function transposeMatrix(literals : Literal[][]) : Literal[][] {
    var transposedLiterals : Literal[][] = [];
    for(var i = 0; i < literals.length; i++) {
        for(var j = 0; j < literals[i].length; j++) {
            if(transposedLiterals.length <= j) {
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
function buildConjunctionsFromAllCombinedLiterals(obj1 : string[], relation : string, obj2 : string[], state : WorldState,  transpose : boolean = false) : Conjunction[] {
    var conjuncts : Conjunction[] = [];
    var literals : Literal[][] = buildAllLiterals(obj1, relation, obj2, state)
    literals = transpose ? transposeMatrix(literals) : literals;
    conjuncts = combineAllValidLiterals(literals, conjuncts)
    conjuncts.forEach(conj => conj.literals.reverse());
    return conjuncts;
}

/**
 * Returns all possible conjunctions from choosing elements in each column of a 2D array of literals,
 *  where none of the elements share a common row (similar to finding all solutions for the Eight Queen Problem)
 * @param {Literal[][]} literals 
 * @param {Conjunction[]} conjuncts
 * @returns {Conjunction[]} 
 */
function combineAllValidLiterals(literals : Literal[][], conjuncts : Conjunction[]) : Conjunction[] {
    // Returns new conjunction for deepest recursion
    if(literals.length == 0 || literals[0].length == 0) return [new Conjunction()];
    var conjTemp : Conjunction[] = []; // Temporarily stores new conjunctions
    const MAX_NUMBER_OF_CONJUNCTS = 10; // Prevent factorial growth 
    for (var i = 0; i < literals.length; i++) {
        if (literals[i][0] == null) continue; // Checks for null pointer
        
        // Removes current row and column from literals to create a reduced array.
        // Passing 0 as third argument to always remove the left most column.
        var reducedLiterals = removeRowAndCol<Literal>(literals, i, 0);

        // Passing reduced array of literals for deeper recursion
        // Temporarily stores the return value
        let tempResult = combineAllValidLiterals(reducedLiterals, conjuncts);

        // Appends current literal to all conjunctions of tempResult 
        tempResult.forEach(conj => conj.literals.push(literals[i][0]));

        // Makes conjTemp a copy of tempResult, but creates new references, since
        // we don't want different conjunctions to reference to the same literals 
        tempResult.forEach(conj => conjTemp.push(new Conjunction(conj.literals)));

        if(conjTemp.length > MAX_NUMBER_OF_CONJUNCTS) break;
    }
    conjuncts = [];
    conjTemp.forEach(conj => conjuncts.push(conj))
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
function buildConjunctions(obj1 : string[], relation : string, obj2 : string[], state: WorldState, allLiteralsInOneConjuntion : boolean = false) : Conjunction[] {
    var conjuncts : Conjunction[] = [];
    for (var o1 of obj1){
        for (var o2 of obj2) {
            if (o1 != o2 && physical_laws(relation, state.objects[o1], state.objects[o2])) {     
                if(allLiteralsInOneConjuntion && conjuncts.length > obj1.indexOf(o1)) {
                    conjuncts[obj1.indexOf(o1)].literals.push(new Literal(relation, [o1, o2]));
                } else {
                    conjuncts.push(new Conjunction([new Literal(relation, [o1, o2])]));
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
function mergeConjunctions(conjuncts : Conjunction[]) : Conjunction[]{
    var conj : Conjunction = new Conjunction();
    for(var i = 0; i < conjuncts.length; i++) {
        conjuncts[i].literals.forEach(lit => conj.literals.push(lit));
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
function resolveList(obj1 : string[], relation : string, obj2 : string[], state : WorldState, quantifier1? : string, quantifier2? : string) : string | DNFFormula {
    var result = new DNFFormula();

    // Uses object quantifiers and relations between objects to decide how to build an interpretation (conjunction array).
    // Relations 'inside' and 'ontop' differs from all other relations because an object can only have one other object inside or on top of it.
    // The commented numbers after the cases are refering to testcases in InterpreterTestCases. 
    switch(quantifier1) {
        case 'any':
            switch(quantifier2) {
                case 'any': // 0 -> 38 (not 30, 31, 35)
                case 'the': // 30, 31, 35, 55
                    result.conjuncts = buildConjunctions(obj1, relation, obj2, state);
                    break;

                case 'all':
                    switch(relation) {
                        case 'inside': // 42
                        case 'ontop':
                            if(obj1.length < obj2.length) return "";
                            result.conjuncts = buildConjunctionsFromAllCombinedLiterals(obj1, relation, obj2, state);
                            break;

                        default: // 50, 56, 57, 61
                            result.conjuncts = buildConjunctions(obj1, relation, obj2, state, true);
                            result.conjuncts.forEach(
                                conj => conj.literals.length < obj2.length ? result.conjuncts.splice(
                                    result.conjuncts.indexOf(conj),1) : null
                            );
                            break;
                    }
                    break;
            }
            break;

        case 'all':
            switch(quantifier2) {
                case 'any':
                    switch(relation) {
                        case 'beside': // 44, 54
                                var literals : Literal[][] = buildAllLiterals(obj2, relation, obj1, state)
                                literals.forEach(literal => literal.forEach(literal => literal.args.sort()));
                                literals.forEach(literal => result.conjuncts.push(new Conjunction(literal)));
                            break;

                        case 'inside': // 43
                        case 'ontop': 
                            if(obj1.length > obj2.length) return "";
                                result.conjuncts = buildConjunctionsFromAllCombinedLiterals(obj1, relation, obj2, state, true);
                            break;

                        default: // 41, 59
                            var literals : Literal[][] = buildAllLiterals(obj1, relation, obj2, state)
                            literals = transposeMatrix(literals);
                            literals.forEach(lits => lits.some(lit => lit == null) ? null : result.conjuncts.push(new Conjunction(lits)));
                    }
                    break;  

                case 'all': // 40, 45
                    switch(relation) {
                        case 'beside': // No test cases
                            result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                            break;

                        case 'inside': // 51
                        case 'ontop':
                            if(obj1.length != obj2.length) return "";
                            result.conjuncts = buildConjunctionsFromAllCombinedLiterals(obj1, relation, obj2, state);
                            break;
                            
                        default: // 40, 45
                            result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                    } 
                    break;

                case 'the':
                    switch(relation) {
                        case 'beside': // 52
                            result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                            break;
                            
                        case 'inside': // 53
                        case 'ontop': // 39
                            result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                            break;

                        default: // 60
                            result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                    }
                    break;
            }
            break;
        
        case 'the':
            switch(quantifier2) {
                case 'any': // 46
                    result.conjuncts = buildConjunctions(obj1, relation, obj2, state);
                    break;

                case 'all': 
                    switch (relation) {
                        case 'inside':
                        case 'ontop': // 58
                            if(obj2.length != 1) return "";
                            result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                            break;
                            
                        default: // 47
                        result.conjuncts = mergeConjunctions(buildConjunctions(obj1, relation, obj2, state));
                    }
                    break;

                case 'the': // 48
                    result.conjuncts = buildConjunctions(obj1, relation, obj2, state);
                    break;
            }
            break;
    }

    if(result.conjuncts.length == 0) {
        return ""; // returns empty string if no interpretation (conjunction) is created
    } else {
        return result;
    }
}

export function selectEntities(entity : Entity, state : WorldState) : string[] {
    
    // console.log("selectEntities(" + entity.toString() + ", ... )");
    var result : string[] = [];

    if (entity.object instanceof SimpleObject)
        result = selectSimpleObjects(entity.object, state);

    if (entity.object instanceof RelativeObject)
        result = selectRelativeObjects(entity.object, state);

    // Fail if "the" doesn't have an exact match
    if (entity.quantifier == "the" && result.length != 1)
        result = [];

    return result;
}

function selectSimpleObjects(simpleObject : SimpleObject, state : WorldState) : string[] {

    // console.log("selectSimpleObjects(" + simpleObject.toString() + ", ... )");

    // Check separately for floor object, not in world
    if (simpleObject.form == "floor")
        return ["floor"];

    // Check each object in the world for match
    var result : string[] = [];
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

function selectRelativeObjects(relativeObject : RelativeObject, state : WorldState) : string[] {

    // console.log("selectRelativeObjects(" + relativeObject.toString() + ", ... )");
    var thisObjectID : string[] = [];

    // Simple check first, no recursion if simple object does not exist
    if (relativeObject.object instanceof SimpleObject) {
        thisObjectID = selectSimpleObjects(relativeObject.object, state);
        if (thisObjectID == [])
            return [];
    }

    var otherObjectID : string[] = selectEntities(relativeObject.location.entity, state);
    if (otherObjectID == [])
        return [];

    if (relativeObject.object instanceof RelativeObject) {
        // console.log();
        // console.log("RelativeObject has weird recursion! This shouldn't happen?");
        // console.log();
        thisObjectID = selectRelativeObjects(relativeObject.object, state);
        if (thisObjectID == [])
            return [];
    }
    
    var result : string [] = [];
    for (var obj1 of thisObjectID)
        for (var obj2 of otherObjectID)
            if (current_relation(state, relativeObject.location.relation, obj1, obj2)) {
                result.push(obj1);
                break;
            }
    return result;
}


export function current_relation(state : WorldState, relation : string, obj1 : string, obj2? : string) : boolean {
    
    // holding
    if (relation == 'holding' && state.holding == obj1) {
    	return true;
    }

    // ontop
    if (relation == 'ontop' && state.objects[obj2].form != 'box' && state.objects[obj2].form != 'cup') { 
        for (var row = 0; row < state.stacks.length; row++) {
            for (var col = 0; col < state.stacks[row].length ; col++) {
        	for (var height = 0; height < state.stacks[row][col].length ; height++) {
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
            for (var col = 0; col < state.stacks[row].length ; col++) {
                for (var height = 0; height < state.stacks[row][col].length ; height++) {
                    if (obj1 == state.stacks[row][col][height])
                        return obj2 == state.stacks[row][col][height - 1];
        	}
            }
        }
    }

    // above
    if (relation == 'above') {
        var found : boolean = false;
    	for (var row = 0; row < state.stacks.length; row++) {
            for (var col = 0; col < state.stacks[row].length; col++) {
                for (var height = 0; height < state.stacks[row][col].length; height++) {
                    if (obj2 == state.stacks[row][col][height]) {
                        found = true;
                    }
                    if (found && obj1 == state.stacks[row][col][height]) {
                        return true
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
            for(var col = 0; col < state.stacks[row].length ; col++) {
                for(var height = 0; height < state.stacks[row][col].length; height++) {
                    if (obj1 == state.stacks[row][col][height]) {
                        found = true;
                    }
                    if (found && obj2 == state.stacks[row][col][height]) {
                        return true
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
        for (var col = 0; col < state.stacks[row].length ; col++) {
            for (var height = 0; height < state.stacks[row][col].length ; height++) {
                if (obj2 == state.stacks[row][col][height]) {
                    var row2 : number = row;
                    var col2 : number = col;
                }
                if (obj1 == state.stacks[row][col][height]) {
                    var row1 : number = row;
                    var col1 : number = col;
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



export function physical_laws(relation: string, obj1: SimpleObject, obj2: SimpleObject) : boolean {
    // relation can be : leftof, rightof, inside, ontop, under, beside or above
    // returns true physicals laws are good

    var result_bool : boolean = true;

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
            if (obj2.form == 'cup')
            {
                if (obj1.size == 'large' || obj1.form == 'plank' || obj1.form == 'pyramid' || obj1.form == 'box')
                    return false;
            }
            else{
                if (obj1.size == 'large' || obj1.form == 'plank' || obj1.form == 'pyramid' || obj1.form == 'box' || obj1.form == 'cup')
                    return false;
            }

        // no large pyramids, planks and boxes can be inside something
        if (obj1.size == 'large')
            if (obj2.form == 'cup'){
                if (obj1.form == 'plank' || obj1.form == 'pyramid' || obj1.form == 'box')
                return false;
            }
            else{
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
