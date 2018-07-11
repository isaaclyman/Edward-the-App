(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{"LLl+":function(e,t,a){"use strict";a.d(t,"a",function(){return r}),a.d(t,"b",function(){return o});var r=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"workshop-wrap"},[a("div",{staticClass:"workshop"},[a("h1",[e._v("Writer's Unblock")]),e._v(" "),a("p",{staticClass:"intro"},[e._v("\n      A new idea, even a bad one, can unblock your mind and get you writing again.\n    ")]),e._v(" "),a("p",[e._v("\n      A recent sentence from your novel and two random words will appear below.\n      Write a few paragraphs to follow the sentence, and try to use each random word at least once.\n      Consider that the words may have multiple meanings.\n    ")]),e._v(" "),e.hasChapterContent?e._e():a("div",{staticClass:"warn"},[a("p",[e._v("You can't do this workshop until you've written at least one sentence in a chapter.")])]),e._v(" "),e.begun?e._e():a("button",{staticClass:"begin button-green",attrs:{disabled:!e.hasChapterContent},on:{click:function(t){e.begin()}}},[e._v("Begin")]),e._v(" "),e.begun&&!e.finished?a("div",[a("div",{staticClass:"prompt"},[a("div",{staticClass:"sentence"},[e._m(0),e._v(" "),a("p",[e._v("\n            "+e._s(e.sentence)+"\n          ")])]),e._v(" "),a("div",{staticClass:"words"},[e._m(1),e._v(" "),e._l(e.words,function(t){return a("p",{key:t,staticClass:"word"},[e._v("\n            "+e._s(t)+"\n            "),a("a",{staticClass:"define-link",attrs:{href:e.getDefineLink(t),target:"_blank"}},[e._v("define")])])})],2)]),e._v(" "),a("div",{staticClass:"write"},[a("quill-editor",{ref:"quillEditor",attrs:{content:e.content},on:{"update:content":function(t){e.updateContent(t)}}})],1),e._v(" "),a("div",{staticClass:"actions"},[a("button",{staticClass:"done button-green",on:{click:function(t){e.finish()}}},[e._v("Done")])])]):e.finished?a("div",[a("p",{staticClass:"finished"},[this.fullText.trim()?[a("strong",[e._v("Saved!")]),e._v(" You can view this exercise in the Workshops column of the Write page.\n        ")]:[a("strong",[e._v("Deleted!")]),e._v(" This exercise was empty.\n        ")]],2),e._v(" "),a("button",{staticClass:"button-green",on:{click:function(t){e.reset()}}},[e._v("Start over")])]):e._e()])])},o=[function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("strong",[this._v("Sentence:")])])},function(){var e=this.$createElement,t=this._self._c||e;return t("p",[t("strong",[this._v("Words:")])])}]},PSXQ:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=a("6TUa"),o=h(a("fyQS")),n=a("fU7r"),i=h(a("vsPS")),s=h(a("HANv")),c=h(a("Qz65")),l=h(a("bFnm"));function h(e){return e&&e.__esModule?e:{default:e}}var d=new o.default("WRITERS_UNBLOCK_CURRENT_EXERCISE"),u=new o.default("WRITERS_UNBLOCK_PROMPTS");t.default={components:{QuillEditor:s.default},computed:{allChapters:function(){return this.$store.state.chapters.chapters},allWorkshops:function(){return this.$store.state.workshop.workshops},content:function(){return this.workshop?this.workshop.content:null},hasChapterContent:function(){return!!this.getChapterSentences().join("").trim().length},fullText:function(){return(0,n.GetContentString)(this.content)}},data:function(){return{begun:!1,finished:!1,sentence:"",words:[],workshop:null}},methods:{begin:function(e,t){this.begun=!0,e?(this.workshop=e,t&&(this.sentence=t.sentence,this.words=t.words)):this.newWorkshop()},checkForDeletion:function(){this.fullText.trim()||(d.cacheDelete(),u.cacheDelete(),this.workshop&&this.allWorkshops.includes(this.workshop)&&this.$store.commit(r.DELETE_WORKSHOP,{workshop:this.workshop}))},finish:function(){d.cacheDelete(),u.cacheDelete(),this.finished=!0,this.checkForDeletion()},getChapterSentences:function(){return this.allChapters.slice(-10).map(function(e){return(0,n.GetContentString)(e.content)}).join(". ").replace(/\.[ *.]+/g,".").split(".").filter(function(e){return!!e.trim()})},getCurrentPrompts:function(){var e=u.cacheGet();return e||null},getCurrentWorkshop:function(){var e=d.cacheGet();return e&&this.allWorkshops.find(function(t){return t.guid===e})||null},getDefineLink:function(e){return"https://www.google.com/#q=define+"+e.trim().replace(/\s+/g,"+")},getRandomSentence:function(){var e=this.getChapterSentences(),t=this.randomInt(e.length-2),a=e[t].trim(),r=(e[t-1]||"").trim(),o=(e[t+1]||"").trim();return a.length<30&&r&&(a=r+". "+a),a.length<30&&o&&(a=a+". "+o),a+="."},getRandomWords:function(){var e=Math.floor((c.default.length-1)/2),t=this.randomInt(e),a=c.default[t],r=this.randomInt(e)+e;return[a,c.default[r]]},newWorkshop:function(){u.cacheDelete(),this.sentence=this.getRandomSentence(),this.words=this.getRandomWords(),u.cacheSet({sentence:this.sentence,words:this.words}),d.cacheDelete(),this.workshop={archived:!1,guid:(0,i.default)(),title:"Writer's Unblock "+(new Date).toLocaleDateString(),order:0,workshopName:l.default.WRITERS_UNBLOCK.name,content:null,date:(new Date).toLocaleDateString("en-US")},this.$store.commit(r.ADD_WORKSHOP,{workshop:this.workshop}),d.cacheSet(this.workshop.guid)},randomInt:function(e){return Math.floor(Math.random()*Math.floor(e+1))},reset:function(){this.begun=!1,this.finished=!1,this.workshop=null},updateContent:function(e){var t=e.content;this.$store.commit(r.UPDATE_WORKSHOPS_CONTENT,{workshopUpdates:[{workshop:this.workshop,newContent:t}]})}},created:function(){var e=this.getCurrentWorkshop();if(e){var t=this.getCurrentPrompts();this.begin(e,t)}},beforeDestroy:function(){this.checkForDeletion()}}},QOKX:function(e,t){},Qz65:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=["abandon","abduct","abnormal","accident","ache","addict","adopt","affair","afford","afraid","afterlife","aftermath","afternoon","aftertaste","aged","agenda","agent","aggression","agility","agitator","agony","aim","airtight","alarm","alibi","alien","alley","alliance","alligator","almighty","amateur","amber","ambient","ambiguous","ambition","ambush","amnesia","amputate","amuse","anatomy","ancestor","angel","angry","anguish","animal","ankle","annihilate","anonymous","answer","anticlimactic","antique","anxiety","ape","apology","apparatus","appeal","appear","appetite","applause","apple","applied","aquarium","aquatic","arbitrary","arcane","arch","archer","archive","area","ark","arm","armor","army","aroma","arrival","arrogant","arrow","arson","art","artificial","ash","assassin","assault","associate","atmosphere","atrocity","attack","attempt","attic","attitude","auction","audacity","authentic","authority","autopsy","average","aversion","avocado","avoid","award","awful","awkward","axe","babble","baboon","baby","bachelor","backbone","bacteria","badge","badger","bag","bait","bake","balance","bald","ball","ballet","balloon","bamboo","banana","bang","bank","banquet","barbaric","bare","bark","barren","barricade","barter","bash","basin","basket","bat","battle","beach","beacon","bead","beak","beam","bean","bear","beard","beast","beat","beauty","bed","beehive","beggar","beginner","behead","bell","belt","bench","berserk","bet","betray","bird","birthmark","birthplace","bite","bitter","black","blackmail","blade","blame","blast","blaze","bleak","bleed","bless","blind","blink","bliss","blister","blizzard","bloat","blood","blossom","blow","bludgeon","blue","bluff","blunt","blur","blurt","blush","boar","boast","body","bone","bonus","boom","border","born","bottle","bottomless","bounce","boundary","brain","branch","brand","brave","breathless","bribery","bridge","bright","broken","brother","brush","brutal","bubble","bucket","bug","bull","bunny","burden","buried","burn","burst","business","cage","calculation","call","camel","candle","candy","cannibal","canvas","canyon","captain","captive","capture","caravan","carcass","cardinal","care","careless","caress","cargo","carnal","carnivorous","carriage","carrot","case","casket","cast","castle","cat","catch","caterpillar","cave","cavity","celebration","celebrity","cell","century","ceramic","ceremony","chain","chair","chalk","challenge","chamber","chameleon","champion","channel","chant","chaos","charade","charisma","charm","chart","chef","chemical","chief","childish","chill","chisel","choke","chop","chunk","church","cinder","cinnamon","circus","city","civilization","clairvoyant","clam","claw","clay","clean","clear","clever","cloth","cloud","club","cluster","coal","coast","coat","cocoon","coercion","coil","coincidence","cold","collar","collection","collide","colony","color","column","coma","combat","command","compact","companion","compassionate","complete","complicated","composite","compound","compulsive","concept","concert","concrete","concussion","condemned","condition","confident","confidential","conflict","confrontational","confuse","connection","conqueror","conquest","conscious","conservative","console","conspiracy","consumption","contagious","contaminant","contempt","content","contest","contradiction","contrast","control","controversial","conversion","convict","convulsion","copper","cords","corpse","corrosive","cosmic","costume","cottage","cotton","cough","council","country","courage","coward","crab","crack","cradle","crafty","crash","crater","crawl","creator","creature","creep","crew","cricket","criminal","crimson","crisis","crisp","critical","crooked","crop","crossfire","crowd","crown","crude","cruel","crunch","crush","crust","crutch","cry","cryptic","crystal","cube","cuddle","cultish","curfew","curious","curse","curve","cut","cynical","daisy","damage","dancer","dangerous","dark","dart","daughter","daydream","daylight","days","dead","deadbeat","debate","debt","decade","decadent","decay","deceit","decent","decode","deduction","defect","deformity","degenerate","delay","delicacy","delicate","delicious","delight","democratic","demolition","demon","dense","dent","depression","desire","desolate","despair","desperate","destiny","destroy","determined","devices","devour","devout","diary","dictator","dig","dilemma","dimension","dinner","diplomatic","direct","direction","dirty","disaster","disbeliever","discharge","discipline","discontent","discord","discovery","discussion","disease","disfigured","dishonest","dismissal","disobey","disorientation","dispatch","disputed","disrupt","dissolve","distant","distort","disturb","ditch","diversion","divine","divorce","dizzy","dog","doll","dome","dominant","domino","donation","doomsday","door","dope","dormant","dove","downfall","dozens","drag","dread","dream","drench","dress","drift","drill","drink","drip","drown","drowsy","drug","drum","drunk","dry","duck","duel","dumb","dump","dusk","dust","eagle","ear","easier","easy","eat","echo","edge","eel","eerie","egg","ego","egocentric","elaborate","elastic","elbow","electric","elegant","elephant","elevation","eliminate","elite","embrace","emerge","emergency","emotion","emperor","empire","empty","endless","enemy","energy","enforcer","enjoy","enlarge","enlighten","enormous","enrage","entertain","entrance","envelope","ephemeral","episode","equal","error","eruption","escape","essence","estate","estimate","eternal","ethical","evacuate","event","evidence","evil","evoke","evolution","examiner","exception","excessive","exchange","exclusive","execute","exhibit","exile","exorcism","expansion","expert","explosion","export","expose","expression","extortion","extract","extravagant","extremist","eyes","fabric","fabrication","facade","face","faction","fail","faint","faith","faithless","fake","falcon","fall","famous","fanatic","fancy","fang","fashion","fat","fatal","fate","father","favor","fear","fearless","fearsome","feast","feather","feed","feel","feet","fellow","fence","ferocious","fertile","festival","fever","fiasco","fictional","field","fiend","fierce","fiery","fight","fighter","filter","filth","filthy","final","finale","find","finish","fire","firm","firstborn","fish","fist","fistfight","fix","fizz","flag","flake","flamboyant","flame","flap","flash","flatten","flavor","flaw","flawless","flesh","flicker","flight","flinch","flirt","flood","floral","fluent","fluid","flush","flutter","focus","foggy","fold","fool","foot","forbidden","force","foreign","forest","forgery","forgiven","forgotten","fork","forlorn","formal","fort","fortunate","fortune","fossil","foul","foundation","founder","fountain","fracture","fragile","frame","frantic","fraud","freak","freckled","free","freedom","frequent","fresh","fried","friend","friendless","fright","frog","front","frontier","frost","frozen","frustrated","fuel","fugitive","funeral","funnel","funny","furious","furry","fuse","future","fuzzy","gallery","gamble","game","gang","garden","gargantuan","gateway","gaunt","gem","generation","genuine","getaway","ghetto","ghost","ghoulish","giant","gibberish","gift","glacial","glamorous","gland","glass","glimmer","gloomy","glory","glossy","gloves","glow","glutton","goat","god","gold","gone","goodbye","goon","gorgeous","gossip","grab","graceful","grade","grain","grandiose","granite","graphic","grapple","grasshopper","grateful","grave","gravel","greasy","greed","grid","grill","grim","grin","grind","grit","groan","groove","gross","grotesque","grounds","growl","guard","guerilla","guest","guide","guilty","gulf","gum","gunk","gurgle","guru","gutless","gutsy","gutter","habit","habitual","hack","hairy","halfway","hallucination","hand","handler","hangover","happiness","hard","harm","harmless","harmonic","harsh","harvest","hash","hat","hatch","hate","haunt","hawk","hazard","hazy","head","headache","headstrong","heal","healer","healthy","hear","heart","heartbeat","heartbroken","heartless","heartsick","heat","heaven","heavy","hectic","heist","hell","help","helpless","herald","herb","herd","heretic","heritage","hermit","heroic","hesitation","hibernation","hidden","hide","hideous","hideout","highway","hill","hiss","historic","history","hit","hive","hoax","hobby","hoist","holes","holiday","hollow","home","homeland","homeless","homemade","homesick","homicidal","homicide","honest","honey","honeymoon","honor","honorary","hood","hoodwink","hoof","hook","hooligan","hop","hopeless","horizon","hormonal","horn","horrific","horror","horse","horseback","horseplay","hose","host","hostage","hostile","hot","hothead","hound","hour","house","hover","hug","humanlike","humble","humility","hump","hundred","hungry","hunk","hunt","hurdle","hush","hustle","hybrid","hymn","hype","hypnotic","ice","ideal","identical","identity","ignorant","illegal","imaginary","immunity","imposter","imprint","improper","indecent","infinite","initial","injury","injustice","ink","innocent","insane","insect","insecure","intimate","intoxicant","intruder","invader","invention","invisible","invitation","iron","island","ivory","jagged","jewel","juice","jump","junior","junk","justice","juvenile","key","kick","kidnap","kill","kind","kitten","knot","knuckle","lady","land","landscape","lavender","leaf","legend","legendary","legion","lemon","lethal","level","liberal","lick","life","lights","limitless","link","lion","lizard","lock","logical","loneliness","loner","loophole","lord","loser","lottery","love","loyal","lucky","lullaby","luminous","lurk","luxury","mad","magic","magnetic","major","marble","martyr","mask","massacre","massive","master","maximum","meat","medicine","melody","melt","memory","menace","messenger","metal","metallic","mighty","milky","mindless","minimal","mirror","misshapen","mission","mistaken","mixer","mob","model","modern","moist","molten","money","mongrel","monkey","moon","morbid","morsel","mortal","mother","mountain","mouth","murder","murky","muscle","muscular","mushroom","mustache","muzzle","mysterious","mystery","mystical","mythical","naive","naked","nasty","neck","nectar","needle","nerve","nervous","night","nightfall","nightmare","noble","noise","nomad","norm","nude","nurse","obey","object","obsession","ocean","octopus","offender","officer","official","old","opposition","optimum","optional","orange","orchard","ordeal","orphan","overt","pain","painless","pale","pandemic","panic","paper","parade","paradise","paradox","parallel","parasite","parcel","passion","paste","patient","patrol","pattern","pearl","perception","perfect","perfume","perilous","periodic","personal","perverted","pesky","pessimist","pest","phantom","phase","phenomena","philosophy","phonetic","pick","picnic","pieces","pig","pinch","pink","pipe","pitch","pity","planet","plant","play","pleasant","plush","pocket","poet","poetic","poison","poisonous","polite","pony","poor","popular","port","portrait","positive","possess","possession","potential","pound","powder","power","powerful","powerless","practical","prank","pray","predator","predict","prediction","preserve","pressure","pretend","prime","primitive","private","privilege","probe","production","profile","profound","project","promise","prong","proof","propaganda","proper","property","prophecy","proposal","protect","protest","proud","proven","public","pulse","punch","puppet","pure","purple","purpose","puzzle","queen","quick","rage","raid","rain","rainstorm","ransom","rare","rat","rattle","raw","rear","reason","rebel","reckless","recluse","record","refugee","regret","relearn","release","religion","reptile","research","retreat","revenge","revolt","rib","rich","riddle","rights","riot","risk","rival","roast","robber","rodent","root","rose","rotten","rough","royal","rubber","rude","rust","sabotage","sacred","sadistic","salt","sand","sauce","savage","scar","scenic","scheme","scrape","scream","search","sector","seed","selfish","serenity","series","serpent","servant","settler","setup","severe","sewage","shack","shadow","shake","shame","shameful","sharp","shine","shock","shoe","sick","signal","silence","silver","sink","skin","skull","sky","slap","sleep","slip","smart","smile","smoke","smooth","smuggle","snake","sob","social","solid","solitary","song","sorrow","soul","sound","soup","sparkle","speed","spell","spider","spike","spirit","sponge","spy","stage","star","state","station","stealth","sticky","stone","stretch","strong","stun","sudden","suffer","sugar","sun","sunrise","surprise","surreal","swarm","sweat","sweet","switch","swollen","symbol","symbolic","system","tactic","tank","taste","teeth","tense","terror","thick","thief","thin","threat","thunder","tight","timeless","timid","tin","tongue","torch","toy","tragic","trail","trap","trauma","treason","treasure","tree","tremor","trial","true","trust","truth","twin","twisted","tyrant","union","unsure","useless","vacant","vast","veil","victory","village","villain","violence","violent","virtual","vision","visitor","voice","void","volume","wake","wall","war","warm","warmth","warrior","water","wave","weak","wealthy","weapon","web","weed","weep","wet","whip","whisper","wild","winter","wisdom","wise","wish","witness","wonder","world","worm","wound","wreck","wreckage","wrong","young"]},t3o4:function(e,t,a){"use strict";a.r(t);var r=a("PSXQ"),o=a.n(r);for(var n in r)"default"!==n&&function(e){a.d(t,e,function(){return r[e]})}(n);var i=a("LLl+"),s=a("JFUb");var c=function(e){a("QOKX")},l=Object(s.a)(o.a,i.a,i.b,!1,c,null,null);t.default=l.exports}}]);
//# sourceMappingURL=4.de18c52f7302ad6167fd.js.map