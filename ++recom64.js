var _self=self;
var instance=null;
var conInstance=null;
if (self) {
self.addEventListener('message', function(e) {
if (instance) {
instance.registerKey(e.data);
} else {
instance=new Compiled();
if(e.data=="run") {
instance.execute(true);
} else {
var comp=instance;
var cons=new CbmConsole();
conInstance=cons;
cons.inject(comp, e.data);
comp.execute(true);
}
}
}, false);
}
function executeAsync(srcFile, func, cons) {
var worker=new Worker(srcFile);
worker.addEventListener('message', func, false);
if (cons) {
worker.postMessage("console");
} else {
worker.postMessage("run");
}
return worker;
}
function CbmConsole() {
this.x=0;
this.y=0;
this.width=40;
this.height=25;
this.vidMem=new Array(1000);
this.colMem=new Array(1000);
this.bgColor=6;
this.fontColor=14;
this.map = {};
this.charset=null;
this.graphicsMode=true;
this.reverseMode=false;
this.compiledCode=null;
var _selfy=this;
this.getPokeValue = function(ch) {
if (Number.isInteger(ch)) {
ch=String.fromCharCode(ch);
}
return _selfy.charset.charCodeAt(_selfy.getConvertedChar(ch)+(_selfy.graphicsMode?0:256));
}
this.clearScreen = function() {
for (var i=0; i<_selfy.width*_selfy.height; i++) {
_selfy.vidMem[i]=32;
_selfy.colMem[i]=_selfy.fontColor;
_selfy.x=0;
_selfy.y=0;
}
}
this.shiftRight = function(pos) {
var offset = pos;
var end = _selfy.y * _selfy.width + (((_selfy.y & 1) == 1) ? (_selfy.width-1) : (2*_selfy.width-1));
if (_selfy.vidMem[end] != 32) {
return;
}
for (var i = end; i > offset; i--) {
_selfy.vidMem[i] = _selfy.vidMem[i - 1];
_selfy.colMem[i] = _selfy.colMem[i - 1];
}
_selfy.vidMem[offset]=_selfy.getPokeValue(32);
_selfy.colMem[offset]=_selfy.fontColor;
}
this.processControlCode = function(code, pos, withSpc) {
var col=_selfy.compiledCode.getMemory()[646];
if (withSpc && code==32) {
if (_selfy.reverseMode) {
_selfy.setAtCursor(pos);
} else {
_selfy.clearAtCursor(pos);
}
_selfy.x++;
}
else {
switch(code) {
case 147:
_selfy.clearScreen();
_selfy.x=0;
_selfy.y=0;
break;
case 19:
_selfy.x=0;
_selfy.y=0;
break;
case 29:
_selfy.x++;
break;
case 157:
_selfy.x--;
break;
case 17:
_selfy.y++;
break;
case 145:
_selfy.y--;
break;
case 144:
col = 0;
break;
case 5:
col = 1;
break;
case 28:
col = 2;
break;
case 159:
col = 3;
break;
case 156:
col = 4;
break;
case 30:
col = 5;
break;
case 31:
col = 6;
break;
case 158:
col = 7;
break;
case 129:
col = 8;
break;
case 149:
col = 9;
break;
case 150:
col = 10;
break;
case 151:
col = 11;
break;
case 152:
col = 12;
break;
case 153:
col = 13;
break;
case 154:
col = 14;
break;
case 155:
col = 15;
break;
case 18:
_selfy.reverseMode = true;
break;
case 146:
_selfy.reverseMode = false;
break;
case 20:
_selfy.x--;
_selfy.clearAtCursor(pos);
break;
case 148:
_selfy.shiftRight(pos);
_selfy.clearAtCursor(pos);
break;
case 13:
_selfy.reverseMode = false;
_selfy.y++;
break;
case 14:
_selfy.graphicsMode=false;
break;
case 142:
_selfy.graphicsMode=true;
break;
default:
_selfy.vidMem[pos]=_selfy.getPokeValue(String.fromCharCode(code));
_selfy.colMem[pos]=_selfy.fontColor;
_selfy.x++;
break;
}
}
if (col!=-1) {
_selfy.fontColor=col;
_selfy.compiledCode.getMemory()[646]=col;
}
}
this.clearAtCursor = function(pos) {
_selfy.vidMem[pos]=_selfy.getPokeValue(32);
_selfy.colMem[pos]=_selfy.fontColor;
_selfy.x++;
}
this.setAtCursor = function(pos) {
_selfy.vidMem[pos]=_selfy.getPokeValue(160);
_selfy.colMem[pos]=_selfy.fontColor;
_selfy.x++;
}
this.inject = function(compiledCode, conElem) {
compiledCode.superOut=compiledCode.out;
_selfy.con=conElem;
_selfy.fillMap();
_selfy.charset=_selfy.createCharsetMapping();
_selfy.compiledCode=compiledCode;
compiledCode.convert = function(c) {
if (c >= 'a' && c <= 'z') {
c = String.fromCharCode(c.charCodeAt(0) - 32);
} else if (c >= 'A' && c <= 'Z') {
c = String.fromCharCode(c.charCodeAt(0) + 32);
}
return c;
}
compiledCode.out = function(val) {
if (val==null) {
return;
}
val=""+val;
for(var i=0; i<val.length; i++) {
var c=val.charAt(i);
var pos=_selfy.x+_selfy.width*_selfy.y;
var col=_selfy.compiledCode.getMemory()[646];
_selfy.fontColor=col;
if (c=='{') {
var end=val.indexOf('}', i);
if (end!=-1) {
var subs=val.substring(i,end+1);
i=end;
var code=_selfy.getCode(subs);
if (code!=-1) {
_selfy.processControlCode(code, pos, true);
}
continue;
}
}
if (_selfy.isChar(c)) {
_selfy.processControlCode(c.charCodeAt(0), pos, false);
} else {
if (_selfy.isBreak(c)) {
_selfy.x=0;
_selfy.y++;
_selfy.reverseMode = false;
}
}
if (_selfy.x==_selfy.width) {
_selfy.x=0;
_selfy.y++;
}
if (_selfy.y>=_selfy.height) {
_selfy.y=_selfy.height-1;
for (var p=_selfy.width;p<_selfy.width*_selfy.height;p++) {
_selfy.vidMem[p-_selfy.width]=_selfy.vidMem[p];
_selfy.colMem[p-_selfy.width]=_selfy.colMem[p];
}
for (var p=_selfy.width*(_selfy.height-1);p<_selfy.width*_selfy.height;p++) {
_selfy.vidMem[p]=32;
_selfy.colMem[p]=_selfy.fontColor;
}
}
}
_self.postMessage([_selfy.vidMem, _selfy.colMem, _selfy.bgColor]);
};
compiledCode.get = function() {
var key=this.keyPressed;
if (!key) {
return ""
}
this.timeOut=20;
this.keyPressed=null;
this._memory[198]=0;
return key.substring(0,1);
};
}
this.isChar = function(c) {
return c!="\r" && c!="\n";
}
this.isBreak = function(c) {
return c=="\r" || c=="\n";
}
this.getConvertedChar = function(c) {
if (c >= 'a' && c <= 'z') {
c = c.charCodeAt(0) - 96;
//} else if (c >= 'A' && c <= 'Z') {
//	c = c.charCodeAt(0) + 32;
} else {
c=c.charCodeAt(0);
}
c+=(_selfy.reverseMode?128:0);
return c;
}
this.setCharAt = function(str, index, replacement) {
return str.substr(0, index) + replacement+ str.substr(index + replacement.length);
}
this.createCharsetMapping = function() {
var sb="";
sb+="@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_ !\"#$%&'()*+,-./0123456789:;<=>?`abcdefghijklmnopqrstuvwxyz{|}~";
sb+=" ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿";
sb+="ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ";
for (var i = 0; i < 32; i++) {
sb+=String.fromCharCode(i + 128);
}
sb+=String.fromCharCode(224);
for (var i = 0; i < 31; i++) {
sb+=String.fromCharCode(i + 256);
}
sb+="@";
for (var i = 0; i < 26; i++) {
sb+=String.fromCharCode(i + 287);
}
sb+="[\\]^_ !\"#$%&'()*+,-./0123456789:;<=>?`";
sb+="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
sb+="{|}~ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿À";
for (var i = 0; i < 26; i++) {
sb+=String.fromCharCode(i + 313);
}
sb+="ÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ";
sb+=String.fromCharCode(128);
sb+="ÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚ";
for (var i = 27; i < 32; i++) {
sb+=String.fromCharCode(i + 128);
}
sb+=String.fromCharCode(224);
for (var i = 0; i < 31; i++) {
sb+=String.fromCharCode(i + 256);
}
_selfy.setCharAt(sb, 94 + 256, '?');
_selfy.setCharAt(sb,95 + 256, 'œ');
_selfy.setCharAt(sb,105 + 256, '?');
_selfy.setCharAt(sb,122 + 256, '?');
_selfy.setCharAt(sb,94 + 128 + 256, '¦');
_selfy.setCharAt(sb,95 + 128 + 256, '?');
_selfy.setCharAt(sb,105 + 128 + 256, '?');
_selfy.setCharAt(sb,122 + 128 + 256, '?');
return sb;
}
this.getCode = function(placeHolder) {
placeHolder = placeHolder.replace("{", "").replace("}", "").toLowerCase().trim();
if (_selfy.map[placeHolder]) {
return _selfy.map[placeHolder];
}
return -1;
}
this.fillMap = function() {
_selfy.add(32, "space");
_selfy.add(144, "black", "blk", "ctrl-1");
_selfy.add(5, "white", "wht", "ctrl-2", "ctrl-e");
_selfy.add(28, "red", "ctrl-3", "ctrl-pound", "ctrl-£");
_selfy.add(159, "cyan", "cyn", "ctrl-4");
_selfy.add(156, "purple", "pur", "pink", "cm-3");
_selfy.add(30, "green", "grn", "ctrl-6", "ctrl-up arrow", "ctrl-?");
_selfy.add(31, "blue", "blu", "ctrl-7", "ctrl-=");
_selfy.add(158, "yellow", "yel", "ctrl-8");
_selfy.add(129, "orange", "orng", "orn", "cm-1");
_selfy.add(149, "brown", "brn", "cm-2");
_selfy.add(150, "light red", "lred");
_selfy.add(151, "dark grey", "dark gray", "gry1", "cm-4");
_selfy.add(152, "grey", "gray", "gry2", "cm-5");
_selfy.add(153, "light green", "lgrn", "cm-6");
_selfy.add(154, "light blue", "lblu", "cm-7");
_selfy.add(155, "light grey", "light gray", "gry3", "cm-8");
_selfy.add(18, "reverse on", "rvon", "rvson", "ctrl-r", "ctrl-9");
_selfy.add(146, "reverse off", "rvof", "rvsoff", "ctrl-0");
_selfy.add(17, "cursor down", "down", "ctrl-q");
_selfy.add(145, "cursor up", "up", "shift-cursor down", "shift-down", "sh-cursor down", "sh-down");
_selfy.add(157, "cursor left", "left", "shift-cursor-right", "shift-right", "sh-cursor-right", "sh-right");
_selfy.add(29, "cursor right", "rght", "right", "ctrl-;");
_selfy.add(20, "del", "delete", "ctrl-t");
_selfy.add(14, "ctrl-n");
_selfy.add(13, "return", "ret", "ctrl-m");
_selfy.add(148, "insert", "inst", "shift-delete", "sh-delete", "shift-del", "sh-del");
_selfy.add(147, "clear", "clr", "shift-home", "sh-home", "clr/home");
_selfy.add(19, "home", "ctrl-s");
_selfy.add(133, "f1");
_selfy.add(134, "f3");
_selfy.add(135, "f5");
_selfy.add(136, "f7");
_selfy.add(8, "ctrl-h");
_selfy.add(9, "ctrl-i");
_selfy.add(14, "ctrl+n", "ctrl-n");
_selfy.add(142, "ctrl+/", "ctrl-/");
_selfy.add(165, "ctrl-g");
_selfy.add(137, "f2", "shift-f1", "sh-f1");
_selfy.add(138, "f4", "shift-f3", "sh-f3");
_selfy.add(139, "f6", "shift-f5", "sh-f5");
_selfy.add(140, "f8", "shift-f7", "sh-f7");
_selfy.add(92, "pound", "£");
_selfy.add(160, "shift-space", "sh-space");
_selfy.add(33, "shift-1", "sh-1");
_selfy.add(34, "shift-2", "sh-2");
_selfy.add(35, "shift-3", "sh-3");
_selfy.add(36, "shift-4", "sh-4");
_selfy.add(37, "shift-5", "sh-5");
_selfy.add(38, "shift-6", "sh-6");
_selfy.add(39, "shift-7", "sh-7");
_selfy.add(40, "shift-8", "sh-8");
_selfy.add(41, "shift-9", "sh-9");
_selfy.add(42, "*", "asterisk");
_selfy.add(43, "+", "plus");
_selfy.add(44, ",", "comma");
_selfy.add(45, "-", "minus");
_selfy.add(46, ".", "period");
_selfy.add(47, "/", "slash");
_selfy.add(58, ":", "colon");
_selfy.add(59, ";", "semicolon");
_selfy.add(60, "shift-comma", "shift-,", "sh-comma", "sh-,");
_selfy.add(61, "equal", "equals", "eq", "=");
_selfy.add(62, "shift-period", "shift-.", "sh-period", "sh-.");
_selfy.add(63, "shift-slash", "shift-/", "sh-slash", "sh-/");
_selfy.add(64, "@", "at");
_selfy.add(91, "shift-colon", "shift-:", "sh-colon", "sh-:");
_selfy.add(93, "shift-semicolon", "shift-;", "sh-semicolon", "sh-;");
_selfy.add(94, "?", "^", "up arrow");
_selfy.add(95, "?", "left arrow");
_selfy.add(141, "shift-return", "sh-return", "shift-ret", "sh-ret");
_selfy.add(161, "cm-k");
_selfy.add(162, "cm-i");
_selfy.add(163, "cm-t");
_selfy.add(164, "cm-@", "cm-at");
_selfy.add(165, "cm-g");
_selfy.add(166, "cm-+", "cm-plus");
_selfy.add(167, "cm-m");
_selfy.add(168, "cm-£", "cm-pound");
_selfy.add(169, "shift-£", "shift-pound", "sh-£", "sh-pound");
_selfy.add(170, "cm-n");
_selfy.add(171, "cm-q");
_selfy.add(172, "cm-d");
_selfy.add(173, "cm-z");
_selfy.add(174, "cm-s");
_selfy.add(175, "cm-p");
_selfy.add(176, "cm-a");
_selfy.add(177, "cm-e");
_selfy.add(178, "cm-r");
_selfy.add(179, "cm-w");
_selfy.add(180, "cm-h");
_selfy.add(181, "cm-j");
_selfy.add(182, "cm-l");
_selfy.add(183, "cm-y");
_selfy.add(184, "cm-u");
_selfy.add(185, "cm-o");
_selfy.add(186, "shift-@", "shift-at", "sh-@", "sh-at");
_selfy.add(187, "cm-f");
_selfy.add(188, "cm-c");
_selfy.add(189, "cm-x");
_selfy.add(190, "cm-v");
_selfy.add(191, "cm-b");
_selfy.add(192, "shift-*", "shift-asterisk", "sh-*", "sh-asterisk");
_selfy.add(219, "shift-+", "shift-plus", "sh-+", "sh-plus");
_selfy.add(220, "cm--", "cm-minus");
_selfy.add(221, "shift--", "shift-minus", "sh--", "sh-minus");
_selfy.add(222, "shift-?", "shift-up arrow", "sh-?", "sh-up arrow");
_selfy.add(223, "cm-*", "cm-asterisk");
for (var i = 65; i < 91; i++) {
var c = String.fromCharCode(i - 65 + 97);
_selfy.add(i, "shift-" + c, "sh-" + c);
}
}
this.add = function() {
var code=arguments[0];
for (var i = 1; i < arguments.length; i++) {
var placy=arguments[i];
_selfy.map[placy]=code;
_selfy.map[placy.replace("ctrl", "ct")]=code;
_selfy.map[placy.replace("ctrl", "control")]=code;
_selfy.map[placy.replace("-", " ")]=code;
_selfy.map[placy.replace("ctrl", "ct").replace("-", " ")]=code;
_selfy.map[placy.replace("ctrl", "control").replace("-", " ")]=code;
}
}
_selfy.clearScreen();
}
function Compiled(input, output) {
	this.blob=input;
	this.blobOut=new Array();
this.outputter=function(txt) {console.log(txt);}
if (output) {this.outputter=output;}
this.INIT = function() {
this.blobCount=0;
this.X_REG=0.0;
this.Y_REG=0.0;
this.C_REG=0.0;
this.D_REG=0.0;
this.E_REG=0.0;
this.F_REG=0.0;
this.A_REG=0;
this.B_REG=0;
this.G_REG=0;
this.CMD_NUM=0;
this.CHANNEL=0;
this.JUMP_TARGET="";
this.USR_PARAM=0;
this._line="";
this._stack=new Array();
this._forstack=new Array();
this._memory=new Array(65535);
this._zeroflag=0
this._timeOffset=0
this._time=0
this._inputQueue=new Array();
this.CONST_0=64;
this.CONST_1="";
this.CONST_2=0;
this.CONST_3=1;
this.CONST_4=",";
this.CONST_5=2;
this.CONST_6=256;
this.CONST_7="Undef'd Statement Error";
this.CONST_8=63999;
this.CONST_9="{clear}{down}{space*6}Recompactor{space*4}by GD-Soft {ct h}{ct n}";
this.CONST_10="Format loops (y/n)";
this.CONST_11="n";
this.CONST_12="y";
this.CONST_13="j";
this.CONST_14="{home}{down*10}";
this.CONST_15=3;
this.CONST_16="Pass 1 :";
this.CONST_17=11;
this.CONST_18=23;
this.CONST_19="Pass 2 :";
this.CONST_20=31;
this.CONST_21=10.0;
this.CONST_22=100.0;
this.CONST_23=":";
this.CONST_24=139;
this.CONST_25=143;
this.CONST_26=34;
this.CONST_27="Line Increment too large !";
this.CONST_28="{home}{down*13}";
this.CONST_29="Pass 3 :";
this.CONST_30=0.0;
this.CONST_31=141;
this.CONST_32=137;
this.CONST_33=167;
this.CONST_34=145;
this.CONST_35=203;
this.CONST_36=" ";
this.CONST_37="9";
this.CONST_38="0";
this.CONST_39=-1;
this.CONST_40="ON without GOTO Error";
this.CONST_41=164;
this.CONST_42="GO without TO Error";
this.CONST_43="Pass 4 :";
this.CONST_44=":                    ";
this.CONST_45=129;
this.CONST_46=130;
this.CONST_47="{home}{down*17}";
this.CONST_48=16;
this.CONST_49="{reverse on} saving ";
this.CONST_50=2049.0;
this.CONST_51=1.0;
this.CONST_52=8.00390625;
this.CONST_53=5;
this.CONST_54=255;
this.CONST_55="{home}{down*20}{space*2}Errors :";
this.CONST_56="{home}{down*21}{right}error for ";
this.CONST_57=" :";
this.CONST_58="{down}{sh space}";
this.CONST_59="{right}in";
this.CONST_60=5000;
this.CONST_61="{home}{down*21}{space*39}";
this.CONST_62="{down}{space*39}";
this.VAR_D=0.0;
this.VAR_AD=0.0;
this.VAR_YY=0.0;
this.VAR_SS=0.0;
this.VAR_S_array=new Array();
this.VAR_JA=0.0;
this.VAR_U_array=new Array();
this.VAR_JN=0.0;
this.VAR_I=0.0;
this.VAR_D_array=new Array();
this.VAR_ER=0.0;
this.VAR_DD=0.0;
this.VAR_F1=0.0;
this.VAR_F2=0.0;
this.VAR_F3=0.0;
this.VAR_M=0.0;
this.VAR_X=0.0;
this.VAR_MM=0.0;
this.VAR_NN=0.0;
this.VAR_AS=0.0;
this.VAR_FO=0.0;
this.VAR_LP=0.0;
this.VAR_HP=0.0;
this.VAR_LZ=0.0;
this.VAR_HZ=0.0;
this.VAR_ER_int=0;
this.VAR_T=0.0;
this.VAR_A$="";
this.VAR_X1$="";
this.VAR_X2$="";
this.VAR_X3$="";
this.VAR_X4$="";
this.VAR_D$="";
this.VAR_L$="";
this.VAR_H$="";
this.VAR_DA$="";
this.VAR_X$="";
this.VAR_ER$="";
this.VAR_FO$="";
this.VAR_ZE$="";
this.VAR_JA$="";
this.VAR_NN$="";
this.VAR_LI$="";
this.VAR_RE$="";
this.VAR_SN$="";
this.VAR_S$_array=new Array();
this.VAR_D$_array=new Array();
}
//
this.PROGRAMSTART = function() {
this.START();
return 1000;
} 
//
this.line_0 = function() {
return 1000;
} 
//
this.line_1000 = function() {
//
return 1310;
} 
//
this.line_1010 = function() {
//
return 1030;
} 
//
this.line_1020 = function() {
//
return 1040;
} 
//
this.line_1030 = function() {
//
return 1040;
} 
//
this.line_1040 = function() {
//
this._memory[19]=Math.floor(this.CONST_0) & 255;
return "INPUT0";
} 
//
this.line_1050 = function() {
//
return "INPUT0";
} 
//
this.INPUT0 = function() {
this.CLEARQUEUE();
this.COMPACTMAX();
this.A_REG=this.CONST_1;
this.STROUT();
this.QMARKOUT1();
this.INPUTSTR();
this.VAR_A$=this.A_REG;
this.QUEUESIZE();
if ((this.X_REG==this.CONST_2?0:1)==0) {
return "INPUTCHECK0";}
this.EXTRAIGNORED();
return 1060;
} 
//
this.INPUTCHECK0 = function() {
return 1060;
} 
//
this.line_1060 = function() {
//
this._memory[19]=Math.floor(this.CONST_2) & 255;
return 1070;
} 
//
this.line_1070 = function() {
//
this.LINEBREAK();
return 1080;
} 
//
this.line_1080 = function() {
//
return "RETURN";
} 
//
this.line_1090 = function() {
//
this.Y_REG=this.CONST_3;
this._stack.push(this.Y_REG);
this.CLEARQUEUE();
this.COMPACTMAX();
this.C_REG=this._stack.pop();
this.INPUTSTRCHANNEL();
this.VAR_X1$=this.A_REG;
this.INPUTSTRCHANNEL();
this.VAR_X2$=this.A_REG;
this.INPUTSTRCHANNEL();
this.VAR_X3$=this.A_REG;
this.INPUTSTRCHANNEL();
this.VAR_X4$=this.A_REG;
return 1100;
} 
//
this.line_1100 = function() {
//
this.B_REG=this.VAR_X1$;
// ignored: CHGCTX #0
this.VAL();
this.VAR_D=this.X_REG;
return 1110;
} 
//
this.line_1110 = function() {
//
this.COMPACTMAX();
this.B_REG=this.CONST_4;
this.A_REG=this.VAR_X1$;
this.CONCAT();
this.B_REG=this.VAR_X2$;
this.CONCAT();
this.B_REG=this.CONST_4;
this.CONCAT();
this.B_REG=this.VAR_X3$;
this.CONCAT();
this.B_REG=this.CONST_4;
this.CONCAT();
this.B_REG=this.VAR_X4$;
this.CONCAT();
this.VAR_D$=this.A_REG;
return 1120;
} 
//
this.line_1120 = function() {
//
return "RETURN";
} 
//
this.line_1130 = function() {
//
this.C_REG=this.CONST_5;
this.GETSTRCHANNEL();
this.VAR_L$=this.A_REG;
this.GETSTRCHANNEL();
this.VAR_H$=this.A_REG;
return 1140;
} 
//
this.line_1140 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this.B_REG=this.A_REG;
this.A_REG=this.VAR_H$;
this.CONCAT();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.ASC();
this.Y_REG=this.CONST_6;
this.X_REG=this.X_REG*this.Y_REG;
this._stack.push(this.X_REG);
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this.B_REG=this.A_REG;
this.A_REG=this.VAR_L$;
this.CONCAT();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.ASC();
this.Y_REG=this._stack.pop();
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_AD=this.X_REG;
return 1150;
} 
//
this.line_1150 = function() {
//
return "RETURN";
} 
//
this.line_1160 = function() {
//
this.B_REG=this.CONST_1;
this.VAR_DA$=this.B_REG;
return 1170;
} 
//
this.line_1170 = function() {
//
this.C_REG=this.CONST_5;
this.GETSTRCHANNEL();
this.VAR_X$=this.A_REG;
return 1180;
} 
//
this.line_1180 = function() {
//
this.B_REG=this.CONST_1;
this.A_REG=this.VAR_X$;
// ignored: CHGCTX #0
this.SNEQ();
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP0";}
return "SKIP0";
} 
//
this.NSKIP0 = function() {
//
//
this.COMPACTMAX();
this.B_REG=this.VAR_X$;
this.A_REG=this.VAR_DA$;
this.CONCAT();
this.VAR_DA$=this.A_REG;
return 1170;
//
return 1190;
} 
//
this.SKIP0 = function() {
return 1190;
} 
//
this.line_1190 = function() {
//
return "RETURN";
} 
//
this.line_1200 = function() {
//
this.Y_REG=this.CONST_3;
this.VAR_YY=this.Y_REG;
//
this.Y_REG=this.VAR_SS;
this._stack.push(this.Y_REG);
//
this.Y_REG=this.CONST_3;
this._stack.push(this.Y_REG);
//
this.INITFOR("FORLOOP0","VAR_YY");
return 1210;
} 
//
this.FORLOOP0 = function() {
return 1210;
} 
//
this.line_1210 = function() {
//
this.X_REG=this.VAR_YY;
this.G_REG=this.VAR_S_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.Y_REG=this.X_REG;
this.X_REG=this.VAR_JA;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP1";}
return "SKIP1";
} 
//
this.NSKIP1 = function() {
//
//
this.X_REG=this.VAR_YY;
this.G_REG=this.VAR_U_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.VAR_JN=this.X_REG;
return "RETURN";
//
return 1220;
} 
//
this.SKIP1 = function() {
return 1220;
} 
//
this.line_1220 = function() {
//
//
this.NEXT("0");
if ((this.A_REG==this.CONST_2?0:1)==0) {
return "($JUMP)";}
return 1230;
} 
//
this.line_1230 = function() {
//
this.B_REG=this.CONST_7;
this.VAR_ER$=this.B_REG;
return 1240;
} 
//
this.line_1240 = function() {
//
this.X_REG=this.VAR_I;
this.G_REG=this.VAR_D_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.VAR_ER=this.X_REG;
return 1250;
} 
//
this.line_1250 = function() {
//
this.GOSUB("GOSUBCONT0");
return 3580;
} 
//
this.GOSUBCONT0 = function() {
return 1260;
} 
//
this.line_1260 = function() {
//
this.Y_REG=this.CONST_8;
this.VAR_JN=this.Y_REG;
return 1270;
} 
//
this.line_1270 = function() {
//
return "RETURN";
} 
//
this.line_1280 = function() {
//
return 1300;
} 
//
this.line_1290 = function() {
//
return 1310;
} 
//
this.line_1300 = function() {
//
return 1320;
} 
//
this.line_1310 = function() {
return 1330;
} 
//
this.line_1320 = function() {
//
return 1340;
} 
//
this.line_1330 = function() {
//
return 1350;
} 
//
this.line_1340 = function() {
//
return 1360;
} 
//
this.line_1350 = function() {
//
return 1370;
} 
//
this.line_1360 = function() {
//
return 1380;
} 
//
this.line_1370 = function() {
//
return 1380;
} 
//
this.line_1380 = function() {
//
this.A_REG=this.CONST_9;
this.STROUT();
this.LINEBREAK();
return 1400;
} 
//
this.line_1390 = function() {
//
return 1410;
} 
//
this.line_1400 = function() {
//
return 1420;
} 
//
this.line_1410 = function() {
//
return 1430;
} 
//
this.line_1420 = function() {
//
return 1440;
} 
//
this.line_1430 = function() {
//
return 1450;
} 
//
this.line_1440 = function() {
//
return 1450;
} 
//
this.line_1450 = function() {
//
this.A_REG=this.CONST_10;
this.STROUT();
return 1460;
} 
//
this.line_1460 = function() {
//
this._memory[204]=Math.floor(this.CONST_2) & 255;
return 1470;
} 
//
this.line_1470 = function() {
//
this.GETSTR();
this.VAR_FO$=this.A_REG;
return 1480;
} 
//
this.line_1480 = function() {
//
this.B_REG=this.CONST_11;
this.A_REG=this.VAR_FO$;
// ignored: CHGCTX #0
this.SNEQ();
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_12;
this.A_REG=this.VAR_FO$;
// ignored: CHGCTX #0
this.SNEQ();
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_13;
this.A_REG=this.VAR_FO$;
// ignored: CHGCTX #0
this.SNEQ();
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) & Math.floor(this.Y_REG);
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) & Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP2";}
return "SKIP2";
} 
//
this.NSKIP2 = function() {
return 1470;
//
return 1490;
} 
//
this.SKIP2 = function() {
return 1490;
} 
//
this.line_1490 = function() {
//
this._memory[204]=Math.floor(this.CONST_3) & 255;
return 1500;
} 
//
this.line_1500 = function() {
//
this.A_REG=this.VAR_FO$;
this.STROUT();
this.LINEBREAK();
return 1520;
} 
//
this.line_1510 = function() {
//
return 1530;
} 
//
this.line_1520 = function() {
//
return 1540;
} 
//
this.line_1530 = function() {
//
return 1550;
} 
//
this.line_1540 = function() {
//
return 1560;
} 
//
this.line_1550 = function() {
//
return 1570;
} 
//
this.line_1560 = function() {
//
return 1580;
} 
//
this.line_1570 = function() {
//
return 1590;
} 
//
this.line_1580 = function() {
//
return 1600;
} 
//
this.line_1590 = function() {
//
return 1600;
} 
//
this.line_1600 = function() {
//
this.A_REG=this.CONST_9;
this.STROUT();
this.LINEBREAK();
return 1620;
} 
//
this.line_1610 = function() {
//
return 1630;
} 
//
this.line_1620 = function() {
//
return 1640;
} 
//
this.line_1630 = function() {
//
return 1650;
} 
//
this.line_1640 = function() {
//
return 1660;
} 
//
this.line_1650 = function() {
//
return 1660;
} 
//
this.line_1660 = function() {
//
this.A_REG=this.CONST_14;
this.STROUT();
//
this.Y_REG=this.CONST_15;
// ignored: CHGCTX #1
this.TAB();
//
this.A_REG=this.CONST_16;
this.STROUT();
this.LINEBREAK();
return 1680;
} 
//
this.line_1670 = function() {
//
return 1690;
} 
//
this.line_1680 = function() {
//
return 1700;
} 
//
this.line_1690 = function() {
//
return 1710;
} 
//
this.line_1700 = function() {
//
return 1710;
} 
//
this.line_1710 = function() {
//
this.GOSUB("GOSUBCONT1");
return 1130;
} 
//
this.GOSUBCONT1 = function() {
return 1720;
} 
//
this.line_1720 = function() {
//
this.GOSUB("GOSUBCONT2");
return 1130;
} 
//
this.GOSUBCONT2 = function() {
return 1730;
} 
//
this.line_1730 = function() {
//
this.Y_REG=this.CONST_2;
this.X_REG=this.VAR_AD;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP3";}
return "SKIP3";
} 
//
this.NSKIP3 = function() {
return 1840;
//
return 1740;
} 
//
this.SKIP3 = function() {
return 1740;
} 
//
this.line_1740 = function() {
//
this.GOSUB("GOSUBCONT3");
return 1130;
} 
//
this.GOSUBCONT3 = function() {
return 1750;
} 
//
this.line_1750 = function() {
//
this.A_REG=this.CONST_14;
this.STROUT();
//
this.Y_REG=this.CONST_17;
// ignored: CHGCTX #1
this.TAB();
//
this.X_REG=this.VAR_AD;
this.REALOUT();
this.CHECKCMD();
this.LINEBREAK();
return 1760;
} 
//
this.line_1760 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_SS;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_SS=this.X_REG;
return 1770;
} 
//
this.line_1770 = function() {
//
this.Y_REG=this.VAR_SS;
this.X_REG=this.Y_REG;
this.Y_REG=this.VAR_AD;
this.G_REG=this.VAR_S_array;
this.ARRAYSTORE_REAL();
return 1780;
} 
//
this.line_1780 = function() {
//
this.GOSUB("GOSUBCONT4");
return 1160;
} 
//
this.GOSUBCONT4 = function() {
return 1790;
} 
//
this.line_1790 = function() {
//
this.Y_REG=this.VAR_SS;
this._stack.push(this.Y_REG);
//
this.A_REG=this.VAR_DA$;
this.X_REG=this._stack.pop();
this.G_REG=this.VAR_S$_array;
this.ARRAYSTORE_STRING();
return 1800;
} 
//
this.line_1800 = function() {
//
return 1720;
} 
//
this.line_1810 = function() {
//
return 1830;
} 
//
this.line_1820 = function() {
//
return 1840;
} 
//
this.line_1830 = function() {
//
return 1840;
} 
//
this.line_1840 = function() {
//
this.A_REG=this.CONST_14;
this.STROUT();
//
this.Y_REG=this.CONST_18;
// ignored: CHGCTX #1
this.TAB();
//
this.A_REG=this.CONST_19;
this.STROUT();
this.LINEBREAK();
return 1850;
} 
//
this.line_1850 = function() {
//
this.Y_REG=this.CONST_3;
this.VAR_I=this.Y_REG;
//
this.Y_REG=this.VAR_SS;
this._stack.push(this.Y_REG);
//
this.Y_REG=this.CONST_3;
this._stack.push(this.Y_REG);
//
this.INITFOR("FORLOOP1","VAR_I");
return 1860;
} 
//
this.FORLOOP1 = function() {
return 1860;
} 
//
this.line_1860 = function() {
//
this.A_REG=this.CONST_14;
this.STROUT();
//
this.Y_REG=this.CONST_20;
// ignored: CHGCTX #1
this.TAB();
//
this.X_REG=this.VAR_I;
this.G_REG=this.VAR_S_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.REALOUT();
this.CHECKCMD();
this.LINEBREAK();
return 1870;
} 
//
this.line_1870 = function() {
//
this.Y_REG=this.VAR_I;
this._stack.push(this.Y_REG);
//
this.Y_REG=this.CONST_21;
this.X_REG=this.VAR_DD;
this.X_REG=this.X_REG*this.Y_REG;
this.Y_REG=this.CONST_22;
this.X_REG=this.X_REG+this.Y_REG;
this.Y_REG=this.X_REG;
this.X_REG=this._stack.pop();
this.G_REG=this.VAR_U_array;
this.ARRAYSTORE_REAL();
return 1880;
} 
//
this.line_1880 = function() {
//
this.Y_REG=this.CONST_2;
this.VAR_F1=this.Y_REG;
return 1890;
} 
//
this.line_1890 = function() {
//
this.Y_REG=this.CONST_2;
this.VAR_F2=this.Y_REG;
return 1900;
} 
//
this.line_1900 = function() {
//
this.Y_REG=this.CONST_2;
this.VAR_F3=this.Y_REG;
return 1910;
} 
//
this.line_1910 = function() {
//
this.Y_REG=this.CONST_3;
this.VAR_M=this.Y_REG;
//
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_S$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.LEN();
this._stack.push(this.X_REG);
//
this.Y_REG=this.CONST_3;
this._stack.push(this.Y_REG);
//
this.INITFOR("FORLOOP2","VAR_M");
return 1920;
} 
//
this.FORLOOP2 = function() {
return 1920;
} 
//
this.line_1920 = function() {
//
this.COMPACTMAX();
this.C_REG=this.VAR_M;
this._stack.push(this.C_REG);
this.C_REG=this.CONST_3;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_S$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.VAR_X$=this.A_REG;
return 1930;
} 
//
this.line_1930 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this.B_REG=this.A_REG;
this.A_REG=this.VAR_X$;
this.CONCAT();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.ASC();
this.VAR_X=this.X_REG;
return 1940;
} 
//
this.line_1940 = function() {
//
this.B_REG=this.CONST_1;
this.A_REG=this.VAR_ZE$;
// ignored: CHGCTX #0
this.SNEQ();
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_23;
this.A_REG=this.VAR_X$;
// ignored: CHGCTX #0
this.SEQ();
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) & Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP4";}
return "SKIP4";
} 
//
this.NSKIP4 = function() {
return 2010;
//
return 1950;
} 
//
this.SKIP4 = function() {
return 1950;
} 
//
this.line_1950 = function() {
//
this.Y_REG=this.CONST_24;
this.X_REG=this.VAR_X;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP5";}
return "SKIP5";
} 
//
this.NSKIP5 = function() {
//
//
this.Y_REG=this.CONST_3;
this.VAR_F1=this.Y_REG;
return 1960;
} 
//
this.SKIP5 = function() {
return 1960;
} 
//
this.line_1960 = function() {
//
this.Y_REG=this.CONST_25;
this.X_REG=this.VAR_X;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP6";}
return "SKIP6";
} 
//
this.NSKIP6 = function() {
//
//
this.Y_REG=this.CONST_3;
this.VAR_F1=this.Y_REG;
return 1970;
} 
//
this.SKIP6 = function() {
return 1970;
} 
//
this.line_1970 = function() {
//
this.Y_REG=this.CONST_26;
this.X_REG=this.VAR_X;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP7";}
return "SKIP7";
} 
//
this.NSKIP7 = function() {
//
//
this.Y_REG=this.VAR_F2;
this.X_REG=this.CONST_3;
this.X_REG=this.X_REG-this.Y_REG;
this.VAR_F2=this.X_REG;
return 1980;
} 
//
this.SKIP7 = function() {
return 1980;
} 
//
this.line_1980 = function() {
//
this.COMPACTMAX();
this.B_REG=this.VAR_X$;
this.A_REG=this.VAR_ZE$;
this.CONCAT();
this.VAR_ZE$=this.A_REG;
return 1990;
} 
//
this.line_1990 = function() {
//
//
this.NEXT("VAR_M");
if ((this.A_REG==this.CONST_2?0:1)==0) {
return "($JUMP)";}
return 2000;
} 
//
this.line_2000 = function() {
//
this.Y_REG=this.CONST_3;
this.VAR_F3=this.Y_REG;
return 2010;
} 
//
this.line_2010 = function() {
//
this.Y_REG=this.CONST_2;
this.X_REG=this.VAR_F3;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP8";}
return "SKIP8";
} 
//
this.NSKIP8 = function() {
//
//
this.Y_REG=this.VAR_F2;
this.X_REG=this.VAR_F1;
this.X_REG=Math.floor(this.X_REG) | Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP9";}
return "SKIP9";
} 
//
this.NSKIP9 = function() {
return 1980;
} 
//
this.SKIP9 = function() {
//
return 2020;
} 
//
this.SKIP8 = function() {
return 2020;
} 
//
this.line_2020 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_DD;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_DD=this.X_REG;
return 2030;
} 
//
this.line_2030 = function() {
//
this.Y_REG=this.VAR_DD;
this._stack.push(this.Y_REG);
//
this.A_REG=this.VAR_ZE$;
this.X_REG=this._stack.pop();
this.G_REG=this.VAR_D$_array;
this.ARRAYSTORE_STRING();
return 2040;
} 
//
this.line_2040 = function() {
//
this.B_REG=this.CONST_1;
this.VAR_ZE$=this.B_REG;
return 2050;
} 
//
this.line_2050 = function() {
//
this.Y_REG=this.VAR_DD;
this._stack.push(this.Y_REG);
//
this.Y_REG=this.CONST_21;
this.X_REG=this.VAR_DD;
this.X_REG=this.X_REG*this.Y_REG;
this.Y_REG=this.CONST_22;
this.X_REG=this.X_REG+this.Y_REG;
this.Y_REG=this.CONST_21;
this.X_REG=this.X_REG-this.Y_REG;
this.Y_REG=this.X_REG;
this.X_REG=this._stack.pop();
this.G_REG=this.VAR_D_array;
this.ARRAYSTORE_REAL();
return 2060;
} 
//
this.line_2060 = function() {
//
this.Y_REG=this.CONST_2;
this.X_REG=this.VAR_F3;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP10";}
return "SKIP10";
} 
//
this.NSKIP10 = function() {
this._memory[this.A_REG]=this.VAR_M;
//
this.NEXT("0");
if ((this.A_REG==this.CONST_2?0:1)==0) {
return "($JUMP)";}
return 2070;
} 
//
this.SKIP10 = function() {
return 2070;
} 
//
this.line_2070 = function() {
//
this.Y_REG=this.VAR_I;
this._stack.push(this.Y_REG);
//
this.A_REG=this.CONST_1;
this.X_REG=this._stack.pop();
this.G_REG=this.VAR_S$_array;
this.ARRAYSTORE_STRING();
return 2080;
} 
//
this.line_2080 = function() {
//
//
this.NEXT("VAR_I");
if ((this.A_REG==this.CONST_2?0:1)==0) {
return "($JUMP)";}
return 2090;
} 
//
this.line_2090 = function() {
//
this.X_REG=this.VAR_DD;
this.G_REG=this.VAR_D_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.Y_REG=this.CONST_8;
this.X_REG=(this.X_REG>this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP11";}
return "SKIP11";
} 
//
this.NSKIP11 = function() {
//
//
this.B_REG=this.CONST_27;
this.VAR_ER$=this.B_REG;
//
//
this.Y_REG=this.CONST_2;
this.VAR_ER=this.Y_REG;
this.GOSUB("GOSUBCONT5");
//
return 3580;
} 
//
this.GOSUBCONT5 = function() {
this.RUN();
//
return 2100;
} 
//
this.SKIP11 = function() {
return 2110;
} 
//
this.line_2100 = function() {
//
return 2120;
} 
//
this.line_2110 = function() {
//
return 2130;
} 
//
this.line_2120 = function() {
//
return 2130;
} 
//
this.line_2130 = function() {
//
this.A_REG=this.CONST_28;
this.STROUT();
//
this.Y_REG=this.CONST_15;
// ignored: CHGCTX #1
this.TAB();
//
this.A_REG=this.CONST_29;
this.STROUT();
this.LINEBREAK();
return 2140;
} 
//
this.line_2140 = function() {
//
this.Y_REG=this.CONST_3;
this.VAR_I=this.Y_REG;
//
this.Y_REG=this.VAR_DD;
this._stack.push(this.Y_REG);
//
this.Y_REG=this.CONST_3;
this._stack.push(this.Y_REG);
//
this.INITFOR("FORLOOP3","VAR_I");
return 2150;
} 
//
this.FORLOOP3 = function() {
return 2150;
} 
//
this.line_2150 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_MM=this.Y_REG;
return 2160;
} 
//
this.line_2160 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_F1=this.Y_REG;
return 2170;
} 
//
this.line_2170 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_F2=this.Y_REG;
return 2180;
} 
//
this.line_2180 = function() {
//
this.A_REG=this.CONST_28;
this.STROUT();
//
this.Y_REG=this.CONST_17;
// ignored: CHGCTX #1
this.TAB();
//
this.X_REG=this.VAR_I;
this.G_REG=this.VAR_D_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.REALOUT();
this.CHECKCMD();
this.LINEBREAK();
return 2190;
} 
//
this.line_2190 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_MM=this.X_REG;
return 2200;
} 
//
this.line_2200 = function() {
//
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.LEN();
this.Y_REG=this.X_REG;
this.X_REG=this.VAR_MM;
this.X_REG=(this.X_REG>this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP12";}
return "SKIP12";
} 
//
this.NSKIP12 = function() {
this._memory[this.A_REG]=this.VAR_I;
//
this.NEXT("0");
if ((this.A_REG==this.CONST_2?0:1)==0) {
return "($JUMP)";}
return 3090;
//
return 2210;
} 
//
this.SKIP12 = function() {
return 2210;
} 
//
this.line_2210 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this._stack.push(this.A_REG);
// ignored: CHGCTX #0
this.C_REG=this.VAR_MM;
this._stack.push(this.C_REG);
this.C_REG=this.CONST_3;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.B_REG=this._stack.pop();
this.CONCAT();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.ASC();
this.VAR_YY=this.X_REG;
return 2220;
} 
//
this.line_2220 = function() {
//
this.Y_REG=this.CONST_26;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP13";}
return "SKIP13";
} 
//
this.NSKIP13 = function() {
//
//
this.Y_REG=this.VAR_F2;
this.X_REG=this.CONST_3;
this.X_REG=this.X_REG-this.Y_REG;
this.VAR_F2=this.X_REG;
//
//
return 2230;
} 
//
this.SKIP13 = function() {
return 2230;
} 
//
this.line_2230 = function() {
//
this.Y_REG=this.CONST_25;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP14";}
return "SKIP14";
} 
//
this.NSKIP14 = function() {
//
//
this.Y_REG=this.CONST_3;
this.VAR_F1=this.Y_REG;
//
//
return 2240;
} 
//
this.SKIP14 = function() {
return 2240;
} 
//
this.line_2240 = function() {
//
this.Y_REG=this.VAR_F2;
this.X_REG=this.VAR_F1;
this.X_REG=Math.floor(this.X_REG) | Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP15";}
return "SKIP15";
} 
//
this.NSKIP15 = function() {
return 2190;
//
//
//
return 2250;
} 
//
this.SKIP15 = function() {
return 2250;
} 
//
this.line_2250 = function() {
//
this.Y_REG=this.CONST_31;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
this._stack.push(this.X_REG);
this.Y_REG=this.CONST_32;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) | Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP16";}
return "SKIP16";
} 
//
this.NSKIP16 = function() {
return 2310;
//
//
//
return 2260;
} 
//
this.SKIP16 = function() {
return 2260;
} 
//
this.line_2260 = function() {
//
this.Y_REG=this.CONST_33;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP17";}
return "SKIP17";
} 
//
this.NSKIP17 = function() {
return 2490;
//
//
//
return 2270;
} 
//
this.SKIP17 = function() {
return 2270;
} 
//
this.line_2270 = function() {
//
this.Y_REG=this.CONST_34;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP18";}
return "SKIP18";
} 
//
this.NSKIP18 = function() {
return 2570;
//
//
//
return 2280;
} 
//
this.SKIP18 = function() {
return 2280;
} 
//
this.line_2280 = function() {
//
this.Y_REG=this.CONST_35;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP19";}
return "SKIP19";
} 
//
this.NSKIP19 = function() {
return 2980;
//
//
//
return 2290;
} 
//
this.SKIP19 = function() {
return 2290;
} 
//
this.line_2290 = function() {
//
return 2190;
} 
//
this.line_2300 = function() {
//
return 2310;
} 
//
this.line_2310 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_JA=this.Y_REG;
return 2320;
} 
//
this.line_2320 = function() {
//
this.B_REG=this.CONST_1;
this.VAR_JA$=this.B_REG;
return 2330;
} 
//
this.line_2330 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_NN=this.Y_REG;
return 2340;
} 
//
this.line_2340 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_NN;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_NN=this.X_REG;
return 2350;
} 
//
this.line_2350 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.VAR_NN;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this._stack.push(this.X_REG);
this.C_REG=this.CONST_3;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.VAR_NN$=this.A_REG;
return 2360;
} 
//
this.line_2360 = function() {
//
this.B_REG=this.CONST_36;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SNEQ();
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_37;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SGT();
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_38;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SLT();
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) | Math.floor(this.Y_REG);
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) & Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP20";}
return "SKIP20";
} 
//
this.NSKIP20 = function() {
return 2390;
//
return 2370;
} 
//
this.SKIP20 = function() {
return 2370;
} 
//
this.line_2370 = function() {
//
this.COMPACTMAX();
this.B_REG=this.VAR_NN$;
this.A_REG=this.VAR_JA$;
this.CONCAT();
this.VAR_JA$=this.A_REG;
return 2380;
} 
//
this.line_2380 = function() {
//
return 2340;
} 
//
this.line_2390 = function() {
//
this.B_REG=this.VAR_JA$;
// ignored: CHGCTX #0
this.VAL();
this.VAR_JA=this.X_REG;
return 2400;
} 
//
this.line_2400 = function() {
//
this.GOSUB("GOSUBCONT6");
return 1200;
} 
//
this.GOSUBCONT6 = function() {
return 2410;
} 
//
this.line_2410 = function() {
//
this.COMPACTMAX();
this.C_REG=this.VAR_MM;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.C_REG=this._stack.pop();
this.LEFT();
this.VAR_LI$=this.A_REG;
return 2420;
} 
//
this.line_2420 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.VAR_NN;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this._stack.push(this.X_REG);
this.C_REG=this.CONST_39;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.VAR_RE$=this.A_REG;
return 2430;
} 
//
this.line_2430 = function() {
//
this.Y_REG=this.VAR_I;
this._stack.push(this.Y_REG);
//
this.COMPACTMAX();
this.Y_REG=this.VAR_JN;
// ignored: CHGCTX #1
this.STR();
this.B_REG=this.A_REG;
this.A_REG=this.VAR_LI$;
this.CONCAT();
this.B_REG=this.VAR_RE$;
this.CONCAT();
this.X_REG=this._stack.pop();
this.G_REG=this.VAR_D$_array;
this.ARRAYSTORE_STRING();
return 2440;
} 
//
this.line_2440 = function() {
//
this.Y_REG=this.VAR_NN;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_MM=this.X_REG;
return 2450;
} 
//
this.line_2450 = function() {
//
return 2190;
} 
//
this.line_2460 = function() {
//
return 2480;
} 
//
this.line_2470 = function() {
//
return 2490;
} 
//
this.line_2480 = function() {
//
return 2490;
} 
//
this.line_2490 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_NN=this.Y_REG;
return 2510;
} 
//
this.line_2500 = function() {
//
return 2510;
} 
//
this.line_2510 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_NN;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_NN=this.X_REG;
return 2520;
} 
//
this.line_2520 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.VAR_NN;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this._stack.push(this.X_REG);
this.C_REG=this.CONST_3;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.VAR_NN$=this.A_REG;
return 2530;
} 
//
this.line_2530 = function() {
//
this.B_REG=this.CONST_36;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SNEQ();
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_37;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SGT();
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_38;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SLT();
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) | Math.floor(this.Y_REG);
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) & Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP21";}
return "SKIP21";
} 
//
this.NSKIP21 = function() {
return 2190;
//
return 2540;
} 
//
this.SKIP21 = function() {
return 2540;
} 
//
this.line_2540 = function() {
//
this.B_REG=this.CONST_36;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SEQ();
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP22";}
return "SKIP22";
} 
//
this.NSKIP22 = function() {
return 2510;
//
//
//
return 2550;
} 
//
this.SKIP22 = function() {
return 2550;
} 
//
this.line_2550 = function() {
//
return 2310;
} 
//
this.line_2560 = function() {
//
return 2570;
} 
//
this.line_2570 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_MM=this.X_REG;
return 2580;
} 
//
this.line_2580 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this._stack.push(this.A_REG);
// ignored: CHGCTX #0
this.C_REG=this.VAR_MM;
this._stack.push(this.C_REG);
this.C_REG=this.CONST_3;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.B_REG=this._stack.pop();
this.CONCAT();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.ASC();
this.VAR_AS=this.X_REG;
return 2590;
} 
//
this.line_2590 = function() {
//
this.Y_REG=this.CONST_31;
this.X_REG=this.VAR_AS;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
this._stack.push(this.X_REG);
this.Y_REG=this.CONST_32;
this.X_REG=this.VAR_AS;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) | Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP23";}
return "SKIP23";
} 
//
this.NSKIP23 = function() {
return 2760;
//
return 2600;
} 
//
this.SKIP23 = function() {
return 2600;
} 
//
this.line_2600 = function() {
//
this.Y_REG=this.CONST_35;
this.X_REG=this.VAR_AS;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP24";}
return "SKIP24";
} 
//
this.NSKIP24 = function() {
return 2670;
//
return 2610;
} 
//
this.SKIP24 = function() {
return 2610;
} 
//
this.line_2610 = function() {
//
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.LEN();
this.Y_REG=this.X_REG;
this.X_REG=this.VAR_MM;
this.X_REG=(this.X_REG<this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP25";}
return "SKIP25";
} 
//
this.NSKIP25 = function() {
return 2570;
//
return 2620;
} 
//
this.SKIP25 = function() {
return 2620;
} 
//
this.line_2620 = function() {
//
this.B_REG=this.CONST_40;
this.VAR_ER$=this.B_REG;
return 2630;
} 
//
this.line_2630 = function() {
//
this.X_REG=this.VAR_I;
this.G_REG=this.VAR_D_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.VAR_ER=this.X_REG;
return 2640;
} 
//
this.line_2640 = function() {
//
this.GOSUB("GOSUBCONT7");
return 3580;
} 
//
this.GOSUBCONT7 = function() {
return 2650;
} 
//
this.line_2650 = function() {
//
//
this.NEXT("VAR_I");
if ((this.A_REG==this.CONST_2?0:1)==0) {
return "($JUMP)";}
return 2670;
} 
//
this.line_2660 = function() {
//
return 2670;
} 
//
this.line_2670 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_MM=this.X_REG;
return 2680;
} 
//
this.line_2680 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this._stack.push(this.A_REG);
// ignored: CHGCTX #0
this.C_REG=this.VAR_MM;
this._stack.push(this.C_REG);
this.C_REG=this.CONST_3;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.B_REG=this._stack.pop();
this.CONCAT();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.ASC();
this.VAR_AS=this.X_REG;
return 2690;
} 
//
this.line_2690 = function() {
//
this.Y_REG=this.CONST_41;
this.X_REG=this.VAR_AS;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP26";}
return "SKIP26";
} 
//
this.NSKIP26 = function() {
return 2760;
//
return 2700;
} 
//
this.SKIP26 = function() {
return 2700;
} 
//
this.line_2700 = function() {
//
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.LEN();
this.Y_REG=this.X_REG;
this.X_REG=this.VAR_MM;
this.X_REG=(this.X_REG<this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP27";}
return "SKIP27";
} 
//
this.NSKIP27 = function() {
return 2670;
//
return 2710;
} 
//
this.SKIP27 = function() {
return 2710;
} 
//
this.line_2710 = function() {
//
this.B_REG=this.CONST_42;
this.VAR_ER$=this.B_REG;
return 2720;
} 
//
this.line_2720 = function() {
//
this.X_REG=this.VAR_I;
this.G_REG=this.VAR_D_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.VAR_ER=this.X_REG;
return 2730;
} 
//
this.line_2730 = function() {
//
this.GOSUB("GOSUBCONT8");
return 3580;
} 
//
this.GOSUBCONT8 = function() {
return 2740;
} 
//
this.line_2740 = function() {
//
//
this.NEXT("VAR_I");
if ((this.A_REG==this.CONST_2?0:1)==0) {
return "($JUMP)";}
return 2760;
} 
//
this.line_2750 = function() {
//
return 2760;
} 
//
this.line_2760 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_NN=this.Y_REG;
return 2770;
} 
//
this.line_2770 = function() {
//
this.Y_REG=this.VAR_NN;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_MM=this.X_REG;
return 2780;
} 
//
this.line_2780 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_NN=this.Y_REG;
return 2790;
} 
//
this.line_2790 = function() {
//
this.B_REG=this.CONST_1;
this.VAR_JA$=this.B_REG;
return 2800;
} 
//
this.line_2800 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_NN;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_NN=this.X_REG;
return 2810;
} 
//
this.line_2810 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.VAR_NN;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this._stack.push(this.X_REG);
this.C_REG=this.CONST_3;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.VAR_NN$=this.A_REG;
return 2820;
} 
//
this.line_2820 = function() {
//
this.B_REG=this.CONST_36;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SNEQ();
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_37;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SGT();
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_38;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SLT();
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) | Math.floor(this.Y_REG);
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) & Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP28";}
return "SKIP28";
} 
//
this.NSKIP28 = function() {
return 2850;
//
return 2830;
} 
//
this.SKIP28 = function() {
return 2830;
} 
//
this.line_2830 = function() {
//
this.COMPACTMAX();
this.B_REG=this.VAR_NN$;
this.A_REG=this.VAR_JA$;
this.CONCAT();
this.VAR_JA$=this.A_REG;
return 2840;
} 
//
this.line_2840 = function() {
//
return 2800;
} 
//
this.line_2850 = function() {
//
this.B_REG=this.VAR_JA$;
// ignored: CHGCTX #0
this.VAL();
this.VAR_JA=this.X_REG;
return 2860;
} 
//
this.line_2860 = function() {
//
this.GOSUB("GOSUBCONT9");
return 1200;
} 
//
this.GOSUBCONT9 = function() {
return 2870;
} 
//
this.line_2870 = function() {
//
this.COMPACTMAX();
this.C_REG=this.VAR_MM;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.C_REG=this._stack.pop();
this.LEFT();
this.VAR_LI$=this.A_REG;
return 2880;
} 
//
this.line_2880 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.VAR_NN;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this._stack.push(this.X_REG);
this.C_REG=this.CONST_39;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.VAR_RE$=this.A_REG;
return 2890;
} 
//
this.line_2890 = function() {
//
this.Y_REG=this.VAR_I;
this._stack.push(this.Y_REG);
//
this.COMPACTMAX();
this.Y_REG=this.VAR_JN;
// ignored: CHGCTX #1
this.STR();
this.B_REG=this.A_REG;
this.A_REG=this.VAR_LI$;
this.CONCAT();
this.B_REG=this.VAR_RE$;
this.CONCAT();
this.X_REG=this._stack.pop();
this.G_REG=this.VAR_D$_array;
this.ARRAYSTORE_STRING();
return 2900;
} 
//
this.line_2900 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_NN;
this.X_REG=this.X_REG-this.Y_REG;
this.VAR_NN=this.X_REG;
return 2910;
} 
//
this.line_2910 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_NN;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_NN=this.X_REG;
return 2920;
} 
//
this.line_2920 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.VAR_NN;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this._stack.push(this.X_REG);
this.C_REG=this.CONST_3;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.VAR_NN$=this.A_REG;
return 2930;
} 
//
this.line_2930 = function() {
//
this.B_REG=this.CONST_36;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SEQ();
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP29";}
return "SKIP29";
} 
//
this.NSKIP29 = function() {
return 2910;
//
return 2940;
} 
//
this.SKIP29 = function() {
return 2940;
} 
//
this.line_2940 = function() {
//
this.B_REG=this.CONST_4;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SEQ();
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP30";}
return "SKIP30";
} 
//
this.NSKIP30 = function() {
return 2770;
//
return 2950;
} 
//
this.SKIP30 = function() {
return 2950;
} 
//
this.line_2950 = function() {
//
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.LEN();
this._stack.push(this.X_REG);
this.Y_REG=this.VAR_NN;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this.Y_REG=this._stack.pop();
this.X_REG=(this.X_REG>this.Y_REG?-1:0);
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_23;
this.A_REG=this.VAR_NN$;
// ignored: CHGCTX #0
this.SEQ();
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) | Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP31";}
return "SKIP31";
} 
//
this.NSKIP31 = function() {
//
//
this.Y_REG=this.VAR_NN;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_MM=this.X_REG;
return 2190;
//
return 2960;
} 
//
this.SKIP31 = function() {
return 2960;
} 
//
this.line_2960 = function() {
//
return 2910;
} 
//
this.line_2970 = function() {
//
return 2980;
} 
//
this.line_2980 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_MM=this.X_REG;
return 2990;
} 
//
this.line_2990 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this._stack.push(this.A_REG);
// ignored: CHGCTX #0
this.C_REG=this.VAR_MM;
this._stack.push(this.C_REG);
this.C_REG=this.CONST_3;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.B_REG=this._stack.pop();
this.CONCAT();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.ASC();
this.VAR_AS=this.X_REG;
return 3000;
} 
//
this.line_3000 = function() {
//
this.Y_REG=this.CONST_41;
this.X_REG=this.VAR_AS;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP32";}
return "SKIP32";
} 
//
this.NSKIP32 = function() {
return 2310;
//
//
//
return 3010;
} 
//
this.SKIP32 = function() {
return 3010;
} 
//
this.line_3010 = function() {
//
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.LEN();
this.Y_REG=this.X_REG;
this.X_REG=this.VAR_MM;
this.X_REG=(this.X_REG<this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP33";}
return "SKIP33";
} 
//
this.NSKIP33 = function() {
return 2980;
//
return 3020;
} 
//
this.SKIP33 = function() {
return 3020;
} 
//
this.line_3020 = function() {
//
this.B_REG=this.CONST_42;
this.VAR_ER$=this.B_REG;
return 3030;
} 
//
this.line_3030 = function() {
//
this.X_REG=this.VAR_I;
this.G_REG=this.VAR_D_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.VAR_ER=this.X_REG;
return 3040;
} 
//
this.line_3040 = function() {
//
this.GOSUB("GOSUBCONT10");
return 3580;
} 
//
this.GOSUBCONT10 = function() {
return 3050;
} 
//
this.line_3050 = function() {
//
//
this.NEXT("VAR_I");
if ((this.A_REG==this.CONST_2?0:1)==0) {
return "($JUMP)";}
return 3070;
} 
//
this.line_3060 = function() {
//
return 3080;
} 
//
this.line_3070 = function() {
//
return 3090;
} 
//
this.line_3080 = function() {
//
return 3090;
} 
//
this.line_3090 = function() {
//
this.B_REG=this.CONST_12;
this.A_REG=this.VAR_FO$;
// ignored: CHGCTX #0
this.SNEQ();
this._stack.push(this.X_REG);
// ignored: CHGCTX #1
this.B_REG=this.CONST_13;
this.A_REG=this.VAR_FO$;
// ignored: CHGCTX #0
this.SNEQ();
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) & Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP34";}
return "SKIP34";
} 
//
this.NSKIP34 = function() {
return 3300;
//
return 3100;
} 
//
this.SKIP34 = function() {
return 3100;
} 
//
this.line_3100 = function() {
//
this.A_REG=this.CONST_28;
this.STROUT();
//
this.Y_REG=this.CONST_18;
// ignored: CHGCTX #1
this.TAB();
//
this.A_REG=this.CONST_43;
this.STROUT();
this.LINEBREAK();
return 3110;
} 
//
this.line_3110 = function() {
//
this.Y_REG=this.CONST_2;
this.VAR_FO=this.Y_REG;
return 3120;
} 
//
this.line_3120 = function() {
//
this.Y_REG=this.CONST_3;
this.VAR_I=this.Y_REG;
//
this.Y_REG=this.VAR_DD;
this._stack.push(this.Y_REG);
//
this.Y_REG=this.CONST_3;
this._stack.push(this.Y_REG);
//
this.INITFOR("FORLOOP4","VAR_I");
return 3130;
} 
//
this.FORLOOP4 = function() {
return 3130;
} 
//
this.line_3130 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_MM=this.Y_REG;
return 3140;
} 
//
this.line_3140 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_F1=this.Y_REG;
return 3150;
} 
//
this.line_3150 = function() {
//
this.Y_REG=this.CONST_30;
this.VAR_F2=this.Y_REG;
return 3160;
} 
//
this.line_3160 = function() {
//
this.Y_REG=this.VAR_I;
this._stack.push(this.Y_REG);
//
this.COMPACTMAX();
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this._stack.push(this.A_REG);
// ignored: CHGCTX #0
this.C_REG=this.VAR_FO;
// ignored: CHGCTX #1
this.B_REG=this.CONST_44;
this.LEFT();
this.B_REG=this._stack.pop();
this.CONCAT();
this.X_REG=this._stack.pop();
this.G_REG=this.VAR_D$_array;
this.ARRAYSTORE_STRING();
return 3170;
} 
//
this.line_3170 = function() {
//
this.A_REG=this.CONST_28;
this.STROUT();
//
this.Y_REG=this.CONST_20;
// ignored: CHGCTX #1
this.TAB();
//
this.X_REG=this.VAR_I;
this.G_REG=this.VAR_D_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.REALOUT();
this.CHECKCMD();
this.LINEBREAK();
return 3180;
} 
//
this.line_3180 = function() {
//
this.Y_REG=this.CONST_3;
this.X_REG=this.VAR_MM;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_MM=this.X_REG;
return 3190;
} 
//
this.line_3190 = function() {
//
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.LEN();
this.Y_REG=this.X_REG;
this.X_REG=this.VAR_MM;
this.X_REG=(this.X_REG>this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP35";}
return "SKIP35";
} 
//
this.NSKIP35 = function() {
this._memory[this.A_REG]=this.VAR_I;
//
this.NEXT("0");
if ((this.A_REG==this.CONST_2?0:1)==0) {
return "($JUMP)";}
return 3300;
//
return 3200;
} 
//
this.SKIP35 = function() {
return 3200;
} 
//
this.line_3200 = function() {
//
this.COMPACTMAX();
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this._stack.push(this.A_REG);
// ignored: CHGCTX #0
this.C_REG=this.VAR_MM;
this._stack.push(this.C_REG);
this.C_REG=this.CONST_3;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this.B_REG=this._stack.pop();
this.CONCAT();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.ASC();
this.VAR_YY=this.X_REG;
return 3210;
} 
//
this.line_3210 = function() {
//
this.Y_REG=this.CONST_26;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP36";}
return "SKIP36";
} 
//
this.NSKIP36 = function() {
//
//
this.Y_REG=this.VAR_F2;
this.X_REG=this.CONST_3;
this.X_REG=this.X_REG-this.Y_REG;
this.VAR_F2=this.X_REG;
//
//
return 3220;
} 
//
this.SKIP36 = function() {
return 3220;
} 
//
this.line_3220 = function() {
//
this.Y_REG=this.CONST_25;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP37";}
return "SKIP37";
} 
//
this.NSKIP37 = function() {
//
//
this.Y_REG=this.CONST_3;
this.VAR_F1=this.Y_REG;
//
//
return 3230;
} 
//
this.SKIP37 = function() {
return 3230;
} 
//
this.line_3230 = function() {
//
this.Y_REG=this.VAR_F2;
this.X_REG=this.VAR_F1;
this.X_REG=Math.floor(this.X_REG) | Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP38";}
return "SKIP38";
} 
//
this.NSKIP38 = function() {
return 3180;
//
//
//
return 3240;
} 
//
this.SKIP38 = function() {
return 3240;
} 
//
this.line_3240 = function() {
//
this.Y_REG=this.CONST_45;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP39";}
return "SKIP39";
} 
//
this.NSKIP39 = function() {
//
//
this.Y_REG=this.CONST_5;
this.X_REG=this.VAR_FO;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_FO=this.X_REG;
//
//
return 3250;
} 
//
this.SKIP39 = function() {
return 3250;
} 
//
this.line_3250 = function() {
//
this.Y_REG=this.CONST_2;
this.X_REG=this.VAR_FO;
this.X_REG=(this.X_REG>this.Y_REG?-1:0);
this._stack.push(this.X_REG);
this.Y_REG=this.CONST_46;
this.X_REG=this.VAR_YY;
this.X_REG=(this.X_REG==this.Y_REG?-1:0);
this.Y_REG=this._stack.pop();
this.X_REG=Math.floor(this.X_REG) & Math.floor(this.Y_REG);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP40";}
return "SKIP40";
} 
//
this.NSKIP40 = function() {
//
//
this.Y_REG=this.CONST_5;
this.X_REG=this.VAR_FO;
this.X_REG=this.X_REG-this.Y_REG;
this.VAR_FO=this.X_REG;
//
//
this.Y_REG=this.VAR_I;
this._stack.push(this.Y_REG);
//
this.COMPACTMAX();
this.Y_REG=this.CONST_15;
this.X_REG=this.VAR_FO;
this.X_REG=this.X_REG+this.Y_REG;
this._stack.push(this.X_REG);
this.C_REG=this.CONST_39;
this._stack.push(this.C_REG);
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
this.D_REG=this._stack.pop();
this.C_REG=this._stack.pop();
this.MID();
this._stack.push(this.A_REG);
// ignored: CHGCTX #0
this.C_REG=this.VAR_FO;
// ignored: CHGCTX #1
this.B_REG=this.CONST_44;
this.LEFT();
this.B_REG=this._stack.pop();
this.CONCAT();
this.X_REG=this._stack.pop();
this.G_REG=this.VAR_D$_array;
this.ARRAYSTORE_STRING();
return 3260;
} 
//
this.SKIP40 = function() {
return 3260;
} 
//
this.line_3260 = function() {
//
return 3180;
} 
//
this.line_3270 = function() {
//
return 3290;
} 
//
this.line_3280 = function() {
//
return 3300;
} 
//
this.line_3290 = function() {
//
return 3300;
} 
//
this.line_3300 = function() {
//
this.A_REG=this.CONST_47;
this.STROUT();
//
this.Y_REG=this.CONST_48;
// ignored: CHGCTX #1
this.TAB();
//
this.A_REG=this.CONST_49;
this.STROUT();
this.LINEBREAK();
return 3320;
} 
//
this.line_3310 = function() {
//
return 3330;
} 
//
this.line_3320 = function() {
//
return 3340;
} 
//
this.line_3330 = function() {
//
return 3350;
} 
//
this.line_3340 = function() {
//
return 3350;
} 
//
this.line_3350 = function() {
//
this.Y_REG=this.CONST_50;
this.VAR_AD=this.Y_REG;
return 3370;
} 
//
this.line_3360 = function() {
//
return 3380;
} 
//
this.line_3370 = function() {
//
return 3380;
} 
//
this.line_3380 = function() {
//
this.LOCKCHANNEL();
this.Y_REG=this.CONST_5;
this._stack.push(this.Y_REG);
//
this.COMPACTMAX();
this.Y_REG=this.CONST_51;
// ignored: CHGCTX #1
this.CHR();
this.C_REG=this._stack.pop();
this.STROUTCHANNEL();
this._stack.push(this.C_REG);
//
this.COMPACTMAX();
this.Y_REG=this.CONST_52;
// ignored: CHGCTX #1
this.CHR();
this.C_REG=this._stack.pop();
this.STROUTCHANNEL();
this.UNLOCKCHANNEL();
return 3390;
} 
//
this.line_3390 = function() {
//
this.Y_REG=this.CONST_3;
this.VAR_I=this.Y_REG;
//
this.Y_REG=this.VAR_DD;
this._stack.push(this.Y_REG);
//
this.Y_REG=this.CONST_3;
this._stack.push(this.Y_REG);
//
this.INITFOR("FORLOOP5","VAR_I");
return 3400;
} 
//
this.FORLOOP5 = function() {
return 3400;
} 
//
this.line_3400 = function() {
//
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.B_REG=this.A_REG;
// ignored: CHGCTX #0
this.LEN();
this.Y_REG=this.VAR_AD;
this.X_REG=this.X_REG+this.Y_REG;
this.Y_REG=this.CONST_53;
this.X_REG=this.X_REG+this.Y_REG;
this.VAR_AD=this.X_REG;
return 3410;
} 
//
this.line_3410 = function() {
//
this.Y_REG=this.VAR_AD;
this.X_REG=this.CONST_54;
this.X_REG=Math.floor(this.X_REG) & Math.floor(this.Y_REG);
this.VAR_LP=this.X_REG;
return 3420;
} 
//
this.line_3420 = function() {
//
this.Y_REG=this.CONST_6;
this.X_REG=this.VAR_AD;
this.X_REG=this.X_REG/this.Y_REG;
this.VAR_HP=this.X_REG;
return 3430;
} 
//
this.line_3430 = function() {
//
this.LOCKCHANNEL();
this.Y_REG=this.CONST_5;
this._stack.push(this.Y_REG);
//
this.COMPACTMAX();
this.Y_REG=this.VAR_LP;
// ignored: CHGCTX #1
this.CHR();
this.C_REG=this._stack.pop();
this.STROUTCHANNEL();
this._stack.push(this.C_REG);
//
this.COMPACTMAX();
this.Y_REG=this.VAR_HP;
// ignored: CHGCTX #1
this.CHR();
this.C_REG=this._stack.pop();
this.STROUTCHANNEL();
this.UNLOCKCHANNEL();
return 3440;
} 
//
this.line_3440 = function() {
//
this.X_REG=this.VAR_I;
this.G_REG=this.VAR_D_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.Y_REG=this.CONST_54;
this.X_REG=Math.floor(this.X_REG) & Math.floor(this.Y_REG);
this.VAR_LZ=this.X_REG;
return 3450;
} 
//
this.line_3450 = function() {
//
this.X_REG=this.VAR_I;
this.G_REG=this.VAR_D_array;
// ignored: CHGCTX #0
this.ARRAYACCESS_REAL();
this.Y_REG=this.CONST_6;
this.X_REG=this.X_REG/this.Y_REG;
this.VAR_HZ=this.X_REG;
return 3460;
} 
//
this.line_3460 = function() {
//
this.LOCKCHANNEL();
this.Y_REG=this.CONST_5;
this._stack.push(this.Y_REG);
//
this.COMPACTMAX();
this.Y_REG=this.VAR_LZ;
// ignored: CHGCTX #1
this.CHR();
this.C_REG=this._stack.pop();
this.STROUTCHANNEL();
this._stack.push(this.C_REG);
//
this.COMPACTMAX();
this.Y_REG=this.VAR_HZ;
// ignored: CHGCTX #1
this.CHR();
this.C_REG=this._stack.pop();
this.STROUTCHANNEL();
this.UNLOCKCHANNEL();
return 3470;
} 
//
this.line_3470 = function() {
//
this.LOCKCHANNEL();
this.Y_REG=this.CONST_5;
this._stack.push(this.Y_REG);
//
this.X_REG=this.VAR_I;
// ignored: CHGCTX #1
this.G_REG=this.VAR_D$_array;
this.ARRAYACCESS_STRING();
this.C_REG=this._stack.pop();
this.STROUTCHANNEL();
this._stack.push(this.C_REG);
//
this.COMPACTMAX();
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this.C_REG=this._stack.pop();
this.STROUTCHANNEL();
this.UNLOCKCHANNEL();
return 3480;
} 
//
this.line_3480 = function() {
//
//
this.NEXT("0");
if ((this.A_REG==this.CONST_2?0:1)==0) {
return "($JUMP)";}
return 3490;
} 
//
this.line_3490 = function() {
//
this.LOCKCHANNEL();
this.Y_REG=this.CONST_5;
this._stack.push(this.Y_REG);
//
this.COMPACTMAX();
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this.C_REG=this._stack.pop();
this.STROUTCHANNEL();
this._stack.push(this.C_REG);
//
this.COMPACTMAX();
this.Y_REG=this.CONST_2;
// ignored: CHGCTX #1
this.CHR();
this.C_REG=this._stack.pop();
this.STROUTCHANNEL();
this.UNLOCKCHANNEL();
return 3510;
} 
//
this.line_3500 = function() {
//
return 3520;
} 
//
this.line_3510 = function() {
//
return 3520;
} 
//
this.line_3520 = function() {
//
this.A_REG=this.CONST_55;
this.STROUT();
//
this.X_REG=this.VAR_ER_int;
this.INTOUT();
this.CHECKCMD();
this.LINEBREAK();
return 3530;
} 
//
this.line_3530 = function() {
//
this.LINEBREAK();
return 3540;
} 
//
this.line_3540 = function() {
//
this.END();
return;
} 
//
this.line_3550 = function() {
//
return 3570;
} 
//
this.line_3560 = function() {
//
return 3580;
} 
//
this.line_3570 = function() {
//
return 3580;
} 
//
this.line_3580 = function() {
//
this.B_REG=this.VAR_ER$;
this.VAR_D$=this.B_REG;
return 3590;
} 
//
this.line_3590 = function() {
//
this.Y_REG=this.VAR_ER;
this.VAR_D=this.Y_REG;
return 3600;
} 
//
this.line_3600 = function() {
//
this.A_REG=this.CONST_56;
this.STROUT();
//
this.A_REG=this.VAR_SN$;
this.STROUT();
//
this.A_REG=this.CONST_57;
this.STROUT();
this.LINEBREAK();
return 3610;
} 
//
this.line_3610 = function() {
//
this.A_REG=this.CONST_58;
this.STROUT();
//
this.A_REG=this.VAR_D$;
this.STROUT();
return 3620;
} 
//
this.line_3620 = function() {
//
this.B_REG=this.VAR_D$;
// ignored: CHGCTX #0
this.VAL();
this.Y_REG=this.X_REG;
this.X_REG=this.VAR_D;
this.X_REG=(this.X_REG!=this.Y_REG?-1:0);
if ((this.X_REG==this.CONST_2?0:1)==1) {
return "NSKIP41";}
return "SKIP41";
} 
//
this.NSKIP41 = function() {
//
//
this.A_REG=this.CONST_59;
this.STROUT();
//
this.X_REG=this.VAR_D;
this.REALOUT();
this.CRSRRIGHT();
return 3630;
} 
//
this.SKIP41 = function() {
return 3630;
} 
//
this.line_3630 = function() {
//
return 3650;
} 
//
this.line_3640 = function() {
//
return 3660;
} 
//
this.line_3650 = function() {
//
return 3660;
} 
//
this.line_3660 = function() {
//
this.A_REG=this.CONST_61;
this.STROUT();
this.LINEBREAK();
return 3670;
} 
//
this.line_3670 = function() {
//
this.A_REG=this.CONST_62;
this.STROUT();
return 3680;
} 
//
this.line_3680 = function() {
//
return "RETURN";
//
this.END();
return;
}
// *** SUBROUTINES ***
this.restart = false;
this.running = true;
this.keyPressed=null;
this.lineNumber = 0;
this.timeOut=0;
this.funcName = "PROGRAMSTART";
this.batchSize=500;
this.tmpy=0;
this.disk=new Disk(this);
function File() {
this.name;
this.content=new Array();
}
function FilePointer() {
this.channel=0;
this.file=null;
this.position=0;
this.disk=null;
this.master=null;
this.readString = function() {
return this.readLine();
}
this.readLine = function() {
var ret="";
var content=this.file.content;
for (var i=this.position; i<content.length; i++) {
var c=content[i];
this.position++;
c=this.master.convert(c);
if (c==',' || c==':' || c=='\n' || c=='\r') {
if (c=='\n' && i<content.length-1 && content [i+1]=='\r') {
this.position++;
}
if (c=='\r' && i<content.length-1 && content [i+1]=='\n') {
this.position++;
}
if (i==content.length-1) {
this.disk.flagError();
}
return ret;
}
ret=ret+c;
}
this.disk.flagError();
return ret;
}
}
function Disk(master) {
this.files=new Array();
this.openFiles=new Array();
this.status=0;
this.master=master;
this.init = function() {
this.status=0;
}
this.getStatus = function() {
return this.status;
}
this.flagError = function() {
this.status=64;
}
this.get = function(channel) {
for (var i=0; i<this.openFiles.length; i++) {
var file=this.openFiles[i];
if (file.channel==channel) {
return file;
}
}
console.log("Channel "+channel+" not open");
return null;
}
this.open = function(channel, device, subAddr, name) {
this.close(channel);
name=name.toLowerCase();
var parts=name.split(",");
var type="s";
var mode="r";
if (parts.length>1) {
name=parts[0];
if (parts.length==1) {
mode=parts[1];
}
if (parts.length==2) {
mode=parts[2];
type=parts[1];
}
if (mode.length>1) {
mode=mode.substring(0,1);
}
}
if (subAddr==0) {
mode="r";
}
if (subAddr==1) {
mode="w";
}
var found=null;
for (var i=0; i<this.files.length; i++) {
var file=this.files[i];
if (file.name==name) {
found=file;
break;
}
}
this.init();
if (!found) {
found=new File();
found.name=name;
if (mode=="r") {
var xhr = new XMLHttpRequest();
console.log("grabbing file "+name);
xhr.open('GET', name, false);
xhr.overrideMimeType("text/plain; charset=x-user-defined");
xhr.onload = function() {
if (xhr.status === 200) {
found.content=xhr.responseText.split('');
//console.log("debug: "+xhr.responseText);
console.log("file "+name+" loaded from remote");
}
else {
console.log("file "+name+" not found");
found.content=new Array();
}
};
xhr.send();
}
this.files.push(found);
}
if (mode=="w") {
found.content=new Array();
console.log("emtpy file "+name+" created");
}
console.log("file "+name+" opened");
var pointer=new FilePointer();
pointer.file=found;
pointer.channel=channel;
pointer.position=0;
pointer.disk=this;
pointer.master=this.master;
this.openFiles.push(pointer);
}
this.close = function(channel) {
this.init();
for (var i=0; i<this.openFiles.length; i++) {
var file=this.openFiles[i];
if (file.channel==channel) {
console.log("closed channel "+channel+"/"+file.file.name);
this.openFiles.splice(i, 1);
break;
}
}
}
}
this.getMemory = function() {
return this._memory;
}
this.registerKey= function(key) {
var k=key[1];
var ctx=this;
if (k.length>1) {
k=String.fromCharCode(key[2]);
}
if (key[0]) {
this.keyPressed=k;
this._memory[198]=1;
self.setTimeout(function() {
ctx.keyPressed=null;
ctx._memory[198]=0;
}, 200);
} else {
this.keyPressed=null;
this._memory[198]=0;
}
}
this.execute = function(threaded) {
if (!threaded) {
do  {
this.reinit();
while (this.running) {
this.executeLine(threaded);
}
} while(this.restart);
} else {
this.reinit();
this.executeThreaded();
}
}
this.executeThreaded = function() {
var cnt=0;
do {
if (this.restart) {
this.reinit();
}
this.executeLine(true);
} while(this.running && cnt++<this.batchSize);
if (this.running) {
var ctx=this;
self.setTimeout(function() {
ctx.executeThreaded();
}, this.timeOut);
this.timeOut=0;
}
}
this.reinit = function() {
this.lineNumber = 0;
this.funcName = "PROGRAMSTART";
this.restart=false;
this.running=true;
}
this.executeLine = function(threaded) {
var nextLine = this[this.funcName]();
if (nextLine != null) {
this.lineNumber = nextLine;
if (this.lineNumber == "($JUMP)") {
this.lineNumber = this.JUMP_TARGET;
}
if (Number.isInteger(this.lineNumber)) {
this.funcName = "line_" + this.lineNumber;
} else {
this.funcName = this.lineNumber;
}
} else {
this.running = false;
}
if (threaded) {
_self.postMessage(this.funcName);
}
}
this.START = function() {
this.INIT();
if (!Array.prototype.fill) {
for (var i=0; i<this._memory.length; i++) {
this._memory[i]=0;
}
} else {
this._memory.fill(0);
}
this._memory[646]=14;
}
this.RUN = function() {
this.running=false;
this.restart=true;
}
this.RESTARTPRG = function() {
// This is not correct behaviour as BASIC does it, because it doesn't preserve the variables, but...who cares?
this.running=false;
this.restart=true;
}
this.END = function() {
//
}
this.CLEARQUEUE = function() {
this._inputQueue=new Array();
}
this.QUEUESIZE = function() {
this.X_REG=this._inputQueue.length;
}
this.EXTRAIGNORED = function() {
out("?extra ignored!");
}
this.INPUTNUMBER = function() {
var inp=this.input();
if (this.isNumeric(inp)) {
this.Y_REG=parseFloat(inp);
this.X_REG=0;
} else {
this.X_REG=-1;
}
}
this.INPUTSTR = function() {
var inp=this.input();
this.A_REG=inp;
}
this.GETSTR = function() {
this.A_REG=this.get();
}
this.GETNUMBER = function() {
this.Y_REG=0;
var fk=this.get();
if (fk && this.isNumeric(fk)) {
this.Y_REG=parseFloat(fk);
} else {
out("?syntax error");
}
}
this.isNumeric = function(num) {
return !isNaN(parseFloat(num));
}
this.GOSUB = function(gosubCont) {
this._forstack.push(gosubCont);
this._forstack.push(0);
}
this.RETURN = function() {
var val = 0;
if (this._forstack.length == 0) {
throw "RETURN without GOSUB error!";
}
do {
val = this._forstack.pop();
if (val == 1) {
// skip FORs
this._forstack.pop();
this._forstack.pop();
this._forstack.pop();
this._forstack.pop();
}
} while (val != 0);
return this._forstack.pop();
}
this.adjustStack = function(variable) {
for (var i=this._forstack.length; i>0;) {
var type = this._forstack[i-1];
if (type==0) {
return;
}
var stvar = this._forstack[i-2];
var addr = this._forstack[i-3];
var end = this._forstack[i-4];
var step = this._forstack[i-5];
i-=5;
if (stvar==variable) {
this._forstack=this._forstack.slice(0,i);
return;
}
}
}
this.INITFOR = function(addr, variable) {
this.adjustStack(variable);
this._forstack.push(this._stack.pop()); // step
this._forstack.push(this._stack.pop()); // end
this._forstack.push(addr); // address
this._forstack.push(variable); // var ref
this._forstack.push(1); // type
}
this.NEXT = function(variable) {
var found = false;
do {
if (this._forstack.length == 0) {
throw "NEXT without FOR error!";
}
var type = this._forstack.pop();
if (type == 0) {
throw "NEXT without FOR error!";
}
var stvar = this._forstack.pop();
var addr = this._forstack.pop();
var end = this._forstack.pop();
var step = this._forstack.pop();
found = variable == "0" || variable == stvar;
} while (!found);
this[stvar] += step;
if ((step >= 0 && this[stvar] <= end) || (step < 0 && this[stvar] >= end)) {
// restore stack content if needed
this._forstack.push(step); // step
this._forstack.push(end); // end
this._forstack.push(addr); // address
this._forstack.push(stvar); // var ref
this._forstack.push(1); // type
this.A_REG = 0;
this.JUMP_TARGET = addr;
return;
}
this.A_REG = 1;
return;
}
this.ARRAYACCESS_REAL = function() {
this.X_REG = this.G_REG[Math.floor(this.X_REG)];
if (this.X_REG==null) {
this.X_REG=0;
}
}
this.ARRAYACCESS_INTEGER = function() {
this.X_REG = this.G_REG[Math.floor(this.X_REG)];
if (this.X_REG==null) {
this.X_REG=0;
}
this.X_REG=Math.floor(this.X_REG);
}
this.ARRAYACCESS_STRING = function() {
this.A_REG = this.G_REG[Math.floor(this.X_REG)];
if (this.A_REG==null) {
this.A_REG="";
}
}
this.ARRAYSTORE_REAL = function() {
this.G_REG[Math.floor(this.X_REG)] = this.Y_REG;
}
this.ARRAYSTORE_INTEGER = function() {
this.G_REG[Math.floor(this.X_REG)] = Math.floor(this.Y_REG);
}
this.ARRAYSTORE_STRING = function() {
this.G_REG[Math.floor(this.X_REG)] = this.A_REG;
}
this.STR = function() {
this.A_REG=this.Y_REG.toString(10);
}
this.VAL = function() {
this.X_REG=parseFloat((""+this.B_REG).replace(/ /g,""));
}
this.LEN = function() {
if (this.B_REG==null) {
this.B_REG="";
}
this.X_REG=this.B_REG.length;
}
this.CHR = function() {
this.A_REG=String.fromCharCode(Math.floor(this.Y_REG));
}
this.ASC = function() {
if (this.B_REG.length==0) {
this.X_REG=0;
return;
}
var cc=this.B_REG.charCodeAt(0);
var c=this.B_REG.charAt(0);
if (c>='a' && c<='z') {
//cc-=32;
}
this.X_REG=cc;
}
this.POS = function() {
this.X_REG=this._line.length;
}
this.TAB = function() {
var tb=Math.floor(this.Y_REG);
tb-=this._line.length;
for (var i=0;i<tb; i++) {
this._line+=" ";
}
}
this.SPC = function() {
var tb=Math.floor(this.Y_REG);
for (var i=0;i<tb; i++) {
this._line+=" ";
}
}
this.FRE = function() {
this.X_REG=65535;
}
this.CONCAT = function() {
this.A_REG=this.A_REG+this.B_REG;
}
this.MID = function() {
if (this.C_REG>this.B_REG.length) {
this.A_REG="";
return;
}
var end=this.C_REG-1+this.D_REG;
if (this.D_REG===-1) {
end=this.B_REG.length;
}
this.A_REG=this.B_REG.substring(this.C_REG-1, end);
}
this.LEFT = function() {
if (this.C_REG>this.B_REG.length) {
this.A_REG=this.B_REG;
return;
}
if (this.C_REG===0) {
this.A_REG="";
return;
}
this.A_REG=this.B_REG.substring(0, this.C_REG);
}
this.RIGHT = function() {
if (this.C_REG>this.B_REG.length) {
this.A_REG=this.B_REG;
return;
}
if (this.C_REG===0) {
this.A_REG="";
return;
}
this.A_REG=this.B_REG.substring(this.B_REG.length-this.C_REG);
}
this.SEQ = function() {
this.X_REG=(this.A_REG===this.B_REG?-1:0);
}
this.SNEQ = function() {
this.X_REG=(this.A_REG===this.B_REG?0:-1);
}
this.SGT = function() {
this.X_REG=(this.A_REG>this.B_REG?-1:0);
}
this.SLT = function() {
this.X_REG=(this.A_REG<this.B_REG?-1:0);
}
this.SGTEQ = function() {
this.X_REG=(this.A_REG>=this.B_REG?-1:0);
}
this.SLTEQ = function() {
this.X_REG=(this.A_REG<=this.B_REG?-1:0);
}
this.COMPACT = function() {
// Nothing to do in this context
}
this.COMPACTMAX = function() {
// Nothing to do in this context
}
this.SYSTEMCALLDYN = function() {
// Nothing to do in this context
}
this.APPENDSYSCHAR = function() {
// Nothing to do in this context
}
this.SETUPMULTIPARS = function() {
// Nothing to do in this context
}
this.COPYSTRINGPAR = function() {
// Nothing to do in this context
}
this.COPYREALPAR = function() {
// Nothing to do in this context
}
this.ADDCOLON = function() {
// Nothing to do in this context
}
this.PULLDOWNMULTIPARS = function() {
// Nothing to do in this context
}
this.STROUT = function() {
this.out(this.A_REG);
}
this.QMARKOUT1 = function() {
this.out("?");
}
this.CRSRRIGHT = function() {
this.out(" ");
}
this.QMARKOUT2 = function() {
this.out("??");
}
this.REALOUT = function() {
this.out(this.X_REG);
}
this.INTOUT = function() {
this.out(this.X_REG);
}
this.CHECKCMD = function() {
//
}
this.LINEBREAK = function() {
this.out("\n");
}
this.TABOUT = function() {
this.out("\t");
}
this.WRITETID = function(value) {
var d = new Date();
this._time = d.getTime();
this._timeOffset = parseInt(value.substring(0, 2), 10) * 1000 * 60 * 60
+ parseInt(value.substring(2, 4), 10) * 1000 * 60
+ parseInt(value.substring(4, 6), 10) * 1000;
}
this.READTI = function() {
var d = new Date();
var t=d.getTime();
t=Math.floor((t-this._time+this._timeOffset)/(1000.0/60.0));
//console.log("ti: "+t+"/"+this._time+"/"+this._timeOffset+"/"+(t-this._time+this._timeOffset));
this.tmpy=t;
}
this.READTID = function() {
var d = new Date();
var t=d.getTime();
t=(t-this._time+this._timeOffset);
var h=Math.floor(t/(1000 * 60 * 60));
var m=Math.floor((t-(h*(1000 * 60 * 60)))/(1000 * 60));
var s=Math.floor((t-(h*(1000 * 60 * 60))-m*(1000 * 60))/1000);
h=this.fill(h);
m=this.fill(m);
s=this.fill(s);
this.tmpy= h+m+s;
}
this.fill = function(num) {
num=num.toString(10);
if (num.length==1) {
num="0"+num;
}
return num;
}
this.READSTATUS = function() {
this.tmpy= this.disk.getStatus();
}
this.RESTORE = function() {
this._dataPtr=0;
}
this.READSTR = function() {
this.A_REG=this._datas[this._dataPtr++];
}
this.READNUMBER = function() {
var n=this._datas[this._dataPtr++];
if (n=="" || n==".") {
n=0;
}
this.Y_REG=n;
}
this.FINX = function() {
throw new Error("Fast inc optimization not supported for target JS!");
}
this.FDEX = function() {
throw new Error("Fast dec optimization not supported for target JS!");
}
this.FASTFOR = function() {
throw new Error("Fast for optimization not supported for target JS!");
}
this.OPEN = function() {
this.disk.open(this.X_REG, this.C_REG, this.D_REG, this.B_REG);
}
this.CLOSE = function() {
this.disk.close(this.X_REG);
}
this.CMD = function() {
console.log("[CMD not supported for JS, call ignored: "+this.X_REG+"]");
}
this.LOCKCHANNEL = function() {
// Nothing to do
}

this.UNLOCKCHANNEL = function() {
// Nothing to do
}
this.STROUTCHANNEL = function() {
	var txt = this.A_REG;
	try {
		for (var pp=0; pp<txt.length; pp++) {
			var cc = txt.charCodeAt(pp);
			this.blobOut.push(cc & 0xFF);
		}
	} catch(e) {
		console.log(e);
	}
}
this.REALOUTCHANNEL = function() {
console.log("[PRINT# not supported for JS, redirected to normal PRINT]");
this.REALOUT();
}
this.LINEBREAKCHANNEL = function() {
console.log("[PRINT# not supported for JS, redirected to normal PRINT]");
this.LINEBREAK();
}
this.INTOUTCHANNEL = function() {
console.log("[PRINT# not supported for JS, redirected to normal PRINT]");
this.INTOUT();
}
this.INPUTNUMBERCHANNEL = function() {
var fp=this.disk.get(this.C_REG);
var inp=fp.readString();
if (this.isNumeric(inp)) {
this.Y_REG=parseFloat(inp);
this.X_REG=0;
} else {
this.X_REG=-1;
}
}
this.INPUTSTRCHANNEL = function() {
var fp=this.disk.get(this.C_REG);
this.A_REG=fp.readString();
}
this.GETSTRCHANNEL = function() {
if (this.blobCount>=this.blob.length) {
    this.A_REG="";
	return;
}
var byt=this.blob[this.blobCount++];
if (byt==0) {
	this.A_REG = "";
	return;
}
this.A_REG=String.fromCharCode(byt);

}
this.GETNUMBERCHANNEL = function() {
console.log("[GET# not supported for JS, call ignored]");
this.X_REG=0;
}
this.TABOUTCHANNEL = function() {
console.log("[TAB not supported for JS in file mode, redirected to normal TAB]");
this.TAB();
}
this.SPCOUTCHANNEL = function() {
console.log("[SPC not supported for JS in file mode, redirected to normal SPC]");
this.SPC();
}
this.TABCHANNEL = function() {
console.log("[TAB not supported for JS in file mode, redirected to normal TAB]");
this.TAB();
}
this.SPCCHANNEL = function() {
console.log("[SPC not supported for JS in file mode, redirected to normal SPC]");
this.SPC();
}
this.LOAD = function() {
console.log("[LOAD not supported for JS in file mode, call ignored]");
}
this.SAVE = function() {
console.log("[SAVE not supported for JS in file mode, call ignored]");
}
this.VERIFY = function() {
console.log("[VERIFY not supported for JS in file mode, call ignored]");
}
this.REM = function() {
console.log("[inline assembly ignored]");
}
this.USR = function() {
var addr=this._memory[785] + 256*this._memory[786];
this.USR_PARAM=this.X_REG;
var callStr="$"+addr.toString(16);
console.log("[Calling user function named "+callStr+"]");
try {
this[callStr]();
} catch(e) {
console.log("[Function call failed]");
}
}
// Here start the input/output code, that might be adopted to fit ones needs...
this.input = function() {
if (this._inputQueue.length>0) {
return this._inputQueue.pop();
}
var inp=prompt(this._line);
this._line="";
if (inp) {
var parts=inp.split(",");
parts.reverse();
this._inputQueue.push.apply(this._inputQueue, parts);
return this._inputQueue.pop();
} else {
return "";
}
}
// GET relies on INPUT here, because due to the single threaded nature of
// Javascript, the concept of a BASIC program constantly polling the keyboard
// doesn't really work in this context unless you stuff the compiled program
// into a web worker or something like that.
this.get = function() {
var key=this.input();
if (!key) {
return ""
}
return key.substring(0,1);
}
this.out = function(txt) {
if (txt.indexOf && txt.indexOf("\n") != -1) {
this._line += txt;
this.outputter(this._line);
this._line = "";
} else {
this._line += txt;
}
}
this.convert = function(c) {
return c;
}
}
