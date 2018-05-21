(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{"8yIU":function(t,i){},"C/02":function(t,i){},JEWj:function(t,i,e){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var n=e("6TUa"),s=u(e("fyQS")),o=e("fU7r"),r=u(e("vsPS")),a=u(e("HANv")),l=u(e("ZBUZ")),c=u(e("bFnm"));function u(t){return t&&t.__esModule?t:{default:t}}var m=new s.default("FREE_WRITE_CURRENT_EXERCISE");i.default={components:{QuillEditor:a.default,Timer:l.default},computed:{allWorkshops:function(){return this.$store.state.workshop.workshops},content:function(){return this.workshop?this.workshop.content:null},fullText:function(){return(0,o.GetContentString)(this.content)}},data:function(){return{begun:!1,finished:!1,workshop:null}},methods:{begin:function(t){this.begun=!0,t?this.workshop=t:this.newWorkshop()},checkForDeletion:function(){this.fullText.trim()||(m.cacheDelete(),this.workshop&&this.allWorkshops.includes(this.workshop)&&this.$store.commit(n.DELETE_WORKSHOP,{workshop:this.workshop}))},finish:function(){this.$refs.quillEditor.disable(),m.cacheDelete(),this.finished=!0,this.checkForDeletion()},getCurrentWorkshop:function(){var t=m.cacheGet();return t&&this.allWorkshops.find(function(i){return i.guid===t})||null},newWorkshop:function(){m.cacheDelete(),this.workshop={archived:!1,guid:(0,r.default)(),title:"Free Write "+(new Date).toLocaleDateString(),order:0,workshopName:c.default.FREE_WRITE.name,content:null,date:(new Date).toLocaleDateString("en-US")},this.$store.commit(n.ADD_WORKSHOP,{workshop:this.workshop}),m.cacheSet(this.workshop.guid)},reset:function(){this.begun=!1,this.finished=!1,this.workshop=null},updateContent:function(t){this.$store.commit(n.UPDATE_WORKSHOPS_CONTENT,{workshopUpdates:[{workshop:this.workshop,newContent:t,newTitle:(0,o.GetContentString)(t).slice(0,20)+"..."}]})}},created:function(){var t=this.getCurrentWorkshop();t&&this.begin(t)},beforeDestroy:function(){this.checkForDeletion()}}},MOG0:function(t,i,e){"use strict";e.r(i);var n=e("JEWj"),s=e.n(n);for(var o in n)"default"!==o&&function(t){e.d(i,t,function(){return n[t]})}(o);var r=e("aoPT"),a=e("JFUb");var l=function(t){e("8yIU")},c=Object(a.a)(s.a,r.a,r.b,!1,l,"data-v-63cceeb0",null);i.default=c.exports},ZBUZ:function(t,i,e){"use strict";e.r(i);var n=e("tOKB"),s=e.n(n);for(var o in n)"default"!==o&&function(t){e.d(i,t,function(){return n[t]})}(o);var r=e("fUJD"),a=e("JFUb");var l=function(t){e("C/02")},c=Object(a.a)(s.a,r.a,r.b,!1,l,"data-v-0ae82c80",null);i.default=c.exports},aoPT:function(t,i,e){"use strict";e.d(i,"a",function(){return n}),e.d(i,"b",function(){return s});var n=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"workshop-wrap"},[e("div",{staticClass:"workshop"},[e("h1",[t._v("Free Write")]),t._v(" "),e("p",{staticClass:"intro"},[t._v("\n      Write whatever comes to mind. Don't worry about style, grammar, or making sense.\n    ")]),t._v(" "),t.begun?t._e():e("p",{staticClass:"intro"},[t._v("If you'd like, you can set a time or word limit:")]),t._v(" "),e("transition",{attrs:{name:"shrink"}},[t.finished?t._e():e("div",{staticClass:"timer-wrap"},[e("timer",{attrs:{fullText:t.fullText},on:{begin:function(i){t.begin()}}})],1)]),t._v(" "),e("div",{directives:[{name:"show",rawName:"v-show",value:t.begun,expression:"begun"}],staticClass:"content"},[e("transition",{attrs:{name:"fade",mode:"out-in"}},[t.begun&&!t.finished?e("div",{key:"editor",staticClass:"content-inner"},[e("div",{staticClass:"editor"},[e("quill-editor",{ref:"quillEditor",attrs:{content:t.content},on:{"update:content":function(i){t.updateContent(i)}}})],1),t._v(" "),e("div",{staticClass:"done"},[e("button",{staticClass:"button-green",on:{click:function(i){t.finish()}}},[t._v("Done")])])]):t.finished?e("div",{key:"done",staticClass:"content-inner"},[e("p",{staticClass:"finished"},[this.fullText.trim()?[e("strong",[t._v("Saved!")]),t._v(" You can view this free write in the Workshops column of the Write page.\n            ")]:[e("strong",[t._v("Deleted!")]),t._v(" This free write was empty.\n            ")]],2),t._v(" "),e("button",{staticClass:"button-green",on:{click:function(i){t.reset()}}},[t._v("Start over")])]):t._e()])],1)],1)])},s=[]},fUJD:function(t,i,e){"use strict";e.d(i,"a",function(){return n}),e.d(i,"b",function(){return s});var n=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",[e("div",{directives:[{name:"show",rawName:"v-show",value:!t.begun,expression:"!begun"}],staticClass:"limit"},[e("div",{staticClass:"limit-option"},[e("input",{directives:[{name:"model",rawName:"v-model",value:t.limitType,expression:"limitType"}],attrs:{type:"radio",id:"wordLimit",name:"limit",value:"word"},domProps:{checked:t._q(t.limitType,"word")},on:{change:function(i){t.limitType="word"}}}),t._v(" "),e("label",{attrs:{for:"wordLimit"}},[t._v("Set a word limit")])]),t._v(" "),e("div",{staticClass:"limit-option"},[e("input",{directives:[{name:"model",rawName:"v-model",value:t.limitType,expression:"limitType"}],attrs:{type:"radio",id:"timeLimit",name:"limit",value:"time"},domProps:{checked:t._q(t.limitType,"time")},on:{change:function(i){t.limitType="time"}}}),t._v(" "),e("label",{attrs:{for:"timeLimit"}},[t._v("Set a time limit")])]),t._v(" "),e("div",{staticClass:"limit-option"},[e("input",{directives:[{name:"model",rawName:"v-model",value:t.limitType,expression:"limitType"}],attrs:{type:"radio",id:"noLimit",name:"limit"},domProps:{value:null,checked:t._q(t.limitType,null)},on:{change:function(i){t.limitType=null}}}),t._v(" "),e("label",{attrs:{for:"noLimit"}},[t._v("No limit")])]),t._v(" "),t.limitType?e("div",{staticClass:"set-limit"},[e("input",{directives:[{name:"model",rawName:"v-model",value:t.limit,expression:"limit"}],attrs:{type:"number",id:"setLimit"},domProps:{value:t.limit},on:{input:function(i){i.target.composing||(t.limit=i.target.value)}}}),t._v(" "),e("label",{staticClass:"set-limit-label",attrs:{for:"setLimit"}},[t._v(t._s(t.setLimitLabel))])]):t._e(),t._v(" "),e("div",{staticClass:"begin"},[e("button",{staticClass:"button-green",attrs:{disabled:!t.valid},on:{click:function(i){t.begin()}}},[t._v("Begin")])])]),t._v(" "),e("div",{directives:[{name:"show",rawName:"v-show",value:t.begun,expression:"begun"}],staticClass:"counter",class:{expired:t.limitReached}},["word"===t.limitType?e("div",[t._v("\n      "+t._s(t.wordCount)+" of "+t._s(t.limit)+" words written\n    ")]):"time"===t.limitType?e("div",[t._v("\n      "+t._s(t.timeDisplay)+"\n    ")]):t._e(),t._v(" "),t.limitReached||null===t.limitType?t._e():e("div",[e("button",{staticClass:"button-link",on:{click:function(i){t.reset()}}},[t._v("Cancel")])]),t._v(" "),t.limitReached?e("div",[e("button",{staticClass:"button-link",on:{click:function(i){t.reset()}}},[t._v("Set again")])]):t._e(),t._v(" "),null===t.limitType?e("div",[e("button",{staticClass:"button-link",on:{click:function(i){t.reset()}}},[t._v("Set a limit")])]):t._e()])])},s=[]},tOKB:function(t,i,e){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var n={word:500,time:10};i.default={computed:{secondsRemaining:function(){return"time"!==this.limitType?0:60*this.limit-this.elapsedSeconds},setLimitLabel:function(){switch(this.limitType){case"word":return"word limit";case"time":return"minute limit"}},timeDisplay:function(){if(this.secondsRemaining>30){var t=Math.ceil(this.secondsRemaining/60);return t>1?t+" minutes left":t+" minute left"}return this.secondsRemaining>0?this.secondsRemaining+" seconds left":"Timer expired"},valid:function(){return null===this.limitType||this.limit>0},wordCount:function(){return(this.fullText.match(/[^\s]+/g)||[]).length}},data:function(){return{begun:!1,elapsedSeconds:0,limit:0,limitReached:!1,limitType:null,timerInterval:null}},methods:{begin:function(){this.begun=!0,this.$emit("begin"),"time"===this.limitType&&this.startTimer()},clearTimer:function(){this.timerInterval&&clearInterval(this.timerInterval)},reset:function(){this.clearTimer(),this.begun=!1,this.limitReached=!1},startTimer:function(){var t=this,i=(new Date).getTime();this.timerInterval=setInterval(function(){var e=(new Date).getTime();t.elapsedSeconds=Math.round((e-i)/1e3)},200)}},watch:{limitType:function(t,i){if(!(Number(this.limit)>0&&Number(this.limit)!==n[i]))switch(t){case"word":return void(this.limit=500);case"time":return void(this.limit=10)}},secondsRemaining:function(t){"time"===this.limitType&&t<=0&&(this.clearTimer(),this.limitReached=!0,this.$emit("limitReached"))},wordCount:function(t){"word"===this.limitType&&(t>=this.limit?(this.limitReached=!0,this.$emit("limitReached")):!0===this.limitReached&&(this.limitReached=!1))}},props:{fullText:{required:!0,type:String}},beforeDestroy:function(){this.clearTimer()}}}}]);
//# sourceMappingURL=5.c564eb2fdc7c6293f993.js.map