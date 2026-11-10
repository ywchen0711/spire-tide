// Story scripts. Each one is async and gets E, the toolbox main.js hands over (say, battle, warp ...).
import { ITEMS, SHOPS, TROOPS } from './data.js';
import { S } from './party.js';

export const SCRIPTS = {
  // ---------- generic objects ----------
  async chest(E, e) {
    if (e.open) { await E.say(null, '寶箱是空的。'); return; }
    e.open = true; S.flags['chest:' + e.id] = true;
    E.sfx('chest');
    if (e.gold) { S.gold += e.gold; await E.say(null, `得到了 ${e.gold} 金幣！`); return; }
    E.give(e.item, e.n || 1, true);
    await E.say(null, `得到了${ITEMS[e.item].name}${e.n > 1 ? '×' + e.n : ''}！`);
  },
  async save(E) {
    E.heal(); E.sfx('heal');
    const r = await E.ask(null, '水晶的光芒溫暖了大家，體力和魔力都恢復了。\n要記錄目前的冒險嗎？', ['記錄', '不用']);
    if (r === 0) { E.save(); E.sfx('save'); await E.say(null, '記錄完成。'); }
  },
  async spring(E) { E.heal(); E.sfx('heal'); await E.say(null, '清涼的泉水讓大家恢復了精神。'); },
  async resetStone(E) {
    const r = await E.ask(null, '一塊微微發光的石頭。\n要讓這裡的石塊回到原位嗎？', ['恢復原位', '不用']);
    if (r === 0) await E.resetPuzzle();
  },

  // ---------- Ren's house ----------
  async opening(E) {
    await E.wait(40);
    const mom = E.ent('mom');
    await E.walk(mom, 'l');
    await E.talk('母親', '蓮！你總算醒了。', '港口的鐘從天還沒亮就一直響……聽說又有船在灰塔附近失蹤了。', '村長剛剛派人來，說有要緊的事找你。村長家在鎮的東北邊，藍色屋頂的那間。');
    await E.say('蓮', '知道了，媽。我這就去。');
    await E.walk(mom, 'r');
    S.flags.start = true;
  },
  async mom(E) {
    if (!S.flags.mayorTalked) { await E.say('母親', '村長在找你呢，快去吧。藍色屋頂的那間喔。'); return; }
    if (!S.flags.key) await E.say('母親', '北岬洞窟……你父親以前就是在那裡守護潮之鑰的。蓮，一定要小心。');
    else if (!S.flags.tide) await E.say('母親', '你真的把潮之鑰拿回來了……你父親一定也會為你驕傲的。');
    else await E.say('母親', '東邊的海上出現了一條沙路……蓮，答應我，一定要平安回來。');
    const r = await E.ask('母親', '要不要在家休息一下？', ['休息', '不用了']);
    if (r === 0) await E.rest('好好睡吧。……早安，蓮。');
  },

  // ---------- the town ----------
  async guard(E) {
    if (!S.flags.mayorTalked) await E.say('守衛', '抱歉，蓮。村長下令，在弄清楚狀況之前，誰都不能出鎮。');
    else if (!S.flags.key) await E.say('守衛', '村長都交代過了。北岬洞窟就在大路的盡頭，出鎮後一直往北走。路上小心！');
    else await E.say('守衛', '你們辛苦了。鎮上就交給我吧！');
  },
  async guardBlock(E) {
    if (S.flags.mayorTalked) return;
    const g = E.ent('guard'); g.dir = 'l';
    await E.say('守衛', '等一下，蓮！村長下令誰都不能出鎮。你先去村長家一趟吧。');
    await E.walkPlayer('d');
  },
  async miraTown(E, e) {
    if (!S.flags.mayorTalked) { await E.talk('米菈', '嗨，蓮！你也聽到鐘聲了吧？', '我一直在觀察那座塔散發出來的魔力……它好像在呼吸一樣，一漲一退的。好奇怪喔。'); return; }
    await E.talk('米菈', '我都聽說了！你要去北岬洞窟拿潮之鑰對吧？', '帶我一起去！我可是魔法學院的……呃，見習生。不過火焰魔法我用得很好喔！');
    await E.say('蓮', '那裡有魔物，很危險的。');
    await E.say('米菈', '就是危險才要兩個人去啊。而且洞窟裡那麼暗，你總需要一個會點火的人吧？');
    E.join('mira', e);
    await E.say(null, '米菈成為了夥伴！');
  },
  async girl(E) {
    if (!S.flags.tide) await E.say('小女孩', '聽說灰塔裡住著會唱歌的女妖，聽到她的歌就會睡著喔。好可怕……');
    else await E.say('小女孩', '蓮哥哥要去塔裡了嗎？被女妖的歌聲催眠的話，被打一下就會醒來喔！我奶奶說的。');
  },
  async boy(E) { await E.say('男孩', '蓮哥哥！洞窟裡那些大石塊，從後面推就會動喔！推錯了也不用怕，旁邊發光的石頭可以讓石塊回到原位！'); },
  async fisher(E) {
    if (!S.flags.key) await E.say('老漁夫', '那片霧……我在海上打了五十年魚，從來沒見過那樣的霧。霧裡有歌聲，聽了就想往海裡跳。');
    else if (!S.flags.tide) await E.say('老漁夫', '潮之鑰？要在東邊的海岬用？那裡有一座古老的祠堂，聽說是英雄們留下的。');
    else await E.say('老漁夫', '海上出現了一條沙路……年輕人，願海神保佑你們。');
  },
  async sailor(E) { await E.say('水手', '船長說今天的海不對勁，我們就沒出港，算是撿回一條命啊。'); },
  async lady(E) { await E.say('鎮上的婦人', '最近晚上總聽見海上傳來歌聲……你說，是不是那座塔在叫人過去呢？'); },
  async oldman(E) { await E.talk('老爺爺', '百年前的四英雄啊……他們的名字早就被人忘記了。', '不過我爺爺說過，其中一位英雄，就是從這個港口出海的。'); },
  async signHarbor(E) { await E.say(null, '「潮鳴港」\n東方海上的灰塔附近危險，嚴禁船隻靠近。'); },
  async lockedHut(E) { await E.say(null, '門鎖著。'); },
  async lockedHut2(E) { await E.say(null, '門鎖著。裡面傳來響亮的打呼聲。'); },
  async mayorWife(E) { await E.say('村長夫人', '我先生從早上就一直在翻那本舊書，連早飯都忘了吃。'); },
  async traveler(E) { await E.say('旅人', '我是從大陸來的。聽說塔出現以後，這附近的魔物變得很兇……你們出門要小心。'); },
  async inn(E) {
    const price = 8 * S.members.length;
    const r = await E.ask('老闆', `歡迎來到海鷗亭！住一晚 ${price} 金幣，要休息嗎？`, ['住宿', '不用']);
    if (r !== 0) { await E.say('老闆', '歡迎再來！'); return; }
    if (S.gold < price) { await E.say('老闆', '錢好像不太夠呢……'); return; }
    S.gold -= price;
    await E.rest('早安！祝你們旅途順利。', '老闆');
  },
  async itemShop(E) { await E.shop(SHOPS.items, '歡迎光臨！藥草和魔力水都有喔。'); },
  async armShop(E) { await E.shop(S.flags.key ? SHOPS.arms : SHOPS.armsEarly, S.flags.key ? '新的一批鋼材到貨了！要看看嗎？' : '武器和防具都在這裡，慢慢挑。'); },
  async nun(E) {
    for (;;) {
      const r = await E.ask('修女', '願海神保佑你。有什麼需要嗎？', ['記錄冒險', '復活同伴', '沒事']);
      if (r === 0) { E.save(); E.sfx('save'); await E.say('修女', '你的冒險已經記錄下來了。'); }
      else if (r === 1) {
        const dead = S.members.filter((m) => m.hp <= 0);
        if (!dead.length) { await E.say('修女', '大家都很平安呢。'); continue; }
        for (const m of dead) m.hp = 1;
        E.sfx('heal'); await E.say('修女', '願海神的光照耀他們……他們醒過來了。');
      } else { await E.say('修女', '路上小心。'); return; }
    }
  },
  async lysChapel(E, e) {
    await E.talk('巫女', '……你身上帶著潮之鑰，對嗎？我感覺得到它的力量。', '我是莉絲，東方海神殿最後的巫女。神殿在塔出現的那天晚上被大浪吞沒，只有我逃了出來。');
    await E.say('莉絲', '潮之鑰的力量，必須在東方海岬的祠堂，由巫女祈禱才能發動。鑰匙會讓潮水退去，露出一條通往塔的路。');
    await E.say('米菈', '那妳要跟我們一起去囉？');
    await E.say('莉絲', '是的。這是巫女的使命……也是我自己的心願。神殿的大家，說不定還被困在那座塔裡。');
    E.join('lys', e);
    await E.say(null, '莉絲成為了夥伴！');
  },
  async mayor(E) {
    if (!S.flags.mayorTalked) {
      await E.talk('村長', '蓮，你來了。坐吧……不，已經沒有時間坐了。', '一個月前，東方的海上冒出了一座灰色的高塔。從那以後，靠近它的船一艘接一艘地消失在霧裡。', '今天早上，又有三艘漁船沒有回來。');
      await E.talk('村長', '鎮上的古書記載，百年前也出現過一座同樣的塔。深淵之王歐爾德從塔中率領魔物侵襲大地。', '當時是四位英雄，用「潮之鑰」把塔封回了海底。', '潮之鑰收藏在北岬洞窟的深處。你父親生前，正是守護那座洞窟的人。');
      await E.say('蓮', '所以，您要我去把潮之鑰拿回來？');
      await E.say('村長', '只有你熟悉那座洞窟的路。……我知道這很危險，但除了你，我想不到別人了。');
      const r = await E.ask('村長', '你願意去嗎？', ['我去', '讓我想想']);
      if (r !== 0) { await E.say('村長', '……我明白。準備好了再來找我吧。'); return; }
      await E.say('村長', '謝謝你，蓮。這是我的一點心意。');
      S.gold += 100; E.give('herb', 3);
      E.sfx('chest'); await E.say(null, '得到了 100 金幣和藥草×3！');
      await E.say('村長', '對了，最近洞窟裡也出現了魔物。鎮上的鐵匠葛羅前幾天說要去採礦，到現在都還沒回來……如果遇到他，幫我看看他是否平安。');
      S.flags.mayorTalked = true;
      return;
    }
    if (!S.flags.key) await E.say('村長', '潮之鑰就在北岬洞窟的深處。出鎮後往北走就到了。');
    else if (!S.flags.lys) await E.talk('村長', '你拿回潮之鑰了！而且葛羅也平安無事，太好了。', '古書上說，鑰匙需要海神巫女的祈禱才能發動……聽說禮拜堂今天來了一位巫女，去問問看吧。');
    else if (!S.flags.tide) await E.say('村長', '鑰匙的力量要在東方海岬的祠堂才能發動。沿著大路往東走吧。');
    else await E.say('村長', '塔……就在那裡了。蓮，大家都在等你們回來。');
  },

  // ---------- the grotto ----------
  async garoCell(E, e) {
    await E.talk('鐵匠', '喔喔！總算有人來了！', '我是葛羅，潮鳴港的鐵匠。三天前來這裡挖礦，結果那群螃蟹把洞口的機關弄亂了，我就被關在這裡出不去。');
    await E.say('蓮', '村長很擔心你。我們要去洞窟深處拿潮之鑰。');
    await E.say('葛羅', '潮之鑰？深處那隻大螃蟹王就守在那裡！就是牠把我趕進這個死胡同的。');
    await E.say('葛羅', '好！算我一份。我這把斧頭，可是劈過比牠的殼還硬的石頭！');
    E.join('garo', e);
    E.openGates('garo');
    await E.say(null, '葛羅成為了夥伴！\n遠處傳來機關轉動的聲音。');
  },
  async clawmaw(E) {
    if (S.flags.boss1) return;
    E.music(null);
    await E.wait(20);
    await E.say('？？？', '嘎……嘎嘎……人類……潮之鑰……主人說……不准給任何人……');
    await E.say('米菈', '這隻螃蟹會說話！？');
    if (S.members.find((m) => m.id === 'garo')) await E.say('葛羅', '就是牠！上次的仇，今天一起算！');
    const r = await E.battle(TROOPS.boss1, { boss: true, bg: 'cave' });
    if (r !== 'win') return;
    S.flags.boss1 = true;
    E.removeEnt('clawmaw');
    await E.wait(30);
    E.music(null);
    E.flash('#c0f0ff', 20); E.sfx('warp');
    const her = E.spawn({ type: 'npc', id: 'herald', sprite: 'herald', x: 10, y: 3, dir: 'd' });
    await E.wait(30);
    await E.say('？？？', '呵呵呵……真是精彩的表演。');
    await E.say('？？？', '潮之鑰就交給你們保管吧。反正塔的大門……也需要有人來替我們打開呢。');
    E.flash('#c0f0ff', 20); E.sfx('warp');
    E.removeEnt(her);
    await E.wait(20);
    await E.say('米菈', '剛剛那個人是……？');
    await E.say('蓮', '……不管她是誰，先把鑰匙拿到手再說。');
    E.give('tidekey', 1);
    E.sfx('chest');
    S.flags.key = true;
    await E.say(null, '螃蟹王守護的石台上，靜靜地放著一把藍色的鑰匙。\n得到了潮之鑰！');
    E.music('cave');
  },

  // ---------- the cape ----------
  async capeShrine(E) {
    if (!S.flags.key) await E.say(null, '古老的石造祠堂。石碑上刻著：\n「潮之鑰歸位之時，海路自開。」');
    else if (!S.flags.lys) await E.say(null, '石碑上有一個鑰匙形狀的凹槽。把潮之鑰放上去……什麼也沒有發生。\n或許還需要某種祈禱。');
    else if (!S.flags.tide) await SCRIPTS.cape(E);
    else await E.say(null, '祠堂裡的潮之鑰發出柔和的藍光。');
  },
  async cape(E) {
    if (!S.flags.key || !S.flags.lys || S.flags.tide) return;
    await E.say('莉絲', '就是這裡。請把潮之鑰交給我。');
    E.music(null);
    await E.say('莉絲', '海神啊，請聽我的祈禱。以百年前的誓約之名——讓潮水退去，為我們指引道路！');
    E.sfx('holy'); E.flash('#ffffff', 30);
    await E.wait(30);
    E.sfx('quake'); E.shake(60);
    await E.wait(70);
    S.flags.tide = true;
    await E.reloadWorld();
    E.sfx('warp');
    await E.say(null, '潮水退去了，海面上出現了一條通往塔的沙路！');
    await E.say('米菈', '好、好厲害……');
    if (S.members.find((m) => m.id === 'garo')) await E.say('葛羅', '走吧！去把那座塔敲個粉碎！');
    E.music('field');
  },

  // ---------- the tower ----------
  async seren(E) {
    if (S.flags.seren) return;
    E.music(null);
    await E.wait(20);
    await E.say('塞壬', '歡迎來到蒼潮魔塔，鑰匙的持有者們。');
    await E.say('塞壬', '我是霧之使者塞壬，深淵王歐爾德大人最忠實的僕人。');
    await E.say('塞壬', '那些消失的船員？他們的靈魂，都成了喚醒大人的養分。神殿的巫女們也是一樣……');
    if (S.members.find((m) => m.id === 'lys')) await E.say('莉絲', '妳……！把大家還來！');
    await E.say('塞壬', '別急，很快你們也會加入他們。在我的歌聲中，永遠沉睡吧！');
    const r = await E.battle(TROOPS.boss2, { boss: true, bg: 'tower' });
    if (r !== 'win') return;
    S.flags.seren = true;
    await E.wait(20);
    await E.say('塞壬', '不……不可能……可是……大人……已經……甦醒了……');
    E.removeEnt('seren'); E.flash('#c0f0ff', 20); E.sfx('warp');
    E.openGates('seren');
    await E.wait(20);
    await E.say('米菈', '她說歐爾德已經醒了……');
    await E.say('蓮', '那就趁他還沒完全恢復力量之前，打倒他！');
    E.music('tower');
  },
  async ordath(E) {
    if (S.flags.ordath) return;
    E.music(null);
    E.sfx('quake'); E.shake(50);
    await E.wait(60);
    await E.say('？？？', '……百年了。');
    await E.say('歐爾德', '百年的黑暗，百年的冰冷。封印我的英雄們早已化為塵土，而他們的子孫，卻親手為我打開了大門。');
    await E.say('蓮', '我們不是來為你開門的。是來把你送回海底的！');
    await E.say('歐爾德', '渺小的人類。也好……就讓你們成為新時代的第一批祭品吧！');
    const r = await E.battle(TROOPS.boss3, { boss: true, bg: 'roof', music: 'final' });
    if (r !== 'win') return;
    S.flags.ordath = true;
    await E.ending();
  },
};
