!function(){function System(){this.stateKey="app",this.registry={},this.modules={},this.activities={},this.uiTemplates={},this.onLoadQueue=[],this.notYetStarted=[],this.activeRequests={},this.onModuleLoaded={},this.services={},this.modulesHashes={},this.hashChecker=null,this.firstTime=!1,this.scopeServices=[],this.inited=!1,this.app=null}Galaxy=new System,Galaxy.GalaxySystem=System;var importedLibraries={};System.prototype.state=function(id,handler){var module,modulePath,moduleNavigation,domain=this;if(!domain)throw"Domain can NOT be null";return id=this.app.id+"/"+id,handler?domain.modules[id]?domain.modules[id]:("function"==typeof handler?(module=new Galaxy.GalaxyModule,module.domain=domain,module.id=id,module.stateId=id.replace("system/",""),handler.call(null,module)):(module=Galaxy.utility.extend(new Galaxy.GalaxyModule,handler||{}),module.domain=domain,module.id=id,module.stateId=id.replace("system/","")),modulePath=domain.app.navigation[module.stateKey]?domain.app.navigation[module.stateKey]:[],moduleNavigation=Galaxy.utility.extend(!0,{},domain.app.navigation),moduleNavigation[module.stateKey]=modulePath.slice(id.split("/").length-1),domain.modules[id]=module,domain.notYetStarted.push(id),module.init(moduleNavigation,domain.app.params),module):(domain.notYetStarted.push(id),domain.modules[id])},System.prototype.newStateHandler=function(scope,handler){var app=this.getHashParam("app");return 0===app.indexOf(scope._stateId)?this.state(scope._stateId,handler):(scope._doNotRegister=!0,null)},System.prototype.on=function(id,handler){this.app.on.call(this.app,id,handler)},System.prototype.start=function(){var _this=this;if(!_this.inited)throw new Error("Galaxy is not initialized");var detect=function(){if(_this.app.oldHash!==window.location.hash||_this.app.newListener){var parsedHash=_this.parseHash(window.location.hash);_this.setModuleHashValue(parsedHash.navigation,parsedHash.params,parsedHash.hash),_this.app.hashChanged(parsedHash.navigation,parsedHash.params,parsedHash.hash,parsedHash.navigation[_this.app.stateKey]),_this.app.oldHash="#"+parsedHash.hash,_this.app.newListener=!1}};detect(),clearInterval(this.hashChecker),this.hashChecker=setInterval(function(){detect()},50)},System.prototype.parseHash=function(hash){var navigation={},params={};return hash=hash.replace(/^#\/?/gim,""),hash.replace(/([^&]*)=([^&]*)/g,function(m,k,v){navigation[k]=v.split("/").filter(Boolean),params[k]=v}),{hash:hash,navigation:navigation,params:params}},System.prototype.init=function(mods){if(this.inited)throw new Error("Galaxy is initialized already");var app=new Galaxy.GalaxyModule;this.app=app,app.domain=this,app.stateKey=this.stateKey,app.id="system",app.installModules=mods||[],app.init({},{},"system"),app.oldHash=window.location.hash,app.params=this.parseHash(window.location.hash).params,this.inited=!0};var CONTENT_PARSERS={};CONTENT_PARSERS["text/html"]=function(content){for(var scripts=[],imports=[],raw=Galaxy.utility.parseHTML(content),html=raw.filter(function(e){if(e.nodeType===Node.ELEMENT_NODE){var scriptTags=Array.prototype.slice.call(e.querySelectorAll("script"));scriptTags.forEach(function(tag){scripts.push(tag.innerHTML),tag.parentNode.removeChild(tag)})}return e.tagName&&"script"===e.tagName.toLowerCase()?(scripts.push(e.innerHTML),!1):!e.tagName||"import"!==e.tagName.toLowerCase()||(imports.push({name:e.getAttribute("name"),from:e.getAttribute("from"),fresh:e.hasAttribute("fresh")}),!1)}),temp=document.createElement("div"),i=0,len=html.length;i<len;i++)html[i]=temp.appendChild(html[i]);document.getElementsByTagName("body")[0].appendChild(temp);var uiView=temp.querySelectorAll("ui-view,[ui-view]");return temp.parentNode.removeChild(temp),{html:html,imports:imports,views:uiView,script:scripts.join("\n")}};var javascriptParser=function(content){return{html:[],imports:[],views:[],script:content}};CONTENT_PARSERS["text/javascript"]=javascriptParser,CONTENT_PARSERS["application/javascript"]=javascriptParser,System.prototype.parseModuleContent=function(module,content,contentType){var parser=CONTENT_PARSERS[contentType.toLowerCase()];return parser?parser(content):(console.log("Resource is not a valid html file:",module.url,contentType),{html:[],imports:[],views:[],script:""})},System.prototype.load=function(module,onDone){function compile(moduleContent){var scopeUIViews={};Array.prototype.forEach.call(moduleContent.views,function(node,i){var uiViewName=node.getAttribute("ui-view");scopeUIViews[uiViewName||"view_"+i]=node});var scope={_moduleId:"system/"+module.id,_stateId:module.id,parentScope:module.scope||null,html:moduleContent.html,views:scopeUIViews,imports:{}},imports=Array.prototype.slice.call(moduleContent.imports,0),scriptContent=moduleContent.script||"";if(scriptContent=scriptContent.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm,""),moduleContent.script=scriptContent.replace(/Scope\.import\(['|"](.*)['|"]\)\;/gm,function(match,path){var query=path.match(/([\S]+)/gm);return imports.push({url:query[query.length-1],fresh:query.indexOf("new")!==-1}),"Scope.imports['"+query[query.length-1]+"']"}),imports.length){var importsCopy=imports.slice(0);return imports.forEach(function(item,i){var scopeService=Galaxy.getScopeService(item.url);scopeService?(importedLibraries[item.url]={name:item.url,module:scopeService.handler.call(null,moduleContent)},doneImporting(module,scope,importsCopy,moduleContent)):importedLibraries[item.url]&&!item.fresh?doneImporting(module,scope,importsCopy,moduleContent):Galaxy.load({id:(new Date).valueOf()+"-"+performance.now(),name:item.name,url:item.url,fresh:item.fresh,scope:scope,invokers:invokers,temprory:!0},function(loaded){doneImporting(module,scope,importsCopy,moduleContent)})}),!1}moduleLoaded(module,scope,moduleContent)}function doneImporting(module,scope,imports,moduleContent){imports.splice(imports.indexOf(module.url)-1,1),0===imports.length&&moduleLoaded(module,scope,moduleContent)}function moduleLoaded(module,scope,filtered){for(var item in importedLibraries)if(importedLibraries.hasOwnProperty(item)){var asset=importedLibraries[item];scope.imports[asset.name]=asset.module}var html=document.createDocumentFragment();scope.html.forEach(function(item){html.appendChild(item)}),scope.html=html,html._scope=scope;var currentComponentScripts=filtered.script;delete filtered.script;var componentScript=new Function("Scope",currentComponentScripts);componentScript.call(null,scope);for(var htmlNodes=[],i=0,len=html.childNodes.length;i<len;i++)htmlNodes.push(html.childNodes[i]);scope.html=htmlNodes,importedLibraries[module.url]?module.fresh?importedLibraries[module.url].module=scope.export:scope.imports[module.name]=importedLibraries[module.url].module:importedLibraries[module.url]={name:module.name||module.url,module:scope.export};var currentModule=Galaxy.modules["system/"+module.id];module.temprory||scope._doNotRegister?(delete scope._doNotRegister,currentModule={}):currentModule||(currentModule=Galaxy.modules["system/"+module.id]={}),currentModule.scope=scope,"function"==typeof Galaxy.onModuleLoaded["system/"+module.id]&&(Galaxy.onModuleLoaded["system/"+module.id].call(this,currentModule,scope.html),delete Galaxy.onModuleLoaded["system/"+module.id]),delete Galaxy.onLoadQueue["system/"+module.id]}var _this=this;module.id=module.id||(new Date).valueOf()+"-"+performance.now(),Galaxy.onModuleLoaded["system/"+module.id]=onDone;var moduleExist=Galaxy.modules["system/"+module.id],invokers=[module.url];if(module.invokers){if(module.invokers.indexOf(module.url)!==-1)throw new Error("circular dependencies: \n"+module.invokers.join("\n")+"\nwanna load: "+module.url);invokers=module.invokers,invokers.push(module.url)}return moduleExist?void("function"==typeof Galaxy.onModuleLoaded["system/"+module.id]&&window.requestAnimationFrame(function(){Galaxy.onModuleLoaded["system/"+module.id].call(this,moduleExist,moduleExist.scope.html),delete Galaxy.onModuleLoaded["system/"+module.id]})):void(Galaxy.onLoadQueue["system/"+module.id]||(Galaxy.onLoadQueue["system/"+module.id]=!0,nanoajax.ajax({method:"GET",url:module.url,body:Galaxy.utility.serialize(module.params||{})},function(code,response,meta){var contentType=(meta.getResponseHeader("content-type").split(";")[0]+"").trim()||"text/html",parsedContent=_this.parseModuleContent(module,response,contentType);window.requestAnimationFrame(function(){compile(parsedContent)})})))},System.prototype.setURLHash=function(hash){hash=hash.replace(/^#\/?/gim,"");var navigation={},params={};hash.replace(/([^&]*)=([^&]*)/g,function(m,k,v){navigation[k]=v.split("/").filter(Boolean),params[k]=v})},System.prototype.getHashParam=function(key,hashName){var asNumber=parseFloat(this.app.params[key]);return asNumber||this.app.params[key]||null},System.prototype.getHashNav=function(key,hashName){return this.app.navigation[key]||[]},System.prototype.setModuleHashValue=function(navigation,parameters,hashValue,init){var nav=parameters[this.stateKey];nav&&(Galaxy.modulesHashes[nav]&&Galaxy.app.activeModule!==Galaxy.modules["system/"+nav]&&Galaxy.app.activeModule&&"app"===Galaxy.app.activeModule.stateKey||(this.firstTime?Galaxy.modulesHashes[nav]?Galaxy.modulesHashes[nav]&&(Galaxy.modulesHashes[nav]=hashValue):Galaxy.modulesHashes[nav]="app="+nav:(Galaxy.modulesHashes[nav]=hashValue,this.firstTime=!0)))},System.prototype.setHashParameters=function(parameters,replace,clean){var newParams=Galaxy.utility.clone(parameters);this.lastHashParams=parameters;var hashValue=window.location.hash,nav=parameters.app;nav&&!Galaxy.modulesHashes[nav]?Galaxy.modulesHashes[nav]=hashValue="app="+nav:nav&&Galaxy.modulesHashes[nav]&&(hashValue=Galaxy.modulesHashes[nav]),hashValue.indexOf("#")!==-1&&(hashValue=hashValue.substring(1));var newHash=(hashValue.split("&"),"#"),and=!1;hashValue.replace(/([^&]*)=([^&]*)/g,function(m,k,v){null!==newParams[k]&&"undefined"!=typeof newParams[k]?(newHash+=k+"="+newParams[k],newHash+="&",and=!0,delete newParams[k]):newParams.hasOwnProperty(k)||clean||(newHash+=k+"="+v,newHash+="&",and=!0)});for(var key in newParams)if(newParams.hasOwnProperty(key)){var value=newParams[key];key&&value&&(newHash+=key+"="+value+"&")}newHash=newHash.replace(/\&$/,""),replace?window.location.replace((""+window.location).split("#")[0]+newHash):window.location.hash=newHash.replace(/\&$/,"")},System.prototype.setParamIfNull=function(param,value){this.app.setParamIfNull(param,value)},System.prototype.loadDependecies=function(dependecies){for(var key in dependecies);},System.prototype.getScopeService=function(name){return this.scopeServices.filter(function(service){return service.name===name})[0]},System.prototype.registerScopeService=function(name,handler){if("function"!=typeof handler)throw"scope service should be a function";this.scopeServices.push({name:name,handler:handler})},System.prototype.boot=function(bootModule,onDone){var _this=this;_this.init(),_this.load(bootModule,function(module){onDone.call(null,module),_this.start()})}}(),function(galaxy){function GalaxyUI(){this.DEFAULTS={animationDuration:1},this.COMPONENT_STRUCTURE={el:null,events:{},on:function(event,handler){this.events[event]=handler},trigger:function(event){this.events[event]&&this.events[event].apply(this,Array.prototype.slice.call(arguments,1))}},this.body=document.getElementsByTagName("body")[0]}galaxy.GalaxyUI=GalaxyUI,galaxy.ui=new galaxy.GalaxyUI,GalaxyUI.prototype.utility={viewRegex:/\{\{([^\{\}]*)\}\}/g},GalaxyUI.prototype.utility.populate=function(template,data){return template=template.replace(this.viewRegex,function(match,key){return eval("data."+key)||""})},GalaxyUI.prototype.utility.hasClass=function(element,className){return element.classList?element.classList.contains(className):new RegExp("(^| )"+className+"( |$)","gi").test(element.className)},GalaxyUI.prototype.utility.addClass=function(el,className){el&&(el.classList?el.classList.add(className):el.className+=" "+className)},GalaxyUI.prototype.utility.removeClass=function(el,className){el&&(el.classList?el.classList.remove(className):el.className=el.className.replace(new RegExp("(^|\\b)"+className.split(" ").join("|")+"(\\b|$)","gi")," "))},GalaxyUI.prototype.utility.toTreeObject=function(element){var jsTree={_:element,_children:[]},indexIndicator={};for(var index in element.childNodes){var node=element.childNodes[index];if(node.nodeType===Node.ELEMENT_NODE){var key=node.nodeName.toLowerCase();indexIndicator[key]?(indexIndicator[key]++,jsTree[key+"_"+indexIndicator[key]]=galaxy.ui.utility.toTreeObject(node)):(indexIndicator[key]=1,jsTree[node.nodeName.toLowerCase()]=galaxy.ui.utility.toTreeObject(node)),jsTree._children.push(node)}}return jsTree},GalaxyUI.prototype.utility.getContentHeight=function(element,withPaddings){for(var height=0,children=element.children,index=0,length=children.length;index<length;index++)if(!children[index].__ui_neutral){var cs=window.getComputedStyle(children[index],null);if("absolute"!==cs.position){var dimension=children[index].offsetTop+children[index].offsetHeight,marginBottom=parseInt(cs.marginBottom||0);height=dimension+marginBottom>height?dimension+marginBottom:height}}return withPaddings&&(height+=parseInt(window.getComputedStyle(element).paddingBottom||0)),height},GalaxyUI.prototype.setContent=function(parent,nodes){var parentNode=parent;if("string"==typeof parent&&(parentNode=document.querySelector(parent)),!parentNode)throw new Error("parent element can not be null: "+parent+"\r\n try to set ui-view on your target element and refrence it via Scope.views");var children=Array.prototype.slice.call(parentNode.childNodes);children.forEach(function(child){parentNode.removeChild(child)}),nodes.hasOwnProperty("length")||(nodes=[nodes]);for(var i=0,len=nodes.length;i<len;i++){var item=nodes[i];parentNode.appendChild(item)}},GalaxyUI.prototype.clone=function(obj){var target={};for(var i in obj)obj.hasOwnProperty(i)&&(target[i]=obj[i]);return target},GalaxyUI.prototype.getCenterPoint=function(rect){document.activeElement.getBoundingClientRect();return{left:rect.left+rect.width/2,top:rect.top+rect.height/2}},GalaxyUI.prototype.animations={}}(Galaxy),function(){function Helpers(){}Galaxy.GalaxyHelpers=Helpers,Galaxy.helpers=new Galaxy.GalaxyHelpers,Helpers.prototype.loadModuleInto=function(module,element){Galaxy.load(module,function(module){Galaxy.ui.setContent(element,module.scope.html),module.start&&module.start()})}}(),function(galaxy){function GalaxyModule(){this.domain=null,this.inited=!1,this.started=!1,this.active=!1,this.stateKey="app",this.navigation={},this.params={},this.html="",this.installModules=[],this.binds={},this.newListener=!1,this.onInit=null,this.onStart=null,this.onStop=null,this.hashListeners=[],this.globalHashListeners=[],this.data={}}galaxy.GalaxyModule=GalaxyModule,galaxy.module=new galaxy.GalaxyModule,GalaxyModule.prototype.installModulesOnInit=function(modules){this.installModules=modules},GalaxyModule.prototype.init=function(navigations,params,html){var _this=this;this.inited=!0,this.trigger("onInit"),this.installModules.forEach(function(lib){_this.domain.loadModule(lib)})},GalaxyModule.prototype.start=function(){if(this.started=!0,this.active=!0,this.trigger("onStart"),("system/"+this.domain.app.params[this.stateKey]).indexOf(this.id)<=-1)throw console.log(this.domain.app.params[this.stateKey]),new Error("Could not find module `"+this.id+"` by state key `"+this.stateKey+"`");var newNav=galaxy.utility.extend(!0,{},this.domain.app.navigation),st="system/"+this.domain.app.params[this.stateKey],napPath=0===st.indexOf(this.id)?st.substr(this.id.length).split("/").filter(Boolean):[];newNav[this.stateKey]=napPath;var nav=newNav,params=this.domain.app.params;this.navigation={},this.params={},this.hashChanged(nav,params,this.hash,this.domain.getHashNav(this.stateKey));var index=this.domain.notYetStarted.indexOf(this.id);index>-1&&this.domain.notYetStarted.splice(index,1)},GalaxyModule.prototype.dispose=function(){},GalaxyModule.prototype.on=function(id,handler){this.hashListeners.push({id:id,handler:handler}),this.newListener=!0},GalaxyModule.prototype.onGlobal=function(id,handler){this.globalHashListeners.push({id:id,handler:handler})},GalaxyModule.prototype.getNav=function(key){return this.domain.getHashNav(key)},GalaxyModule.prototype.setNav=function(value,key){var pathKey=key||"app",pathValue=null===value||void 0===value?"":value;this.setParam(pathKey,(this.id+"/").replace("system/","")+pathValue)},GalaxyModule.prototype.getParam=function(key){return this.domain.getHashParam(key)},GalaxyModule.prototype.setParam=function(key,value,replace){var paramObject={};paramObject[key]=value,this.domain.setHashParameters(paramObject,replace)},GalaxyModule.prototype.setParamIfNull=function(param,value){if(!this.domain.getHashParam(param)){var paramObject={};paramObject[param]=value,this.domain.setHashParameters(paramObject,!0)}},GalaxyModule.prototype.setParamIfNot=function(param,value){if(this.domain.getHashParam(param)!==value){var paramObject={};paramObject[param]=value,this.domain.setHashParameters(paramObject,!0)}},GalaxyModule.prototype.bind=function(event,action){"string"==typeof event&&"function"==typeof action&&(this.binds[event]=action)},GalaxyModule.prototype.stage=function(event,action){"string"==typeof event&&"function"==typeof action&&(this.binds[event]=action)},GalaxyModule.prototype.trigger=function(event,args){"function"==typeof this[event]&&this[event].apply(this,args)},GalaxyModule.prototype.hashChanged=function(navigation,params,hashValue,fullNav){var _this=this,moduleNavigation=navigation,fullNavPath=params[_this.stateKey];this.id==="system/"+fullNavPath?(this.domain.app.activeModule=this,this.domain.app.activeModule.active=!0):this.solo||(this.domain.app.activeModule&&this.domain.app.activeModule.active&&this.domain.app.activeModule.trigger("onStop"),this.domain.app.activeModule=null,this.active=!1),this.hashHandler.call(this,navigation,params);var allNavigations=galaxy.utility.extend({},this.navigation,navigation),tempNav=_this.navigation;if(_this.navigation=navigation,_this.params=params,this.domain.app.activeModule&&this.active&&this.domain.app.activeModule.id===_this.id){for(var key in allNavigations)if(allNavigations.hasOwnProperty(key)){var stateHandlers=_this.hashListeners.filter(function(item){return item.id===key});if(stateHandlers.length){if(tempNav[key]){var currentKeyValue=tempNav[key].join("/");if(navigation[key]&&currentKeyValue===navigation[key].join("/"))continue}var parameters=[];parameters.push(null);var navigationValue=navigation[key];if(navigationValue){parameters[0]=navigationValue.join("/");for(var i=0;i<navigationValue.length;i++){var arg=galaxy.utility.isNumber(navigationValue[i])?parseFloat(navigationValue[i]):navigationValue[i];parameters.push(arg)}}stateHandlers.forEach(function(item){item.handler.apply(_this,parameters)})}}}else if(!this.active){var keyStateHandlers=_this.hashListeners.filter(function(item){return item.id===_this.stateKey}),stateKeyNavigationValue=navigation[_this.stateKey];if(keyStateHandlers.length&&stateKeyNavigationValue){var currentKeyValue=tempNav[_this.stateKey]?tempNav[_this.stateKey].join("/"):[];if(currentKeyValue!==stateKeyNavigationValue.join("/")){var args=[];args.push(stateKeyNavigationValue);for(var i=0,len=stateKeyNavigationValue.length;i<len;++i)args.push(stateKeyNavigationValue[i]);keyStateHandlers.forEach(function(item){item.handler.apply(_this,args)})}}}for(var key in allNavigations)if(allNavigations.hasOwnProperty(key)){var globalStateHandlers=_this.globalHashListeners.filter(function(item){return item.id===key});if(globalStateHandlers.length){if(tempNav[key]){var currentKeyValue=tempNav[key].join("/");if(navigation[key]&&currentKeyValue===navigation[key].join("/"))continue}if(parameters=[],parameters.push(null),navigationValue=navigation[key]){parameters[0]=navigationValue.join("/");for(var i=0;i<navigationValue.length;i++){var arg=galaxy.utility.isNumber(navigationValue[i])?parseFloat(navigationValue[i]):navigationValue[i];parameters.push(arg)}}globalStateHandlers.forEach(function(item){item.handler.apply(_this,parameters)})}}navigation[this.stateKey]&&this.domain.modules[this.id+"/"+navigation[this.stateKey][0]]&&(this.activeModule=this.domain.modules[this.id+"/"+navigation[this.stateKey][0]]),this.activeModule&&this.activeModule.id===this.id+"/"+navigation[this.stateKey][0]&&(moduleNavigation=galaxy.utility.extend(!0,{},navigation),moduleNavigation[this.stateKey]=fullNav.slice(this.activeModule.id.split("/").length-1),this.activeModule.hashChanged(moduleNavigation,this.params,hashValue,fullNav))},GalaxyModule.prototype.loadModule=function(module,onDone){galaxy.loadModule(module,onDone,this.scope)},GalaxyModule.prototype.hashHandler=function(nav,params){}}(Galaxy),!function(t,e){function n(t){return t&&e.XDomainRequest&&!/MSIE 1/.test(navigator.userAgent)?new XDomainRequest:e.XMLHttpRequest?new XMLHttpRequest:void 0}function o(t,e,n){t[e]=t[e]||n}var r=["responseType","withCredentials","timeout","onprogress"];t.ajax=function(t,a){function s(t,e){return function(){c||(a(void 0===f.status?t:f.status,0===f.status?"Error":f.response||f.responseText||e,f),c=!0)}}var u=t.headers||{},i=t.body,d=t.method||(i?"POST":"GET"),c=!1,f=n(t.cors);f.open(d,t.url,!0);var l=f.onload=s(200);f.onreadystatechange=function(){4===f.readyState&&l()},f.onerror=s(null,"Error"),f.ontimeout=s(null,"Timeout"),f.onabort=s(null,"Abort"),i&&(o(u,"X-Requested-With","XMLHttpRequest"),e.FormData&&i instanceof e.FormData||o(u,"Content-Type","application/x-www-form-urlencoded"));for(var p,m=0,v=r.length;v>m;m++)p=r[m],void 0!==t[p]&&(f[p]=t[p]);for(var p in u)f.setRequestHeader(p,u[p]);return f.send(i),f},e.nanoajax=t}({},function(){return this}()),function(galaxy){galaxy.utility={clone:function(source){if(null===source||"object"!=typeof source)return source;var copy=source.constructor();for(var property in source)source.hasOwnProperty(property)&&(copy[property]=source[property]);return copy},extend:function(out){var isDeep=!1;out===!0&&(isDeep=!0,out={});for(var i=1;i<arguments.length;i++){var obj=arguments[i];if(obj)for(var key in obj)obj.hasOwnProperty(key)&&("object"==typeof obj[key]&&isDeep?Array.isArray(obj[key])?out[key]=galaxy.utility.extend([],obj[key]):out[key]=galaxy.utility.extend({},obj[key]):out[key]=obj[key])}return out},installModuleStateHandlers:function(module,states){for(var state in states)module.on(state,states[state])},getProperty:function(obj,propString){if(!propString)return obj;for(var prop,props=propString.split("."),i=0,iLen=props.length-1;i<iLen;i++){prop=props[i];var candidate=obj[prop];if(void 0===candidate)break;obj=candidate}return obj[props[i]]},isHTML:function(str){var element=document.createElement("div");element.innerHTML=str;for(var c=element.childNodes,i=c.length;i--;)if(1===c[i].nodeType)return!0;return!1},decorate:function(hostObject){return{with:function(behavior){return Array.prototype.unshift.call(arguments,hostObject),behavior.apply(null,arguments)}}},withHost:function(hostObject){return{behave:function(behavior){if("function"!=typeof behavior)throw"Behavior is not a function: "+behavior;return function(){return Array.prototype.unshift.call(arguments,hostObject),behavior.apply(null,arguments)}}}},isNumber:function(o){return!isNaN(o-0)&&null!==o&&""!==o&&o!==!1},parseHTML:function(htmlString){var container=document.createElement("div");return container.style.position="absolute",container.style.opacity="0",container.innerHTML=htmlString,document.querySelector("body").appendChild(container),document.querySelector("body").removeChild(container),Array.prototype.slice.call(container.childNodes)},serialize:function(obj,prefix){var p,str=[];for(p in obj)if(obj.hasOwnProperty(p)){var k=prefix?prefix+"["+p+"]":p,v=obj[p];str.push(null!==v&&"object"==typeof v?serialize(v,k):encodeURIComponent(k)+"="+encodeURIComponent(v))}return str.join("&")}}}(Galaxy);