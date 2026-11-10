// Story scripts. Each one is async and gets E, the toolbox main.js hands over (say, battle, warp ...).
// Every line is written as L('中文', 'English'); speaker names are translated in ui.js.
import { ITEMS, SHOPS, TROOPS } from './data.js';
import { S } from './party.js';
import { L } from './i18n.js';

export const SCRIPTS = {
  // ---------- generic objects ----------
  async chest(E, e) {
    if (e.open) { await E.say(null, L('寶箱是空的。', 'The chest is empty.')); return; }
    e.open = true; S.flags['chest:' + e.id] = true;
    E.sfx('chest');
    if (e.gold) { S.gold += e.gold; await E.say(null, L(`得到了 ${e.gold} 金幣！`, `Found ${e.gold} gold!`)); return; }
    E.give(e.item, e.n || 1, true);
    await E.say(null, L(`得到了${ITEMS[e.item].name}${e.n > 1 ? '×' + e.n : ''}！`, `Found ${e.n > 1 ? e.n + ' × ' : ''}${ITEMS[e.item].name}!`));
  },
  async save(E) {
    E.heal(); E.sfx('heal');
    const r = await E.ask(null, L('水晶的光芒溫暖了大家，體力和魔力都恢復了。\n要記錄目前的冒險嗎？', "The crystal's light warms everyone. HP and MP are restored.\nSave your adventure?"), [L('記錄', 'Save'), L('不用', 'No')]);
    if (r === 0) { E.save(); E.sfx('save'); await E.say(null, L('記錄完成。', 'Saved.')); }
  },
  async spring(E) { E.heal(); E.sfx('heal'); await E.say(null, L('清涼的泉水讓大家恢復了精神。', 'The cool spring water refreshes everyone.')); },
  async resetStone(E) {
    const r = await E.ask(null, L('一塊微微發光的石頭。\n要讓這裡的石塊回到原位嗎？', 'A faintly glowing stone.\nPut the blocks in this room back?'), [L('恢復原位', 'Reset'), L('不用', 'No')]);
    if (r === 0) await E.resetPuzzle();
  },

  // ---------- Ren's house ----------
  async opening(E) {
    await E.wait(40);
    const mom = E.ent('mom');
    await E.walk(mom, 'l');
    await E.talk('母親',
      L('蓮！你總算醒了。', "Ren! You're finally awake."),
      L('港口的鐘從天還沒亮就一直響……聽說又有船在灰塔附近失蹤了。', 'The harbour bell has been ringing since before dawn... They say another ship went missing near the grey tower.'),
      L('村長剛剛派人來，說有要緊的事找你。村長家在鎮的東北邊，藍色屋頂的那間。', "The mayor sent word. He needs to see you, and it's urgent. His house is in the north-east of town, the one with the blue roof."));
    await E.say('蓮', L('知道了，媽。我這就去。', "Got it, Mum. I'm on my way."));
    await E.walk(mom, 'r');
    S.flags.start = true;
  },
  async mom(E) {
    if (!S.flags.mayorTalked) { await E.say('母親', L('村長在找你呢，快去吧。藍色屋頂的那間喔。', "The mayor's waiting for you. Hurry now, the house with the blue roof.")); return; }
    if (!S.flags.key) await E.say('母親', L('北岬洞窟……你父親以前就是在那裡守護潮之鑰的。蓮，一定要小心。', 'The Northern Cape Grotto... Your father used to guard the Tide Key there. Please be careful, Ren.'));
    else if (!S.flags.tide) await E.say('母親', L('你真的把潮之鑰拿回來了……你父親一定也會為你驕傲的。', 'You really brought back the Tide Key... Your father would be so proud of you.'));
    else await E.say('母親', L('東邊的海上出現了一條沙路……蓮，答應我，一定要平安回來。', 'A road of sand has appeared in the eastern sea... Ren, promise me you will come home safe.'));
    const r = await E.ask('母親', L('要不要在家休息一下？', 'Would you like to rest for a while?'), [L('休息', 'Rest'), L('不用了', 'No thanks')]);
    if (r === 0) await E.rest(L('好好睡吧。……早安，蓮。', 'Sleep well. ...Good morning, Ren.'));
  },

  // ---------- the town ----------
  async guard(E) {
    if (!S.flags.mayorTalked) await E.say('守衛', L('抱歉，蓮。村長下令，在弄清楚狀況之前，誰都不能出鎮。', "Sorry, Ren. Mayor's orders: nobody leaves town until we know what's going on."));
    else if (!S.flags.key) await E.say('守衛', L('村長都交代過了。北岬洞窟就在大路的盡頭，出鎮後一直往北走。路上小心！', 'The mayor told me everything. The Northern Cape Grotto is at the end of the road. Just keep heading north. Take care!'));
    else await E.say('守衛', L('你們辛苦了。鎮上就交給我吧！', 'Good work out there. Leave the town to me!'));
  },
  async guardBlock(E) {
    if (S.flags.mayorTalked) return;
    const g = E.ent('guard'); g.dir = 'l';
    await E.say('守衛', L('等一下，蓮！村長下令誰都不能出鎮。你先去村長家一趟吧。', "Hold it, Ren! Mayor's orders, nobody leaves town. Go and see him first."));
    await E.walkPlayer('d');
  },
  async miraTown(E, e) {
    if (!S.flags.mayorTalked) {
      await E.talk('米菈', L('嗨，蓮！你也聽到鐘聲了吧？', 'Hi, Ren! You heard the bell too, right?'),
        L('我一直在觀察那座塔散發出來的魔力……它好像在呼吸一樣，一漲一退的。好奇怪喔。', "I've been watching the magic coming off that tower... It rises and falls, like it's breathing. So weird."));
      return;
    }
    await E.talk('米菈', L('我都聽說了！你要去北岬洞窟拿潮之鑰對吧？', "I heard everything! You're going to the Northern Cape Grotto for the Tide Key, right?"),
      L('帶我一起去！我可是魔法學院的……呃，見習生。不過火焰魔法我用得很好喔！', "Take me with you! I'm a student at the magic academy... well, an apprentice. But I'm really good with fire!"));
    await E.say('蓮', L('那裡有魔物，很危險的。', "There are monsters in there. It's dangerous."));
    await E.say('米菈', L('就是危險才要兩個人去啊。而且洞窟裡那麼暗，你總需要一個會點火的人吧？', "That's exactly why you need two. Besides, caves are dark. You'll want someone who can light a fire, won't you?"));
    E.join('mira', e);
    await E.say(null, L('米菈成為了夥伴！', 'Mira joined the party!'));
  },
  async girl(E) {
    if (!S.flags.tide) await E.say('小女孩', L('聽說灰塔裡住著會唱歌的女妖，聽到她的歌就會睡著喔。好可怕……', 'They say a singing witch lives in the grey tower. If you hear her song, you fall asleep. So scary...'));
    else await E.say('小女孩', L('蓮哥哥要去塔裡了嗎？被女妖的歌聲催眠的話，被打一下就會醒來喔！我奶奶說的。', "Are you going to the tower, Ren? If the witch's song puts you to sleep, getting hit wakes you up! My grandma said so."));
  },
  async boy(E) { await E.say('男孩', L('蓮哥哥！洞窟裡那些大石塊，從後面推就會動喔！推錯了也不用怕，旁邊發光的石頭可以讓石塊回到原位！', "Ren! Those big stone blocks in the grotto move if you push them from behind! If one gets stuck, the glowing stone nearby puts them all back!")); },
  async fisher(E) {
    if (!S.flags.key) await E.say('老漁夫', L('那片霧……我在海上打了五十年魚，從來沒見過那樣的霧。霧裡有歌聲，聽了就想往海裡跳。', "That fog... Fifty years I've fished this sea and never seen fog like it. There's singing in it. Makes you want to jump overboard."));
    else if (!S.flags.tide) await E.say('老漁夫', L('潮之鑰？要在東邊的海岬用？那裡有一座古老的祠堂，聽說是英雄們留下的。', "The Tide Key? For the eastern cape? There's an old shrine out there. They say the heroes built it."));
    else await E.say('老漁夫', L('海上出現了一條沙路……年輕人，願海神保佑你們。', 'A road of sand across the sea... May the sea god watch over you, young ones.'));
  },
  async sailor(E) { await E.say('水手', L('船長說今天的海不對勁，我們就沒出港，算是撿回一條命啊。', 'The captain said the sea felt wrong today, so we stayed in port. Probably saved our lives.')); },
  async lady(E) { await E.say('鎮上的婦人', L('最近晚上總聽見海上傳來歌聲……你說，是不是那座塔在叫人過去呢？', 'I keep hearing singing from the sea at night... Do you think the tower is calling people to it?')); },
  async oldman(E) { await E.talk('老爺爺', L('百年前的四英雄啊……他們的名字早就被人忘記了。', 'The four heroes of a hundred years ago... Everyone has long forgotten their names.'), L('不過我爺爺說過，其中一位英雄，就是從這個港口出海的。', 'But my grandfather said one of them set sail from this very harbour.')); },
  async signHarbor(E) { await E.say(null, L('「潮鳴港」\n東方海上的灰塔附近危險，嚴禁船隻靠近。', '"TIDEBELL HARBOUR"\nDanger near the grey tower in the eastern sea. Ships must keep away.')); },
  async lockedHut(E) { await E.say(null, L('門鎖著。', 'The door is locked.')); },
  async lockedHut2(E) { await E.say(null, L('門鎖著。裡面傳來響亮的打呼聲。', 'The door is locked. Loud snoring comes from inside.')); },
  async mayorWife(E) { await E.say('村長夫人', L('我先生從早上就一直在翻那本舊書，連早飯都忘了吃。', 'My husband has been buried in that old book since morning. He even forgot his breakfast.')); },
  async traveler(E) { await E.say('旅人', L('我是從大陸來的。聽說塔出現以後，這附近的魔物變得很兇……你們出門要小心。', 'I came over from the mainland. They say the monsters here turned vicious once the tower appeared... Be careful out there.')); },
  async inn(E) {
    const price = 8 * S.members.length;
    const r = await E.ask('老闆', L(`歡迎來到海鷗亭！住一晚 ${price} 金幣，要休息嗎？`, `Welcome to the Gull's Rest! A night is ${price} gold. Will you stay?`), [L('住宿', 'Stay'), L('不用', 'No')]);
    if (r !== 0) { await E.say('老闆', L('歡迎再來！', 'Come again!')); return; }
    if (S.gold < price) { await E.say('老闆', L('錢好像不太夠呢……', "Looks like you're a little short...")); return; }
    S.gold -= price;
    await E.rest(L('早安！祝你們旅途順利。', 'Good morning! Safe travels.'), '老闆');
  },
  async itemShop(E) { await E.shop(SHOPS.items, L('歡迎光臨！藥草和魔力水都有喔。', 'Welcome! Herbs, magic water, we have it all.')); },
  async armShop(E) { await E.shop(S.flags.key ? SHOPS.arms : SHOPS.armsEarly, S.flags.key ? L('新的一批鋼材到貨了！要看看嗎？', 'A fresh load of steel just came in! Take a look?') : L('武器和防具都在這裡，慢慢挑。', 'Weapons and armour, all right here. Take your time.')); },
  async nun(E) {
    for (;;) {
      const r = await E.ask('修女', L('願海神保佑你。有什麼需要嗎？', 'May the sea god bless you. How can I help?'), [L('記錄冒險', 'Save'), L('復活同伴', 'Revive'), L('沒事', 'Nothing')]);
      if (r === 0) { E.save(); E.sfx('save'); await E.say('修女', L('你的冒險已經記錄下來了。', 'Your adventure has been recorded.')); }
      else if (r === 1) {
        const dead = S.members.filter((m) => m.hp <= 0);
        if (!dead.length) { await E.say('修女', L('大家都很平安呢。', 'Everyone is well.')); continue; }
        for (const m of dead) m.hp = 1;
        E.sfx('heal'); await E.say('修女', L('願海神的光照耀他們……他們醒過來了。', "May the sea god's light shine on them... They have woken."));
      } else { await E.say('修女', L('路上小心。', 'Go safely.')); return; }
    }
  },
  async lysChapel(E, e) {
    await E.talk('巫女', L('……你身上帶著潮之鑰，對嗎？我感覺得到它的力量。', "...You carry the Tide Key, don't you? I can feel its power."),
      L('我是莉絲，東方海神殿最後的巫女。神殿在塔出現的那天晚上被大浪吞沒，只有我逃了出來。', 'I am Lys, the last priestess of the eastern sea temple. A great wave swallowed the temple the night the tower rose. Only I escaped.'));
    await E.say('莉絲', L('潮之鑰的力量，必須在東方海岬的祠堂，由巫女祈禱才能發動。鑰匙會讓潮水退去，露出一條通往塔的路。', "The key's power wakes only at the shrine on the eastern cape, through a priestess's prayer. It will draw back the tide and open a path to the tower."));
    await E.say('米菈', L('那妳要跟我們一起去囉？', "So you're coming with us?"));
    await E.say('莉絲', L('是的。這是巫女的使命……也是我自己的心願。神殿的大家，說不定還被困在那座塔裡。', "Yes. It is a priestess's duty... and my own wish. The others from the temple may still be trapped in that tower."));
    E.join('lys', e);
    await E.say(null, L('莉絲成為了夥伴！', 'Lys joined the party!'));
  },
  async mayor(E) {
    if (!S.flags.mayorTalked) {
      await E.talk('村長', L('蓮，你來了。坐吧……不，已經沒有時間坐了。', "Ren, you came. Sit down... No, there's no time for sitting."),
        L('一個月前，東方的海上冒出了一座灰色的高塔。從那以後，靠近它的船一艘接一艘地消失在霧裡。', 'A month ago, a tall grey tower rose out of the eastern sea. Since then, ship after ship has vanished into the fog around it.'),
        L('今天早上，又有三艘漁船沒有回來。', 'This morning, three more fishing boats failed to return.'));
      await E.talk('村長', L('鎮上的古書記載，百年前也出現過一座同樣的塔。深淵之王歐爾德從塔中率領魔物侵襲大地。', "The town's old records tell of the same tower a hundred years ago. From it, Ordath the Abyss King led his monsters against the land."),
        L('當時是四位英雄，用「潮之鑰」把塔封回了海底。', 'Four heroes sealed the tower back under the sea with the Tide Key.'),
        L('潮之鑰收藏在北岬洞窟的深處。你父親生前，正是守護那座洞窟的人。', 'The Tide Key is kept deep in the Northern Cape Grotto. Your father was its guardian, while he lived.'));
      await E.say('蓮', L('所以，您要我去把潮之鑰拿回來？', 'So you want me to bring back the Tide Key?'));
      await E.say('村長', L('只有你熟悉那座洞窟的路。……我知道這很危險，但除了你，我想不到別人了。', "You're the only one who knows the way through that grotto. ...I know it's dangerous, but I can think of no one else."));
      const r = await E.ask('村長', L('你願意去嗎？', 'Will you go?'), [L('我去', "I'll go"), L('讓我想想', 'Let me think')]);
      if (r !== 0) { await E.say('村長', L('……我明白。準備好了再來找我吧。', "...I understand. Come back when you're ready.")); return; }
      await E.say('村長', L('謝謝你，蓮。這是我的一點心意。', 'Thank you, Ren. Please take this.'));
      S.gold += 100; E.give('herb', 3);
      E.sfx('chest'); await E.say(null, L('得到了 100 金幣和藥草×3！', 'Received 100 gold and 3 Herbs!'));
      await E.say('村長', L('對了，最近洞窟裡也出現了魔物。鎮上的鐵匠葛羅前幾天說要去採礦，到現在都還沒回來……如果遇到他，幫我看看他是否平安。', "Oh, and monsters have appeared in the grotto lately. Garo, our smith, went there to mine days ago and hasn't come back... If you find him, make sure he's all right."));
      S.flags.mayorTalked = true;
      return;
    }
    if (!S.flags.key) await E.say('村長', L('潮之鑰就在北岬洞窟的深處。出鎮後往北走就到了。', 'The Tide Key lies deep in the Northern Cape Grotto. Head north out of town.'));
    else if (!S.flags.lys) await E.talk('村長', L('你拿回潮之鑰了！而且葛羅也平安無事，太好了。', 'You brought back the Tide Key! And Garo is safe too. Wonderful.'),
      L('古書上說，鑰匙需要海神巫女的祈禱才能發動……聽說禮拜堂今天來了一位巫女，去問問看吧。', 'The old book says the key needs the prayer of a sea priestess... I hear a priestess came to the chapel today. Go and ask her.'));
    else if (!S.flags.tide) await E.say('村長', L('鑰匙的力量要在東方海岬的祠堂才能發動。沿著大路往東走吧。', "The key's power wakes at the shrine on the eastern cape. Follow the road east."));
    else await E.say('村長', L('塔……就在那裡了。蓮，大家都在等你們回來。', "The tower... it's right there now. Ren, we'll all be waiting for you to come home."));
  },

  // ---------- the grotto ----------
  async garoCell(E, e) {
    await E.talk('鐵匠', L('喔喔！總算有人來了！', 'Oho! Somebody, at last!'),
      L('我是葛羅，潮鳴港的鐵匠。三天前來這裡挖礦，結果那群螃蟹把洞口的機關弄亂了，我就被關在這裡出不去。', "I'm Garo, the smith from Tidebell. Came to mine three days ago, and those crabs jammed the gate works. I've been stuck in here ever since."));
    await E.say('蓮', L('村長很擔心你。我們要去洞窟深處拿潮之鑰。', "The mayor's worried about you. We're heading deeper in for the Tide Key."));
    await E.say('葛羅', L('潮之鑰？深處那隻大螃蟹王就守在那裡！就是牠把我趕進這個死胡同的。', "The Tide Key? The big Crab King guards it down there! That's the brute that chased me into this dead end."));
    await E.say('葛羅', L('好！算我一份。我這把斧頭，可是劈過比牠的殼還硬的石頭！', 'Right! Count me in. This axe has split rock harder than that shell!'));
    E.join('garo', e);
    E.openGates('garo');
    await E.say(null, L('葛羅成為了夥伴！\n遠處傳來機關轉動的聲音。', 'Garo joined the party!\nSomewhere, machinery grinds into motion.'));
  },
  async clawmaw(E) {
    if (S.flags.boss1) return;
    E.music(null);
    await E.wait(20);
    await E.say('？？？', L('嘎……嘎嘎……人類……潮之鑰……主人說……不准給任何人……', 'Krrr... krr-krr... Humans... Tide Key... Master said... give it... to no one...'));
    await E.say('米菈', L('這隻螃蟹會說話！？', 'That crab can TALK!?'));
    if (S.members.find((m) => m.id === 'garo')) await E.say('葛羅', L('就是牠！上次的仇，今天一起算！', "That's him! Time to settle the score!"));
    const r = await E.battle(TROOPS.boss1, { boss: true, bg: 'cave' });
    if (r !== 'win') return;
    S.flags.boss1 = true;
    E.removeEnt('clawmaw');
    await E.wait(30);
    E.music(null);
    E.flash('#c0f0ff', 20); E.sfx('warp');
    const her = E.spawn({ type: 'npc', id: 'herald', sprite: 'herald', x: 10, y: 3, dir: 'd' });
    await E.wait(30);
    await E.say('？？？', L('呵呵呵……真是精彩的表演。', 'Hohoho... What a splendid performance.'));
    await E.say('？？？', L('潮之鑰就交給你們保管吧。反正塔的大門……也需要有人來替我們打開呢。', 'Keep the Tide Key, by all means. After all, someone has to open the tower gate... for us.'));
    E.flash('#c0f0ff', 20); E.sfx('warp');
    E.removeEnt(her);
    await E.wait(20);
    await E.say('米菈', L('剛剛那個人是……？', 'Who was that...?'));
    await E.say('蓮', L('……不管她是誰，先把鑰匙拿到手再說。', "...Whoever she is, let's get the key first."));
    E.give('tidekey', 1);
    E.sfx('chest');
    S.flags.key = true;
    await E.say(null, L('螃蟹王守護的石台上，靜靜地放著一把藍色的鑰匙。\n得到了潮之鑰！', 'On the altar the Crab King guarded lies a blue key.\nGot the Tide Key!'));
    E.music('cave');
  },

  // ---------- the cape ----------
  async capeShrine(E) {
    if (!S.flags.key) await E.say(null, L('古老的石造祠堂。石碑上刻著：\n「潮之鑰歸位之時，海路自開。」', 'An ancient stone shrine. The tablet reads:\n"When the Tide Key returns, the sea road opens."'));
    else if (!S.flags.lys) await E.say(null, L('石碑上有一個鑰匙形狀的凹槽。把潮之鑰放上去……什麼也沒有發生。\n或許還需要某種祈禱。', 'The tablet has a key-shaped hollow. You set the Tide Key in it... Nothing happens.\nPerhaps it needs a prayer.'));
    else if (!S.flags.tide) await SCRIPTS.cape(E);
    else await E.say(null, L('祠堂裡的潮之鑰發出柔和的藍光。', 'The Tide Key glows a soft blue in the shrine.'));
  },
  async cape(E) {
    if (!S.flags.key || !S.flags.lys || S.flags.tide) return;
    await E.say('莉絲', L('就是這裡。請把潮之鑰交給我。', 'This is the place. Please give me the Tide Key.'));
    E.music(null);
    await E.say('莉絲', L('海神啊，請聽我的祈禱。以百年前的誓約之名——讓潮水退去，為我們指引道路！', 'O god of the sea, hear my prayer. By the oath of a hundred years ago, draw back the tide and show us the way!'));
    E.sfx('holy'); E.flash('#ffffff', 30);
    await E.wait(30);
    E.sfx('quake'); E.shake(60);
    await E.wait(70);
    S.flags.tide = true;
    await E.reloadWorld();
    E.sfx('warp');
    await E.say(null, L('潮水退去了，海面上出現了一條通往塔的沙路！', 'The tide draws back, and a road of sand leads across the sea to the tower!'));
    await E.say('米菈', L('好、好厲害……', 'W-wow...'));
    if (S.members.find((m) => m.id === 'garo')) await E.say('葛羅', L('走吧！去把那座塔敲個粉碎！', "Let's go! Time to knock that tower to pieces!"));
    E.music('field');
  },

  // ---------- the tower ----------
  async seren(E) {
    if (S.flags.seren) return;
    E.music(null);
    await E.wait(20);
    await E.say('塞壬', L('歡迎來到蒼潮魔塔，鑰匙的持有者們。', 'Welcome to the Spire of the Blue Tide, bearers of the key.'));
    await E.say('塞壬', L('我是霧之使者塞壬，深淵王歐爾德大人最忠實的僕人。', 'I am Seren of the Mist, most loyal servant of Lord Ordath, the Abyss King.'));
    await E.say('塞壬', L('那些消失的船員？他們的靈魂，都成了喚醒大人的養分。神殿的巫女們也是一樣……', 'The missing sailors? Their souls were food to wake my lord. So were the priestesses of the temple...'));
    if (S.members.find((m) => m.id === 'lys')) await E.say('莉絲', L('妳……！把大家還來！', 'You...! Give them back!'));
    await E.say('塞壬', L('別急，很快你們也會加入他們。在我的歌聲中，永遠沉睡吧！', 'Patience. You will join them soon. Sleep forever in my song!'));
    const r = await E.battle(TROOPS.boss2, { boss: true, bg: 'tower' });
    if (r !== 'win') return;
    S.flags.seren = true;
    await E.wait(20);
    await E.say('塞壬', L('不……不可能……可是……大人……已經……甦醒了……', 'No... impossible... but... my lord... is already... awake...'));
    E.removeEnt('seren'); E.flash('#c0f0ff', 20); E.sfx('warp');
    E.openGates('seren');
    await E.wait(20);
    await E.say('米菈', L('她說歐爾德已經醒了……', 'She said Ordath is already awake...'));
    await E.say('蓮', L('那就趁他還沒完全恢復力量之前，打倒他！', 'Then we beat him before he gets his full strength back!'));
    E.music('tower');
  },
  async ordath(E) {
    if (S.flags.ordath) return;
    E.music(null);
    E.sfx('quake'); E.shake(50);
    await E.wait(60);
    await E.say('？？？', L('……百年了。', '...A hundred years.'));
    await E.say('歐爾德', L('百年的黑暗，百年的冰冷。封印我的英雄們早已化為塵土，而他們的子孫，卻親手為我打開了大門。', 'A hundred years of darkness and cold. The heroes who sealed me are dust, and their children have opened the gate for me with their own hands.'));
    await E.say('蓮', L('我們不是來為你開門的。是來把你送回海底的！', "We didn't come to open any gate. We came to send you back under the sea!"));
    await E.say('歐爾德', L('渺小的人類。也好……就讓你們成為新時代的第一批祭品吧！', 'Tiny humans. Very well... You shall be the first offerings of a new age!'));
    const r = await E.battle(TROOPS.boss3, { boss: true, bg: 'roof', music: 'final' });
    if (r !== 'win') return;
    S.flags.ordath = true;
    await E.ending();
  },
};
