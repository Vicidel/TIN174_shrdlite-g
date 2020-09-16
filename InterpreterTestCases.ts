
/********************************************************************************
** InterpreterTestCases

This file contains several test cases, some of which have not been authored yet.
You should add your own interpretation where it says so.
You are also free to add new test cases.
********************************************************************************/

export interface TestCase {
    world : string;
    utterance : string;
    interpretations : string[][]
}

export var testCases : TestCase[] = [];


//////////////////////////////////////////////////////////////////////
// Examples that test the physical laws

// "Balls must be in boxes or on the floor, otherwise they roll away"
// #0 
testCases.push({
    world: "small",
    utterance: "put a ball on a table",
    interpretations: []
});

// "Objects are “inside” boxes, but “ontop” of other objects"
// #1
testCases.push({
    world: "small",
    utterance: "put a ball on a box",
    interpretations: []
});
// #2
testCases.push({
    world: "small",
    utterance: "put a box in a brick",
    interpretations: []
});

// "Boxes cannot contain pyramids, planks or boxes of the same size"
// #3
testCases.push({
    world: "medium",
    utterance: "put a plank in a box",
    interpretations: [["inside(SmlGrnPlnk,LrgRedBox)", "inside(SmlGrnPlnk,LrgYlwBox)"]]
});
// #4
testCases.push({
    world: "medium",
    utterance: "put a large plank in a box",
    interpretations: []
});
// #5
testCases.push({
    world: "medium",
    utterance: "put a pyramid in a box",
    interpretations: [["inside(SmlRedPrmd,LrgRedBox)", "inside(SmlRedPrmd,LrgYlwBox)"]]
});
// #6
testCases.push({
    world: "medium",
    utterance: "put a pyramid in a small box",
    interpretations: []
});
// #7
testCases.push({
    world: "medium",
    utterance: "put a box in a box",
    interpretations: [["inside(SmlBluBox,LrgRedBox)", "inside(SmlBluBox,LrgYlwBox)"]]
});
// #8
testCases.push({
    world: "medium",
    utterance: "put a large box in a box",
    interpretations: []
});
// #9
testCases.push({
    world: "medium",
    utterance: "put a plank in a small box",
    interpretations: []
});
// #10
testCases.push({
    world: "small",
    utterance: "put a big ball in a small box",
    interpretations: []
});

// "Small boxes cannot be supported by small bricks or pyramids."
// #11
testCases.push({
    world: "medium",
    utterance: "put a large box on a large brick",
    interpretations: [["ontop(LrgRedBox,LrgGrnBrck1)", "ontop(LrgRedBox,LrgGrnBrck2)", "ontop(LrgRedBox,LrgGrnBrck3)", "ontop(LrgYlwBox,LrgGrnBrck1)", "ontop(LrgYlwBox,LrgGrnBrck2)", "ontop(LrgYlwBox,LrgGrnBrck3)"]]
});
// #12
testCases.push({
    world: "medium",
    utterance: "put a small box on a small brick",
    interpretations: []
});
// #13
testCases.push({
    world: "medium",
    utterance: "put a small box on a small pyramid",
    interpretations: []
});

// "Large boxes cannot be supported by large pyramids."
// #14
testCases.push({
    world: "medium",
    utterance: "put a large box on a large pyramid",
    interpretations: []
});

// Common errors with the floor
// #15
testCases.push({
    world: "small",
    utterance: "take the floor",
    interpretations: []
});
// #16
testCases.push({
    world: "small",
    utterance: "put a brick on a floor",
    interpretations: []
});
// #17
testCases.push({
    world: "small",
    utterance: "put a brick on the red floor",
    interpretations: []
});
// #18
testCases.push({
    world: "small",
    utterance: "take a ball on a box",
    interpretations: []
});
// #19
testCases.push({
    world: "small",
    utterance: "take a ball in the floor",
    interpretations: []
});
// #20
testCases.push({
    world: "small",
    utterance: "take a box in a table",
    interpretations: []
});


//////////////////////////////////////////////////////////////////////
// Simple examples with a clear interpretation
// #21
testCases.push({
    world: "small",
    utterance: "take an object",
    interpretations: [["holding(LargeBlueTable)", "holding(LargeWhiteBall)", "holding(LargeRedBox)", "holding(LargeYellowBox)", "holding(SmallBlackBall)", "holding(SmallBlueBox)"]]
});
// #22
testCases.push({
    world: "small",
    utterance: "take a blue object",
    interpretations: [["holding(LargeBlueTable)", "holding(SmallBlueBox)"]]
});
// #23
testCases.push({
    world: "small",
    utterance: "take a box",
    interpretations: [["holding(LargeRedBox)", "holding(LargeYellowBox)", "holding(SmallBlueBox)"]]
});
// #24
testCases.push({
    world: "small",
    utterance: "put a ball in a box",
    interpretations: [["inside(LargeWhiteBall,LargeRedBox)", "inside(LargeWhiteBall,LargeYellowBox)", "inside(SmallBlackBall,LargeRedBox)", "inside(SmallBlackBall,LargeYellowBox)", "inside(SmallBlackBall,SmallBlueBox)"]]
});
// #25
testCases.push({
    world: "small",
    utterance: "put a ball above a table",
    interpretations: [["above(LargeWhiteBall,LargeBlueTable)", "above(SmallBlackBall,LargeBlueTable)"]]
});
// #26
testCases.push({
    world: "small",
    utterance: "put a ball left of a ball",
    interpretations: [["leftof(LargeWhiteBall,SmallBlackBall)", "leftof(SmallBlackBall,LargeWhiteBall)"]]
});
// #27
testCases.push({
    world: "small",
    utterance: "take a white object beside a blue object",
    interpretations: [["holding(LargeWhiteBall)"]]
});
// #28
testCases.push({
    world: "small",
    utterance: "put a white object beside a blue object",
    interpretations: [["beside(LargeWhiteBall,LargeBlueTable)", "beside(LargeWhiteBall,SmallBlueBox)"]]
});
// #29
testCases.push({
    world: "small",
    utterance: "put a white ball in a box on the floor",
    interpretations: [["inside(LargeWhiteBall,LargeYellowBox)"]]
});
// #30
testCases.push({
    world: "small",
    utterance: "put a black ball in a box on the floor",
    interpretations: [["inside(SmallBlackBall,LargeYellowBox)"], ["ontop(SmallBlackBall,floor)"]]
});


//////////////////////////////////////////////////////////////////////
// Examples where YOU shuold define the interpretation

// #31
testCases.push({
    world: "small",
    utterance: "put a ball in a box on the floor",
    interpretations: [
        [
            // put a ball INTO a box THAT IS ON the floor
            "inside(LargeWhiteBall,LargeYellowBox)",
            "inside(SmallBlackBall,LargeYellowBox)"
/*        ],[
            // put a ball INTO a box ONTO the floor
            "inside(LargeWhiteBall,LargeRedBox) & ontop(LargeRedBox,floor)",
            "inside(LargeWhiteBall,LargeYellowBox) & ontop(LargeYellowBox,floor)",
            "inside(SmallBlackBall,LargeRedBox) & ontop(LargeRedBox,floor)",
            "inside(SmallBlackBall,LargeYellowBox) & ontop(LargeYellowBox,floor)",
            "inside(SmallBlackBall,SmallBlueBox) & ontop(SmallBlueBox,floor)" */
        ],[
            // put a ball THAT IS IN a box ONTO the floor
            "ontop(SmallBlackBall,floor)"
        ]]
});

// "put it"

// #32
testCases.push({
    world: "small",
    utterance: "put it on the floor",
    interpretations: []               // No held object to put on the floor
});

// Deep recursion

// #33
testCases.push({
    world: "small",
    utterance: "take a ball in a box in a box",
    interpretations: [["holding(SmallBlackBall)"]]
});

// #34
testCases.push({
    world: "small",
    utterance: "take a ball in a box in a box on the floor",
    interpretations: [["holding(SmallBlackBall)"]]
});

// #35
testCases.push({
    world: "small",
    utterance: "put a box on a table on the floor",
    interpretations: [
        [
            // put a box ONTO a table THAT IS ON the floor
            "ontop(LargeRedBox,LargeBlueTable)", // Remove this interpretation since already there??
            "ontop(LargeYellowBox,LargeBlueTable)",
            "ontop(SmallBlueBox,LargeBlueTable)"
/*        ],[
            // put a box ONTO a table ONTO the floor
            "ontop(LargeRedBox,LargeBlueTable) & ontop(LargeBlueTable,floor)", // Remove this interpretation since already there??
            "ontop(LargeYellowBox,LargeBlueTable) & ontop(LargeBlueTable,floor)",
            "ontop(SmallBlueBox,LargeBlueTable) & ontop(LargeBlueTable,floor)" */
        ],[
            // put a box THAT IS ON a table ONTO the floor
            "ontop(LargeRedBox,floor)"
        ]]
});

// #36
testCases.push({
    world: "small",
    utterance: "put a box in a box on a table",
    interpretations: [
        [
            // put a box INTO a box THAT IS ON a table
            "inside(SmallBlueBox,LargeRedBox)"
/*        ],[
            // put a box INTO a box ONTO a table
            "inside(SmallBlueBox,LargeRedBox) & ontop(LargeRedBox,LargeBlueTable)",
            "inside(SmallBlueBox,LargeYellowBox) & ontop(LargeYellowBox,LargeBlueTable)" */
        ],[
            // put a box THAT IS IN a box ONTO a table
            "ontop(SmallBlueBox,LargeBlueTable)"
        ]]
});

// #37
testCases.push({
    world: "small",
    utterance: "put a box in a box on a table on the floor",
    interpretations: [
        [
            // put a box INTO a box THAT IS ON a table THAT IS ON the floor
            "inside(SmallBlueBox,LargeRedBox)"
/*        ],[
            // put a box INTO a box ONTO a table THAT IS ON the floor
            "inside(SmallBlueBox,LargeRedBox) & ontop(LargeRedBox,LargeBlueTable)",
            "inside(SmallBlueBox,LargeYellowBox) & ontop(LargeYellowBox,LargeBlueTable)"
        ],[
            // put a box INTO a box ONTO a table ONTO the floor
            "inside(SmallBlueBox,LargeRedBox) & ontop(LargeBlueTable,floor) & ontop(LargeRedBox,LargeBlueTable)",
            "inside(SmallBlueBox,LargeYellowBox) & ontop(LargeBlueTable,floor) & ontop(LargeYellowBox,LargeBlueTable)"
        ],[
            // put a box THAT IS IN a box ONTO a table ONTO the floor
            "ontop(LargeBlueTable,floor) & ontop(SmallBlueBox,LargeBlueTable)" */
        ],[
            // put a box THAT IS IN a box ONTO a table THAT IS ON the floor
            "ontop(SmallBlueBox,LargeBlueTable)"
        ]
            // put a box THAT IS IN a box THAT IS ON a table ONTO the floor
            // no boxes in boxes on tables in small
        ]
});

// #38
testCases.push({
    world: "medium",
    utterance: "put a brick on a brick on a brick on the floor",
    interpretations: [
        [
/*          // put a brick ONTO a brick THAT IS ON a brick THAT IS ON the floor
            // no bricks on bricks on the floor in medium

            // put a brick ONTO a brick ONTO a brick THAT IS ON the floor
            "ontop(LrgGrnBrck1,LrgGrnBrck2)",
            "ontop(LrgGrnBrck3,LrgGrnBrck2)",
            "ontop(SmlWhtBrck,LrgGrnBrck2)"
        ],[
            // put a brick ONTO a brick ONTO a brick ONTO the floor
            "ontop(LrgGrnBrck1,floor) & ontop(LrgGrnBrck2,LrgGrnBrck1)",
            "ontop(LrgGrnBrck1,floor) & ontop(LrgGrnBrck3,LrgGrnBrck1)",
            "ontop(LrgGrnBrck1,floor) & ontop(SmlWhtBrck,LrgGrnBrck1)",
            "ontop(LrgGrnBrck1,LrgGrnBrck2) & ontop(LrgGrnBrck2,floor)",
            "ontop(LrgGrnBrck1,LrgGrnBrck3) & ontop(LrgGrnBrck3,floor)",
            "ontop(LrgGrnBrck2,floor) & ontop(LrgGrnBrck3,LrgGrnBrck2)",
            "ontop(LrgGrnBrck2,floor) & ontop(SmlWhtBrck,LrgGrnBrck2)",
            "ontop(LrgGrnBrck2,LrgGrnBrck3) & ontop(LrgGrnBrck3,floor)",
            "ontop(LrgGrnBrck3,floor) & ontop(SmlWhtBrck,LrgGrnBrck3)"
*/
            // put a brick THAT IS ON a brick ONTO a brick THAT IS ON the floor
            "ontop(SmlWhtBrck,LrgGrnBrck2)"
            // put a brick THAT IS ON a brick ONTO a brick ONTO the floor
/*      ],[
            "ontop(LrgGrnBrck1,floor) & ontop(SmlWhtBrck,LrgGrnBrck1)",
            "ontop(LrgGrnBrck2,floor) & ontop(SmlWhtBrck,LrgGrnBrck2)",
            "ontop(LrgGrnBrck3,floor) & ontop(SmlWhtBrck,LrgGrnBrck3)"
            // put a brick THAT IS ON a brick THAT IS ON a brick ONTO the floor
            
            // no bricks on bricks on bricks in medium */
        ]]
});


//////////////////////////////////////////////////////////////////////
// Test cases for the ALL quantifier
// These are not necessary to solve if you only aim for grade 3/G

testCases.push({
    world: "small",
    utterance: "put all balls on the floor",
    interpretations: [["ontop(LargeWhiteBall,floor) & ontop(SmallBlackBall,floor)"]]
});

// #40
testCases.push({
    world: "small",
    utterance: "put every ball to the right of all blue things",
    interpretations: [
        [
            "rightof(LargeWhiteBall,LargeBlueTable) & rightof(LargeWhiteBall,SmallBlueBox) & rightof(SmallBlackBall,LargeBlueTable) & rightof(SmallBlackBall,SmallBlueBox)"
        ]]
});

// #41
testCases.push({
    world: "small",
    utterance: "put all balls left of a box on the floor",
    interpretations: [
        [
            // put all balls LEFT OF a box THAT IS ON the floor
            "leftof(LargeWhiteBall,LargeYellowBox) & leftof(SmallBlackBall,LargeYellowBox)"
        ],[
            // put all balls THAT ARE LEFT OF a box ONTO the floor
            "ontop(LargeWhiteBall,floor)"  // remove?
        ]]
});

// #42
testCases.push({
    world: "small",
    utterance: "put a ball in every large box",
    interpretations: [
        [
            "inside(LargeWhiteBall,LargeRedBox) & inside(SmallBlackBall,LargeYellowBox)",
            "inside(LargeWhiteBall,LargeYellowBox) & inside(SmallBlackBall,LargeRedBox)"
        ]]
});

// #43
testCases.push({
    world: "small",
    utterance: "put every ball in a box",
    interpretations: [
        [
            "inside(LargeWhiteBall,LargeRedBox) & inside(SmallBlackBall,LargeYellowBox)",
            "inside(LargeWhiteBall,LargeRedBox) & inside(SmallBlackBall,SmallBlueBox)",
            "inside(LargeWhiteBall,LargeYellowBox) & inside(SmallBlackBall,LargeRedBox)",
            "inside(LargeWhiteBall,LargeYellowBox) & inside(SmallBlackBall,SmallBlueBox)"
        ]]
});

// #44
testCases.push({
    world: "medium",
    utterance: "put all large green bricks beside a large green brick",
    interpretations: [
        [
            "beside(LrgGrnBrck1,LrgGrnBrck2) & beside(LrgGrnBrck1,LrgGrnBrck3)",
            "beside(LrgGrnBrck1,LrgGrnBrck2) & beside(LrgGrnBrck2,LrgGrnBrck3)",
            "beside(LrgGrnBrck1,LrgGrnBrck3) & beside(LrgGrnBrck2,LrgGrnBrck3)"
        ]]
});

// #45
testCases.push({
    world: "medium",
    utterance: "put all green objects left of all red objects",
    interpretations: [
        [
            "leftof(LrgGrnBrck1,LrgRedBox) & leftof(LrgGrnBrck1,LrgRedPlnk) & leftof(LrgGrnBrck1,SmlRedPrmd) & leftof(LrgGrnBrck1,SmlRedTble) & leftof(LrgGrnBrck2,LrgRedBox) & leftof(LrgGrnBrck2,LrgRedPlnk) & leftof(LrgGrnBrck2,SmlRedPrmd) & leftof(LrgGrnBrck2,SmlRedTble) & leftof(LrgGrnBrck3,LrgRedBox) & leftof(LrgGrnBrck3,LrgRedPlnk) & leftof(LrgGrnBrck3,SmlRedPrmd) & leftof(LrgGrnBrck3,SmlRedTble) & leftof(SmlGrnPlnk,LrgRedBox) & leftof(SmlGrnPlnk,LrgRedPlnk) & leftof(SmlGrnPlnk,SmlRedPrmd) & leftof(SmlGrnPlnk,SmlRedTble)"
        ]]
});

/////////////////////////////////////////////////////////////////////////////
// Test cases defined by bukka
/////////////////////////////////////////////////////////////////////////////

// #46
testCases.push({
    world: "small",
    utterance: "put the white ball in a box",
    interpretations: [
        [
            "inside(LargeWhiteBall,LargeRedBox)",
            "inside(LargeWhiteBall,LargeYellowBox)"
        ]
    ]
});

// #47
testCases.push({
    world: "small",
    utterance: "put the white ball left of every box",
    interpretations: [
        [
            "leftof(LargeWhiteBall,LargeRedBox) & " +
            "leftof(LargeWhiteBall,LargeYellowBox) & " +
            "leftof(LargeWhiteBall,SmallBlueBox)"
        ]
    ]
});

// #48
testCases.push({
    world: "small",
    utterance: "put the white ball in the yellow box",
    interpretations: [
        [
            "inside(LargeWhiteBall,LargeYellowBox)"
        ]]
});

// #49
testCases.push({
    world: "small",
    utterance: "put the white ball on the floor",
    interpretations: [
        [
            "ontop(LargeWhiteBall,floor)"
        ]]
});

// #50
testCases.push({
    world: "small",
    utterance: "put a ball beside every blue object",
    interpretations: [
        [
            "beside(LargeWhiteBall,LargeBlueTable) & " +
            "beside(LargeWhiteBall,SmallBlueBox)",
            "beside(SmallBlackBall,LargeBlueTable) & " +
            "beside(SmallBlackBall,SmallBlueBox)"
        ]]
});

// #51
testCases.push({
    world: "small",
    utterance: "put every small object inside every big box",
    interpretations: [
        [
            "inside(SmallBlackBall,LargeRedBox) & inside(SmallBlueBox,LargeYellowBox)",
            "inside(SmallBlackBall,LargeYellowBox) & inside(SmallBlueBox,LargeRedBox)"
        ]
    ]
});

// #52
testCases.push({
    world: "small",
    utterance: "put every small object beside the big yellow box",
    interpretations: [
        [
            "beside(SmallBlackBall,LargeYellowBox) & beside(SmallBlueBox,LargeYellowBox)"
        ]
    ]
});

// #53
testCases.push({
    world: "small",
    utterance: "put every small ball inside the big yellow box",
    interpretations: [
        [
            "inside(SmallBlackBall,LargeYellowBox)"
        ]
    ]
});

// #54
testCases.push({
    world: "medium-3d",
    utterance: "put all green objects beside a blue object",
    interpretations: [
        [
            "beside(LrgBluBall,LrgGrnBrck1) & beside(LrgBluBall,LrgGrnBrck2) & beside(LrgBluBall,LrgGrnBrck3) & beside(LrgBluBall,SmlGrnPlnk)",
            "beside(LrgBluTble,LrgGrnBrck1) & beside(LrgBluTble,LrgGrnBrck2) & beside(LrgBluTble,LrgGrnBrck3) & beside(LrgBluTble,SmlGrnPlnk)",
            "beside(LrgGrnBrck1,SmlBluBox) & beside(LrgGrnBrck2,SmlBluBox) & beside(LrgGrnBrck3,SmlBluBox) & beside(SmlBluBox,SmlGrnPlnk)"
        ]
    ]
});

// #55
testCases.push({
    world: "medium-3d",
    utterance: "put it on the floor",
    interpretations: [
        [
           "ontop(LrgGrnBrck1,floor)"
        ]
    ]
});

// #56
testCases.push({
    world: "medium-3d",
    utterance: "put all yellow objects left of all black objects",
    interpretations: [
        [
           "leftof(LrgYlwBox,SmlBlkBall) & leftof(LrgYlwBox,SmlBlkBox) & " +
           "leftof(LrgYlwPrmd,SmlBlkBall) & leftof(LrgYlwPrmd,SmlBlkBox)"
        ]
    ]
});

// #57
testCases.push({
    world: "medium-3d",
    utterance: "put all black objects above all green objects",
    interpretations: [
        [
           "above(SmlBlkBall,LrgGrnBrck1) & above(SmlBlkBall,LrgGrnBrck2) & " +
           "above(SmlBlkBall,LrgGrnBrck3) & above(SmlBlkBall,SmlGrnPlnk) & " +
           "above(SmlBlkBox,LrgGrnBrck1) & above(SmlBlkBox,LrgGrnBrck2) & " +
           "above(SmlBlkBox,LrgGrnBrck3) & above(SmlBlkBox,SmlGrnPlnk)"
        ]
    ]
});

// #58
testCases.push({
    world: "medium-3d",
    utterance: "put the white ball inside all yellow boxes",
    interpretations: [
        [
           "inside(LrgWhtBall,LrgYlwBox)"
        ]
    ]
});

// "put all red objects beside all red objects", duplicates are created... check that?

// #59
testCases.push({
    world: "medium-3d",
    utterance: "move all bricks above a table",
    interpretations: [
        [
           "above(LrgGrnBrck1,LrgBluTble) & " +
           "above(LrgGrnBrck2,LrgBluTble) & " +
           "above(LrgGrnBrck3,LrgBluTble) & "+
           "above(SmlWhtBrck,LrgBluTble)"
        ]
    ]
});

// #60
testCases.push({
    world: "medium-3d",
    utterance: "move all bricks above the blue table",
    interpretations: [
        [
           "above(LrgGrnBrck1,LrgBluTble) & " +
           "above(LrgGrnBrck2,LrgBluTble) & " +
           "above(LrgGrnBrck3,LrgBluTble) & "+
           "above(SmlWhtBrck,LrgBluTble)"
        ]
    ]
});

// #61
testCases.push({
    world: "small",
    utterance: "put a ball above all boxes",
    interpretations: [
        [
            "above(SmallBlackBall,LargeRedBox) & "+
            "above(SmallBlackBall,LargeYellowBox) & "+
            "above(SmallBlackBall,SmallBlueBox)"
        ]
    ]
});