const fs = require('fs');
const code = fs.readFileSync(__dirname + '/game.js', 'utf8');
const lines = code.split('\n');

// 检查物品获取位置
console.log('=== 物品获取位置 ===');
const items = ['old_key','candle','matches','diary_1','mirror_shard','photo','diary_2','letter','painting_frag_a','painting_frag_b','scissors','safe_code_hint','drug'];
items.forEach(item => {
    const pattern = "addItem('" + item + "')";
    const lineIdx = lines.findIndex(l => l.includes(pattern));
    if (lineIdx >= 0) {
        // 找到该行所属的场景
        let sceneName = '?';
        for (let i = lineIdx; i >= 0; i--) {
            const sm = lines[i].match(/^\s{4}(\w+):\s*\{/);
            if (sm) { sceneName = sm[1]; break; }
        }
        console.log(item + ' -> 场景: ' + sceneName + ', 行: ' + (lineIdx+1));
    } else {
        console.log(item + ' -> 未找到 addItem 调用!');
    }
});

// 检查结局条件
console.log('\n=== 结局触发条件 ===');
const endingScenes = ['ending_rational','ending_insane','ending_together','ending_forever','ending_true_redemption','ending_lost','ending_redemption'];
endingScenes.forEach(e => {
    const idx = lines.findIndex(l => l.includes(e + ':'));
    if (idx >= 0) console.log(e + ': 行 ' + (idx+1));
    else console.log(e + ': 未定义!');
});

// 检查所有条件引用的函数
console.log('\n=== 条件函数检查 ===');
const condFunctions = ['hasItem','hasClue','GameState.flags'];
condFunctions.forEach(f => {
    const count = (code.match(new RegExp(f, 'g')) || []).length;
    console.log(f + ': 引用 ' + count + ' 次');
});

// 检查 CombineRecipes
console.log('\n=== 物品组合配方 ===');
const recipeStart = lines.findIndex(l => l.includes('CombineRecipes'));
if (recipeStart >= 0) {
    for (let i = recipeStart; i < recipeStart + 10 && i < lines.length; i++) {
        console.log(lines[i]);
    }
}

// 检查密码逻辑
console.log('\n=== 密码验证逻辑 ===');
const pwdIdx = lines.findIndex(l => l.includes('password') && l.includes('==='));
if (pwdIdx >= 0) {
    for (let i = Math.max(0, pwdIdx-2); i < pwdIdx + 10 && i < lines.length; i++) {
        console.log((i+1) + ': ' + lines[i]);
    }
} else {
    // 搜索 submitPassword
    const spIdx = lines.findIndex(l => l.includes('function submitPassword'));
    if (spIdx >= 0) {
        for (let i = spIdx; i < spIdx + 20 && i < lines.length; i++) {
            console.log((i+1) + ': ' + lines[i]);
        }
    }
}

// 检查有 disabled 但没有处理的选项
console.log('\n=== disabled 选项检查 ===');
lines.forEach((l, i) => {
    if (l.includes('disabled: true')) {
        console.log((i+1) + ': ' + l.trim());
    }
});
