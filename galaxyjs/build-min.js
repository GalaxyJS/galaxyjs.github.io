!function(){function System(){this.stateKey="app",this.registry={},this.modules={},this.activities={},this.uiTemplates={},this.onLoadQueue=[],this.notYetStarted=[],this.activeRequests={},this.onModuleLoaded={},this.services={},this.modulesHashes={},this.hashChecker=null,this.navigation={},this.params={},this.firstTime=!1}Galaxy=new System,Galaxy.GalaxySystem=System;var importedLibraries={};System.prototype.state=function(id,handler){var module,modulePath,moduleNavigation,domain=this;if(!domain)throw"Domain can NOT be null";return id=this.app.id+"/"+id,handler?domain.modules[id]?domain.modules[id]:("function"==typeof handler?(module=Galaxy.utility.extend(!0,{},Galaxy.module.create()),module.domain=domain,module.id=id,module.stateId=id.replace("system/",""),handler.call(null,module)):(module=Galaxy.utility.extend(!0,{},Galaxy.module.create(),handler||{}),module.domain=domain,module.id=id,module.stateId=id.replace("system/","")),modulePath=domain.app.navigation[module.stateKey]?domain.app.navigation[module.stateKey]:[],moduleNavigation=Galaxy.utility.extend(!0,{},domain.app.navigation),moduleNavigation[module.stateKey]=modulePath.slice(id.split("/").length-1),domain.modules[id]=module,domain.notYetStarted.push(id),module.init(moduleNavigation,domain.app.params),module):(domain.notYetStarted.push(id),domain.modules[id])},System.prototype.component=function(scope,handler){var app=this.getHashParam("app");return 0===app.indexOf(scope._stateId)?this.state(scope._stateId,handler):(scope._doNotRegister=!0,null)},System.prototype.on=function(id,handler){this.app.on.call(this.app,id,handler)},System.prototype.start=function(){var _this=this,detect=function(){if(_this.app.oldHash!==window.location.hash){var hashValue=window.location.hash,navigation={},params={};hashValue=hashValue.replace(/^#\/?/gim,""),hashValue.replace(/([^&]*)=([^&]*)/g,function(m,k,v){navigation[k]=v.split("/").filter(Boolean),params[k]=v}),_this.setModuleHashValue(navigation,params,hashValue),_this.app.hashChanged(navigation,params,hashValue,navigation[_this.app.stateKey]),_this.app.oldHash="#"+hashValue}};detect(),clearInterval(this.hashChecker),this.hashChecker=setInterval(function(){detect()},50)},System.prototype.setModuleHashValue=function(navigation,parameters,hashValue,init){var nav=parameters[this.stateKey];nav&&(Galaxy.modulesHashes[nav]&&Galaxy.app.activeModule!==Galaxy.modules["system/"+nav]&&Galaxy.app.activeModule&&"app"===Galaxy.app.activeModule.stateKey||(this.firstTime?Galaxy.modulesHashes[nav]?Galaxy.modulesHashes[nav]&&(Galaxy.modulesHashes[nav]=hashValue):Galaxy.modulesHashes[nav]="app="+nav:(Galaxy.modulesHashes[nav]=hashValue,this.firstTime=!0)))},System.prototype.init=function(mods){this.app=Galaxy.utility.extend(!0,{},Galaxy.module.create()),this.app.domain=this,this.app.stateKey=this.stateKey,this.app.id="system",this.app.installModules=mods||[],this.app.init({},{},"system")},System.prototype.parseContent=function(raw,module){var scripts=[],imports=[];if(!Galaxy.utility.isHTML(raw))return console.log("Resource is not a valid html file:",module.url),{html:[],imports:[],uiView:[],script:""};for(var raw=Galaxy.utility.parseHTML(raw),html=raw.filter(function(e){if(e.nodeType===Node.ELEMENT_NODE){var scriptTags=Array.prototype.slice.call(e.querySelectorAll("script"));scriptTags.forEach(function(tag){scripts.push(tag.innerHTML),tag.parentNode.removeChild(tag)})}return e.tagName&&"script"===e.tagName.toLowerCase()?(scripts.push(e.innerHTML),!1):!e.tagName||"import"!==e.tagName.toLowerCase()||(imports.push({name:e.getAttribute("name"),from:e.getAttribute("from"),fresh:e.hasAttribute("fresh")}),!1)}),temp=document.createElement("div"),i=0,len=html.length;i<len;i++)html[i]=temp.appendChild(html[i]);document.getElementsByTagName("body")[0].appendChild(temp);var uiView=temp.querySelectorAll("system-ui-view,[system-ui-view]");return temp.parentNode.removeChild(temp),{html:html,imports:imports,uiView:uiView,script:scripts.join("\n")}},System.prototype.load=function(module,onDone){function compile(parsedContent){var scopeUIViews={};Array.prototype.forEach.call(parsedContent.uiView,function(item){var uiViewName=item.getAttribute("system-ui-view")||item.getAttribute("name"),key=uiViewName.replace(/([A-Z])|(\-)|(\s)/g,function($1){return"_"+(/[A-Z]/.test($1)?$1.toLowerCase():"")});scopeUIViews[key]=item});var scope={_moduleId:"system/"+module.id,_stateId:module.id,parentScope:module.scope||null,uiViews:scopeUIViews,ui:parsedContent.html,html:parsedContent.html,views:scopeUIViews,imports:{}},imports=Array.prototype.slice.call(parsedContent.imports,0),scriptContent=parsedContent.script||"";return scriptContent=scriptContent.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm,""),parsedContent.script=scriptContent.replace(/Scope\.import\(['|"](.*)['|"]\)\;/gm,function(match,path){var query=path.match(/([\S]+)/gm);return imports.push({url:query[query.length-1],fresh:query.indexOf("new")!==-1}),"Scope.imports['"+query[query.length-1]+"']"}),imports.length?(imports.forEach(function(item){importedLibraries[item.url]&&!item.fresh?doneImporting(module,scope,imports,parsedContent):Galaxy.load({id:(new Date).valueOf()+"-"+performance.now(),name:item.name,url:item.url,fresh:item.fresh,scope:scope,invokers:invokers,temprory:!0},function(loaded){doneImporting(module,scope,imports,parsedContent)})}),!1):void moduleLoaded(module,scope,parsedContent)}function doneImporting(module,scope,imports,filtered){imports.splice(imports.indexOf(module.url),1),0===imports.length&&moduleLoaded(module,scope,filtered)}function moduleLoaded(module,scope,filtered){for(var item in importedLibraries)if(importedLibraries.hasOwnProperty(item)){var asset=importedLibraries[item];scope.imports[asset.name]=asset.module}new Function("Scope",filtered.script).call(null,scope),importedLibraries[module.url]?module.fresh?importedLibraries[module.url].module=scope.export:scope.imports[module.name]=importedLibraries[module.url].module:importedLibraries[module.url]={name:module.name||module.url,module:scope.export};var currentModule=Galaxy.modules["system/"+module.id];module.temprory||scope._doNotRegister?(delete scope._doNotRegister,currentModule={}):currentModule||(currentModule=Galaxy.modules["system/"+module.id]={}),currentModule.html=filtered.html,currentModule.scope=scope,"function"==typeof Galaxy.onModuleLoaded["system/"+module.id]&&(Galaxy.onModuleLoaded["system/"+module.id].call(this,currentModule,currentModule.html),delete Galaxy.onModuleLoaded["system/"+module.id]),delete Galaxy.onLoadQueue["system/"+module.id]}module.id=module.id||(new Date).valueOf()+"-"+performance.now(),Galaxy.onModuleLoaded["system/"+module.id]=onDone;var moduleExist=Galaxy.modules["system/"+module.id],invokers=[module.url];if(module.invokers){if(module.invokers.indexOf(module.url)!==-1)throw new Error("circular dependencies: \n"+module.invokers.join("\n")+"\nwanna load: "+module.url);invokers=module.invokers,invokers.push(module.url)}return moduleExist?void("function"==typeof Galaxy.onModuleLoaded["system/"+module.id]&&(Galaxy.onModuleLoaded["system/"+module.id].call(this,moduleExist,moduleExist.html),delete Galaxy.onModuleLoaded["system/"+module.id])):void(Galaxy.onLoadQueue["system/"+module.id]||(Galaxy.onLoadQueue["system/"+module.id]=!0,nanoajax.ajax({method:"GET",url:module.url,body:Galaxy.utility.serialize(module.params||{})},function(code,response){var parsedContent=Galaxy.parseContent(response,module);setTimeout(function(){compile(parsedContent)},1)})))},System.prototype.setURLHash=function(hash){hash=hash.replace(/^#\/?/gim,"");var navigation={},params={};hash.replace(/([^&]*)=([^&]*)/g,function(m,k,v){navigation[k]=v.split("/").filter(Boolean),params[k]=v})},System.prototype.getHashParam=function(key,hashName){var asNumber=parseFloat(this.app.params[key]);return asNumber||this.app.params[key]||null},System.prototype.getHashNav=function(key,hashName){return this.app.navigation[key]||[]},System.prototype.setModuleHashValue=function(navigation,parameters,hashValue,init){var nav=parameters[this.stateKey];nav&&(Galaxy.modulesHashes[nav]&&Galaxy.app.activeModule!==Galaxy.modules["system/"+nav]&&Galaxy.app.activeModule&&"app"===Galaxy.app.activeModule.stateKey||(this.firstTime?Galaxy.modulesHashes[nav]?Galaxy.modulesHashes[nav]&&(Galaxy.modulesHashes[nav]=hashValue):Galaxy.modulesHashes[nav]="app="+nav:(Galaxy.modulesHashes[nav]=hashValue,this.firstTime=!0)))},System.prototype.setHashParameters=function(parameters,replace,clean){var newParams=Galaxy.utility.clone(parameters);this.lastHashParams=parameters;var hashValue=window.location.hash,nav=parameters.app;nav&&!Galaxy.modulesHashes[nav]?Galaxy.modulesHashes[nav]=hashValue="app="+nav:nav&&Galaxy.modulesHashes[nav]&&(hashValue=Galaxy.modulesHashes[nav]),hashValue.indexOf("#")!==-1&&(hashValue=hashValue.substring(1));var newHash=(hashValue.split("&"),"#"),and=!1;hashValue.replace(/([^&]*)=([^&]*)/g,function(m,k,v){null!==newParams[k]&&"undefined"!=typeof newParams[k]?(newHash+=k+"="+newParams[k],newHash+="&",and=!0,delete newParams[k]):newParams.hasOwnProperty(k)||clean||(newHash+=k+"="+v,newHash+="&",and=!0)});for(var key in newParams)if(newParams.hasOwnProperty(key)){var value=newParams[key];key&&value&&(newHash+=key+"="+value+"&")}newHash=newHash.replace(/\&$/,""),replace?window.location.replace((""+window.location).split("#")[0]+newHash):window.location.hash=newHash.replace(/\&$/,"")},System.prototype.setParamIfNull=function(param,value){this.app.setParamIfNull(param,value)},System.prototype.loadDependecies=function(dependecies){for(var key in dependecies);}}(),function(galaxy){function GalaxyUI(){this.DEFAULTS={animationDuration:1},this.COMPONENT_STRUCTURE={el:null,events:{},on:function(event,handler){this.events[event]=handler},trigger:function(event){this.events[event]&&this.events[event].apply(this,Array.prototype.slice.call(arguments,1))}},this.body=document.getElementsByTagName("body")[0]}galaxy.GalaxyUI=GalaxyUI,galaxy.ui=new galaxy.GalaxyUI,GalaxyUI.prototype.utility={viewRegex:/\{\{([^\{\}]*)\}\}/g},GalaxyUI.prototype.utility.populate=function(template,data){return template=template.replace(this.viewRegex,function(match,key){return eval("data."+key)||""})},GalaxyUI.prototype.utility.hasClass=function(element,className){return element.classList?element.classList.contains(className):new RegExp("(^| )"+className+"( |$)","gi").test(element.className)},GalaxyUI.prototype.utility.addClass=function(el,className){el&&(el.classList?el.classList.add(className):el.className+=" "+className)},GalaxyUI.prototype.utility.removeClass=function(el,className){el&&(el.classList?el.classList.remove(className):el.className=el.className.replace(new RegExp("(^|\\b)"+className.split(" ").join("|")+"(\\b|$)","gi")," "))},GalaxyUI.prototype.utility.toTreeObject=function(element){var jsTree={_:element,_children:[]},indexIndicator={};for(var index in element.childNodes){var node=element.childNodes[index];if(node.nodeType===Node.ELEMENT_NODE){var key=node.nodeName.toLowerCase();indexIndicator[key]?(indexIndicator[key]++,jsTree[key+"_"+indexIndicator[key]]=galaxy.ui.utility.toTreeObject(node)):(indexIndicator[key]=1,jsTree[node.nodeName.toLowerCase()]=galaxy.ui.utility.toTreeObject(node)),jsTree._children.push(node)}}return jsTree},GalaxyUI.prototype.utility.getContentHeight=function(element,withPaddings){for(var height=0,children=element.children,index=0,length=children.length;index<length;index++)if(!children[index].__ui_neutral){var cs=window.getComputedStyle(children[index],null);if("absolute"!==cs.position){var dimension=children[index].offsetTop+children[index].offsetHeight,marginBottom=parseInt(cs.marginBottom||0);height=dimension+marginBottom>height?dimension+marginBottom:height}}return withPaddings&&(height+=parseInt(window.getComputedStyle(element).paddingBottom||0)),height},GalaxyUI.prototype.setContent=function(parent,nodes){var children=Array.prototype.slice.call(parent.childNodes);children.forEach(function(child){parent.removeChild(child)}),nodes.forEach(function(item){parent.appendChild(item)})},GalaxyUI.prototype.clone=function(obj){var target={};for(var i in obj)obj.hasOwnProperty(i)&&(target[i]=obj[i]);return target},GalaxyUI.prototype.getCenterPoint=function(rect){document.activeElement.getBoundingClientRect();return{left:rect.left+rect.width/2,top:rect.top+rect.height/2}},GalaxyUI.prototype.animations={}}(Galaxy),function(galaxy){function GalaxyModule(){}galaxy.GalaxyModule=GalaxyModule,galaxy.module=new galaxy.GalaxyModule,GalaxyModule.prototype.create=function(){return{domain:null,inited:!1,started:!1,active:!1,stateKey:"app",navigation:{},params:{},html:"",installModules:[],binds:{},installModulesOnInit:function(modules){this.installModules=modules},onInit:null,onStart:null,onStop:null,init:function(navigations,params,html){var _this=this;this.inited=!0,this.trigger("onInit"),this.installModules.forEach(function(lib){_this.domain.loadModule(lib)})},start:function(){if(this.started=!0,this.active=!0,this.trigger("onStart"),("system/"+this.domain.app.params[this.stateKey]).indexOf(this.id)<=-1)throw console.log(this.domain.app.params[this.stateKey]),new Error("Could not find module `"+this.id+"` by state key `"+this.stateKey+"`");var newNav=galaxy.utility.extend(!0,{},this.domain.app.navigation),st="system/"+this.domain.app.params[this.stateKey],napPath=0===st.indexOf(this.id)?st.substr(this.id.length).split("/").filter(Boolean):[];newNav[this.stateKey]=napPath;var nav=newNav,params=this.domain.app.params;this.navigation={},this.params={},this.hashChanged(nav,params,this.hash,this.domain.getHashNav(this.stateKey));var index=this.domain.notYetStarted.indexOf(this.id);index>-1&&this.domain.notYetStarted.splice(index,1)},dispose:function(){},hashListeners:[],globalHashListeners:[],data:{},on:function(id,handler){this.hashListeners.push({id:id,handler:handler})},onGlobal:function(id,handler){this.globalHashListeners.push({id:id,handler:handler})},getNav:function(key){return this.domain.getHashNav(key)},setNav:function(value,key){var pathKey=key||"app",pathValue=null===value||void 0===value?"":value;this.setParam(pathKey,(this.id+"/").replace("system/","")+pathValue)},getParam:function(key){return this.domain.getHashParam(key)},setParam:function(key,value,replace){var paramObject={};paramObject[key]=value,this.domain.setHashParameters(paramObject,replace)},setParamIfNull:function(param,value){if(!this.domain.getHashParam(param)){var paramObject={};paramObject[param]=value,this.domain.setHashParameters(paramObject,!0)}},setParamIfNot:function(param,value){if(this.domain.getHashParam(param)!==value){var paramObject={};paramObject[param]=value,this.domain.setHashParameters(paramObject,!0)}},bind:function(event,action){"string"==typeof event&&"function"==typeof action&&(this.binds[event]=action)},stage:function(event,action){"string"==typeof event&&"function"==typeof action&&(this.binds[event]=action)},trigger:function(event,args){"function"==typeof this[event]&&this[event].apply(this,args)},hashChanged:function(navigation,params,hashValue,fullNav){var _this=this,moduleNavigation=navigation,fullNavPath=params[_this.stateKey];this.id==="system/"+fullNavPath?(this.domain.app.activeModule=this,this.domain.app.activeModule.active=!0):this.solo||(this.domain.app.activeModule&&this.domain.app.activeModule.active&&this.domain.app.activeModule.trigger("onStop"),this.domain.app.activeModule=null,this.active=!1),this.hashHandler.call(this,navigation,params);var allNavigations=galaxy.utility.extend({},this.navigation,navigation),tempNav=_this.navigation;if(_this.navigation=navigation,_this.params=params,this.domain.app.activeModule&&this.active&&this.domain.app.activeModule.id===_this.id){for(var key in allNavigations)if(allNavigations.hasOwnProperty(key)){var stateHandlers=_this.hashListeners.filter(function(item){return item.id===key});if(stateHandlers.length){if(tempNav[key]){var currentKeyValue=tempNav[key].join("/");if(navigation[key]&&currentKeyValue===navigation[key].join("/"))continue}var parameters=[];parameters.push(null);var navigationValue=navigation[key];if(navigationValue){parameters[0]=navigationValue.join("/");for(var i=0;i<navigationValue.length;i++){var arg=galaxy.utility.isNumber(navigationValue[i])?parseFloat(navigationValue[i]):navigationValue[i];parameters.push(arg)}}stateHandlers.forEach(function(item){item.handler.apply(_this,parameters)})}}}else if(!this.active){var keyStateHandlers=_this.hashListeners.filter(function(item){return item.id===_this.stateKey}),stateKeyNavigationValue=navigation[_this.stateKey];if(keyStateHandlers.length&&stateKeyNavigationValue){var currentKeyValue=tempNav[_this.stateKey]?tempNav[_this.stateKey].join("/"):[];if(currentKeyValue!==stateKeyNavigationValue.join("/")){var args=[];args.push(stateKeyNavigationValue);for(var i=0,len=stateKeyNavigationValue.length;i<len;++i)args.push(stateKeyNavigationValue[i]);keyStateHandlers.forEach(function(item){item.handler.apply(_this,args)})}}}for(var key in allNavigations)if(allNavigations.hasOwnProperty(key)){var globalStateHandlers=_this.globalHashListeners.filter(function(item){return item.id===key});if(globalStateHandlers.length){if(tempNav[key]){var currentKeyValue=tempNav[key].join("/");if(navigation[key]&&currentKeyValue===navigation[key].join("/"))continue}if(parameters=[],parameters.push(null),navigationValue=navigation[key]){parameters[0]=navigationValue.join("/");for(var i=0;i<navigationValue.length;i++){var arg=galaxy.utility.isNumber(navigationValue[i])?parseFloat(navigationValue[i]):navigationValue[i];parameters.push(arg)}}globalStateHandlers.forEach(function(item){item.handler.apply(_this,parameters)})}}navigation[this.stateKey]&&this.domain.modules[this.id+"/"+navigation[this.stateKey][0]]&&(this.activeModule=this.domain.modules[this.id+"/"+navigation[this.stateKey][0]]),this.activeModule&&this.activeModule.id===this.id+"/"+navigation[this.stateKey][0]&&(moduleNavigation=galaxy.utility.extend(!0,{},navigation),moduleNavigation[this.stateKey]=fullNav.slice(this.activeModule.id.split("/").length-1),this.activeModule.hashChanged(moduleNavigation,this.params,hashValue,fullNav))},loadModule:function(module,onDone){galaxy.loadModule(module,onDone,this.scope)},hashHandler:function(nav,params){}}}}(Galaxy),!function(t,e){function n(t){return t&&e.XDomainRequest&&!/MSIE 1/.test(navigator.userAgent)?new XDomainRequest:e.XMLHttpRequest?new XMLHttpRequest:void 0}function o(t,e,n){t[e]=t[e]||n}var r=["responseType","withCredentials","timeout","onprogress"];t.ajax=function(t,a){function s(t,e){return function(){c||(a(void 0===f.status?t:f.status,0===f.status?"Error":f.response||f.responseText||e,f),c=!0)}}var u=t.headers||{},i=t.body,d=t.method||(i?"POST":"GET"),c=!1,f=n(t.cors);f.open(d,t.url,!0);var l=f.onload=s(200);f.onreadystatechange=function(){4===f.readyState&&l()},f.onerror=s(null,"Error"),f.ontimeout=s(null,"Timeout"),f.onabort=s(null,"Abort"),i&&(o(u,"X-Requested-With","XMLHttpRequest"),e.FormData&&i instanceof e.FormData||o(u,"Content-Type","application/x-www-form-urlencoded"));for(var p,m=0,v=r.length;v>m;m++)p=r[m],void 0!==t[p]&&(f[p]=t[p]);for(var p in u)f.setRequestHeader(p,u[p]);return f.send(i),f},e.nanoajax=t}({},function(){return this}()),function(galaxy){galaxy.utility={clone:function(source){if(null===source||"object"!=typeof source)return source;var copy=source.constructor();for(var property in source)source.hasOwnProperty(property)&&(copy[property]=source[property]);return copy},extend:function(out){var isDeep=!1;out===!0&&(isDeep=!0,out={});for(var i=1;i<arguments.length;i++){var obj=arguments[i];if(obj)for(var key in obj)obj.hasOwnProperty(key)&&("object"==typeof obj[key]&&isDeep?Array.isArray(obj[key])?out[key]=galaxy.utility.extend([],obj[key]):out[key]=galaxy.utility.extend({},obj[key]):out[key]=obj[key])}return out},installModuleStateHandlers:function(module,states){for(var state in states)module.on(state,states[state])},getProperty:function(obj,propString){if(!propString)return obj;for(var prop,props=propString.split("."),i=0,iLen=props.length-1;i<iLen;i++){prop=props[i];var candidate=obj[prop];if(void 0===candidate)break;obj=candidate}return obj[props[i]]},isHTML:function(str){var element=document.createElement("div");element.innerHTML=str;for(var c=element.childNodes,i=c.length;i--;)if(1===c[i].nodeType)return!0;return!1},decorate:function(hostObject){return{with:function(behavior){return Array.prototype.unshift.call(arguments,hostObject),behavior.apply(null,arguments)}}},withHost:function(hostObject){return{behave:function(behavior){if("function"!=typeof behavior)throw"Behavior is not a function: "+behavior;return function(){return Array.prototype.unshift.call(arguments,hostObject),behavior.apply(null,arguments)}}}},isNumber:function(o){return!isNaN(o-0)&&null!==o&&""!==o&&o!==!1},parseHTML:function(htmlString){var container=document.createElement("div");return container.style.position="absolute",container.style.opacity="0",container.innerHTML=htmlString,document.querySelector("body").appendChild(container),document.querySelector("body").removeChild(container),Array.prototype.slice.call(container.childNodes)},serialize:function(obj,prefix){var p,str=[];for(p in obj)if(obj.hasOwnProperty(p)){var k=prefix?prefix+"["+p+"]":p,v=obj[p];str.push(null!==v&&"object"==typeof v?serialize(v,k):encodeURIComponent(k)+"="+encodeURIComponent(v))}return str.join("&")}}}(Galaxy),function(){var Field={lifecycle:{created:function(){var element=this,input=this.querySelectorAll("input, textarea, select");input.length>1&&console.warn("Only one input field is allowed inside system-field",this),element.xtag._input=this.querySelectorAll("input, textarea, select")[0],element.xtag._input&&(element.setEmptiness(),element.xtag._input.addEventListener("focus",function(){element.setAttribute("focus",""),element.setEmptiness()}),element.xtag._input.addEventListener("blur",function(){element.removeAttribute("focus")}),element.xtag._input.onchange=function(e){element.setEmptiness()},element.xtag._input.addEventListener("input",function(e){element.setEmptiness()}))},inserted:function(){var tag=this;tag.xtag.observer=setInterval(function(){tag.xtag._input.value!==tag.xtag.oldValue&&(tag.setEmptiness(),tag.xtag.oldValue=tag.xtag._input.value)},250),tag.setEmptiness()},removed:function(){clearInterval(this.xtag.observer)}},accessors:{},events:{},methods:{setEmptiness:function(){var element=this;element.xtag._input.value||"file"===element.xtag._input.type?element.removeAttribute("empty"):element.setAttribute("empty","")}}};xtag.register("system-field",Field)}(),function(){var FloatMenu={lifecycle:{created:function(){var _this=this;_this.xtag.indicator=_this.querySelector("[indicator]")||_this.getElementsByTagName("div")[0],_this.xtag.actionsContainer=_this.querySelector("[actions]")||_this.getElementsByTagName("div")[1];var expand=function(e){e.stopPropagation(),e.preventDefault(),_this.expanded||(_this.expand(),window.addEventListener("touchstart",contract))},contract=function(e){e.stopPropagation(),e.preventDefault(),_this.expanded&&_this.contract(),window.removeEventListener("touchstart",contract)};_this.addEventListener("mouseenter",expand),_this.addEventListener("touchstart",expand),_this.addEventListener("mouseleave",contract),this.style.position="absolute",this.xtag.originClassName=this.className,this.xtag.observer=new MutationObserver(function(mutations){_this.xtag.actionsContainer.children.length?_this.on():_this.off()})},inserted:function(){var _this=this;_this.xtag.observer.observe(_this.xtag.actionsContainer,{attributes:!1,childList:!0,characterData:!1}),_this.children.length?_this.on():_this.off()},removed:function(){this.off(!0)}},accessors:{position:{attribute:{}},parent:{attribute:{}},onAttached:{attribute:{},set:function(value){this.xtag.onAttached=value},get:function(value){return this.xtag.onAttached}}},methods:{expand:function(){this.expanded||(this.expanded=!0,Galaxy.ui.utility.addClass(this,"expand"))},contract:function(){this.expanded=!1,Galaxy.ui.utility.removeClass(this,"expand")},on:function(flag){Galaxy.ui.utility.removeClass(this,"off")},off:function(flag){Galaxy.ui.utility.addClass(this,"off")},clean:function(){this.innerHTML=""}},events:{}};xtag.register("system-float-menu",FloatMenu)}(),function(){var InputJson={lifecycle:{created:function(){this.xtag.elementType="input",this.xtag.allFields=[],this.xtag.fields=[],this.xtag.lastField=this.createField("",""),this.xtag.active=this.xtag.lastField,this.elementType=this.xtag.elementType,this.updateFieldsCount()}},methods:{createField:function(nameValue,valueValue){var jsonInput=this,name=document.createElement("input");name.value=nameValue,name.className="name",name.placeholder="name";var value=document.createElement("input");"object"==typeof valueValue&&(value=document.createElement("system-input-json")),value.value=valueValue,value.className="value",value.placeholder="value",value.elementType="";var field=document.createElement("p");return name.addEventListener("keyup",function(e){jsonInput.updateFieldsCount()}),name.addEventListener("focus",function(e){jsonInput.xtag.active=field}),value.addEventListener("keyup",function(e){jsonInput.updateFieldsCount()}),value.addEventListener("focus",function(e){jsonInput.xtag.active=field}),field._name=name,field.appendChild(name),field.appendChild(value),this.xtag.allFields.push({name:name,value:value,field:field}),this.appendChild(field),{name:name,value:value,field:field}},updateFieldsCount:function(){var jsonInput=this,newFields=[];this.xtag.fields=[],this.xtag.allFields.forEach(function(item){if(!item.name.value&&(!item.value.value||0===Object.keys(item.value.value).length)&&item.field.parentNode&&item.field!==jsonInput.xtag.lastField.field)return void item.field.parentNode.removeChild(item.field);if("INPUT"===item.value.nodeName&&"{}"===item.value.value){var json=document.createElement("system-input-json");json.className="value",item.field.replaceChild(json,item.value),item.value=json,json.focus()}item.field!==jsonInput.xtag.lastField.field&&jsonInput.xtag.fields.push(item),newFields.push(item)}),this.xtag.allFields=newFields,jsonInput.xtag.lastField.name&&!jsonInput.xtag.lastField.name.value||(jsonInput.xtag.lastField=this.createField("","")),jsonInput.xtag.active&&jsonInput.xtag.active.parentNode?jsonInput.xtag.active.focus():jsonInput.xtag.lastField.name.focus()},focus:function(){this.xtag.allFields[this.xtag.allFields.length-1].name.focus()}},accessors:{value:{set:function(data){var jsonInput=this;if(jsonInput.xtag.allFields&&jsonInput.xtag.allFields.forEach(function(item){item.field.parentNode&&item.field.parentNode.removeChild(item.field)}),jsonInput.xtag.allFields=[],jsonInput.xtag.fields=[],"string"==typeof data&&(data=JSON.parse(data)),"object"==typeof data){if(0===Object.keys(data).length)jsonInput.xtag.lastField=jsonInput.createField("",""),jsonInput.xtag.allFields.push(jsonInput.xtag.lastField);else{for(var key in data)data.hasOwnProperty(key)&&(jsonInput.xtag.lastField=jsonInput.createField(key,data[key]),jsonInput.xtag.allFields.push(jsonInput.xtag.lastField));jsonInput.xtag.lastField={}}jsonInput.updateFieldsCount()}},get:function(){var value={};return this.xtag.fields.forEach(function(item){""!==item.name.value&&(value[item.name.value]=item.value.value)}),value}},elementType:{attribute:{},set:function(value){this.xtag.elementType=value},get:function(){return this.xtag.elementType}}}};xtag.register("system-input-json",InputJson)}(),function(){var List={lifecycle:{created:function(){this.template=this.innerHTML,this.xtag.selectedStyle="selected",this.xtag.action="[item]",this.innerHTML="",this.links={},this.data=[],this.value=-1},inserted:function(){},attributeChanged:function(attrName,oldValue,newValue){}},methods:{render:function(data,action){this.innerHTML="";for(var selectableItem=null,i=0,len=data.length;i<len;i++){var item=xtag.createFragment(Galaxy.ui.utility.populate(this.template,data[i]));action&&(selectableItem=xtag.query(item,action)[0],selectableItem&&(selectableItem.dataset.index=i,selectableItem.setAttribute("item",""),data[i].id&&(this.links[data[i].id]=selectableItem),this.links[i]=selectableItem)),this.appendChild(item)}},selectItem:function(i,element){var oldItem=this.links[this.xtag.value];oldItem&&Galaxy.ui.utility.removeClass(oldItem,this.xtag.selectedStyle);var newItem=this.links[i];this.data[i].id&&(newItem=this.links[this.data[i].id]),Galaxy.ui.utility.addClass(newItem,this.xtag.selectedStyle),xtag.fireEvent(this,"item-selected",{detail:{index:i,data:this.xtag.data[i],element:element}})}},accessors:{data:{set:function(value){this.value=-1,"object"!=typeof value&&(this.xtag.data=[],value=[]);var toRender=value;this.xtag.data=value,this.onSetData&&this.onSetData(toRender),this.render(toRender,this.xtag.action)},get:function(){return this.xtag.data}},onSetData:{attribute:{validate:function(value){return this.xtag.onSetData=value,"[ function ]"}},set:function(value){},get:function(value){return this.xtag.onSetData}},selectedStyle:{attribute:{},set:function(value){this.xtag.selectedStyle=value},get:function(){return this.xtag.selectedStyle}},value:{attribute:{},set:function(value,oldValue){value!==oldValue&&(value=parseInt(value),value>-1&&this.xtag.data.length&&this.selectItem(value,this.links[value]),this.xtag.value=value)},get:function(){return this.xtag.value}},action:{attribute:{},set:function(value){this.xtag.action=value},get:function(){return this.xtag.action}}},events:{"click:delegate([item])":function(e){e.preventDefault(),e.currentTarget.value=this.dataset.index},"tap:delegate([item])":function(e){e.preventDefault(),e.currentTarget.value=this.dataset.index}}};xtag.register("system-list",List)}(),function(){var SortableList={lifecycle:{created:function(){this.xtag.placeHolder=document.createElement("li"),this.xtag.placeHolder.className+="placeholder",this.xtag.glass=document.createElement("div"),this.xtag.glass.style.position="absolute",this.xtag.glass.style.width="100%",this.xtag.glass.style.height="100%",this.style.overflow="hidden",this.isValidParent=function(){return!0},this.onDrop=function(){}},inserted:function(){},removed:function(){}},events:{mousedown:function(event){},"mousedown:delegate(.handle)":function(e){var dim=this.getBoundingClientRect();e.currentTarget.xtag.initDragPosition={x:e.pageX-dim.left,y:e.pageY-dim.top};for(var draggedItem=this;"li"!==draggedItem.tagName.toLowerCase();)draggedItem=draggedItem.parentNode;var diDimension=draggedItem.getBoundingClientRect();e.currentTarget.xtag.draggedItem=draggedItem,draggedItem.style.position="fixed",draggedItem.style.width=diDimension.width+"px",draggedItem.style.height=diDimension.height+"px",e.currentTarget.xtag.glass.width=diDimension.width+"px",e.currentTarget.xtag.glass.height=diDimension.height+"px",draggedItem.appendChild(e.currentTarget.xtag.glass),Galaxy.ui.utility.addClass(draggedItem,"dragged"),e.stopPropagation(),e.preventDefault()},"mouseup:delegate(.handle)":function(e){e.stopPropagation(),e.preventDefault()},mousemove:function(event){if(this.xtag.draggedItem){for(var groups=this.querySelectorAll("ul"),groupDim=[],i=0,len=groups.length;i<len;i++)groupDim.push(groups[i].getBoundingClientRect());for(var parent=null,index=0,indexElement=null,i=groupDim.length-1;i>=0;i--){var parentDim=groupDim[i];if(event.pageX>parentDim.left&&event.pageX<parentDim.right&&event.pageY>parentDim.top&&event.pageY<parentDim.bottom){parent=groups[i];for(var children=parent.childNodes||[],childElements=[],n=0;n<children.length;n++)"li"===children[n].tagName.toLowerCase()&&children[n]!==this.xtag.draggedItem&&childElements.push(children[n]);for(n=childElements.length-1;n>=0;n--)if("placeholder"!==childElements[n].className){var childDim=childElements[n].getBoundingClientRect();if(event.pageY>childDim.top&&event.pageY<childDim.top+childDim.height/2){index=n,indexElement=childElements[index];break}if(event.pageY>=childDim.top+childDim.height/2){index=n+1,
indexElement=childElements[index];break}indexElement=this.xtag.tempIndexElement}break}}this.xtag.draggedItem.style.left=event.pageX-this.xtag.initDragPosition.x+"px",this.xtag.draggedItem.style.top=event.pageY-this.xtag.initDragPosition.y+"px",!parent||this.xtag.tempParent===parent&&this.xtag.tempIndexElement===indexElement||(this.xtag.tempParent=parent,this.xtag.tempIndex=index,this.xtag.tempIndexElement=indexElement,this.isValidParent(this.xtag.draggedItem,parent,this.xtag.tempIndex)&&(indexElement&&indexElement.parentNode===parent?parent.insertBefore(this.xtag.placeHolder,indexElement):indexElement||parent.insertBefore(this.xtag.placeHolder,indexElement)))}},mouseup:function(event){this.xtag.draggedItem&&(this.xtag.draggedItem.style.position="",this.xtag.draggedItem.style.width="",this.xtag.draggedItem.style.height="",this.xtag.draggedItem.style.left="",this.xtag.draggedItem.style.top="",this.xtag.draggedItem.removeChild(this.xtag.glass),Galaxy.ui.utility.removeClass(this.xtag.draggedItem,"dragged"),this.xtag.placeHolder.parentNode&&(this.onDrop(this.xtag.draggedItem,this.xtag.tempParent,this.xtag.tempIndex),this.xtag.placeHolder.parentNode.replaceChild(this.xtag.draggedItem,this.xtag.placeHolder)),this.xtag.draggedItem=null,this.xtag.tempParent=null,this.xtag.tempIndex=null),event.preventDefault(),event.stopPropagation()}}};xtag.register("system-sortable-list",SortableList)}(),function(){var Spirit={lifecycle:{created:function(){var element=this;element.xtag.animations=[],element.xtag.registeredAnimations=[],this.xtag.cachedAnimations=this.getAttribute("animations")},attributeChanged:function(attrName,oldValue,newValue){},inserted:function(){this.xtag.cachedAnimations&&!this.xtag.animations.length&&(this.setAttribute("animations",this.xtag.cachedAnimations),this.xtag.cachedAnimations=null,this.prepare())},removed:function(){this.xtag.cachedAnimations=xtag.clone(this.xtag.animations).join(","),this.xtag.animations=[],this.prepare()}},accessors:{animations:{attribute:{},set:function(value){var element=this;"string"==typeof value?this.xtag.animations=value.split(/[\s,]+/).filter(Boolean):this.xtag.animations=[],element.prepare()},get:function(){return this.xtag.animations}}},events:{},methods:{prepare:function(){var element=this;this.xtag.animations.forEach(function(item){return element.xtag.registeredAnimations.indexOf(item)!==-1?null:Galaxy.spiritAnimations[item]?(Galaxy.spiritAnimations[item].register(element),void element.xtag.registeredAnimations.push(item)):console.warn("spirit animation not found:",item)}),this.xtag.registeredAnimations=this.xtag.registeredAnimations.filter(function(item){return element.xtag.animations.indexOf(item)!==-1||(Galaxy.spiritAnimations[item].deregister(element),!1)})}}};xtag.register("system-spirit",Spirit)}(),function(){var SwitchButton={lifecycle:{created:function(){this.xtag.active=!1},inserted:function(){},removed:function(){},attributeChanged:function(attrName,oldValue,newValue){}},accessors:{name:{attribute:{}},module:{attribute:{}},active:{attribute:{},set:function(value){xtag.fireEvent(this,"switched",{detail:{active:Boolean(value)},bubbles:!0,cancelable:!0}),this.xtag.active=Boolean(value)},get:function(){return this.xtag.active}}},events:{click:function(event){this.xtag.active?event.currentTarget.removeAttribute("active"):event.currentTarget.setAttribute("active","true")}}};xtag.register("system-button-switch",SwitchButton)}(),function(){var UITemplate={lifecycle:{created:function(){if(this.xtag.validate=!1,this.xtag.show=!0,!this.name)throw"system-ui-view missing the `name` attribute";this.xtag.placeholder=document.createComment(" "+this.module+"/"+this.name+" ")},inserted:function(){return this.xtag.validate?void(this.xtag.originalParent=this.parentNode):(this.xtag.originalParent=this.parentNode,this.xtag.showWhenAdded?(this.xtag.showWhenAdded=null,void this.show()):void 0)},removed:function(){this.xtag.validate=!1}},methods:{show:function(){return this.xtag.validate=!0,this.xtag.shouldBeShown=!0,this.xtag.originalParent?void(this.xtag.placeholder.parentNode&&this.xtag.originalParent.replaceChild(this,this.xtag.placeholder)):void(this.xtag.showAsSoonAsAdded=!0)},hide:function(){this.xtag.originalParent=this.parentNode,this.xtag.originalParent.replaceChild(this.xtag.placeholder,this)}},accessors:{name:{attribute:{}},module:{attribute:{}},validate:{attribute:{},set:function(value){this.xtag.validate=value},get:function(value){return this.xtag.validate}}}};xtag.register("system-ui-view",UITemplate)}();