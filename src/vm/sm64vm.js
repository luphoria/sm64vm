import Vm from "vm.js/build/nodejs/src/vm"
import hooker from "hooker"
import * as Keydrown from "../keydrown.min.js"
import * as MarioStep from "../game/MarioStep"

import { CameraInstance as Camera } from "../game/Camera"
import { MarioInstance as Mario } from "../game/Mario"
import { LevelUpdateInstance as LevelUpdate } from "../game/LevelUpdate"
import * as MarioConstants from "../game/constants/constants.json"
import { CodeJar } from 'codejar'
import Prism from 'prismjs';

const highlight = function(editor) {
    var code = editor.textContent;
    code = Prism.highlight(code, Prism.languages.javascript, 'javascript');
    editor.innerHTML = code;
};

let jar = CodeJar(document.querySelector('#scriptTextArea'), highlight);

export class SM64vm {
    constructor() {
        this.setupVM();
        this.setupInterface();
    }

    setupVM() {
        this.vm = new Vm();
        this.addHelpers();
        this.addCamera();
        this.addInput();
        this.addMario();
    }

    addHelpers() {
        this.vm.realm.global.console = { log: this.consoleLog };
        this.vm.realm.global.stringify = function(obj) { return JSON.stringify(obj); };
        this.vm.realm.global.cancel = hooker.preempt;
        var ref = this;
        this.vm.realm.global.setInterval = function(f, time) {
            var errorCatcher = function() { // VM requires recursive error checking for some reason
                try {
                    f();
                } catch (error) {
                    ref.consoleLog(error.message);
                }
            };
            setInterval(errorCatcher, time);
        };
    }

    consoleLog(...text) {
        console.log(text.join(" "));
    }

    addInput() {
        this.vm.realm.global.keys = Keydrown;
    }

    addMario() {
        var ref = this;
        var mario = {
            getPosition: function() { return LevelUpdate.gMarioState.pos; },
            setPosition: function(position) {
                LevelUpdate.gMarioState.pos = position; 
                MarioStep.perform_air_step(LevelUpdate.gMarioState, 0);
             },
            getAction: function() { return LevelUpdate.gMarioState.action; },
            onActionChange: function() {}
        };

        hooker.hook(Mario, "set_mario_action", function() {
            var marioRef = ref.vm.realm.global.mario;
            var currentAction = marioRef.getAction();
            var newAction = arguments[1];
            var constants = MarioConstants.default;
            return ref.vm.realm.global.mario.onActionChange(constants[currentAction], constants[newAction]);
        });

        this.vm.realm.global.mario = mario;
    }

    addCamera() {
        var ref = this;
        ref.cameraActive = true;

        hooker.hook(Camera, "update_camera", function() {
            if (!ref.cameraActive)
                return hooker.preempt(); // stops function from being executed
        });

        var activate = function(activate) {
            ref.cameraActive = activate;
        };

        var camera = {
            activate: activate
        };

        this.vm.realm.global.camera = camera;
    }

    
    setupInterface() {
        $("#runScriptButton").prop("disabled", false);
        $("#scriptTextArea").prop("disabled", false);

        if (localStorage["script"] != "")
            jar.updateCode(localStorage["script"]);

        var ref = this;
        $("#runScriptButton").click(function() {
            var script = jar.toString();

            function makeUnselectable(node) {
                if (node.nodeType == 1) {
                    node.setAttribute("unselectable", "on");
                }
                var child = node.firstChild;
                while (child) {
                    makeUnselectable(child);
                    child = child.nextSibling;
                }
            }
            
            makeUnselectable(document.getElementById("scriptTextArea"));
            // $("#scriptTextArea").addClass("unselectable")
            // $("#scriptTextArea").prop("disabled", true);
            $("#runScriptButton").prop("disabled", true);
            
            localStorage["script"] = script;
            ref.runScript(script);
        });
    }

    runScript(text) {
        try {
            var script = Vm.compile(text, "script.js");
            this.vm.run(script);
        } catch (error) {
            this.consoleLog(error.message);
        }
    }
}