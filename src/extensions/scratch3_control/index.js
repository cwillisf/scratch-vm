const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const defineMessages = require('../../extension-support/define-messages');

const messages = Object.assign(
    defineMessages({
        name: {
            id: 'control',
            default: 'control_ext'
        }
    }), {
        blocks: defineMessages({
            wait: {
                id: 'control.wait',
                default: 'wait [DURATION] seconds'
            },
            repeat: {
                id: 'control.repeat',
                default: 'repeat [TIMES]'
            },
            forever: {
                id: 'control.forever',
                default: 'forever'
            },
            forEach: {
                id: 'control.doForLoop',
                default: 'for each [VARIABLE] in [VALUE]'
            },
            if: {
                id: 'control.if',
                default: 'if [CONDITION] then'
            },
            ifElse0: {
                id: 'control.if',
                default: 'if [CONDITION] then'
            },
            ifElse1: {
                id: 'control.else',
                default: 'else'
            },
            waitUntil: {
                id: 'control.waitUntil',
                default: 'wait until [CONDITION]'
            },
            repeatUntil: {
                id: 'control.repeatUntil',
                default: 'repeat until [CONDITION]'
            },
            stopOtherScripts: {
                id: 'control.stopOtherScripts',
                default: '{targetType, select,' +
                ' stage {stop other scripts in stage}' +
                ' sprite {stop other scripts in sprite}' +
                ' other {stop other scripts in target}}'
            },
            stopScripts: {
                id: 'control.stopScripts',
                default: 'stop [STOP_OPTION]'
            },
            whenCloned: {
                id: 'control.whenCloned',
                default: 'when I start as a clone'
            },
            createCloneOf: {
                id: 'control.createCloneOf',
                default: 'create clone of [CLONE_OPTION]'
            },
            deleteClone: {
                id: 'control.deleteClone',
                default: 'delete this clone'
            }
        }),
        menus: {
            stopScripts: defineMessages({
                allScripts: {
                    id: 'control.menu.stopScripts.allScripts',
                    default: 'all scripts',
                    description: '"all scripts" option in "stop scripts" block menu'
                },
                thisScript: {
                    id: 'control.menu.stopScripts.thisScript',
                    default: 'this script',
                    description: '"this script" option in "stop scripts" block menu'
                }
            }),
            cloneOption: defineMessages({
                myself: {
                    id: 'control.menu.cloneOption.myself',
                    default: 'myself',
                    description: '"myself" option for menu in "create clone of" block'
                }
            })
        }
    }
);

class Scratch3ControlBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'control_ext',
            name: messages.name,
            blocks: [
                {
                    opcode: 'wait',
                    blockType: BlockType.COMMAND,
                    text: messages.blocks.wait,
                    arguments: {
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                '---',
                {
                    opcode: 'repeat',
                    blockType: BlockType.LOOP,
                    text: messages.blocks.repeat,
                    arguments: {
                        TIMES: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                },
                {
                    opcode: 'forever',
                    blockType: BlockType.LOOP,
                    isTerminal: true,
                    text: messages.blocks.forever
                },
                {
                    opcode: 'forEach',
                    hideFromPalette: true,
                    blockType: BlockType.LOOP,
                    text: messages.blocks.forEach,
                    arguments: {
                        VARIABLE: {
                            type: ArgumentType.VARIABLE
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                },
                '---',
                {
                    opcode: 'if',
                    blockType: BlockType.CONDITIONAL,
                    branchCount: 1,
                    text: messages.blocks.if,
                    arguments: {
                        CONDITION: {
                            type: ArgumentType.BOOLEAN
                        }
                    }
                },
                {
                    opcode: 'ifElse',
                    blockType: BlockType.CONDITIONAL,
                    branchCount: 2,
                    text: [messages.blocks.ifElse0, messages.blocks.ifElse1],
                    arguments: {
                        CONDITION: {
                            type: ArgumentType.BOOLEAN
                        }
                    }
                },
                {
                    opcode: 'waitUntil',
                    blockType: BlockType.COMMAND,
                    text: messages.blocks.waitUntil,
                    arguments: {
                        CONDITION: {
                            type: ArgumentType.BOOLEAN
                        }
                    }
                },
                {
                    opcode: 'repeatUntil',
                    blockType: BlockType.LOOP,
                    text: messages.blocks.repeatUntil,
                    arguments: {
                        CONDITION: {
                            type: ArgumentType.BOOLEAN
                        }
                    }
                },
                '---',
                {
                    opcode: 'stopOtherScripts',
                    blockType: BlockType.COMMAND,
                    text: messages.blocks.stopOtherScripts
                },
                {
                    opcode: 'stopScripts',
                    blockType: BlockType.COMMAND,
                    isTerminal: true,
                    text: messages.blocks.stopScripts,
                    arguments: {
                        STOP_OPTION: {
                            type: ArgumentType.STRING,
                            defaultValue: messages.menus.stopScripts.allScripts,
                            menu: 'stopScripts'
                        }
                    }
                },
                '---',
                {
                    opcode: 'whenCloned',
                    blockType: BlockType.EVENT,
                    restartExistingThreads: false,
                    text: messages.blocks.whenCloned
                },
                {
                    opcode: 'createCloneOf',
                    blockType: BlockType.COMMAND,
                    text: messages.blocks.createCloneOf,
                    arguments: {
                        CLONE_OPTION: {
                            type: ArgumentType.STRING,
                            defaultValue: '_myself_',
                            menu: 'cloneOption'
                        }
                    }
                },
                {
                    opcode: 'deleteClone',
                    blockType: BlockType.COMMAND,
                    text: messages.blocks.deleteClone
                }
            ],
            menus: {
                stopScripts: [
                    messages.menus.stopScripts.allScripts,
                    messages.menus.stopScripts.thisScript
                ],
                cloneOption: 'getCloneOptions'
            }
        };
    }

    getCloneOptions () {
        const items = [];
        // TODO: collect sprites other than this one
        items.push({
            text: messages.menus.cloneOption.myself,
            value: '_myself_'
        });
        return items;
    }

    repeat (args, util) {
        const times = Math.floor(Cast.toNumber(args.TIMES));
        // Initialize loop
        if (typeof util.stackFrame.loopCounter === 'undefined') {
            util.stackFrame.loopCounter = times;
        }
        // Only execute once per frame.
        // When the branch finishes, `repeat` will be executed again and
        // the second branch will be taken, yielding for the rest of the frame.
        // Decrease counter
        util.stackFrame.loopCounter--;
        // If we still have some left, start the branch.
        if (util.stackFrame.loopCounter >= 0) {
            util.startBranch(1, true);
        }
    }

    repeatUntil (args, util) {
        const condition = Cast.toBoolean(args.CONDITION);
        // If the condition is true, start the branch.
        if (!condition) {
            util.startBranch(1, true);
        }
    }

    forEach (args, util) {
        const variable = util.target.lookupOrCreateVariable(
            args.VARIABLE.id, args.VARIABLE.name);

        if (typeof util.stackFrame.index === 'undefined') {
            util.stackFrame.index = 0;
        }

        if (util.stackFrame.index < Number(args.VALUE)) {
            util.stackFrame.index++;
            variable.value = util.stackFrame.index;
            util.startBranch(1, true);
        }
    }

    waitUntil (args, util) {
        const condition = Cast.toBoolean(args.CONDITION);
        if (!condition) {
            util.yield();
        }
    }

    forever (args, util) {
        util.startBranch(1, true);
    }

    wait (args) {
        const duration = Math.max(0, 1000 * Cast.toNumber(args.DURATION));
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    if (args, util) {
        const condition = Cast.toBoolean(args.CONDITION);
        if (condition) {
            util.startBranch(1, false);
        }
    }

    ifElse (args, util) {
        const condition = Cast.toBoolean(args.CONDITION);
        if (condition) {
            util.startBranch(1, false);
        } else {
            util.startBranch(2, false);
        }
    }

    stopScripts (args, util) {
        const option = args.STOP_OPTION;
        if (option === 'all') {
            util.stopAll();
        } else if (option === 'this script') {
            util.stopThisScript();
        }
    }

    stopOtherScripts (args, util) {
        util.stopOtherTargetThreads();
    }

    createCloneOf (args, util) {
        let cloneTarget;
        if (args.CLONE_OPTION === '_myself_') {
            cloneTarget = util.target;
        } else {
            cloneTarget = this.runtime.getSpriteTargetByName(args.CLONE_OPTION);
        }
        if (!cloneTarget) {
            return;
        }
        const newClone = cloneTarget.makeClone();
        if (newClone) {
            this.runtime.targets.push(newClone);
        }
    }

    deleteClone (args, util) {
        if (util.target.isOriginal) return;
        this.runtime.disposeTarget(util.target);
        this.runtime.stopForTarget(util.target);
    }
}

module.exports = Scratch3ControlBlocks;
