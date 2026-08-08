// ==================== 回声公寓 - 游戏核心引擎 ====================

// ===== 游戏状态 =====
const GameState = {
    currentScene: 'start',
    sanity: 100,
    inventory: [],
    clues: [],
    flags: {},
    selectedItems: [],
    typing: false,
    dialogueQueue: [],
    passwordCallback: null,
    totalScenes: 0,
    visitedScenes: new Set()
};

// ===== 物品定义 =====
const Items = {
    invitation: { id: 'invitation', name: '邀请函', icon: '✉️', desc: '一封泛黄的邀请函，写着"诚邀阁下莅临回声公寓704号，林女士恭候"。落款日期是三年前。' },
    old_key: { id: 'old_key', name: '生锈钥匙', icon: '🗝️', desc: '一把生锈的铜钥匙，齿痕奇特，似乎能打开某种旧锁。' },
    diary_1: { id: 'diary_1', name: '日记残页·上', icon: '📄', desc: '林晓的日记，写着："3月15日，他说这幅画完成后我们就可以离开了。但我总觉得，画里的眼睛在看着我。"' },
    diary_2: { id: 'diary_2', name: '日记残页·下', icon: '📄', desc: '日记后半部分："密码是我们相遇的日子——如果你还记得的话。他变了，这幅画不能完成。如果有人读到这里，请毁掉画室里那幅《回声》。"' },
    photo: { id: 'photo', name: '泛黄照片', icon: '🖼️', desc: '一对情侣的合照，背后写着"2020.03.15 初见"。男人的脸被划掉了。' },
    candle: { id: 'candle', name: '白色蜡烛', icon: '🕯️', desc: '半燃的白色蜡烛，蜡油凝固成奇怪的形状。' },
    matches: { id: 'matches', name: '旧火柴', icon: '🔥', desc: '一盒老旧的火柴，只剩下最后三根。' },
    lit_candle: { id: 'lit_candle', name: '点燃的蜡烛', icon: '💡', desc: '蜡烛被点燃了，微弱的烛光在黑暗中摇曳。' },
    painting_frag_a: { id: 'painting_frag_a', name: '画布碎片·左', icon: '🎨', desc: '画布的左半部分，画着一个女人的侧影，她的眼睛是空的。' },
    painting_frag_b: { id: 'painting_frag_b', name: '画布碎片·右', icon: '🖼️', desc: '画布的右半部分，画着一扇门，门后似乎有什么东西。' },
    restored_painting: { id: 'restored_painting', name: '复原的画布', icon: '🖼️', desc: '将两片画布拼在一起——女人站在门前，空的眼睛正望着门后的方向。' },
    letter: { id: 'letter', name: '未寄出的信', icon: '💌', desc: '林晓写给某人的信："对不起，我不该带你来这里。如果我消失了，不要找我。忘记我，好好活下去。——林晓"' },
    scissors: { id: 'scissors', name: '园艺剪刀', icon: '✂️', desc: '一把生锈的园艺剪刀，刀刃上有干涸的褐色痕迹。' },
    safe_code_hint: { id: 'safe_code_hint', name: '便签', icon: '📝', desc: '便签上写着："保险箱密码=初见日期后两位+照片里女人的年龄。她今年该27岁了。"' },
    mirror_shard: { id: 'mirror_shard', name: '镜子碎片', icon: '🪞', desc: '尖锐的镜子碎片，映出的你似乎有些不太一样……' },
    drug: { id: 'drug', name: '白色药片', icon: '💊', desc: '不知名的白色药片，边缘刻着奇怪的符号。' },
    burnt_note: { id: 'burnt_note', name: '烧焦的纸条', icon: '🔥', desc: '从画室灰烬里捡出来的半张纸条，还剩半截没烧透。用蓝色圆珠笔写的字："网易博客 · 晓晓的画语 · 网址：localhost:8080/echo_linxiao_blog.html · 密码和初见那天一样"。' },
    blog_slip: { id: 'blog_slip', name: '日记本里的便签', icon: '📑', desc: '夹在日记里的小纸条，是林晓的字："如果我消失了，去看我的博客。第七次之前，还有机会。网址：<a href="echo_linxiao_blog.html" target="_blank" rel="noopener" class="item-link">localhost:8080/echo_linxiao_blog.html</a>"' }
};

// ===== 线索定义 =====
const Clues = {
    c1: { id: 'c1', title: '消失的画家', text: '林晓，女画家，三年前在704号房间失踪。警方调查无果，定性为失踪。' },
    c2: { id: 'c2', title: '神秘男子', text: '照片上林晓身边的男人，脸被刻意划掉。他似乎与事件有重大关联。' },
    c3: { id: 'c3', title: '那幅画', text: '《回声》，林晓失踪前未完成的画作。据说画完的人都会"消失"。' },
    c4: { id: 'c4', title: '日期', text: '2020年3月15日是林晓与"他"初见的日子。这个日期反复出现。' },
    c5: { id: 'c5', title: '管理员', text: '公寓管理员似乎知道很多，但他绝口不提704的事。他的手腕上有旧伤疤。' },
    c6: { id: 'c6', title: '真相碎片', text: '日记里提到"他变了"。也许，林晓的失踪不是单方面的逃离……' },
    c7: { id: 'c7', title: '我的记忆', text: '我为什么会收到邀请函？看到那张照片时，我的头好痛……我是不是忘记了什么？' },
    c8: { id: 'c8', title: '最后的线索', text: '如果照片上的男人是我……那林晓，是我害死的吗？' },
    c9: { id: 'c9', title: '画家的身份', text: '根据林晓的日记/博客，真正的画家不是林晓——而是"他"（也就是男主我自己）。林晓只是他的模特。《回声》七稿，每一次都是以她为原型，他相信"第七次"画中人可以"出来"。这就是为什么她会提到"第七次献祭"。' }
};

// ===== 场景定义 =====
const Scenes = {
    start: {
        title: '序章',
        location: '雨中 · 回声公寓楼下',
        dialogues: [
            '<narrator>雨声。冰冷的雨打在脸上。</narrator>',
            '你站在一栋陈旧的公寓楼前。霓虹招牌在雨雾中闪烁，像是某种不祥的预兆。',
            '手中的邀请函已经被雨水打湿了一角。你不知道是谁寄来的，但"林晓"这个名字……',
            '<thought>林晓……是谁？为什么看到这个名字，我的心脏会揪紧？</thought>',
            '<narrator>公寓大门虚掩着，昏黄的灯光从门缝漏出。</narrator>'
        ],
        choices: [
            { text: '走进公寓', next: 'lobby' }
        ]
    },

    lobby: {
        title: '第一章 · 回声',
        location: '公寓大厅',
        dialogues: [
            '<narrator>大厅里弥漫着消毒水和霉味混合的气息。</narrator>',
            '前台后面坐着一个佝偻的老人，正在翻看一本破旧的登记簿。',
            '"…………"他抬起头，浑浊的眼睛打量了你几秒。',
            '"七楼。704。" 他的声音沙哑得像是砂纸摩擦，"……又来一个。"',
            '<thought>又来一个？这句话是什么意思？</thought>',
            '<narrator>电梯发出刺耳的嘎吱声缓缓打开。</narrator>'
        ],
        onEnter: () => { addClue('c1'); }
        ,
        choices: [
            { text: '上前询问老人更多信息', next: 'lobby_talk', condition: () => !GameState.flags.talkedOldMan },
            { text: '走进电梯，前往七楼', next: 'elevator' }
        ]
    },

    lobby_talk: {
        title: '第一章 · 回声',
        location: '公寓大厅',
        dialogues: [
            '"大爷，请问704号……"',
            '老人的手指划过登记簿上某一行，你瞥见"704 林晓"四个字被重重划掉了。',
            '"别问。不该问的别问。" 他低下头，不再看你。',
            '你注意到他的左手腕上，有一道细长但很深的旧伤疤。',
            '<narrator>他沉默了很久，突然嘟囔了一句：</narrator>',
            '<whisper>"……别相信你看到的东西。"</whisper>'
        ],
        onEnter: () => {
            addClue('c5');
            GameState.flags.talkedOldMan = true;
            GameState.sanity = Math.max(0, GameState.sanity - 3);
        },
        choices: [
            { text: '走进电梯，前往七楼', next: 'elevator' }
        ]
    },

    elevator: {
        title: '第一章 · 回声',
        location: '电梯',
        dialogues: [
            '<narrator>电梯门缓缓合拢，金属摩擦声在狭窄的空间里回荡。</narrator>',
            '你按下"7"。按钮的荧光闪烁了一下，然后亮起刺目的红色。',
            '<narrator>1……2……3……</narrator>',
            '电梯在上升，但你感觉时间被拉长了。这栋楼明明只有七层，为什么……',
            '<narrator>突然——电梯剧烈晃动了一下，灯灭了。</narrator>',
            '<scream>！！！</scream>',
            '<narrator>黑暗中，你似乎听到了一个女人的笑声，近在咫尺。</narrator>',
            '<narrator>灯又亮了。一切正常。</narrator>',
            '<thought>……是错觉吗？</thought>'
        ],
        onEnter: () => {
            GameState.sanity = Math.max(0, GameState.sanity - 5);
        },
        choices: [
            { text: '走出电梯', next: 'hallway_7f' }
        ]
    },

    hallway_7f: {
        title: '第一章 · 回声',
        location: '七楼走廊',
        dialogues: [
            '<narrator>走廊狭长昏暗，灯在头顶一闪一闪。</narrator>',
            '两侧的房门都紧闭着，门牌号从701一路排到704。',
            '704号的门和其他门不一样——它是深红色的，像是被血染过。',
            '<narrator>门缝下漏出微弱的光。有人——或者说有东西——在里面。</narrator>',
            '你注意到门边的消防柜是开着的，里面有什么东西在反光。'
        ],
        choices: [
            { text: '查看消防柜', next: 'hallway_cabinet', condition: () => !hasItem('scissors') },
            { text: '直接推开704的门', next: 'room_entry' },
            { text: '敲敲门', next: 'hallway_knock', condition: () => !GameState.flags.knockedDoor }
        ]
    },

    hallway_cabinet: {
        title: '第一章 · 回声',
        location: '七楼走廊',
        dialogues: [
            '你打开消防柜，里面空空荡荡，只有一把……园艺剪刀？',
            '剪刀上有褐色的干涸痕迹，你的手指碰到它的瞬间，一阵寒意窜上脊背。',
            '<thought>为什么消防柜里会放着这个？</thought>'
        ],
        onEnter: () => {
            addItem('scissors');
            GameState.sanity = Math.max(0, GameState.sanity - 2);
        },
        choices: [
            { text: '返回走廊', next: 'hallway_7f_return' }
        ]
    },

    hallway_knock: {
        title: '第一章 · 回声',
        location: '七楼走廊',
        dialogues: [
            '你敲了敲门。',
            '<narrator>咚……咚……咚……</narrator>',
            '门内传来了脚步声，越来越近。',
            '然后——',
            '<whisper>从门的另一边，传来了和你敲门完全相同的节奏。</whisper>',
            '<narrator>咚……咚……咚……</narrator>',
            '<thought>是……在模仿我？</thought>'
        ],
        onEnter: () => {
            GameState.flags.knockedDoor = true;
            GameState.sanity = Math.max(0, GameState.sanity - 8);
        },
        choices: [
            { text: '推门而入', next: 'room_entry' },
            { text: '再敲一次', next: 'hallway_knock_again', condition: () => GameState.sanity > 30 }
        ]
    },

    hallway_knock_again: {
        title: '第一章 · 回声',
        location: '七楼走廊',
        dialogues: [
            '你鼓起勇气，又敲了三下。',
            '<narrator>这一次，回应你的不是敲门声——</narrator>',
            '<whisper>是一个女人的声音，轻得像贴在你耳边说话：</whisper>',
            '<whisper>"……你终于来了。"</whisper>',
            '<scream>你猛地后退一步，后背撞上了冰冷的墙壁。</scream>',
            '<thought>这不可能……这不可能……！</thought>'
        ],
        onEnter: () => {
            GameState.sanity = Math.max(0, GameState.sanity - 15);
        },
        choices: [
            { text: '冲进门内', next: 'room_entry' },
            { text: '转身逃跑（返回电梯）', next: 'escape_attempt' }
        ]
    },

    escape_attempt: {
        title: '分歧 · 逃离',
        location: '七楼走廊',
        dialogues: [
            '恐惧攫住了你。你转身冲向电梯，拼命按下按钮。',
            '<narrator>电梯门开了。</narrator>',
            '但里面站着一个人——一个女人，背对着你，长发垂落。',
            '"想走？" 她缓缓转过身——',
            '<narrator>她的脸上没有五官，只有一片空白。</narrator>',
            '<scream>——！！！</scream>'
        ],
        onEnter: () => {
            GameState.sanity = Math.max(0, GameState.sanity - 30);
        },
        choices: [
            { text: '闭上眼睛冲过去', next: 'room_entry' },
            { text: '晕倒……', next: 'ending_lost', condition: () => GameState.sanity <= 40 }
        ]
    },

    hallway_7f_return: {
        title: '第一章 · 回声',
        location: '七楼走廊',
        dialogues: [
            '你回到704号门前。那扇深红色的门依旧在那里。'
        ],
        choices: [
            { text: '推开704的门', next: 'room_entry' },
            { text: '敲敲门', next: 'hallway_knock', condition: () => !GameState.flags.knockedDoor }
        ]
    },

    room_entry: {
        title: '第二章 · 房中之物',
        location: '704号 · 玄关',
        dialogues: [
            '你推开了门。',
            '<narrator>出乎意料——房间里很整洁，甚至可以说是温馨。</narrator>',
            '客厅的灯是暖黄色的，沙发上搭着一件女人的针织外套，茶几上放着半杯已经凉透的茶。',
            '仿佛……只是主人临时出门了。',
            '<narrator>但你知道，这里的主人已经消失三年了。</narrator>',
            '玄关的鞋柜上有一串钥匙，和一张折叠的便签。'
        ],
        onEnter: () => {
            GameState.flags.enteredRoom = true;
            updateProgress();
        },
        choices: [
            { text: '拿起钥匙', next: 'room_entry_key', condition: () => !hasItem('old_key') },
            { text: '查看便签', next: 'room_entry_note', condition: () => !hasItem('safe_code_hint') },
            { text: '进入客厅', next: 'living_room' }
        ]
    },

    room_entry_key: {
        title: '第二章 · 房中之物',
        location: '704号 · 玄关',
        dialogues: [
            '那是一把生锈的铜钥匙，齿痕很奇怪，不像普通的门锁钥匙。'
        ],
        onEnter: () => { addItem('old_key'); },
        choices: [
            { text: '查看便签', next: 'room_entry_note', condition: () => !hasItem('safe_code_hint') },
            { text: '进入客厅', next: 'living_room' }
        ]
    },

    room_entry_note: {
        title: '第二章 · 房中之物',
        location: '704号 · 玄关',
        dialogues: [
            '便签上的字迹潦草，像是在匆忙中写下的：',
            '"保险箱密码=初见日期后两位+照片里女人的年龄。她今年该27岁了。"',
            '<thought>初见日期……？照片……？</thought>'
        ],
        onEnter: () => { addItem('safe_code_hint'); },
        choices: [
            { text: '拿起钥匙', next: 'room_entry_key', condition: () => !hasItem('old_key') },
            { text: '进入客厅', next: 'living_room' }
        ]
    },

    living_room: {
        title: '第二章 · 房中之物',
        location: '704号 · 客厅',
        dialogues: [
            '<narrator>客厅很大，朝南的窗户被厚重的窗帘遮住，只有几缕光渗进来。</narrator>',
            '墙上挂着几幅画——都是风景画，笔触细腻，看得出来作者很有天赋。',
            '茶几下面有一个抽屉。电视柜旁摆着一面大镜子。',
            '<narrator>你听到了什么……非常细微的声音，像是有人在低语。</narrator>',
            '那声音……来自卧室的方向？还是画室？',
            '<narrator>客厅有三扇门：左边是卧室，右边是画室，对面是卫生间。</narrator>'
        ],
        choices: [
            { text: '查看茶几抽屉', next: 'living_drawer', condition: () => !GameState.flags.openedDrawer },
            { text: '照照镜子', next: 'living_mirror', condition: () => !GameState.flags.lookedMirror },
            { text: '进入卧室', next: 'bedroom' },
            { text: '进入画室', next: 'studio' },
            { text: '进入卫生间', next: 'bathroom' }
        ]
    },

    living_drawer: {
        title: '第二章 · 房中之物',
        location: '704号 · 客厅',
        dialogues: [
            '你拉开茶几的抽屉。',
            '抽屉里有：一本旧相册、两根未点燃的白色蜡烛、一盒火柴、以及——',
            '一叠撕碎的信件，你拼起来勉强能读到几句。',
            '"……如果我不画完，他就不会放过我……"',
            '"……我好想你，好想回到那天，2020年的春天……"',
            '"……他说画里有另一个世界，但我看到的只有深渊……"'
        ],
        onEnter: () => {
            addItem('candle');
            addItem('matches');
            addItem('diary_1');
            GameState.flags.openedDrawer = true;
            addClue('c3');
            updateProgress();
        },
        choices: [
            { text: '返回客厅', next: 'living_room_return' }
        ]
    },

    living_mirror: {
        title: '第二章 · 房中之物',
        location: '704号 · 客厅',
        dialogues: [
            '你走到镜前。',
            '<narrator>镜子里映出你的脸——苍白，疲惫，眼下是浓重的黑眼圈。</narrator>',
            '……但有什么不对。',
            '<thought>镜中的我……嘴角似乎带着笑？可我没有在笑啊。</thought>',
            '你凑近了一点，想要看清——',
            '<narrator>镜中的你缓缓抬起手，指向你身后的方向。</narrator>',
            '<scream>你猛地回头——身后什么都没有。</scream>',
            '再看向镜子时，一切恢复了正常。只有你的倒影，惊骇地瞪大着眼睛。',
            '<narrator>镜框的缝隙里，掉出了一块镜子碎片。</narrator>'
        ],
        onEnter: () => {
            addItem('mirror_shard');
            addClue('c7');
            GameState.flags.lookedMirror = true;
            GameState.sanity = Math.max(0, GameState.sanity - 10);
            updateProgress();
        },
        choices: [
            { text: '返回客厅', next: 'living_room_return' }
        ]
    },

    living_room_return: {
        title: '第二章 · 房中之物',
        location: '704号 · 客厅',
        dialogues: [
            '你回到客厅中央。三扇门在面前沉默地伫立着。'
        ],
        choices: [
            { text: '查看茶几抽屉', next: 'living_drawer', condition: () => !GameState.flags.openedDrawer },
            { text: '照照镜子', next: 'living_mirror', condition: () => !GameState.flags.lookedMirror },
            { text: '进入卧室', next: 'bedroom' },
            { text: '进入画室', next: 'studio' },
            { text: '进入卫生间', next: 'bathroom' }
        ]
    },

    bedroom: {
        title: '第二章 · 房中之物',
        location: '704号 · 卧室',
        dialogues: [
            '<narrator>卧室的窗帘拉得严严实实，空气里有淡淡的灰尘味。</narrator>',
            '床上铺着干净的床单，枕头旁放着一只毛绒兔子——耳朵已经掉了一只。',
            '床头柜上有一个相框，和一个锁着的抽屉。',
            '衣柜门开着一条缝。墙角的保险箱静静地立在那里。'
        ],
        choices: [
            { text: '查看床头柜相框', next: 'bedroom_photo', condition: () => !hasItem('photo') },
            { text: '尝试打开床头柜抽屉（锁着的）', next: 'bedroom_drawer', condition: () => hasItem('old_key') && !GameState.flags.openedNightstand },
            { text: '床头柜抽屉（需要钥匙）', next: null, condition: () => !hasItem('old_key') && !GameState.flags.openedNightstand, disabled: true, disabledHint: '（锁着）' },
            { text: '打开衣柜', next: 'bedroom_closet', condition: () => !GameState.flags.openedCloset },
            { text: '打开保险箱（密码）', next: 'bedroom_safe', condition: () => !GameState.flags.openedSafe },
            { text: '返回客厅', next: 'living_room_return' }
        ]
    },

    bedroom_photo: {
        title: '第二章 · 房中之物',
        location: '704号 · 卧室',
        dialogues: [
            '相框里是一对年轻情侣的合照。',
            '女人笑得很开心，是林晓。男人的手臂环在她肩上——但他的脸，被人用锐器狠狠划掉了。',
            '你翻过照片，背后用钢笔写着一行小字：',
            '"2020.03.15 初见 ——永远的你"',
            '<thought>……2020.03.15……为什么这个日期……让我头疼？</thought>',
            '<narrator>你紧紧攥着照片，一阵强烈的眩晕袭来。</narrator>',
            '一些模糊的画面闪过你的脑海——春天的风、樱花、一个女孩的笑声……还有血。',
            '<thought>……为什么有血？！</thought>'
        ],
        onEnter: () => {
            addItem('photo');
            addClue('c2');
            addClue('c4');
            GameState.sanity = Math.max(0, GameState.sanity - 8);
            updateProgress();
        },
        choices: [
            { text: '继续查看卧室', next: 'bedroom_return' }
        ]
    },

    bedroom_drawer: {
        title: '第二章 · 房中之物',
        location: '704号 · 卧室',
        dialogues: [
            '你用那把生锈的铜钥匙，试着插入床头柜抽屉的锁孔。',
            '<narrator>咔哒——</narrator>',
            '锁开了。',
            '抽屉里整齐地叠放着一叠日记，还有一封没有寄出的信。',
            '你翻了翻日记，大部分内容都被撕掉了，只留下两页残片。',
            '在日记残页之间，夹着一张手写的便签——是林晓的字：',
            '<whisper>"如果我消失了，去看我的博客。第七次之前，还有机会。"</whisper>',
            '<whisper>"网址：localhost:8080/echo_linxiao_blog.html"</whisper>',
            '便签的背面，她还画了一个箭头，写着：',
            '"对了，他才是那个画家哦。我只是——他摆姿势的模特而已。呵呵。"',
            '<thought>"他"才是画家？……那我为什么一直以为，失踪的画家是林晓？</thought>',
            '<thought>……而且，"第七次之前"……她在指什么？</thought>'
        ],
        onEnter: () => {
            addItem('diary_2');
            addItem('letter');
            addItem('blog_slip');
            addClue('c6');
            addClue('c9');
            GameState.flags.openedNightstand = true;
            updateProgress();
        },
        choices: [
            { text: '继续查看卧室', next: 'bedroom_return' }
        ]
    },

    bedroom_closet: {
        title: '第二章 · 房中之物',
        location: '704号 · 卧室',
        dialogues: [
            '你拉开衣柜门——',
            '<narrator>一件东西从里面掉了出来。</narrator>',
            '是一具骨架。不——是衣架上挂着的连衣裙，被撑得像人形，在昏暗的光线下看起来像……',
            '<scream>你吓得后退一步。</scream>',
            '……只是衣服。只是女人的衣服。',
            '<narrator>但当你再看向衣柜深处时，你看到了——</narrator>',
            '角落里有什么东西在蠕动。黑色的、毛发一样的东西。',
            '<narrator>……是阴影。只是阴影。</narrator>'
        ],
        onEnter: () => {
            GameState.flags.openedCloset = true;
            GameState.sanity = Math.max(0, GameState.sanity - 12);
        },
        choices: [
            { text: '继续查看卧室', next: 'bedroom_return' }
        ]
    },

    bedroom_safe: {
        title: '密码 · 保险箱',
        location: '704号 · 卧室',
        dialogues: [
            '保险箱是老式的转盘密码锁，需要输入四位数字。',
            '<thought>便签上说：初见日期后两位+女人的年龄。初见是2020.03.15，后两位是15……她今年该27岁了……</thought>'
        ],
        onEnter: () => {
            showPasswordPanel(
                '输入保险箱密码',
                '提示：初见日期的后两位数字 + 女人的年龄。\n（共四位数字）',
                '1527',
                () => {
                    GameState.flags.openedSafe = true;
                    addItem('painting_frag_a');
                    addItem('drug');
                    showToast('保险箱打开了！');
                    setTimeout(() => goToScene('bedroom_safe_open'), 500);
                },
                () => {
                    GameState.sanity = Math.max(0, GameState.sanity - 2);
                    showToast('密码错误……');
                }
            );
        },
        choices: [
            { text: '返回卧室', next: 'bedroom_return' }
        ]
    },

    bedroom_safe_open: {
        title: '第二章 · 房中之物',
        location: '704号 · 卧室',
        dialogues: [
            '<narrator>咔哒——保险箱门弹开了。</narrator>',
            '里面有两片被撕下的画布碎片，和一小瓶白色药片。',
            '画布碎片的边缘焦黑，像是有人试图烧毁它但没有烧完。',
            '药瓶上没有标签，只有手写的符号。'
        ],
        onEnter: () => { updateProgress(); },
        choices: [
            { text: '继续查看卧室', next: 'bedroom_return' }
        ]
    },

    bedroom_return: {
        title: '第二章 · 房中之物',
        location: '704号 · 卧室',
        dialogues: [
            '你站在卧室中央。空气似乎更冷了。'
        ],
        choices: [
            { text: '查看床头柜相框', next: 'bedroom_photo', condition: () => !hasItem('photo') },
            { text: '尝试打开床头柜抽屉', next: 'bedroom_drawer', condition: () => hasItem('old_key') && !GameState.flags.openedNightstand },
            { text: '床头柜抽屉（需要钥匙）', next: null, condition: () => !hasItem('old_key') && !GameState.flags.openedNightstand, disabled: true, disabledHint: '（锁着）' },
            { text: '打开衣柜', next: 'bedroom_closet', condition: () => !GameState.flags.openedCloset },
            { text: '打开保险箱（密码）', next: 'bedroom_safe', condition: () => !GameState.flags.openedSafe },
            { text: '返回客厅', next: 'living_room_return' }
        ]
    },

    bathroom: {
        title: '第二章 · 房中之物',
        location: '704号 · 卫生间',
        dialogues: [
            '<narrator>卫生间很小，瓷砖已经泛黄。</narrator>',
            '镜子上蒙着一层水雾——奇怪，明明没有人用过热水。',
            '你伸出手，擦拭镜子。',
            '<narrator>水雾被擦掉的地方，露出了用口红写的字：</narrator>',
            '<whisper>"别相信他。"</whisper>',
            '<whisper>"画完了，一切就结束了。"</whisper>',
            '字是新的。非常新。',
            '<narrator>莲蓬头突然开始滴水。滴答……滴答……</narrator>',
            '你低头看——浴缸的排水口，被什么东西堵住了。'
        ],
        choices: [
            { text: '查看浴缸排水口', next: 'bathroom_drain', condition: () => !hasItem('painting_frag_b') },
            { text: '返回客厅', next: 'living_room_return' }
        ]
    },

    bathroom_drain: {
        title: '第二章 · 房中之物',
        location: '704号 · 卫生间',
        dialogues: [
            '你蹲下身，清理排水口——',
            '<narrator>扯出来的是一团头发和……画布的碎片？</narrator>',
            '那块画布上画着一扇门，门后隐约有一个轮廓。',
            '<thought>为什么画布碎片会在浴缸排水口里？</thought>'
        ],
        onEnter: () => {
            addItem('painting_frag_b');
            GameState.sanity = Math.max(0, GameState.sanity - 5);
            updateProgress();
        },
        choices: [
            { text: '返回客厅', next: 'living_room_return' }
        ]
    },

    studio: {
        title: '第三章 · 画作',
        location: '704号 · 画室',
        dialogues: [
            '<narrator>画室的门推开的瞬间，一股浓烈的松节油味扑面而来。</narrator>',
            '画架上罩着一块白布。白布的形状，勾勒出一个站立的人影。',
            '地上散落着干涸的颜料管和碎裂的画笔。',
            '<narrator>窗户被木板钉死了。整个房间只靠一盏昏暗的台灯照明。</narrator>',
            '画架旁边有一个铁桶，里面是烧过的灰烬。',
            '<whisper>你又听到了那个低语声。这次，是从白布下面传来的。</whisper>'
        ],
        choices: [
            { text: '查看铁桶里的灰烬', next: 'studio_ashes', condition: () => !GameState.flags.checkedAshes },
            { text: '掀开白布看画', next: 'studio_painting' },
            { text: '用蜡烛和火柴照明画室', next: 'studio_light', condition: () => hasItem('candle') && hasItem('matches') && !GameState.flags.litCandle },
            { text: '返回客厅', next: 'living_room_return' }
        ]
    },

    studio_return: {
        title: '第三章 · 画作',
        location: '704号 · 画室',
        dialogues: [
            '你回到画室中央。画架依然静静地立在那里。',
            '<narrator>低语声似乎更清晰了一些。</narrator>'
        ],
        choices: [
            { text: '查看铁桶里的灰烬', next: 'studio_ashes', condition: () => !GameState.flags.checkedAshes },
            { text: '掀开白布看画', next: 'studio_painting' },
            { text: '用蜡烛和火柴照明画室', next: 'studio_light', condition: () => hasItem('candle') && hasItem('matches') && !GameState.flags.litCandle },
            { text: '返回客厅', next: 'living_room_return' }
        ]
    },

    studio_ashes: {
        title: '第三章 · 画作',
        location: '704号 · 画室',
        dialogues: [
            '你翻找铁桶里的灰烬——大部分已经完全烧毁了。',
            '但在最底下，你摸到了好几片没烧完的纸。',
            '其中一片硬挺的铜版纸，像是打印的博客标题页，边缘已经焦黑：',
            '"……网易博客 · 晓晓的画语 · 博主：林晓·LinXiao · 博文47篇……"',
            '下面夹着一张手写小纸条，用蓝色圆珠笔写的，还剩半截：',
            '"……网址：localhost:8080/echo_linxiao_blog.html · 密码和初见那天一样……"',
            '另一片没烧完的画稿上，写着几行潦草的字，像是"他"的笔迹：',
            '"……仪式……血……第七次献祭……画中人出来……互换存在……"',
            '画稿的角落里，还有一个符号——和药瓶边缘刻着的一模一样。',
            '<thought>画家的"他"……指的是谁？为什么画室里全是"他"的笔记？</thought>',
            '<thought>而且博客……那是林晓的博客吗？她想告诉我们什么？</thought>'
        ],
        onEnter: () => {
            GameState.flags.checkedAshes = true;
            GameState.sanity = Math.max(0, GameState.sanity - 10);
            addItem('burnt_note');
            addClue('c3');
            addClue('c9');
            updateProgress();
        },
        choices: [
            { text: '返回画室', next: 'studio_return' }
        ]
    },

    studio_light: {
        title: '第三章 · 画作',
        location: '704号 · 画室',
        dialogues: [
            '你点燃蜡烛，放在画架旁边的桌子上。',
            '<narrator>烛光摇曳，房间里的阴影开始跳舞。</narrator>',
            '<narrator>你注意到——</narrator>',
            '墙壁上，在烛光的映照下，显出了无数道划痕。像是指甲抓出来的。',
            '那些划痕组成了一个字，反复写了无数遍：',
            '<whisper>"走。"</whisper>'
        ],
        onEnter: () => {
            addItem('lit_candle');
            removeItem('candle');
            removeItem('matches');
            GameState.flags.litCandle = true;
            GameState.sanity = Math.max(0, GameState.sanity - 10);
        },
        choices: [
            { text: '返回画室', next: 'studio_return' }
        ]
    },

    studio_painting: {
        title: '第三章 · 画作',
        location: '704号 · 画室',
        dialogues: [
            '你的手指触碰到白布的边缘。布料冰冷。',
            '<narrator>你深吸一口气，猛地掀开——</narrator>',
            '画上是一个女人，站在一扇门前。她的脸模糊不清，但她的眼睛——',
            '<narrator>她的眼睛是空的。两个漆黑的洞。</narrator>',
            '而那扇门——你认出了，那就是704号的大门。',
            '<whisper>画布上的门，似乎在微微颤动。</whisper>',
            '<thought>这幅画……是未完成的《回声》……吗？</thought>',
            '<narrator>你注意到画布中间有一道裂痕，像是被人撕开过又重新粘合。</narrator>'
        ],
        onEnter: () => {
            GameState.flags.lookedPainting = true;
            GameState.sanity = Math.max(0, GameState.sanity - 10);
            updateProgress();
        },
        choices: [
            { text: '用复原的画布修补这幅画', next: 'painting_repair', condition: () => hasItem('restored_painting') && !GameState.flags.repairedPainting },
            { text: '毁掉这幅画（用剪刀）', next: 'painting_destroy', condition: () => hasItem('scissors') && GameState.flags.repairedPainting && !GameState.flags.destroyedPainting },
            { text: '尝试进入画中的门', next: 'painting_enter', condition: () => GameState.flags.repairedPainting && !GameState.flags.destroyedPainting && !GameState.flags.enteredPainting },
            { text: '返回画室', next: 'studio_return' }
        ]
    },

    painting_repair: {
        title: '第三章 · 画作',
        location: '704号 · 画室',
        dialogues: [
            '你取出复原的画布碎片，比对那道裂痕——完美契合。',
            '当两块画布触碰的瞬间，你感到一阵强烈的电流穿过全身。',
            '<narrator>画中的女人动了。</narrator>',
            '她缓缓转过头，空洞的眼睛"看向"你的方向。',
            '她的嘴唇动了。没有声音，但你读懂了——',
            '<whisper>"你来了。"</whisper>',
            '<whisper>"我等你很久很久了。"</whisper>',
            '画中的门开了一条缝。黑暗从门缝涌出。'
        ],
        onEnter: () => {
            removeItem('restored_painting');
            GameState.flags.repairedPainting = true;
            GameState.sanity = Math.max(0, GameState.sanity - 15);
            updateProgress();
        },
        choices: [
            { text: '毁掉这幅画（用剪刀）', next: 'painting_destroy', condition: () => hasItem('scissors') && !GameState.flags.destroyedPainting },
            { text: '进入画中的门', next: 'painting_enter', condition: () => !GameState.flags.enteredPainting },
            { text: '后退……返回画室', next: 'studio_return' }
        ]
    },

    painting_destroy: {
        title: '第三章 · 画作',
        location: '704号 · 画室',
        dialogues: [
            '你握紧园艺剪刀，对着画布狠狠刺下——',
            '<scream>剪刀刺入画布的瞬间，你听到了一个女人凄厉的尖叫！</scream>',
            '鲜血从裂口中涌出——真的血，温热的、鲜红的，溅到你的脸上。',
            '"为什么……？"',
            '<whisper>林晓的声音，从画中传来，虚弱而悲伤。</whisper>',
            '"我等了你三年……就是为了让你杀了我……？"',
            '<narrator>画中的女人，闭上了她空洞的眼睛。</narrator>',
            '血还在流。染红了你的手，染红了地板。',
            '<thought>我……做了什么？</thought>'
        ],
        onEnter: () => {
            GameState.flags.destroyedPainting = true;
            GameState.flags.killedLinXiao = true;
            addClue('c8');
            GameState.sanity = Math.max(0, GameState.sanity - 20);
            updateProgress();
        },
        choices: [
            { text: '……逃离公寓', next: 'final_escape' },
            { text: '对着画中的林晓说些什么', next: 'painting_last_words' }
        ]
    },

    painting_last_words: {
        title: '终章 · 抉择',
        location: '704号 · 画室',
        dialogues: [
            '"林晓……对不起……"',
            '<narrator>你跪倒在画前，血浸湿了你的膝盖。</narrator>',
            '记忆如潮水般涌来——',
            '2020年3月15日，樱花树下。你遇见了林晓。她笑着，把画笔塞进你手里。',
            '"教我画画好吗？"',
            '三年的时光，你们住在这间公寓。她画，你看。',
            '直到那一天——你发现了那幅《回声》的秘密。画里的世界，画里的另一个她。',
            '你妒忌，你愤怒，你失去了理智……',
            '<thought>是我……是我把她关进了画里……</thought>',
            '<thought>三年前，失踪的人其实是……我？</thought>'
        ],
        onEnter: () => {
            GameState.flags.remembered = true;
            addClue('c8');
            GameState.sanity = Math.max(0, GameState.sanity - 10);
        },
        choices: [
            { text: '用剪刀刺向自己（结局D？）', next: 'ending_forever', condition: () => hasItem('scissors') },
            { text: '带着悔恨逃离（结局B？）', next: 'ending_insane', condition: () => GameState.sanity < 30 },
            { text: '尝试把她从画里救出来', next: 'attempt_save', condition: () => GameState.sanity >= 30 }
        ]
    },

    attempt_save: {
        title: '终章 · 抉择',
        location: '704号 · 画室',
        dialogues: [
            '"林晓，我来救你——"',
            '你把手伸向画布的裂口。不可思议的是，你的手穿了过去。',
            '<narrator>画中的世界，阴冷而潮湿。</narrator>',
            '你看到林晓站在那扇红色的门前，背对着你。',
            '"你来了。" 她的声音很轻，"终于愿意面对我了吗？"',
            '"晓晓，对不起——我不该——"',
            '她转过身。这一次，她的脸上有眼睛了。',
            '但那双眼睛，正在流血泪。',
            '"道歉……就够了吗？三年了。三年，我在画里，听着你在外面的声音。"',
            '"我每一天都在等你打开那幅画，等你记起我。"',
            '她伸出手。她的手是冰冷的。',
            '"但现在，已经太晚了。"'
        ],
        onEnter: () => {
            GameState.sanity = Math.max(0, GameState.sanity - 10);
        },
        choices: [
            { text: '握住她的手，和她一起留在画里', next: 'ending_together' },
            { text: '拉她一起离开画里（需要白色药片？）', next: 'ending_redemption', condition: () => hasItem('drug') && GameState.clues.length >= 6 }
        ]
    },

    painting_enter: {
        title: '第三章 · 画作',
        location: '画中世界',
        dialogues: [
            '你走向画中的门。每走一步，画室的世界就变得更模糊。',
            '<narrator>当你的手触碰到画上门把手的那一刻——</narrator>',
            '整个世界翻转了。',
            '<narrator>你站在一条走廊里。和公寓的走廊一模一样，只是——所有的颜色都褪去了。</narrator>',
            '一切都是灰色的。',
            '走廊尽头，704号的红色大门在灰调中格外刺目。',
            '<whisper>"你终于进来了。"</whisper>',
            '林晓站在门旁边，和照片上一模一样。只是她的身体……是半透明的。',
            '"我以为你会选择毁掉那幅画。" 她看着你，眼神复杂，"但你来了。"'
        ],
        onEnter: () => {
            GameState.flags.enteredPainting = true;
            GameState.sanity = Math.max(0, GameState.sanity - 15);
            updateProgress();
        },
        choices: [
            { text: '"林晓……我记起来了。是我把你关在这里的。"', next: 'confession_truth', condition: () => hasClue('c8') || hasClue('c7') },
            { text: '"林晓，我来救你出去。"', next: 'painting_save_attempt' },
            { text: '"你……要怎样才会放过我？"', next: 'ending_insane', condition: () => GameState.sanity < 40 }
        ]
    },

    confession_truth: {
        title: '终章 · 真相',
        location: '画中世界 · 704前',
        dialogues: [
            '她沉默了很久很久。',
            '"……你终于记起来了。"',
            '三年前的那天，你因为妒忌，和她争吵。你把她推向画架——',
            '<narrator>意外发生了。</narrator>',
            '她的头磕在尖锐的画框角上。血，流到了那幅未完成的《回声》上。',
            '血与颜料融合。画中的门，开了。',
            '你惊慌失措，眼睁睁看着她被吸入画中。然后你跑了。',
            '你删掉了自己和她的所有照片。你销毁了和她有关的一切证据。',
            '你甚至……吃了药，选择性地忘记了这一切。',
            '<narrator>你手腕上的旧伤疤——那是你第一次尝试自杀留下的。你失败了，也失忆了。</narrator>',
            '但林晓没有恨你。她等在画里，等你记起一切，等你愿意来见她。',
            '"我等的不是道歉。" 她轻声说，"我等的是你。"'
        ],
        onEnter: () => {
            addClue('c8');
            GameState.sanity = Math.max(0, GameState.sanity - 5);
            updateProgress();
        },
        choices: [
            { text: '和她一起留在画里（结局C）', next: 'ending_together' },
            { text: '使用白色药片，逆转一切（结局E - 完美结局）', next: 'ending_true_redemption', condition: () => hasItem('drug') && GameState.clues.length >= 8 },
            { text: '独自离开（结局A - 理智结局）', next: 'ending_rational', condition: () => GameState.sanity >= 20 }
        ]
    },

    painting_save_attempt: {
        title: '终章 · 抉择',
        location: '画中世界 · 704前',
        dialogues: [
            '"救我出去？" 林晓笑了。笑得很悲伤。',
            '"三年了，你觉得我还能出去吗？"',
            '"画就是我的牢笼，也是我的坟墓。"',
            '"除非……" 她看向你身后的方向，"你愿意和我交换。"',
            '<narrator>画外的世界，你看到自己的身体站在画架前，一动不动。</narrator>',
            '"你留下来代替我，我就可以出去。"',
            '"或者……你毁掉画，我们一起消失。"',
            '"或者，你现在转身离开，忘记一切，继续过你的人生。"',
            '她看着你，眼里有泪光。',
            '"选吧。我不怪你，无论你选什么。"'
        ],
        choices: [
            { text: '留下来代替她（结局D）', next: 'ending_forever' },
            { text: '毁掉画，一起消失（结局B）', next: 'ending_insane' },
            { text: '不——一定还有别的办法！', next: 'confession_truth', condition: () => hasClue('c8') || hasItem('drug') }
        ]
    },

    final_escape: {
        title: '终章 · 逃离',
        location: '704号 · 玄关',
        dialogues: [
            '你跌跌撞撞冲向门口，手上的血在地上留下印记。',
            '<narrator>开门——走廊——电梯——</narrator>',
            '电梯在下降。1楼到了。大厅里老人不在。',
            '雨还在下。你冲进雨中，不停地跑，不停地跑。',
            '<narrator>你不知道跑了多久，直到公寓消失在身后。</narrator>',
            '你停下来，大口喘气。雨浇在脸上，冰凉。',
            '<thought>……我活下来了？</thought>',
            '<thought>那一切……是真的吗？</thought>',
            '你低头看自己的手。',
            '<narrator>干干净净。没有血。</narrator>',
            '<whisper>但在你身后的雨雾中，一个穿着白色连衣裙的身影，静静地站着。</whisper>',
            '<whisper>她在笑。</whisper>'
        ],
        choices: [
            { text: '（结束）', next: 'ending_rational' }
        ]
    },

    // ===== 5个结局 =====
    ending_rational: {
        title: '结局 A',
        type: '🧠 理智尚存 · Normal End',
        location: '结局',
        isEnding: true,
        endingId: 'A',
        dialogues: [
            '你活下来了。',
            '从那以后，你再也没有接近过那栋公寓。你继续做你的心理咨询师，过你的日子。',
            '只是，偶尔，在深夜里——',
            '你会听到敲门声。咚……咚……咚……和那天你敲704门的节奏一模一样。',
            '你不敢开门。你也不敢回头看那扇门。',
            '因为你知道，只要打开一次——',
            '她就会进来。',
            '',
            '【结局 A：理智尚存】',
            '你选择了逃避，保住了自己的人生。',
            '但有些东西，会永远跟在你身后。',
            '',
            '<narrator>—— 收集线索：' + GameState.clues.length + '/9 ——</narrator>',
            '<narrator>—— 剩余理智：' + GameState.sanity + ' ——</narrator>'
        ]
    },

    ending_insane: {
        title: '结局 B',
        type: '👁 沉沦深渊 · Bad End',
        location: '结局',
        isEnding: true,
        endingId: 'B',
        dialogues: [
            '你疯了。',
            '他们在废弃的公寓楼里发现了你，蜷缩在704号房间的角落，嘴里反复念叨着什么。',
            '"画……画……她在画里……"',
            '你被送进了精神病院。单人病房，四面白墙。',
            '但对你来说，这里和704号没有区别。',
            '因为无论你在哪里，墙上都会出现那幅画。画里的女人，空洞的眼睛永远看着你。',
            '而有时，当夜深人静，你会听到护士们的议论：',
            '"那个新来的女病人，真可怜，听说三年前失踪后被找到时，已经完全不记得自己是谁了……"',
            '"是啊，她叫什么来着？林……林什么？"',
            '',
            '你笑了。',
            '因为你知道了——你和她，终于互换了位置。',
            '',
            '【结局 B：沉沦深渊】',
            '精神崩溃后，你的存在与她的存在开始混淆。',
            '谁是画里的人？谁是画外的人？',
            '你已经分不清了。',
            '',
            '<narrator>—— 收集线索：' + GameState.clues.length + '/9 ——</narrator>',
            '<narrator>—— 剩余理智：' + GameState.sanity + ' ——</narrator>'
        ]
    },

    ending_together: {
        title: '结局 C',
        type: '✨ 救赎之光 · Good End',
        location: '结局',
        isEnding: true,
        endingId: 'C',
        dialogues: [
            '"我不走了。"',
            '你走向她，握住她冰冷的手。',
            '"三年前我丢下你一个人。这一次，我陪着你。"',
            '她愣住了。然后，她哭了。',
            '画中的世界开始变化。灰色褪去，色彩重新流动。',
            '走廊变成了樱花纷飞的小路。2020年3月15日，你们初见的那天。',
            '她不再是半透明的了。她有了温度，有了重量。',
            '"你这个笨蛋……" 她把头埋在你胸前，"我等这句话等了三年……"',
            '"对不起。"',
            '"……嗯。"',
            '',
            '画外的世界里，站在画架前的那个身体，缓缓闭上了眼睛。',
            '嘴角带着笑。',
            '而画中，樱花树下，两个人影紧紧相拥。',
            '这一次，不会再分开了。',
            '',
            '【结局 C：救赎之光】',
            '你选择了陪伴她，在画中的世界永远活下去。',
            '也许对你们来说，这才是最好的结局。',
            '',
            '<narrator>—— 收集线索：' + GameState.clues.length + '/9 ——</narrator>',
            '<narrator>—— 剩余理智：' + GameState.sanity + ' ——</narrator>'
        ]
    },

    ending_forever: {
        title: '结局 D',
        type: '🔒 永远的房客 · Bad End',
        location: '结局',
        isEnding: true,
        endingId: 'D',
        dialogues: [
            '你留下来了。',
            '不——应该说，你被困下来了。',
            '当你的意识清醒过来时，你站在704号门前的走廊里。',
            '一切都是灰色的。没有声音，没有风，没有时间。',
            '你试着推开704的门，但门永远是锁着的。',
            '你跑向电梯，电梯永远停在七楼，门永远关着。',
            '你在这条走廊里走了多久？一天？一年？还是一百年？',
            '你不知道。',
            '唯一不变的是——',
            '每当有新的人推开画里的门，你就会站在他们身后。',
            '轻声说一句：',
            '<whisper>"……又来一个。"</whisper>',
            '',
            '【结局 D：永远的房客】',
            '你成为了画中世界的囚徒。',
            '而画里的那个她，带着你的脸，回到了外面的世界。',
            '',
            '<narrator>—— 收集线索：' + GameState.clues.length + '/9 ——</narrator>',
            '<narrator>—— 剩余理智：' + GameState.sanity + ' ——</narrator>'
        ]
    },

    ending_redemption: {
        title: '终章 · 救赎',
        location: '画中世界',
        dialogues: [
            '"拉我一起走？" 林晓瞪大了眼睛，"你知道这意味着什么吗？"',
            '你看着她。她空洞的眼睛里，有微弱的光在闪烁。',
            '你想起口袋里那瓶白色药片——三年前，就是你吃了它才忘记一切的。',
            '"如果药的瓶子是成对的，一瓶让人忘记，那另一瓶应该能让人记起。"',
            '"只要我们中的一个记起了一切，就能改变过去。"',
            '她沉默了很久。',
            '<whisper>"……你真的想好了吗？"</whisper>',
            '<narrator>画中的世界静静流淌，等待着你的最后选择。</narrator>'
        ],
        onEnter: () => {
            addClue('c8');
            updateProgress();
        },
        choices: [
            { text: '放下药片，留在画中永远陪她 → 结局C', next: 'ending_together' },
            { text: '独自吞下解药，改写时间线 → 完美结局E', next: 'ending_true_redemption', condition: () => GameState.clues.length >= 8 }
        ]
    },

    ending_true_redemption: {
        title: '结局 E',
        type: '🌟 完美结局 · True End',
        location: '结局',
        isEnding: true,
        endingId: 'E',
        dialogues: [
            '"还有别的办法。"',
            '你从口袋里掏出那瓶白色药片——三年前，你就是吃了这个才失忆的。',
            '"药的瓶子是成对的。一瓶让人忘记，一瓶……让人记起。"',
            '"如果我没猜错，这一瓶，是解药。"',
            '你倒出药片，毫不犹豫地吞下。',
            '<narrator>剧烈的疼痛席卷全身。所有被遗忘的记忆，在一瞬间涌回。</narrator>',
            '你记起了一切。争吵、血、她被吸入画中的瞬间、你的逃跑、你的自杀……',
            '也记起了——她被吸入画中时，最后说的那句话：',
            '"我不怪你。我等你。"',
            '眼泪夺眶而出。',
            '<narrator>不可思议的事情发生了——</narrator>',
            '你和她之间的界线开始模糊。画中世界和现实世界在重叠，在融合。',
            '你看到过去的自己在推她，你冲上去，把过去的自己撞开——',
            '<narrator>时间线被改写了。</narrator>',
            '',
            '—— 2020年3月15日 ——',
            '樱花树下，一个女孩笑着，把画笔塞进你手里。',
            '"教我画画好吗？"',
            '你接过画笔，紧紧握住她的另一只手。',
            '"好。一辈子教你。"',
            '',
            '这一次，没有争吵，没有血，没有画里的世界。',
            '只有阳光，和两个人长长的影子。',
            '',
            '【结局 E：完美救赎 · True End】',
            '你收集了所有真相，做出了最艰难的选择。',
            '命运的轨迹，终于被纠正了。',
            '',
            '<narrator>—— 恭喜你达成完美结局！——</narrator>',
            '<narrator>—— 收集线索：' + GameState.clues.length + '/9 ——</narrator>',
            '<narrator>—— 剩余理智：' + GameState.sanity + ' ——</narrator>'
        ]
    },

    ending_lost: {
        title: '结局',
        type: '？？？ Hidden End',
        location: '结局',
        isEnding: true,
        endingId: 'H',
        dialogues: [
            '你失去了意识。',
            '',
            '',
            '………………',
            '',
            '',
            '当你醒来时，你发现自己站在704号门前。',
            '你不记得自己是谁，不记得自己为什么在这里。',
            '你手中攥着一张泛黄的邀请函。',
            '',
            '门，缓缓地，自己打开了。',
            '<whisper>"欢迎回家。"</whisper>',
            '',
            '你走了进去。',
            '门在你身后关上。',
            '',
            '—— 又是一个循环。 ——',
            '',
            '<narrator>（理智归零触发 · 隐藏结局）</narrator>'
        ]
    }
};

// ===== 物品组合配方 =====
const CombineRecipes = [
    {
        items: ['painting_frag_a', 'painting_frag_b'],
        result: 'restored_painting',
        message: '两片画布严丝合缝地拼在了一起……'
    }
];

// ===== 工具函数 =====
function hasItem(id) {
    return GameState.inventory.some(i => i.id === id);
}

function addItem(id) {
    if (!Items[id] || hasItem(id)) return;
    GameState.inventory.push(Items[id]);
    showToast('获得物品：' + Items[id].name);
}

function removeItem(id) {
    GameState.inventory = GameState.inventory.filter(i => i.id !== id);
}

function hasClue(id) {
    return GameState.clues.some(c => c.id === id);
}

function addClue(id) {
    if (!Clues[id] || hasClue(id)) return;
    GameState.clues.push(Clues[id]);
    showToast('发现线索：' + Clues[id].title);
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function updateProgress() {
    const total = Object.keys(Scenes).length;
    const visited = GameState.visitedScenes.size;
    const progress = Math.min(100, Math.round((visited / total) * 100 + GameState.clues.length * 5));
    document.getElementById('progress-text').textContent = progress + '%';
}

// ===== UI 更新 =====
function updateUI() {
    const sanity = GameState.sanity;
    const sanityFill = document.getElementById('sanity-fill');
    const sanityText = document.getElementById('sanity-text');
    sanityFill.style.width = sanity + '%';
    sanityText.textContent = sanity;
    sanityFill.classList.remove('medium', 'low');
    if (sanity <= 20) sanityFill.classList.add('low');
    else if (sanity <= 50) sanityFill.classList.add('medium');

    document.body.classList.toggle('low-sanity', sanity <= 20);
    updateProgress();
}

// ===== 打字机效果 =====
let typingTimer = null;
let currentTypingCallback = null;

function typeText(text, callback) {
    GameState.typing = true;
    currentTypingCallback = callback;
    const dialogueText = document.getElementById('dialogue-text');
    const cursor = document.getElementById('dialogue-cursor');

    // 创建新段落，累积显示而非替换
    const lineDiv = document.createElement('div');
    lineDiv.className = 'dialogue-line';
    dialogueText.appendChild(lineDiv);

    // 光标移到当前段落内
    cursor.style.display = 'inline-block';
    lineDiv.appendChild(cursor);

    let i = 0;
    let fullHTML = '';
    let parsedText = parseTextTags(text);

    function type() {
        if (i >= parsedText.length) {
            GameState.typing = false;
            cursor.style.display = 'none';
            typingTimer = null;
            // 自动滚动到底部
            dialogueText.parentElement.scrollTop = dialogueText.parentElement.scrollHeight;
            if (callback) setTimeout(() => { callback(); currentTypingCallback = null; }, 300);
            return;
        }

        let chunk = '';
        if (parsedText[i].startsWith('<')) {
            let endTagIdx = parsedText.indexOf('>', i);
            if (endTagIdx !== -1) {
                chunk = parsedText.substring(i, endTagIdx + 1);
                i = endTagIdx + 1;
            }
        } else {
            chunk = parsedText[i];
            i++;
        }

        fullHTML += chunk;
        // 光标始终在文本末尾
        lineDiv.innerHTML = fullHTML;
        lineDiv.appendChild(cursor);

        let delay = 25;
        if (sanityLow()) delay = 35 + Math.random() * 20;
        typingTimer = setTimeout(type, delay);
    }

    type();
}

function parseTextTags(text) {
    // 将自定义标签转换为带class的span标签，使CSS样式生效
    return text
        .replace(/<narrator>/g, '<span class="narrator">')
        .replace(/<\/narrator>/g, '</span>')
        .replace(/<thought>/g, '<span class="thought">')
        .replace(/<\/thought>/g, '</span>')
        .replace(/<whisper>/g, '<span class="whisper">')
        .replace(/<\/whisper>/g, '</span>')
        .replace(/<scream>/g, '<span class="scream">')
        .replace(/<\/scream>/g, '</span>');
}

function sanityLow() {
    return GameState.sanity <= 20;
}

// ===== 场景系统 =====
function goToScene(sceneId) {
    const scene = Scenes[sceneId];
    if (!scene) {
        console.error('Scene not found:', sceneId);
        return;
    }

    // 清除可能残留的打字计时器与回调，防止场景切换后旧对话继续播放
    if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
    }
    GameState.typing = false;
    currentTypingCallback = null;
    const dialogueBox0 = document.getElementById('dialogue-box');
    if (dialogueBox0) dialogueBox0.onclick = null;

    GameState.currentScene = sceneId;
    GameState.visitedScenes.add(sceneId);
    updateUI();
    saveGame(true);

    document.getElementById('scene-title').textContent = scene.title || '';
    document.getElementById('location-text').textContent = '📍 ' + (scene.location || '');

    // 场景切换时清空对话区（累积显示只在同一场景内）
    // 先把光标移回 dialogue-box，避免被 innerHTML='' 删除
    const cursor = document.getElementById('dialogue-cursor');
    const dialogueBox = document.getElementById('dialogue-box');
    if (cursor && dialogueBox) {
        dialogueBox.appendChild(cursor);
        cursor.style.display = 'none';
    }
    document.getElementById('dialogue-text').innerHTML = '';

    if (scene.onEnter) scene.onEnter();
    updateUI();

    // 切换场景音乐
    if (!scene.isEnding) {
        AudioManager.switchForScene(sceneId, false, null);
    }

    if (scene.isEnding) {
        playEnding(scene);
        return;
    }

    playDialogue(scene.dialogues || [], () => {
        showChoices(scene.choices || []);
    });
}

function playDialogue(dialogues, callback) {
    if (!dialogues || dialogues.length === 0) {
        if (callback) callback();
        return;
    }

    let idx = 0;
    function next() {
        if (idx >= dialogues.length) {
            if (callback) callback();
            return;
        }
        typeText(dialogues[idx], () => {
            setTimeout(() => {
                idx++;
                next();
            }, 600);
        });
    }

    document.getElementById('dialogue-box').onclick = () => {
        if (GameState.typing) {
            skipType(dialogues[idx]);
        }
    };

    next();
}

function skipType(fullText) {
    if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
    }
    const dialogueText = document.getElementById('dialogue-text');
    const cursor = document.getElementById('dialogue-cursor');
    // 只填充最后一个段落（当前正在打字的段落）
    const lines = dialogueText.querySelectorAll('.dialogue-line');
    if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        lastLine.innerHTML = parseTextTags(fullText);
        lastLine.appendChild(cursor);
    }
    cursor.style.display = 'none';
    GameState.typing = false;
    // 自动滚动到底部
    dialogueText.parentElement.scrollTop = dialogueText.parentElement.scrollHeight;

    // 跳过后触发回调，继续后续对话或显示选项
    if (currentTypingCallback) {
        const cb = currentTypingCallback;
        currentTypingCallback = null;
        setTimeout(cb, 300);
    }
}

function showChoices(choices) {
    const container = document.getElementById('choices-container');
    container.innerHTML = '';

    const validChoices = choices.filter(c => !c.condition || c.condition());

    if (validChoices.length === 0) {
        const p = document.createElement('p');
        p.textContent = '……（没有可选择的行动）';
        p.style.color = '#555';
        p.style.textAlign = 'center';
        p.style.marginTop = '30px';
        container.appendChild(p);
        return;
    }

    validChoices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.disabled = choice.disabled;

        let text = choice.text;
        if (choice.disabledHint) {
            text += ' <span class="lock-hint">' + choice.disabledHint + '</span>';
        }
        btn.innerHTML = text;

        if (!choice.disabled && choice.next) {
            btn.onclick = () => {
                container.innerHTML = '';
                document.getElementById('dialogue-box').onclick = null;
                goToScene(choice.next);
            };
        } else if (choice.onClick) {
            btn.onclick = choice.onClick;
        }

        container.appendChild(btn);
    });
}

// ===== 面板系统 =====
function openPanel(id) {
    document.getElementById(id).style.display = 'flex';
    document.getElementById('overlay').classList.add('active');
}

function closePanel(id) {
    document.getElementById(id).style.display = 'none';
    document.getElementById('overlay').classList.remove('active');
    if (id === 'inventory-panel') GameState.selectedItems = [];
    if (id === 'password-panel') GameState.passwordCallback = null;
}

// ===== 物品栏 =====
function openInventory() {
    renderInventory();
    openPanel('inventory-panel');
}

function renderInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';

    if (GameState.inventory.length === 0) {
        list.innerHTML = '<div class="empty-slot">物品栏是空的</div>';
        document.getElementById('combine-btn').style.display = 'none';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'item-list';

    GameState.inventory.forEach(item => {
        const slot = document.createElement('div');
        slot.className = 'item-slot';
        if (GameState.selectedItems.includes(item.id)) slot.classList.add('selected');

        slot.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
        `;

        slot.onclick = () => toggleSelectItem(item);
        grid.appendChild(slot);
    });

    list.appendChild(grid);

    if (GameState.selectedItems.length > 0) {
        const selected = Items[GameState.selectedItems[GameState.selectedItems.length - 1]];
        const detail = document.createElement('div');
        detail.className = 'item-detail';
        detail.innerHTML = `<h3>${selected.icon} ${selected.name}</h3><p>${selected.desc}</p>`;
        list.appendChild(detail);
    }

    document.getElementById('combine-btn').style.display =
        GameState.selectedItems.length === 2 ? 'inline-block' : 'none';
}

function toggleSelectItem(item) {
    const idx = GameState.selectedItems.indexOf(item.id);
    if (idx >= 0) {
        GameState.selectedItems.splice(idx, 1);
    } else {
        if (GameState.selectedItems.length >= 2) GameState.selectedItems.shift();
        GameState.selectedItems.push(item.id);
    }
    renderInventory();
}

function combineItems() {
    if (GameState.selectedItems.length !== 2) return;

    const [a, b] = GameState.selectedItems;
    const recipe = CombineRecipes.find(r =>
        (r.items.includes(a) && r.items.includes(b))
    );

    if (recipe) {
        removeItem(a);
        removeItem(b);
        addItem(recipe.result);
        showToast(recipe.message);
        GameState.selectedItems = [];
        renderInventory();
    } else {
        showToast('这两样东西没法组合……');
    }
}

// ===== 线索 =====
function openClues() {
    renderClues();
    openPanel('clues-panel');
}

function renderClues() {
    const list = document.getElementById('clues-list');
    list.innerHTML = '';

    if (GameState.clues.length === 0) {
        list.innerHTML = '<div class="empty-slot">还没有发现任何线索</div>';
        return;
    }

    GameState.clues.forEach(clue => {
        const div = document.createElement('div');
        div.className = 'clue-item';
        div.innerHTML = `<h4>📌 ${clue.title}</h4><p>${clue.text}</p>`;
        list.appendChild(div);
    });
}

// ===== 密码系统 =====
function showPasswordPanel(title, hint, correctAnswer, onSuccess, onFail) {
    document.getElementById('password-title').textContent = title;
    document.getElementById('password-hint').textContent = hint;
    document.getElementById('password-input').value = '';
    document.getElementById('password-error').textContent = '';

    GameState.passwordCallback = {
        answer: correctAnswer,
        onSuccess,
        onFail
    };

    openPanel('password-panel');
    setTimeout(() => document.getElementById('password-input').focus(), 100);
}

function submitPassword() {
    const input = document.getElementById('password-input').value.trim();
    const cb = GameState.passwordCallback;
    if (!cb) return;

    if (input === cb.answer) {
        closePanel('password-panel');
        if (cb.onSuccess) cb.onSuccess();
    } else {
        document.getElementById('password-error').textContent = '密码错误。再想想……';
        document.getElementById('password-input').value = '';
        if (cb.onFail) cb.onFail();
    }
}

// ===== 结局 =====
function playEnding(scene) {
    updateUI();
    playDialogue(scene.dialogues || [], () => {
        setTimeout(() => showEndingScreen(scene), 1000);
    });
}

function showEndingScreen(scene) {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('ending-screen').style.display = 'flex';
    document.getElementById('ending-title').textContent = scene.title || '结局';
    document.getElementById('ending-type').textContent = scene.type || '';
    document.getElementById('ending-text').innerHTML = scene.dialogues.map(d => parseTextTags(d)).join('\n\n');

    const stats = `
        <span>线索收集：${GameState.clues.length}/9</span>
        <span>理智剩余：${GameState.sanity}</span>
        <span>结局：${scene.endingId || '?'}</span>
    `;
    document.getElementById('ending-stats').innerHTML = stats;

    // 切换结局音乐
    GameState.lastEndingId = scene.endingId;
    if (scene.endingId === 'H') {
        AudioManager.playLoopBgm();
    } else {
        AudioManager.switchForScene(GameState.currentScene, true, scene.endingId);
    }

    localStorage.removeItem('echo_apartment_save');
}

// ===== 存档系统 =====
function saveGame(silent = false) {
    try {
        const saveData = {
            currentScene: GameState.currentScene,
            sanity: GameState.sanity,
            inventory: GameState.inventory.map(i => i.id),
            clues: GameState.clues.map(c => c.id),
            flags: GameState.flags,
            visitedScenes: Array.from(GameState.visitedScenes)
        };
        localStorage.setItem('echo_apartment_save', JSON.stringify(saveData));
        if (!silent) showToast('游戏已保存');
    } catch (e) {
        console.error('Save failed:', e);
    }
}

function loadGame() {
    try {
        const saveData = JSON.parse(localStorage.getItem('echo_apartment_save'));
        if (!saveData) {
            showToast('没有找到存档');
            return false;
        }

        GameState.currentScene = saveData.currentScene;
        GameState.sanity = saveData.sanity;
        GameState.inventory = saveData.inventory.map(id => Items[id]).filter(Boolean);
        GameState.clues = saveData.clues.map(id => Clues[id]).filter(Boolean);
        GameState.flags = saveData.flags || {};
        GameState.visitedScenes = new Set(saveData.visitedScenes || []);

        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'flex';
        document.getElementById('ending-screen').style.display = 'none';

        showToast('存档读取成功');
        goToScene(GameState.currentScene);
        return true;
    } catch (e) {
        console.error('Load failed:', e);
        showToast('存档读取失败');
        return false;
    }
}

// ===== 标题界面 =====
function startNewGame() {
    GameState.currentScene = 'start';
    GameState.sanity = 100;
    GameState.inventory = [];
    GameState.clues = [];
    GameState.flags = {};
    GameState.selectedItems = [];
    GameState.visitedScenes = new Set();

    document.getElementById('title-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('ending-screen').style.display = 'none';

    AudioManager.toGameStart();
    goToScene('start');
}

function backToTitle() {
    document.getElementById('title-screen').style.display = 'flex';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('ending-screen').style.display = 'none';
    closeAllPanels();
    AudioManager.toTitle();
}

function showAbout() {
    openPanel('about-panel');
}

function closeAllPanels() {
    document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
    document.getElementById('overlay').classList.remove('active');
}

// ===== 初始化 =====
window.onload = function() {
    const hasSave = localStorage.getItem('echo_apartment_save');
    if (!hasSave) {
        document.querySelector('#title-menu .menu-btn:nth-child(2)').style.opacity = '0.4';
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.getElementById('password-panel').style.display !== 'none') {
            submitPassword();
        }
        if (e.key === 'Escape') {
            closeAllPanels();
        }
    });

    // 同步音乐控件初始状态
    syncMusicUI();
    // 用户首次交互后启动标题BGM（浏览器自动播放策略）
    const startTitleMusic = () => {
        AudioManager.ensureCtx();
        AudioManager.toTitle();
        document.removeEventListener('click', startTitleMusic);
        document.removeEventListener('keydown', startTitleMusic);
    };
    document.addEventListener('click', startTitleMusic);
    document.addEventListener('keydown', startTitleMusic);

    GameState.totalScenes = Object.keys(Scenes).length;
};

// ===== 音乐控制（全局函数供HTML调用）=====
function toggleMusic(where) {
    const on = !AudioManager.isEnabled();
    AudioManager.setEnabled(on);
    syncMusicUI();
    if (on) {
        const titleShown = document.getElementById('title-screen').style.display !== 'none';
        const endingShown = document.getElementById('ending-screen').style.display !== 'none';
        if (titleShown) {
            AudioManager.toTitle();
        } else if (endingShown) {
            AudioManager.switchForScene(GameState.currentScene, true, GameState.lastEndingId);
        } else {
            AudioManager.switchForScene(GameState.currentScene, false, null);
        }
        showToast('音乐已开启');
    } else {
        showToast('音乐已关闭');
    }
}

function setMusicVolume(val, where) {
    const v = parseInt(val) / 100;
    AudioManager.setVolume(v);
    syncMusicUI(true);
}

function syncMusicUI(skipToggle) {
    const on = AudioManager.isEnabled();
    const vol = Math.round(AudioManager.getVolume() * 100);
    const titleBtn = document.getElementById('title-music-toggle');
    const gameBtn = document.getElementById('game-music-toggle');
    const titleVol = document.getElementById('title-volume');
    const gameVol = document.getElementById('game-volume');

    if (titleBtn) {
        titleBtn.textContent = on ? '🔊 音乐：开' : '🔇 音乐：关';
        titleBtn.classList.toggle('off', !on);
    }
    if (gameBtn) {
        gameBtn.textContent = on ? '🔊' : '🔇';
        gameBtn.classList.toggle('off', !on);
    }
    if (titleVol && titleVol.value != vol) titleVol.value = vol;
    if (gameVol && gameVol.value != vol) gameVol.value = vol;
}
