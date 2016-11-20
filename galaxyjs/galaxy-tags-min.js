!function(galaxy){GalaxyAnimation={CONFIG:{baseDuration:.5,staggerDuration:.05},effects:{}};var Animation={lifecycle:{created:function(){var element=this;element.xtag.effects=[],element.xtag.registeredAnimations=[],this.xtag.cachedAnimations=this.getAttribute("effects")},attributeChanged:function(attrName,oldValue,newValue){},inserted:function(){this.xtag.cachedAnimations&&!this.xtag.effects.length&&(this.setAttribute("effects",this.xtag.cachedAnimations),this.xtag.cachedAnimations=null,this.prepare())},removed:function(){this.xtag.cachedAnimations=xtag.clone(this.xtag.effects).join(","),this.xtag.effects=[],this.prepare()}},accessors:{effects:{attribute:{},set:function(value){var element=this;"string"==typeof value?this.xtag.effects=value.split(/[\s,]+/).filter(Boolean):this.xtag.effects=[],element.prepare()},get:function(){return this.xtag.effects}}},events:{},methods:{prepare:function(){var element=this;this.xtag.effects.forEach(function(item){return element.xtag.registeredAnimations.indexOf(item)!==-1?null:GalaxyAnimation.effects[item]?(GalaxyAnimation.effects[item].register(element),void element.xtag.registeredAnimations.push(item)):console.warn("spirit animation not found:",item)}),this.xtag.registeredAnimations=this.xtag.registeredAnimations.filter(function(item){return element.xtag.effects.indexOf(item)!==-1||(GalaxyAnimation.effects[item].deregister(element),!1)})}}};xtag.register("galaxy-animation",Animation)}(Galaxy),function(){var Field={lifecycle:{created:function(){var element=this,input=this.querySelectorAll("input, textarea, select");input.length>1&&console.warn("Only one input field is allowed inside system-field",this),element.xtag._input=this.querySelectorAll("input, textarea, select")[0],element.xtag._input&&(element.setEmptiness(),element.xtag._input.addEventListener("focus",function(){element.setAttribute("focus",""),element.setEmptiness()}),element.xtag._input.addEventListener("blur",function(){element.removeAttribute("focus")}),element.xtag._input.onchange=function(e){element.setEmptiness()},element.xtag._input.addEventListener("input",function(e){element.setEmptiness()}))},inserted:function(){var tag=this;tag.xtag.observer=setInterval(function(){tag.xtag._input.value!==tag.xtag.oldValue&&(tag.setEmptiness(),tag.xtag.oldValue=tag.xtag._input.value)},250),tag.setEmptiness()},removed:function(){clearInterval(this.xtag.observer)}},accessors:{},events:{},methods:{setEmptiness:function(){var element=this;element.xtag._input.value||"file"===element.xtag._input.type?element.removeAttribute("empty"):element.setAttribute("empty","")}}};xtag.register("galaxy-field",Field)}(),function(){var FloatMenu={lifecycle:{created:function(){var _this=this;_this.xtag.indicator=_this.querySelector("[indicator]")||_this.children[0],_this.xtag.actionsContainer=_this.querySelector("[actions]")||_this.children[1];var expand=function(e){e.stopPropagation(),e.preventDefault(),_this.expanded||(_this.expand(),window.addEventListener("touchstart",contract))},contract=function(e){e.stopPropagation(),e.preventDefault(),_this.expanded&&_this.contract(),window.removeEventListener("touchstart",contract)};_this.addEventListener("mouseenter",expand),_this.addEventListener("touchstart",expand),_this.addEventListener("mouseleave",contract),this.style.position="absolute",this.xtag.originClassName=this.className,this.xtag.observer=new MutationObserver(function(mutations){_this.xtag.actionsContainer.children.length?_this.on():_this.off()})},inserted:function(){var _this=this;_this.xtag.observer.observe(_this.xtag.actionsContainer,{attributes:!1,childList:!0,characterData:!1}),_this.children.length?_this.on():_this.off()},removed:function(){this.off(!0)}},accessors:{position:{attribute:{}},parent:{attribute:{}},onAttached:{attribute:{},set:function(value){this.xtag.onAttached=value},get:function(value){return this.xtag.onAttached}}},methods:{expand:function(){this.expanded||(this.expanded=!0,this.classList.add("expand"))},contract:function(){this.expanded=!1,this.classList.remove("expand")},on:function(){this.classList.remove("off")},off:function(){this.classList.add("off")},clean:function(){this.innerHTML=""}},events:{}};xtag.register("galaxy-float-menu",FloatMenu)}(),function(){var SwitchButton={lifecycle:{created:function(){this.xtag.active=!1},inserted:function(){},removed:function(){},attributeChanged:function(attrName,oldValue,newValue){}},accessors:{name:{attribute:{}},module:{attribute:{}},active:{attribute:{},set:function(value){xtag.fireEvent(this,"switch",{detail:{active:Boolean(value)},bubbles:!0,cancelable:!0}),this.xtag.active=Boolean(value)},get:function(){return this.xtag.active}}},events:{click:function(event){this.xtag.active?event.currentTarget.removeAttribute("active"):event.currentTarget.setAttribute("active","true")}}};xtag.register("galaxy-switch",SwitchButton)}();