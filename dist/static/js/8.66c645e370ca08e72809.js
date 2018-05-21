(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{"07J3":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r,u=f(n("YEIV")),o=f(n("y0ZZ")),i=f(n("U8/g")),s=f(n("o1PP")),a=f(n("zM7W")),A=n("8SVD"),c=f(n("QvSF")),l=f(n("il2d")),d=f(n("GUC0"));function f(e){return e&&e.__esModule?e:{default:e}}var h=new c.default,p=(r={},(0,u.default)(r,s.default.LIMITED.name,{display:"Edward Limited monthly subscription",amount:0}),(0,u.default)(r,s.default.PREMIUM.name,{display:"Edward Premium monthly subscription",amount:299}),(0,u.default)(r,s.default.GOLD.name,{display:"Edward Gold monthly subscription",amount:1e3}),r);t.default={created:function(){this.user&&this.user.accountType&&this.user.accountType.name!==s.default.DEMO.name||this.$router.push("/login")},components:{PulseLoader:l.default},computed:{accountType:function(){return this.user.accountType.displayName},isGold:function(){return"GOLD"===this.user.accountType.name},isOverdue:function(){return this.user.isOverdue},isPremium:function(){return this.user.isPremium},paymentDueDate:function(){return this.user.paymentDue?new Date(this.user.paymentDue).toLocaleDateString():null},user:function(){return this.$route.matched.find(function(e){return e&&e.meta.getCurrentUser}).meta.getCurrentUser()}},data:function(){return{error:!1,payment:null,saving:!1}},methods:{cancel:function(){(0,A.goToApp)()},limitedToPremium:function(){var e=this;this.payment.open({email:this.user.email,description:p.PREMIUM.display,amount:p.PREMIUM.amount,token:function(t){e.error=!1,e.saving=!0,i.default.upgrade({oldAccountType:s.default.LIMITED.name,newAccountType:s.default.PREMIUM.name,token:t}).then(function(){return h.getFullExport()}).then(function(e){return o.default.fullImport(e)}).then(function(){e.error=!1,e.saving=!1,e.showSuccessPage()},function(t){console.error(t),e.error=!0,e.saving=!1})}})},limitedToGold:function(){var e=this;this.payment.open({email:this.user.email,description:p.GOLD.display,amount:p.GOLD.amount,token:function(t){e.error=!1,e.saving=!0,i.default.upgrade({oldAccountType:s.default.LIMITED.name,newAccountType:s.default.GOLD.name,token:t}).then(function(){return h.getFullExport()}).then(function(e){return o.default.fullImport(e)}).then(function(){e.error=!1,e.saving=!1,e.showSuccessPage()},function(t){console.error(t),e.error=!0,e.saving=!1})}})},toGold:function(){var e=this.user.accountType.name;return e===s.default.LIMITED.name?this.limitedToGold():e===s.default.PREMIUM.name?this.premiumToGold():void 0},premiumToGold:function(){var e=this;this.payment.open({email:this.user.email,description:p.GOLD.display,amount:p.GOLD.amount,token:function(t){e.error=!1,e.saving=!0,i.default.upgrade({oldAccountType:s.default.PREMIUM.name,newAccountType:s.default.GOLD.name,token:t}).then(function(){e.error=!1,e.saving=!1,e.showSuccessPage()},function(t){console.error(t),e.error=!0,e.saving=!1})}})},paidToLimited:function(){var e=this;(0,d.default)({buttons:!0,dangerMode:!0,icon:"warning",text:"Do you want to downgrade to a Limited account? You'll lose access to your documents on all other computers, and your data will be deleted if it exceeds the space your browser allows. Premium content (like workshops) will be lost.",title:"Downgrade to Limited account?"}).then(function(t){t&&(e.error=!1,e.saving=!0,o.default.fullExport().then(function(e){return h.doFullImport(e)}).then(function(){return i.default.upgrade({oldAccountType:e.user.accountType.name,newAccountType:s.default.LIMITED.name})}).then(function(){e.error=!1,e.saving=!1,e.showSuccessPage()},function(t){console.error(t),e.error=!0,e.saving=!1}))})},goldToPremium:function(){var e=this;this.payment.open({email:this.user.email,description:p.PREMIUM.display,amount:p.PREMIUM.amount,token:function(t){e.error=!1,e.saving=!0,i.default.upgrade({oldAccountType:s.default.GOLD.name,newAccountType:s.default.PREMIUM.name,token:t}).then(function(){e.error=!1,e.saving=!1,e.showSuccessPage()},function(t){console.error(t),e.error=!0,e.saving=!1})}})},showSuccessPage:function(){this.$router.push("/success")},updatePayment:function(){var e=this,t=p[this.user.accountType.name];this.payment.open({email:this.user.email,description:t.display,amount:t.amount,token:function(t){e.error=!1,e.saving=!0,i.default.updatePayment({token:t}).then(function(){e.error=!1,e.saving=!1,e.showSuccessPage()},function(t){console.error(t),e.error=!0,e.saving=!1})}})}},mounted:function(){this.payment=window.StripeCheckout.configure({key:window.stripePublicKey,image:a.default,color:"white",locale:"auto",name:"Novelist LLC",zipCode:!0,allowRememberMe:!1})},destroyed:function(){this.payment.close()}}},"146S":function(e,t,n){"use strict";n.d(t,"a",function(){return r}),n.d(t,"b",function(){return u});var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"wrap"},[n("div",{staticClass:"account"},[n("h1",{staticClass:"type"},[e._v("You have a "+e._s(e.accountType)+".")]),e._v(" "),e.isPremium?n("h4",{staticClass:"thanks"},[e._v("Thanks for supporting Edward!")]):e._e()]),e._v(" "),e.isPremium?n("hr"):e._e(),e._v(" "),e.isPremium?n("div",{staticClass:"payment"},[!e.isOverdue&&e.paymentDueDate?n("p",[e._v("Your next payment is due on "+e._s(e.paymentDueDate)+".")]):e._e(),e._v(" "),e.isOverdue?n("p",{staticClass:"error"},[e._v("\n      Your account is overdue. You cannot access the app until you downgrade to a Limited account or make a successful payment.\n    ")]):e._e(),e._v(" "),n("p",[e._v("\n      Click here to update your payment method.\n    ")]),e._v(" "),n("button",{on:{click:function(t){e.updatePayment()}}},[e._v("\n      Update Payment Method\n    ")])]):e._e(),e._v(" "),n("hr"),e._v(" "),n("div",{staticClass:"upgrade"},[e.isGold?n("div",[n("p",{staticClass:"above-small"},[e._v("\n        Don't want your Gold account any more?\n      ")]),e._v(" "),n("p",{staticClass:"small"},[e._v("\n        Please back up all of your documents first.\n      ")]),e._v(" "),n("button",{on:{click:function(t){e.goldToPremium()}}},[e._v("\n        Revert to Premium\n      ")])]):e._e(),e._v(" "),e.isPremium?e._e():n("div",[n("p",{staticClass:"above-small"},[e._v("\n        Upgrade to a Premium account to access your novels from anywhere.\n      ")]),e._v(" "),n("p",{staticClass:"price"},[e._v("($2.99 per month, up to 10,000 pages)")]),e._v(" "),n("button",{staticClass:"button-green",on:{click:function(t){e.limitedToPremium()}}},[e._v("\n        Go Premium\n      ")])]),e._v(" "),e.isGold?e._e():n("div",[n("p",{staticClass:"above-small"},[e._v("\n        Upgrade to a Gold account for extra Premium storage space.\n      ")]),e._v(" "),n("p",{staticClass:"price"},[e._v("($10 per month, up to 125,000 pages)")]),e._v(" "),n("button",{staticClass:"button-gold",on:{click:function(t){e.toGold()}}},[e._v("\n        Go Gold\n      ")])]),e._v(" "),e.isPremium?n("div",[n("p",{staticClass:"above-small"},[e._v("\n        Want to downgrade to a Limited account?\n      ")]),e._v(" "),n("p",{staticClass:"small"},[e._v("\n        Please back up all of your documents first. They may not fit in your browser's storage.\n      ")]),e._v(" "),n("button",{on:{click:function(t){e.paidToLimited()}}},[e._v("\n        Revert to Limited\n      ")])]):e._e(),e._v(" "),e.error?n("div",{staticClass:"error"},[e._v("\n      There has been a critical error. "),n("strong",[e._v("Your account change was not successful.")]),e._v("\n      Please try again or contact support at "),n("a",{attrs:{href:"mailto:support@edwardtheapp.com"}},[e._v("support@edwardtheapp.com")]),e._v(".\n    ")]):e._e()]),e._v(" "),n("hr"),e._v(" "),n("div",{staticClass:"delete"},[n("router-link",{attrs:{to:"/delete-account"}},[n("button",{staticClass:"button-link"},[e._v("Delete my account")])])],1),e._v(" "),n("hr"),e._v(" "),n("div",{staticClass:"cancel"},[e.saving?n("pulse-loader"):e._e(),e._v(" "),n("button",{staticClass:"button-link",attrs:{disabled:e.saving},on:{click:function(t){e.cancel()}}},[e._v("\n      Go back to the app\n    ")])],1)])},u=[]},QvSF:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=d(n("GQeE")),u=d(n("sk9p")),o=d(n("4d7F")),i=d(n("iCc5")),s=d(n("V7oC")),a=d(n("uM7l")),A=d(n("oAJy")),c=n("dmJm"),l=d(n("7tbW"));function d(e){return e&&e.__esModule?e:{default:e}}var f=function(){function e(){var t=this;(0,i.default)(this,e),A.default.setDriver([A.default.INDEXEDDB,A.default.WEBSQL,A.default.LOCALSTORAGE]),this.storage=A.default,window._storage=this.storage,this.getStorageKeys=function(){return t.storage.keys()},this.planKeyPrefix=function(e){return e+"_PLAN_DATA_"},this.planOrderKey=function(e){return e+"_PLAN_ORDER"},this.getPlanKey=function(e,n){return""+t.planKeyPrefix(e)+n},this.sectionKeyPrefix=function(e,t){return e+"_SECTION_DATA_"+t+"_"},this.sectionOrderKey=function(e,t){return e+"_SECTION_ORDER_"+t},this.getSectionKey=function(e,n,r){return""+t.sectionKeyPrefix(e,n)+r},this.chapterKeyPrefix=function(e){return e+"_CHAPTER_DATA_"},this.chapterOrderKey=function(e){return e+"_CHAPTER_ORDER"},this.getChapterKey=function(e,n){return""+t.chapterKeyPrefix(e)+n},this.topicKeyPrefix=function(e){return e+"_TOPIC_DATA_"},this.topicOrderKey=function(e){return e+"_TOPIC_ORDER"},this.getTopicKey=function(e,n){return""+t.topicKeyPrefix(e)+n},this.documentGuidsKey="DOCUMENT_IDS",this.documentsKey=function(e){return"DOCUMENT_"+e}}return(0,s.default)(e,[{key:"isPremium",value:function(){return!1}},{key:"addDocument",value:function(e){var t=this,n=e.guid,r=e.name;return this._getAllDocumentGuids().then(function(e){if(!e.includes(n))return e.push(n),t.storage.setItem(t.documentGuidsKey,e)}).then(function(){return t.storage.setItem(t.documentsKey(n),{guid:n,name:r})})}},{key:"arrangeChapters",value:function(e,t){return this.storage.setItem(this.chapterOrderKey(e),t)}},{key:"arrangePlans",value:function(e,t){return this.storage.setItem(this.planOrderKey(e),t)}},{key:"arrangeSections",value:function(e,t,n){return this.storage.setItem(this.sectionOrderKey(e,t),n)}},{key:"arrangeTopics",value:function(e,t){return this.storage.setItem(this.topicOrderKey(e),t)}},{key:"deleteChapter",value:function(e,t){var n=this.getChapterKey(e,t);return this.storage.removeItem(n)}},{key:"deleteDocument",value:function(e){var t=this;return this._getAllDocumentGuids().then(function(n){return n.includes(e)&&n.splice(n.indexOf(e),1),t.storage.setItem(t.documentGuidsKey,n)}).then(function(){return o.default.all([t._getAllChapters(e).then(function(n){return o.default.all(n.map(function(n){return t.deleteChapter(e,n.guid)}))}),t._getAllPlans(e).then(function(n){return o.default.all(n.map(function(n){return t._getAllSections(e,n.guid).then(function(r){return o.default.all(r.map(function(r){return t.deleteSection(e,n.guid,r.guid)}))}).then(function(){return t.deletePlan(e,n.guid)})}))}),t._getAllTopics(e).then(function(n){return o.default.all(n.map(function(n){return t.deleteTopic(e,n.guid)}))})]).then(function(){return t.storage.removeItem(t.documentsKey(e))})})}},{key:"deletePlan",value:function(e,t){var n=this.getPlanKey(e,t);return this.storage.removeItem(n)}},{key:"deleteSection",value:function(e,t,n){var r=this.getSectionKey(e,t,n);return this.storage.removeItem(r)}},{key:"deleteTopic",value:function(e,t){var n=this.getTopicKey(e,t);return this.storage.removeItem(n)}},{key:"deleteWorkshop",value:function(e,t){throw new Error("Workshops are a Premium-only feature.")}},{key:"_getAllChapters",value:function(e){var t=this,n=this.chapterKeyPrefix(e);return o.default.all([this._getChaptersSortOrder(e),this.getStorageKeys().then(function(e){return e.filter(function(e){return e.startsWith(n)})})]).then(function(e){var n=(0,u.default)(e,2),r=n[0],i=n[1];return o.default.all(i.map(function(e){return t.storage.getItem(e)})).then(function(e){return e.sort(function(e,t){return r.indexOf(e.guid)-r.indexOf(t.guid)}),e})})}},{key:"getAllChapters",value:function(e){return this._getAllChapters(e)}},{key:"_getAllDocumentGuids",value:function(){return this.storage.getItem(this.documentGuidsKey).then(function(e){return(0,l.default)(e)||[]})}},{key:"_getAllDocuments",value:function(){var e=this;return this._getAllDocumentGuids().then(function(t){return o.default.all(t.map(function(t){var n=e.documentsKey(t);return e.storage.getItem(n)}))})}},{key:"getAllDocuments",value:function(){return this._getAllDocuments()}},{key:"_getAllPlans",value:function(e){var t=this,n=this.planKeyPrefix(e);return o.default.all([this._getPlansSortOrder(e),this.getStorageKeys().then(function(e){return e.filter(function(e){return e.startsWith(n)})})]).then(function(n){var r=(0,u.default)(n,2),i=r[0],s=r[1];return o.default.all(s.map(function(e){return t.storage.getItem(e)})).then(function(n){return o.default.all(n.map(function(n){return t._getAllSections(e,n.guid).then(function(e){n.sections=e})})).then(function(){return n.sort(function(e,t){return i.indexOf(e.guid)-i.indexOf(t.guid)}),n})})})}},{key:"getAllPlans",value:function(e){return this._getAllPlans(e)}},{key:"_getAllSections",value:function(e,t){var n=this,r=this.sectionKeyPrefix(e,t);return o.default.all([this._getSectionSortOrder(e,t),this.getStorageKeys().then(function(e){return e.filter(function(e){return e.startsWith(r)})})]).then(function(e){var t=(0,u.default)(e,2),r=t[0],i=t[1];return o.default.all(i.map(function(e){return n.storage.getItem(e)})).then(function(e){return e.sort(function(e,t){return r.indexOf(e.guid)-r.indexOf(t.guid)}),e})})}},{key:"_getAllTopics",value:function(e){var t=this,n=this.topicKeyPrefix(e);return o.default.all([this._getTopicsSortOrder(e),this.getStorageKeys().then(function(e){return e.filter(function(e){return e.startsWith(n)})})]).then(function(e){var n=(0,u.default)(e,2),r=n[0],i=n[1];return o.default.all(i.map(function(e){return t.storage.getItem(e)})).then(function(e){return e.sort(function(e,t){return r.indexOf(e.guid)-r.indexOf(t.guid)}),e})})}},{key:"getAllTopics",value:function(e){return this._getAllTopics(e)}},{key:"_getChaptersSortOrder",value:function(e){return this.storage.getItem(this.chapterOrderKey(e)).then(function(e){return e||[]})}},{key:"_getPlansSortOrder",value:function(e){return this.storage.getItem(this.planOrderKey(e)).then(function(e){return e||[]})}},{key:"_getSectionSortOrder",value:function(e,t){return this.storage.getItem(this.sectionOrderKey(e,t)).then(function(e){return e||[]})}},{key:"_getTopicsSortOrder",value:function(e){return this.storage.getItem(this.topicOrderKey(e)).then(function(e){return e||[]})}},{key:"getAllWorkshops",value:function(){throw new Error("Workshops are a Premium-only feature.")}},{key:"saveAllContent",value:function(e,t){var n=this,r=t.chapters,u=t.plans,i=t.topics.map(function(t){return function(){return n.updateTopic(e,t.guid,t)}}),s=(0,c.orderPromises)(i).then(function(){var t=r.map(function(t){return function(){return n.updateChapter(e,t.guid,t)}});return(0,c.orderPromises)(t)}),a=u.map(function(t){return function(){return n.updatePlan(e,t.guid,t).then(function(){var r=t.sections.map(function(r){return function(){return n.updateSection(e,t.guid,r.guid,r)}});return(0,c.orderPromises)(r)})}}),A=(0,c.orderPromises)(a);return o.default.all([s,A])}},{key:"updateChapter",value:function(e,t,n){var r=this;if(e){var u=this.getChapterKey(e,t);return o.default.all([this.storage.setItem(u,n),this._getChaptersSortOrder(e).then(function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(!n.includes(t))return n.push(t),r.arrangeChapters(e,n)})])}}},{key:"updateDocument",value:function(e){var t=e.guid,n=e.name;return this.storage.setItem(this.documentsKey(t),{guid:t,name:n})}},{key:"updatePlan",value:function(e,t,n){var r=this;if(e){var u=this.getPlanKey(e,t);return(n=(0,a.default)(n)).sections=null,o.default.all([this.storage.setItem(u,n),this._getPlansSortOrder(e).then(function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(!n.includes(t))return n.push(t),r.arrangePlans(e,n)})])}}},{key:"updateSection",value:function(e,t,n,r){var u=this;if(e){var i=this.getSectionKey(e,t,n);return o.default.all([this.storage.setItem(i,r),this._getSectionSortOrder(e,t).then(function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(!t.includes(n))return t.push(n),u.arrangeSections(e,t)})])}}},{key:"updateTopic",value:function(e,t,n){var r=this;if(e){var u=this.getTopicKey(e,t);return o.default.all([this.storage.setItem(u,n),this._getTopicsSortOrder(e).then(function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];if(!n.includes(t))return n.push(t),r.arrangeTopics(e,n)})])}}},{key:"updateWorkshops",value:function(e,t){throw new Error("Workshops are a Premium-only feature.")}},{key:"docExport",value:function(e,t){var n=this;return o.default.all([this._getAllChapters(e),this._getAllTopics(e),this._getAllPlans(e).then(function(t){return o.default.all(t.map(function(t){return n._getAllSections(e,t.guid).then(function(e){return t.sections=e,t})}))})]).then(function(n){var r=(0,u.default)(n,3),o=r[0],i=r[1],s=r[2];return{guid:e,name:t,chapters:o,topics:i,plans:s}})}},{key:"docImport",value:function(e){var t=this,n=void 0;return this.docExport(e.guid).then(function(e){n=e}).then(function(){return t.deleteDocument(e.guid)}).then(function(){if(!e)throw new Error("Attempted to import an empty backup");return t.addDocument(e).then(function(){return t.saveAllContent(e.guid,e)})}).then(void 0,function(e){return console.error(e),t.addDocument(n).then(function(){return t.saveAllContent(n.guid,n)})})}},{key:"getFullExport",value:function(){var e=this;return this._getAllDocuments().then(function(t){return o.default.all(t.map(function(t){return o.default.all([e._getAllChapters(t.guid),e._getAllTopics(t.guid),e._getAllPlans(t.guid).then(function(n){return o.default.all(n.map(function(n){return e._getAllSections(t.guid,n.guid).then(function(e){return n.sections=e,n})}))})]).then(function(e){var n=(0,u.default)(e,3),r=n[0],o=n[1],i=n[2];return t.chapters=r,t.topics=o,t.plans=i,t})}))})}},{key:"revertImport",value:function(e){var t=this;return o.default.all((0,r.default)(e).map(function(n){return t.storage.setItem(n,e[n])})).then(void 0,function(e){throw console.error(e),e})}},{key:"doFullImport",value:function(e){var t=this,n={};return this.storage.iterate(function(e,t){n[t]=e}).then(function(){return t.storage.clear().then(function(){if(!e||!Array.isArray(e)||!e.length)throw new Error("Attempted to import an empty backup");var n=e.map(function(e){return function(){return t.addDocument(e).then(function(){return t.saveAllContent(e.guid,e)})}});return(0,c.orderPromises)(n)})}).then(void 0,function(e){return console.error(e),t.revertImport(n)})}}]),e}();t.default=f},dmJm:function(e,t){function n(e,t){return{text:e||"",style:t||[]}}const r={bullet:"ul",ordered:"ol"};function u(e){const t=[],n=[];if(!e)return{styles:t,lineStyles:n};for(const u in e)["bold","italic","underline","strike"].includes(u)?t.push(u):"header"!==u?"blockquote"!==u?"list"!==u||n.push(r[e[u]]):n.push("blockquote"):n.push(`h${e[u]}`);return{styles:t,lineStyles:n}}e.exports={getStyledArrayFromChapters:function(e){const t=[];for(const r of e){t.push({text:r.title,style:"chapterHeading",pageBreak:"before"});let e={text:[],style:[]};const o=r.content&&r.content.ops||[];for(const r of o){const o=r.insert,{styles:i,lineStyles:s}=u(r.attributes);if(s.length&&e.style.push(...s),"\n"===o){t.push(e),e={text:[],style:[]};continue}if(o.includes("\n")){const[r,...u]=o.split("\n");if(r){const t=n(r,i);e.text.push(t)}t.push(e),e={text:[],style:[]};for(let r=0;r<u.length-1;r++){const o=n(u[r],i);e.text.push(o),t.push(e),e={text:[],style:[]}}const s=n(u[u.length-1],i);e.text.push(s);continue}const a=n(o,i);e.text.push(a)}}return t},orderPromises:function e(t){if(!Array.isArray(t)||t.length&&"function"!=typeof t[0])throw new TypeError("orderPromises expects an array of functions. Received: "+JSON.stringify(t));if(!t.length)return Promise.resolve();const n=t[0]();if(!n.then)throw new TypeError("A function in the array passed to orderPromises did not return a promise. Returned: "+JSON.stringify(n));return n.then(function(){return e(t.slice(1))})}}},mNv7:function(e,t,n){"use strict";n.r(t);var r=n("07J3"),u=n.n(r);for(var o in r)"default"!==o&&function(e){n.d(t,e,function(){return r[e]})}(o);var i=n("146S"),s=n("JFUb");var a=function(e){n("no4q")},A=Object(s.a)(u.a,i.a,i.b,!1,a,"data-v-4b625da0",null);t.default=A.exports},no4q:function(e,t){},y0ZZ:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=s(n("4d7F")),u=s(n("iCc5")),o=s(n("V7oC")),i=s(n("vDqi"));function s(e){return e&&e.__esModule?e:{default:e}}var a=function(e){return"/api/"+e},A=function(){function e(){(0,u.default)(this,e)}return(0,o.default)(e,[{key:"simpleGet",value:function(e){return i.default.get(e).then(function(e){return e.data})}},{key:"simplePost",value:function(e,t){return i.default.post(e,t).then(function(e){return e.data})}},{key:"saveAllContent",value:function(e){return this.simplePost(a("document/saveAll"),e)}},{key:"addDocument",value:function(e){return this.simplePost(a("document/add"),e)}},{key:"deleteDocument",value:function(e){return this.simplePost(a("document/delete"),e)}},{key:"getDocuments",value:function(){return this.simpleGet(a("documents")).then(function(e){return e.map(function(e){return e})})}},{key:"updateDocument",value:function(e){return this.simplePost(a("document/update"),e)}},{key:"arrangeChapters",value:function(e){return this.simplePost(a("chapter/arrange"),e)}},{key:"deleteChapter",value:function(e){return this.simplePost(a("chapter/delete"),e)}},{key:"getChapters",value:function(e){return this.simpleGet(a("chapters/"+e))}},{key:"updateChapter",value:function(e){return this.simplePost(a("chapter/update"),e)}},{key:"arrangeTopics",value:function(e){return this.simplePost(a("topic/arrange"),e)}},{key:"deleteTopic",value:function(e){return this.simplePost(a("topic/delete"),e)}},{key:"getTopics",value:function(e){return this.simpleGet(a("topics/"+e))}},{key:"updateTopic",value:function(e){return this.simplePost(a("topic/update"),e)}},{key:"arrangePlans",value:function(e){return this.simplePost(a("plan/arrange"),e)}},{key:"deletePlan",value:function(e){return this.simplePost(a("plan/delete"),e)}},{key:"getPlans",value:function(e){return this.simpleGet(a("plans/"+e))}},{key:"updatePlan",value:function(e){return this.simplePost(a("plan/update"),e)}},{key:"arrangeSections",value:function(e){return this.simplePost(a("section/arrange"),e)}},{key:"deleteSection",value:function(e){return this.simplePost(a("section/delete"),e)}},{key:"updateSection",value:function(e){return this.simplePost(a("section/update"),e)}},{key:"deleteWorkshopContent",value:function(e){var t=e.documentGuid,n=e.guid;return this.simplePost(a("workshop-content/delete"),{documentGuid:t,guid:n})}},{key:"getWorkshops",value:function(e){return this.simpleGet(a("workshop-content/"+e))}},{key:"updateWorkshopContents",value:function(e){var t=e.documentGuid,n=e.workshops;return this.simplePost(a("workshop-content/update"),{documentGuid:t,workshops:n})}},{key:"docExport",value:function(e){return this.simpleGet(a("backup/export/document/"+e))}},{key:"docImport",value:function(e){var t=e.guid,n=e.name,r=e.chapters,u=e.topics,o=e.plans,i=e.workshops;return this.simplePost(a("backup/import/document"),{guid:t,name:n,chapters:r,topics:u,plans:o,workshops:i})}},{key:"fullExport",value:function(){return this.simpleGet(a("backup/export"))}},{key:"fullImport",value:function(e){return this.simplePost(a("backup/import"),e)}},{key:"exportToWord",value:function(e){var t=e.guid,n=e.title,u=e.includeArchived;return new r.default(function(e){window.open(a("word/export-chapters?guid="+t+"&title="+n+"&includeArchived="+!!u),"_blank"),e()})}}]),e}();t.default=new A},zM7W:function(e,t){e.exports="data:image/png;base64,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"}}]);
//# sourceMappingURL=8.66c645e370ca08e72809.js.map