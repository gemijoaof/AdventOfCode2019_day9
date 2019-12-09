const fs = require('fs');
const input = fs.readFileSync('./input.txt').toString();
let arrayinput = input.split(',').map(str => Number(str));

const arraySettingsPart1 = [1, 1];
const arraySettingsPart2 = [2, 2];

const resizeArray = (arrayProgram, newSize, defaultValue) => {
  let arr = [...arrayProgram];
  arr.length = newSize;

  return arrayProgram.map(item => (item === undefined ? defaultValue : item));
};

const enlargeMemory = (arrayProgram, arraySettings) => {
  let array = resizeArray(arrayProgram, 10000, 0);
  let object = runProgram(array, arraySettings);

  return object.memory;
};

const runProgram = (
  array,
  arrayInputNumber,
  isPart2 = false,
  indexSaved = 0
) => {
  let arrayProgram = [...array];
  let index = 0;
  let count = 0;
  let result = null;
  let memory = [];

  let relativeBase = 0;

  if (isPart2) {
    index = indexSaved;
    if (index !== 0) count++; //no more phased setting
  }

  while (index < array.length) {
    const opcode = calcOpcode(arrayProgram[index]);
    let listParamModes = calcListParamModes(arrayProgram[index]);
    let param1 = calcParamIndex(
      arrayProgram,
      index,
      1,
      listParamModes[2],
      relativeBase
    );
    let param2 = calcParamIndex(
      arrayProgram,
      index,
      2,
      listParamModes[1],
      relativeBase
    );
    let param3 = calcParamIndex(
      arrayProgram,
      index,
      3,
      listParamModes[0],
      relativeBase
    );

    //guard close for negative index
    if (
      opcode === '01' ||
      opcode === '02' ||
      opcode === '07' ||
      opcode === '08'
    ) {
      if (param3 < 0) {
        return console.log(
          `ERROR: paramIndex3 can't be smaller than 0 when opcode is 1,2,7,8`
        );
      }
    } else if (opcode === '03' && param1 < 0) {
      return console.log(
        `ERROR: paramIndex1 can't be smaller than 0 when opcode is 3`
      );
    }

    switch (opcode) {
      case '01':
        arrayProgram[param3] = arrayProgram[param1] + arrayProgram[param2];
        index += 4;
        break;
      case '02':
        arrayProgram[param3] = arrayProgram[param1] * arrayProgram[param2];
        index += 4;
        break;
      case '03':
        if (count === 0) {
          arrayProgram[param1] = arrayInputNumber[0];
        } else {
          arrayProgram[param1] = arrayInputNumber[1];
        }
        count++;
        index += 2;
        break;
      case '04':
        result = arrayProgram[param1];
        memory.push(result);
        index += 2;

        if (isPart2) {
          return {
            output: result,
            halted: false,
            index: index,
            program: arrayProgram,
            memory: memory
          };
        }
        break;
      case '05':
        if (arrayProgram[param1] !== 0) {
          index = arrayProgram[param2];
        } else {
          index += 3;
        }
        break;
      case '06':
        if (arrayProgram[param1] === 0) {
          index = arrayProgram[param2];
        } else {
          index += 3;
        }
        break;
      case '07':
        if (arrayProgram[param1] < arrayProgram[param2]) {
          arrayProgram[param3] = 1;
        } else {
          arrayProgram[param3] = 0;
        }
        index += 4;
        break;
      case '08':
        if (arrayProgram[param1] === arrayProgram[param2]) {
          arrayProgram[param3] = 1;
        } else {
          arrayProgram[param3] = 0;
        }
        index += 4;
        break;
      case '09':
        //adjust the relative base
        relativeBase += arrayProgram[param1];
        index += 2;
        break;
      case '99':
        return {
          output: result,
          halted: true,
          index: index,
          program: arrayProgram,
          memory: memory
        };
      default:
        return console.log(`ERROR: opcode: ${opcode}`);
    }
  }
};

const calcOpcode = int => {
  let opcode = int.toString();
  opcode = opcode.padStart(5, '0');
  return opcode[3] + opcode[4];
};

const calcListParamModes = int => {
  let str = int.toString();
  const completeOpcode = str.padStart(5, '0');

  return [
    Number(completeOpcode[0]),
    Number(completeOpcode[1]),
    Number(completeOpcode[2])
  ];
};

const calcParamIndex = (
  arrayProgram,
  index,
  param,
  paramMode,
  relativeBase
) => {
  let result = 0;

  if (paramMode === 0) {
    result = arrayProgram[index + param];
  } else if (paramMode === 1) {
    result = index + param;
    //relative mode
  } else if (paramMode === 2) {
    result = arrayProgram[index + param] + relativeBase;
  }
  return result;
};

console.time('part1');
console.log(enlargeMemory(arrayinput, arraySettingsPart1));
console.timeEnd('part1');
console.log(' ');
console.time('part2');
console.log(enlargeMemory(arrayinput, arraySettingsPart2));
console.timeEnd('part2');
