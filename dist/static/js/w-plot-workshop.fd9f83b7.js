(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["w-plot-workshop"],{"0e6c":function(e,t,r){"use strict";r.r(t);var a=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"workshop-wrap"},[r("div",{staticClass:"workshop"},[r("h1",[e._v("Plot & Character Workshop")]),r("p",[e._v(" A prompt will appear below. Follow the prompt to help you build your plot and develop your characters. ")]),e.begun?e._e():r("button",{staticClass:"begin button-green",on:{click:function(t){return e.begin()}}},[e._v(" Begin ")]),e.begun&&!e.finished?r("div",[r("div",{staticClass:"prompt"},[e._m(0),r("p",[e._v(" "+e._s(e.prompt)+" ")])]),r("div",{staticClass:"write"},[r("quill-editor",{ref:"quillEditor",attrs:{content:e.content},on:{"update:content":function(t){return e.updateContent(t)}}})],1),r("div",{staticClass:"actions"},[r("button",{staticClass:"done button-green",on:{click:function(t){return e.finish()}}},[e._v(" Done ")])])]):e.finished?r("div",[r("p",{staticClass:"finished"},[this.fullText.trim()?[r("strong",[e._v("Saved!")]),e._v(" You can view this exercise in the Workshops column of the Write page. ")]:[r("strong",[e._v("Deleted!")]),e._v(" This exercise was empty. ")]],2),r("button",{staticClass:"button-green",on:{click:function(t){return e.reset()}}},[e._v(" Start over ")])]):e._e()])])},o=[function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("p",[r("strong",[e._v("Prompt:")])])}],n=(r("7db0"),r("caad"),r("b0c0"),r("ac1f"),r("2532"),r("5319"),r("498a"),r("e935")),s=r("7f24"),c=r("7d4e"),i=r("bec3"),h=["Intrigue is when one character keeps a dangerous or malevolent secret from another. Write a scene that creates intrigue.","Write a scene that raises the stakes by putting something a character cares about at risk.","Write a scene where the reader finds out something important that one of the characters doesn't yet know.","Suspense is when the reader wonders anxiously what will happen next. Write a scene where the outcome of a decision, a natural event, or an interaction is urgent and uncertain.","Plots often weave together moments of action and moments of reflection. Determine whether your last scene involved more action or more reflection, then write a scene that does the opposite.","A character's first attempt to solve a problem is rarely successful. Write a scene where someone tries and fails to solve a problem.","Perverseness is when a character willfully makes the wrong choice or makes things worse for themself. Write a scene where a character does something perverse.","Write a scene that sets up the reader to expect a certain outcome, but then the opposite happens.","Write a scene where something happens much sooner than expected.","Characters' relationships with each other often change over the course of a novel. Write a scene where one character misjudges another (too harshly or too generously).","Write a scene where a character acts on a false assumption.","Write a scene where two characters disagree, but neither of them is necessarily wrong.","Write a scene where a character speculates about what another character is doing.","Write a scene where a character speculates about another character's motives.","Write a scene where a character makes an incorrect prediction.","An epiphany is when a character has a sudden, sweeping realization about themself or their situation. Write a scene where someone has an epiphany.","Write a scene that is influenced by events the reader doesn't know about yet. That is, something important has happened offstage, and all the reader can see are the consequences.","Write a scene where something makes a character very uncomfortable.","Write a scene where a character loses their temper.","Write a scene where a character's hidden motives are revealed.","Write a scene where a character shows up unexpectedly.","Characters are more lifelike when they're a little unpredictable. Write a scene where a character does something that surprises another character or even themself.","Write a scene where one character gives another some bad advice.","Write a scene where two or more characters have a conversation and one of them completely misunderstands it.","Write a scene where a character's loyalties are tested.","Write a scene where one character tries to convince another to change sides in a conflict.","Write a scene where a character accidentally discovers something about another character that could change their relationship.","Write a scene where a character faces the consequences of a decision they thought was far behind them.","Write a scene where one character's trust in another is broken.","Write a scene where a character gets lost and ends up somewhere interesting.","Write a scene where something potentially helpful comes from an untrustworthy source.","Write a scene where one character eavesdrops on another's conversation.","Write a scene where one character apologizes to another.","Write a scene where a character gives up, but something happens to motivate them to keep trying.","Write a scene where a character makes a big mistake and assumes all is lost.","Write a scene where one character interrogates another.","Write a scene where a character is forced to defend a lie they told earlier.","Write a scene where one character falsely accuses another of a crime or misdeed.","Write a scene where a character's reputation has preceded them.","Write a scene where a character is forced to choose between two things they care deeply about.","Write a scene where a character is asked to trust a complete stranger.","Write a scene where a character is forced to invent a story to explain their presence somewhere.","Write a scene where two characters at odds with each other are forced to work together."],l=r("1c03"),u=r("6c59"),p=new s["b"]("PLOT_WORKSHOP_CURRENT_EXERCISE"),w=new s["b"]("PLOT_WORKSHOP_PROMPTS"),d={components:{QuillEditor:l["a"]},computed:{allWorkshops:function(){return this.$store.state.workshop.workshops},content:function(){return this.workshop?this.workshop.content:null},fullText:function(){return Object(c["a"])(this.content)}},data:function(){return{begun:!1,finished:!1,prompt:"",workshop:null}},methods:{begin:function(e,t){this.begun=!0,e?(this.workshop=e,t&&(this.prompt=t)):this.newWorkshop()},checkForDeletion:function(){this.fullText.trim()||(p.cacheDelete(),w.cacheDelete(),this.workshop&&this.allWorkshops.includes(this.workshop)&&this.$store.commit(n["c"],{workshop:this.workshop}))},finish:function(){p.cacheDelete(),w.cacheDelete(),this.finished=!0,this.checkForDeletion()},getCurrentPrompts:function(){var e=w.cacheGet();return e||null},getCurrentWorkshop:function(){var e=p.cacheGet();if(!e)return null;var t=this.allWorkshops.find((function(t){return t.guid===e}));return t||null},getDefineLink:function(e){var t=e.trim().replace(/\s+/g,"+");return"https://www.google.com/#q=define+".concat(t)},getRandomPrompt:function(){return h[this.randomInt(h.length)]},newWorkshop:function(){w.cacheDelete(),this.prompt=this.getRandomPrompt(),w.cacheSet(this.prompt),p.cacheDelete(),this.workshop={archived:!1,guid:Object(i["a"])(),title:"Plot Workshop ".concat((new Date).toLocaleDateString()),order:0,workshopName:u["a"].PLOT_WORKSHOP.name,content:null,date:(new Date).toLocaleDateString("en-US")},this.$store.commit(n["a"],{workshop:this.workshop}),p.cacheSet(this.workshop.guid)},randomInt:function(e){return Math.floor(Math.random()*Math.floor(e+1))},reset:function(){this.begun=!1,this.finished=!1,this.workshop=null},updateContent:function(e){var t=e.content;this.$store.commit(n["g"],{workshopUpdates:[{workshop:this.workshop,newContent:t}]})}},created:function(){var e=this.getCurrentWorkshop();if(e){var t=this.getCurrentPrompts();this.begin(e,t)}},beforeDestroy:function(){this.checkForDeletion()}},m=d,f=(r("78f6"),r("2877")),g=Object(f["a"])(m,a,o,!1,null,"5e75d36c",null);t["default"]=g.exports},"78f6":function(e,t,r){"use strict";var a=r("a226"),o=r.n(a);o.a},a226:function(e,t,r){}}]);
//# sourceMappingURL=w-plot-workshop.fd9f83b7.js.map