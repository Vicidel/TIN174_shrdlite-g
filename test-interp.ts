///<reference path="lib/node.d.ts"/>

import {TextWorld} from "./TextWorld";
import {ExampleWorlds} from "./ExampleWorlds";
import {ShrdliteResult} from "./Types";
import {parse} from "./Parser";
import {interpret} from "./Interpreter";
import {TestCase, testCases} from "./InterpreterTestCases";

/********************************************************************************
** test-interpreter

This is the main file for testing the interpreter implementation in Interpreter.ts.
It tests against several test cases that are defined in InterpreterTestCases.ts

You should not edit this file.
********************************************************************************/


function runTest(testcase : TestCase) : boolean {
    var world = new TextWorld(ExampleWorlds[testcase.world]);
    var utterance = testcase.utterance;

    var parses : string | ShrdliteResult[] = parse(utterance);
    if (typeof(parses) === "string") {
        console.log("ERROR: Parsing error!", parses);
        console.log();
        return false;
    }
    console.log("Found " + parses.length + " parses:");
    console.log();
    for (var p of parses) {
        console.log(p.parse.toString());
        console.log();
    }
    console.log();

    var correctints : string[] = testcase.interpretations.map((intp) => intp.sort().join(" | ")).sort();
    var interpretations : string[] = [];
    var intps : string | ShrdliteResult[] = interpret(parses, world.currentState);
    if (typeof(intps) === "string") {
        console.log("ERROR: Interpretation error!", intps);
        console.log();
    } else {
        interpretations = intps.map(
            (intp) => intp.interpretation.conjuncts.map(
                (conj) => conj.literals.map(
                    (lit) => lit.toString()
                ).sort().join(" & ")
            ).sort().join(" | ")
        ).sort()
            .filter((intp, n, sorted_intps) => intp !== sorted_intps[n-1]); // only keep unique interpretations
    }

    console.log("Correct interpretations:");
    var n = 0;
    interpretations.forEach((intp) => {
        if (correctints.some((i) => i == intp)) {
            n++;
            console.log(`    (${n}) ${intp}`);
        }
    });
    if (n == correctints.length && n == interpretations.length) {
        if (n == 0) {
            console.log("    There are no interpretations")
        }
        console.log();
        console.log("Everything is correct!")
        console.log();
        return true;
    }
    if (n == 0) {
        console.log("    No correct interpretations")
    };
    console.log();

    if (n < correctints.length) {
        console.log("Missing interpretations:");
        correctints.forEach((intp) => {
            if (!interpretations.some((j) => j == intp)) {
                console.log("    (-) " + intp);
            }
        });
        console.log();
    }
    if (n < interpretations.length) {
        console.log("Incorrect interpretations:");
        interpretations.forEach((intp) => {
            if (!correctints.some((i) => i == intp)) {
                n++;
                console.log("    (" + n + ") " + intp);
            }
        });
        console.log();
    }
    return false;
}


function runAllTests(argv : string[]) {
    var tests : number[] = [];
    if (argv.length == 0) {
        throw "Missing command-line arguments";
    } else if (argv[0] == "all") {
        for (var n = 0; n < testCases.length; n++) tests.push(n);
    } else {
        tests = argv.map((n) => parseInt(n));
    }

    var failed = 0;
    for (var n of tests) {
        var testcase : TestCase = testCases[n];
        console.log("===================================================================================");
        console.log('Testing utterance ' + n + ': "' + testcase.utterance + '", in world "' + testcase.world + '"');
        var result = runTest(testCases[n]);
        if (!result) failed++;
    }

    console.log("===================================================================================");
    console.log("Summary statistics");
    console.log();
    console.log("Passed tests: " + (tests.length - failed));
    console.log("Failed tests: " + failed);
    console.log();
}


try {
    runAllTests(process.argv.slice(2));
    console.log();
    console.log(process.argv.slice(2).join("\n"));
} catch(err) {
    console.log();
    console.log("ERROR: " + err);
    console.log();
    console.log("Please give at least one argument:");
    console.log("- either a number (0.." + (testCases.length-1) + ") for each test you want to run,");
    console.log("- or 'all' for running all tests.");
    console.log();
}
