import {WorldState} from "./World";
import {DNFFormula, Literal} from "./Types";
import {current_relation} from "./Interpreter";


// this function deconstructs the DNFFormula and calls H on each literal, and then returns the final heuristics value
export function heuristics(interpretation : DNFFormula, state : WorldState) : number {
    // randomly return zero sometimes to avoid getting stuck in local minima
    if (Math.random() > 0.9){
        return 0;
    }
    
    var h = 0;
    var conj_H_values : number[] = [];
    for (var conj of interpretation.conjuncts) {
        var lit_H_values : number[] = [];
        for (var literal of conj.literals) {
            var H_val = H(literal, state);
            lit_H_values.push(H_val);
        }
        
        if (lit_H_values.length > 0) {
            // sum to make heuristics greedier
            var sum = lit_H_values.reduce(function(a, b) { return a + b; }, 0);
            conj_H_values.push(sum);
        }
    }
    
    if (conj_H_values.length > 0) {
        h = Math.min.apply(null, conj_H_values);
    }
    
    return h;
}

class position {
    constructor(
        public stack : number,
        public depth : number
    ){};
}

function find_object(object : string, holding : string, stacks : string[][][]) : position {
    var stack : number = -1; // stack here is just a number that identifies which stack it is, it shouldn't be a copy of the stack 
    var shallowestDepth : number = -1;
   
    if (object == holding) {
        shallowestDepth = 0;
        var pos : position = new position(stack, shallowestDepth);
        return pos;
    }
    else {
        for(var x=0 ; x<stacks.length ; x++){
        	for(var y=0; y<stacks[x].length; y++){
                for(var z=stacks[x][y].length - 1; z>-1; z--){
                    if (stacks[x][y][z] == object){
                        shallowestDepth = stacks[x][y].length - z;
                        stack = x * 100 + y; // assuming there are fewer than 100 stacks in y direction
                        var pos : position = new position(stack, shallowestDepth);
                        return pos;
                    }
               }
            }
        }
        var pos : position = new position(stack, shallowestDepth);
        return pos;
    }
}

// the real "heuristics": calculates the heuristics value based on the literal and world state
export function H(lit : Literal, state : WorldState) : number {
    var rel : string = lit.relation;
    
    if (lit.args.length == 1) { // holding
        if (current_relation(state, rel, lit.args[0]) == true){
            return 0; // relation already holds
        }
    }
    else {
        if (current_relation(state, rel, lit.args[0], lit.args[1]) == true){
            return 0; // relation already holds
        }
    }
    var heuristic : number = 0;

    if (rel == "holding") {
        var pos1 : position = find_object(lit.args[0], state.holding, state.stacks);
        var depth1 : number = pos1.depth;
        heuristic = 2 * depth1 - 1;
    }
    else if (rel == "above" || lit.args[1] == "floor") { // if the depth of the second object doesn't matter
        var pos1 : position = find_object(lit.args[0], state.holding, state.stacks);
        var depth1 : number = pos1.depth;
        heuristic = 2 * depth1; // if depth starts counting from 1 for top of stack
    }
    else if (rel == "under"){ // depth of first object doesn't matter
        var pos2 : position = find_object(lit.args[1], state.holding, state.stacks);
        var depth2 : number = pos2.depth;
        heuristic = 2 * depth2;
    }
    else{
        var pos1 : position = find_object(lit.args[0], state.holding, state.stacks);
        var stack1 : number = pos1.stack;
        var depth1 : number = pos1.depth;
        
        var pos2 : position = find_object(lit.args[1], state.holding, state.stacks);
        var stack2 : number = pos2.stack;
        var depth2 : number = pos2.depth;
        
        if (rel == "leftof" || rel == "rightof" || rel == "behind" || rel == "before" || rel == "beside") { // only the shallowest object matters
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
