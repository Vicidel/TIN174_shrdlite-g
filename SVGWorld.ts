
import {World, WorldState} from "./World";
import "./lib/jquery";

/********************************************************************************
** SVGWorld

This is the implementation of the World interface, for the browser version.
It is used by 'shrdlite-html.ts'.

You don't have to edit this file, but you might want to play around with 
the public constants defined below.
********************************************************************************/

export class SVGWorld implements World {

    constructor(
        public currentState: WorldState,
        public useSpeech = false
    ) {
        // Default arm position
        if (!this.currentState.arm) this.currentState.arm = [0, 0];

        // Get world size
        this.rowCount = this.currentState.stacks.length;
        this.columnCount = this.currentState.stacks[0].length;

        // Canvas geometry
        this.canvasWidth = this.containers.world.width();
        this.canvasHeight = this.containers.world.height();

        // Scale for full width
        this.columnWidth =
            (this.canvasWidth - this.wallSeparation * 2) / (this.columnCount - this.rowCount * Math.cos(this.theta) * this.scaleFactor);

        this.rowX = this.columnWidth * Math.cos(this.theta) * this.scaleFactor;
        this.rowY = this.columnWidth * Math.sin(this.theta) * this.scaleFactor;

        this.columnHeight =
            this.canvasHeight - this.floorThickness - this.rowCount * this.rowY;

        this.viewLeft =
            -this.wallSeparation - 0.5 * this.columnWidth + (this.rowCount - 0.5) * this.rowX;
        this.viewTop =
            -this.columnHeight - 0.5 * this.rowY;

        this.objectWidth = Math.min(this.columnWidth - 4, this.columnWidth * 0.95);
        this.boxSpacing = this.columnWidth - this.objectWidth;
        
        var dropdown : JQuery = this.containers.inputexamples;
        dropdown.empty();
        dropdown.append($('<option value="">').text("(Select an example utterance)"));
        $.each(this.currentState.examples, function(i, value) {
            dropdown.append($('<option>').text(value));
        });

        dropdown.change(() => {
            var userinput = dropdown.val().trim();
            if (userinput) {
                this.containers.userinput.val(userinput).focus();
            }
        });
        this.containers.inputform.submit(() => this.handleUserInput.call(this));
        this.disableInput();
    }

    //////////////////////////////////////////////////////////////////////
    // Public constants that can be played around with

    public dialogueHistory = 100;    // max nr. utterances
    public floorThickness = 10;     // pixels
    public wallSeparation = 4;     // pixels
    public armSize = 0.2;         // of stack width
    public animationPause = 0.01;// seconds
    public promptPause = 0.5;   // seconds
    public ajaxTimeout = 5;    // seconds
    public armSpeed = 1000;   // pixels per second

    //////////////////////////////////////////////////////////////////////
    // Added for 3D
    private theta = Math.PI * 145 / 180;
    private scaleFactor = 0.65;
    private rowX : number;
    private rowY : number;
    private rowCount : number;
    private columnWidth : number;
    private columnHeight : number;
    private columnCount : number;
    private viewLeft : number;
    private viewTop : number;
    private objectWidth : number;
    private boxSpacing : number;

    // There is no way of setting male/female voice,
    // so this is one way of having different voices for user/system:
    public voices : {[participant:string] : {lang:string, rate:number}} = {
        system: {lang: "en-GB", rate: 1.1}, // British English, slightly faster
        user: {lang: "en-US", rate: 1.0},  // American English
    };

    // HTML id's for different containers
    public containers = {
        world: $('#theworld'),
        dialogue: $('#dialogue'),
        inputform: $('#dialogue form'),
        userinput: $('#dialogue form input:text'),
        inputexamples: $('#dialogue form select'),
    };

    //////////////////////////////////////////////////////////////////////
    // Public methods

    public readUserInput(prompt : string, callback : (input:string) => void) {
        this.printSystemOutput(prompt);
        this.enableInput();
        this.inputCallback = callback;
    }

    public printSystemOutput(output : string, participant="system", utterance? : string) {
        if (utterance == undefined) {
            utterance = output;
        }
        var dialogue = this.containers.dialogue;
        if (dialogue.children().length > this.dialogueHistory) {
            dialogue.children().first().remove();
        }
        $('<p>').attr("class", participant)
            .text(output)
            .insertBefore(this.containers.inputform);
        dialogue.scrollTop(dialogue.prop("scrollHeight"));

        if (this.useSpeech && utterance && /^\w/.test(utterance)) {
            try {
                // W3C Speech API (works in Chrome and Safari)
                var speech = new SpeechSynthesisUtterance(utterance);
                speech.lang = this.voices[participant].lang;
                speech.rate = this.voices[participant].rate;
                console.log("SPEAKING: " + utterance);
                window.speechSynthesis.speak(speech);
            } catch(err) {
            }
        }
    }

    public printDebugInfo(info : string) : void {
        console.log(info);
    }

    public printError(error : string, message? : string) : void {
        console.error(error, message);
        if (message) {
            error += ": " + message;
        }
        this.printSystemOutput(error, "error");
    }

    public printWorld(callback? : () => void) : void {

        this.containers.world.empty();

        var viewBox : number[] = [this.viewLeft, this.viewTop,
            this.canvasWidth, this.canvasHeight];

        var svg = $(this.SVG('svg')).attr({
            viewBox: viewBox.join(' '), 
            width: viewBox[2], 
            height: viewBox[3],
        }).appendTo(this.containers.world);

        // The floor:
        $(this.SVG('polygon')).attr({
            points: this.projection([
                -0.5,                -0.5,                   0,
                this.rowCount - 0.5, -0.5,                   0,
                this.rowCount - 0.5, -0.5,                   this.floorThickness,
                this.rowCount - 0.5, this.columnCount - 0.5, this.floorThickness,
                -0.5,                this.columnCount - 0.5, this.floorThickness,
                -0.5,                this.columnCount - 0.5, 0,
            ]).join(' '),
            stroke: '#888',
            fill: '#888'
        }).appendTo(svg);
        for (var row = 0; row < this.rowCount; row++)
            for (var col = 0; col < this.columnCount; col++)
                $(this.SVG('polygon')).attr({
                    points: this.projection([
                        row - 0.48, col - 0.48, 0,
                        row + 0.48, col - 0.48, 0,
                        row + 0.48, col + 0.48, 0,
                        row - 0.48, col + 0.48, 0,
                    ]).join(' '),
                    stroke: '#888',
                    fill: '#bbb'
                }).appendTo(svg);


        // Held object
        if (this.currentState.holding) {
            this.makeObject(svg, this.currentState.holding, this.currentState.arm, 0);
        }

        // The objects on the floor:
        var timeout = 0;
        for (var row = 0; row < this.rowCount; row++) {
            // composition mark
            $(this.SVG('rect')).attr({
                id: 'row'+row.toString(),
                x: this.viewLeft,
                y: this.viewTop,
                width: this.canvasWidth,
                height: this.canvasHeight,
                stroke: 'none',
                fill: '#dbf',
                opacity: '0.10'
            }).appendTo(svg);
            for (var col = 0; col < this.columnCount; col++) {
                for (var height = 0; height < this.currentState.stacks[row][col].length; height++) {
                    var objectid = this.currentState.stacks[row][col][height];
                    this.makeObject(svg, objectid, [row, col], timeout);
                    timeout += this.animationPause;
                }
            }
        }

        // The arm:
        $(this.SVG('line')).attr({
            id: 'arm',
            x1: 0, //this.currentState.arm[1] * this.columnWidth + this.currentState.arm[0] * this.rowX,
            y1: 0, //this.currentState.arm[0] * this.rowY - this.columnHeight,
            x2: 0, //this.currentState.arm[1] * this.columnWidth + this.currentState.arm[0] * this.rowX,
            y2: - this.canvasHeight,
            stroke: 'black',
            'stroke-width': this.armSize * this.columnWidth,
        }).appendTo(svg);
        this.animateMotion($("#arm"), ["M", this.projection([this.currentState.arm[0], this.currentState.arm[1], -this.columnHeight]).join(' ')], 0, 0);

        if (callback) {
            setTimeout(callback, (timeout + this.promptPause) * 1000);
        }
        
    }

    public performPlan(plan : string[], callback? : () => void) : void {
        if (this.isSpeaking()) {
            setTimeout(() => this.performPlan(plan, callback), this.animationPause * 1000);
            return;
        }
        var planctr = 0;
        var performNextAction = () => {
            planctr++;
            if (plan && plan.length) {
                var item = plan.shift().trim();
                var action = this.getAction(item);
                if (action) {
                    try {
                        action.call(this, performNextAction);
                    } catch(err) {
                        this.printError(err);
                        if (callback) setTimeout(callback, this.promptPause * 1000);
                    }
                } else {
                    if (item && item[0] != "#") {
                        if (this.isSpeaking()) {
                            plan.unshift(item);
                            setTimeout(performNextAction, this.animationPause * 1000);
                        } else {
                            this.printSystemOutput(item);
                            performNextAction();
                        }
                    } else {
                        performNextAction();
                    }
                }
            } else {
                if (callback) setTimeout(callback, this.promptPause * 1000);
            }
        }
        performNextAction();
    }

    //////////////////////////////////////////////////////////////////////
    // Private variables & constants

    private canvasWidth : number;
    private canvasHeight : number;
    private svgNS = 'http://www.w3.org/2000/svg';

    //////////////////////////////////////////////////////////////////////
    // Object types

    private objectData : {[form:string] :
                          {[size:string] :
                           {width:number, height:number, thickness?:number}}}
        = {brick: {small: {width:0.30, height:0.30},
                   large: {width:0.70, height:0.60}},
           plank: {small: {width:0.60, height:0.10},
                   large: {width:1.00, height:0.15}},
           ball: {small: {width:0.30, height:0.30},
                  large: {width:0.70, height:0.70}},
           pyramid: {small: {width:0.60, height:0.25},
                     large: {width:1.00, height:0.40}},
           box: {small: {width:0.60, height:0.30, thickness: 0.10},
                 large: {width:1.00, height:0.40, thickness: 0.10}},
           cup: {small: {width:0.60, height:0.30, thickness: 0.10},
                 large: {width:1.00, height:0.40, thickness: 0.10}},
           table: {small: {width:0.60, height:0.30, thickness: 0.10},
                   large: {width:1.00, height:0.40, thickness: 0.10}},
          };

    private SVG(tag : string) : Element {
        return document.createElementNS(this.svgNS, tag);
    }

    private animateMotion(object : JQuery, path : (string|number)[], timeout : number, duration : number) {
        var animation : Element = this.SVG('animateMotion');
        $(animation).attr({
            begin: 'indefinite',
            fill: 'freeze',
            path: path.join(" "),
            dur: duration + "s",
        }).appendTo(object);
        animation.beginElementAt(timeout);
        return animation;
    }

    //////////////////////////////////////////////////////////////////////
    // The basic actions: left, right, pick, drop

    private getAction(act : string) : (callback:()=>void) => void {
        var actions : {[act:string] : (callback:()=>void) => void}
            = {p:this.pick, d:this.drop, l:this.left, r:this.right, b:this.backward, f:this.forward};
        return actions[act.toLowerCase()];
    }

    private backward(callback : () => void) : void {
        if (this.currentState.arm[0] <= 0)
            throw "Already at back edge!";
        
        this.horizontalMove([this.currentState.arm[0] - 1, this.currentState.arm[1]], callback);
    }

    private forward(callback : () => void) : void {
        if (this.currentState.arm[0] >= this.columnCount - 1)
            throw "Already at front edge!";

        this.horizontalMove([this.currentState.arm[0] + 1, this.currentState.arm[1]], callback);
    }

    private left(callback : () => void) : void {
        if (this.currentState.arm[1] <= 0)
            throw "Already at left edge!";
        
        this.horizontalMove([this.currentState.arm[0], this.currentState.arm[1] - 1], callback);
    }

    private right(callback : () => void) : void {
        if (this.currentState.arm[1] >= this.columnCount)
            throw "Already at right edge!";
        
        this.horizontalMove([this.currentState.arm[0], this.currentState.arm[1] + 1], callback);
    }

    private drop(callback: () => void) : void {
        if (!this.currentState.holding)
            throw "Not holding anything!";
        
        this.verticalMove('drop', callback);
        this.currentState.stacks[this.currentState.arm[0]][this.currentState.arm[1]].push(this.currentState.holding);
        this.currentState.holding = null;
    }

    private pick(callback: () => void) : void {
        if (this.currentState.holding)
            throw "Already holding something!";
        
        this.currentState.holding = this.currentState.stacks[this.currentState.arm[0]][this.currentState.arm[1]].pop();
        this.verticalMove('pick', callback);
    }

    //////////////////////////////////////////////////////////////////////
    // Moving around

    private horizontalMove(newArm : [number, number], callback? : () => void) : void {
        var here = this.projection([this.currentState.arm[0], this.currentState.arm[1], -this.columnHeight]);
        var there = this.projection([newArm[0], newArm[1], -this.columnHeight]);
        var path1 = ["M", here[0], here[1], "L", there[0], there[1]];
        var duration = (Math.abs(there[0] - here[0]) + Math.abs(there[1] - here[1])) / this.armSpeed;
        var arm = $('#arm');
        this.animateMotion(arm, path1, 0, duration);
        if (this.currentState.holding) {
            var object = $("#" + this.currentState.holding);
            if (newArm[0] != this.currentState.arm[0]) {
                object.detach().insertBefore("#row"+newArm[0].toString());
            }
            var objectHeight = this.getObjectDimensions(this.currentState.holding).heightadd;
            var path2 = ["M", here[0], here[1] + objectHeight, "L", there[0], there[1] + objectHeight];
            this.animateMotion(object, path2, 0, duration);
        }
        this.currentState.arm = newArm;
        if (callback) setTimeout(callback, (duration + this.animationPause) * 1000);
    }

    private verticalMove(action : string, callback? : () => void) : void {
        var altitude = this.getAltitude(this.currentState.arm);
        var objectHeight = this.getObjectDimensions(this.currentState.holding).heightadd;
        var up = this.projection([this.currentState.arm[0], this.currentState.arm[1], -this.columnHeight]);
        var down = this.projection([this.currentState.arm[0], this.currentState.arm[1], -altitude - objectHeight]);

        var path1 = ["M", up[0], up[1], "V", down[1]];
        var path2 = ["M", down[0], down[1], "V", up[1]];
        var duration = (down[1] - up[1]) / this.armSpeed;
        var arm = $('#arm');
        var object = $("#" + this.currentState.holding)

        this.animateMotion(arm, path1, 0, duration);
        this.animateMotion(arm, path2, duration + this.animationPause, duration);
        if (action == 'pick') {
            var path3 = ["M", down[0], down[1] + objectHeight, "V", up[1] + objectHeight];
            this.animateMotion(object, path3, duration + this.animationPause, duration)
        } else {
            var path3 = ["M", up[0], up[1] + objectHeight, "V", down[1] + objectHeight];
            this.animateMotion(object, path3, 0, duration)
        }
        if (callback) setTimeout(callback, 2*(duration + this.animationPause) * 1000);
    }

    //////////////////////////////////////////////////////////////////////
    // Methods for getting information about objects 

    private getObjectDimensions(objectid : string) {
        var attrs = this.currentState.objects[objectid];
        var size = this.objectData[attrs.form][attrs.size];
        var width = size.width * this.objectWidth;
        var height = size.height * this.objectWidth;
        var thickness = size.thickness * this.objectWidth;
        var heightadd =  (attrs.form == 'box' || attrs.form == 'cup') ? thickness : height;
        return {
            width: width,
            height: height,
            heightadd: heightadd,
            thickness: thickness,
        };
    }

    private getAltitude(stacknr : [number, number], objectid? : string) {
        var stack = this.currentState.stacks[stacknr[0]][stacknr[1]];
        var altitude = 0;
        for (var i = 0; stack[i] && objectid != stack[i]; i++)
            altitude += this.getObjectDimensions(stack[i]).heightadd + this.boxSpacing;
        return altitude;
    }

    //////////////////////////////////////////////////////////////////////
    // Creating objects

    private makeObject(svg : JQuery, objectid : string, stacknr : [number, number], timeout : number) {
        var attrs = this.currentState.objects[objectid];
        var dim = this.getObjectDimensions(objectid);
        if (objectid == this.currentState.holding) {
            var altitude = this.columnHeight - dim.heightadd;
        } else {
            var altitude = this.getAltitude(stacknr, objectid);
        }

        var ybottom = 0; // this.canvasHeight - this.boxSpacing();
        var ytop = ybottom - dim.height;
        var ycenter = (ybottom + ytop) / 2;
        var yradius = (ybottom - ytop) / 2;
        
        var xcenter = 0; // (xright + xleft) / 2;
        var xleft =  - dim.width / 2;
        var xright = xleft + dim.width;
        var xradius = dim.width / 2;
        var xmidleft = (xcenter + xleft) / 2;
        var xmidright = (xcenter + xright) / 2;

        var object : JQuery;
        switch (attrs.form) {
        case 'brick':
        case 'plank':
            object = $(this.SVG('rect')).attr({
                x: xleft, 
                y: ytop, 
                width: dim.width, 
                height: dim.height
            });
            break;
        case 'ball':
            object = $(this.SVG('ellipse')).attr({
                cx: xcenter, 
                cy: ycenter, 
                rx: xradius, 
                ry: yradius
            });
            break;
        case 'pyramid':
            var points = [xleft, ybottom, xmidleft, ytop, xmidright, ytop, xright, ybottom];
            object = $(this.SVG('polygon')).attr({
                points: points.join(" ")
            });
            break;
        case 'cup':
            var points = [xleft, ytop, xleft+1.5*dim.thickness, ybottom, xright-1.5*dim.thickness, ybottom, xright, ytop, 
                          xright-0.5*dim.thickness, ytop, xright-1.5*dim.thickness, ybottom-dim.thickness,
                          xleft+1.5*dim.thickness, ybottom-dim.thickness, xleft+0.5*dim.thickness, ytop];
            object = $(this.SVG('polygon')).attr({
                points: points.join(" "),
            });
            break;
        case 'box':
            var points = [xleft, ytop, xleft, ybottom, xright, ybottom, xright, ytop, 
                          xright-dim.thickness, ytop, xright-dim.thickness, ybottom-dim.thickness,
                          xleft+dim.thickness, ybottom-dim.thickness, xleft+dim.thickness, ytop];
            object = $(this.SVG('polygon')).attr({
                points: points.join(" ")
            });
            break;
        case 'table':
            var points = [xleft, ytop, xright, ytop, xright, ytop+dim.thickness, 
                          xmidright, ytop+dim.thickness, xmidright, ybottom, 
                          xmidright-dim.thickness, ybottom, xmidright-dim.thickness, ytop+dim.thickness,
                          xmidleft+dim.thickness, ytop+dim.thickness, xmidleft+dim.thickness, ybottom,
                          xmidleft, ybottom, xmidleft, ytop+dim.thickness, xleft, ytop+dim.thickness];
            object = $(this.SVG('polygon')).attr({
                points: points.join(" ")
            });
            break;
        }
        object.attr({
            id: objectid,
            stroke: 'black', 
            'stroke-width': this.boxSpacing / 2, 
            fill: attrs.color, 
        });
        object.appendTo(svg);

        var path = ["M", this.projection([stacknr[0], stacknr[1], -altitude - this.canvasHeight]).join(' ')];
        this.animateMotion(object, path, 0, 0);
        path.push("v", this.canvasHeight.toString());
        this.animateMotion(object, path, timeout, 0.5);
    }

    //////////////////////////////////////////////////////////////////////
    // Methods for handling user input and system output

    private enableInput() {
        this.containers.inputexamples.prop('disabled', false).val(''); 
        this.containers.inputexamples.find("option:first").attr('selected', 'selected');
        this.containers.userinput.prop('disabled', false); 
        this.containers.userinput.focus().select();
    }

    private disableInput() {
        this.containers.inputexamples.blur();
        this.containers.inputexamples.prop('disabled', true); 
        this.containers.userinput.blur();
        this.containers.userinput.prop('disabled', true); 
    }

    private inputCallback : (input:string) => void;
    private handleUserInput() {
        var userinput = this.containers.userinput.val().trim();
        this.disableInput();
        this.printSystemOutput(userinput, "user");
        this.inputCallback(userinput);
        return false;
    }

    private projection(coordinates : number[]) : number[] {
        if (coordinates.length % 3)
            throw "Bad coordinate array!";

        var result : number[] = [];
        var count = coordinates.length / 3;

        for (var i = 0; i < count; i++) {
            var row    = coordinates.shift();
            var column = coordinates.shift();
            var height = coordinates.shift();
            result.push(row * this.rowX + column * this.columnWidth);
            result.push(row * this.rowY + height);
        }
        return result;
    }

    private isSpeaking() {
        return this.useSpeech && window && window.speechSynthesis && window.speechSynthesis.speaking;
    }

}


//////////////////////////////////////////////////////////////////////
// Additions to the TypeScript standard library 

// Support for SVG animations

declare global {
    interface Element {
        beginElementAt(timeout: number) : void;
    }
}
