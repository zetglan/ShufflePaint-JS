enchant();

var ans;
var quiz = new Sprite(114,114);	
var fin_quiz = new Sprite(114,114);	//解答後用の画像スプライトを予め生成
var countdown;
var next_ans;
var next_quiz = new Sprite(114,114);	//スプライト生成
var threeflag=true;
var twoflag=true;
var oneflag=true;
var restartLabel;
var bgmname;
var beepstartflag = false;
var spraystartflag=false;
var gamecond=false;//ゲーム続行可能状態の判別
var restartLabel = new Label();	//リスタートする？的なラベル
var titleLabel =new Label();
var GAME_SIZE_WIDTH = 400;
var GAME_SIZE_HEIGHT = 250;
var prev_quiz_ans; //3連続同じお題が出ないように調整するための変数
var prev_prev_quiz_ans; //同上
//(画面サイズ8:5の謎設計)
var vol_slider;
var cookie_age_days = 7; // クッキーの保存日数
var cookie_save_sec = 24 * 60 * 60 * cookie_age_days;
var gamebgm;		//1...tec 2...tra,3...roa

window.onload = function() {
	game = new Game(GAME_SIZE_WIDTH, GAME_SIZE_HEIGHT);
	game.fps = 60;
	game.score = 0;
	game.slctcond=1;	//slctcond:選択中の色，1は赤，2は青，3は黄色
	game.level=1;		//ゲームの難度レベル(レベル5が最難) と思ってた
	var fin_flag=false;	//なんやこれ

	//ゲーム素材予めロード
	game.rootScene.backgroundColor = "gray";
	game.preload('images/red.png','images/blue.png','images/yellow.png');
	game.preload('images/triangle_nothing.png','images/cross_nothing.png','images/circle_nothing.png');
	game.preload('images/timecount3.png','images/timecount2.png','images/timecount1.png','images/timecount0.png');
	game.preload('images/triangle_red.png','images/cross_red.png','images/circle_red.png');
	game.preload('images/triangle_blue.png','images/cross_blue.png','images/circle_blue.png');
	game.preload('images/triangle_yellow.png','images/cross_yellow.png','images/circle_yellow.png');
	game.preload('musics/tec.mp3','musics/tra.mp3','musics/roa.mp3');
	game.preload('SEs/spray.mp3','SEs/beep.mp3','SEs/fin.mp3','SEs/none.mp3');

	//console.log(document.cookie);
	var cookies = document.cookie;
	var cookieItem = cookies.split(";");
	var cookieValue = "";
	var cookieSetting = {};
	//console.log(cookieItem);
	if( isset(cookieItem[0]) ){
		for (i = 0; i < cookieItem.length; i++) {
			var elem = cookieItem[i].split("=");
			cookieSetting[elem[0].trim()]=elem[1].trim();
		}
	}
	
	//console.log(cookieSetting);


	//ボリュームスライダーが変更されたらボリュームを変更
	vol_slider = document.getElementById('volume');
	vol_slider.addEventListener("input",function(){
		var vol = vol_slider.value/100;
		document.cookie="volume="+vol+"; max-age="+cookie_save_sec;
		setSoundvolume(vol);
	});

	//ゲームロード完了したらセッティング
	game.onload = function() {
	var beep = game.assets['SEs/beep.mp3'];
	var splay = game.assets['SEs/spray.mp3'];
	var fin = game.assets['SEs/fin.mp3'];

	var bgm1 = game.assets['musics/tec.mp3'];
	var bgm2 = game.assets['musics/tra.mp3'];
	var bgm3 = game.assets['musics/roa.mp3'];
		game.assets['SEs/none.mp3'].play();

		//エンターキーをAボタンに割り当て
		game.keybind(16, 'a' );

		//カウントダウンタイマーの画像セット
		var timeimage = new Sprite(153, 44);
		timeimage.image = game.assets['images/timecount3.png'];
		game.rootScene.addChild(timeimage);
		timeimage.x=-22;
		timeimage.y=0;
		timeimage.scale(0.6,0.6);

		//答えが赤=1の画像セット
      	var red = new Sprite(10, 10);
		red.image = game.assets['images/red.png'];
		game.rootScene.addChild(red);
		red.x=50;
		red.y=20;
		red.cond=1;
		red.scale(2,2);

		//答えが青=2の画像セット
		var blue = new Sprite(10, 10);
		blue.image = game.assets['images/blue.png'];
		game.rootScene.addChild(blue);
		blue.x=50+20*Math.sin(60*Math.PI/180);
		blue.y=40+20*Math.cos(60*Math.PI/180);
		blue.cond=2;
		blue.scale(2,2);

		//答えが黄=3の画像セット
		var yellow = new Sprite(10, 10);
		yellow.image = game.assets['images/yellow.png'];
		game.rootScene.addChild(yellow);
		yellow.x=50-20*Math.sin(60*Math.PI/180);
		yellow.y=40+20*Math.cos(60*Math.PI/180);
		yellow.cond=3;
		yellow.scale(2,2);
		
		restartLabel.width=400;

		// スコア
    	var score = new Label();
    	score.x = 300; score.y = 5;
    	score.text = "SCORE:"+game.score;
    	//score._element.style.zIndex = 128;
    	//1フレーム進むごとに発火される(enchant.Event.ENTER_FRAME)
    	score.addEventListener(enchant.Event.ENTER_FRAME, function(){
        	this.text = "SCORE:" + game.score;
    		});
    	game.rootScene.addChild(score);

		/**************************************************************/
		/*********************  キ ー 入 力 設 定  **********************/
		/**************************************************************/
		game.rootScene.addEventListener(enchant.Event.RIGHT_BUTTON_DOWN, function() {
			if (game.input.right) {
				//→キー
			 	//console.log("yo!!!");
					changeSlctCondtoRight(red);
					changeSlctCondtoRight(blue);
					changeSlctCondtoRight(yellow);
			}
		});

		game.rootScene.addEventListener(enchant.Event.LEFT_BUTTON_DOWN, function() {
			if (game.input.left) {
				//←キー
			 	//console.log("yo?");
					changeSlctCondtoLeft(red);
					changeSlctCondtoLeft(blue);
					changeSlctCondtoLeft(yellow);
			}
		});

		game.rootScene.addEventListener(enchant.Event.UP_BUTTON_DOWN, function() {
			if (game.input.up) {
				game.assets[bgmname].stop()
				var name=changeBGMtoUp(gamebgm);
					game.assets[name].play();
					bgmname=name;
					gamebgm=setBGMNumber(name);
			}
		});

		game.rootScene.addEventListener(enchant.Event.DOWN_BUTTON_DOWN, function() {
			if (game.input.down) {
				game.assets[bgmname].stop()
				var name=changeBGMtoDown(gamebgm);
					game.assets[name].play();
					bgmname=name;
					gamebgm=setBGMNumber(name);
			}
		});

		//スマホ用タッチ設定
		game.rootScene.addEventListener(Event.TOUCH_START, function(e) {
			//座標を受け取る
			var sax = e.x;
			var say = e.y ;

			if(gamecond){
				//画面左側タッチで左回転
				if(e.x<GAME_SIZE_WIDTH/2){
					changeSlctCondtoLeft(red);
					changeSlctCondtoLeft(blue);
					changeSlctCondtoLeft(yellow);
				}else{
					changeSlctCondtoRight(red);
					changeSlctCondtoRight(blue);
					changeSlctCondtoRight(yellow);
				}
			}
		});
		
		//タイトル画面表示
		restartLabel.x = 35; 
		restartLabel.y = 210;
		restartLabel.text = "PRESS SHIFT KEY OR DOUBLE TAP TO START";
		game.rootScene.addChild(restartLabel);
		
		titleLabel.x = 35;
		titleLabel.y=100;
		titleLabel.text = "ShufflePaint-JS";
		titleLabel.font = "34px Palatino";
		game.rootScene.addChild(titleLabel);

		game.rootScene.addEventListener(enchant.Event.A_BUTTON_DOWN, function() {
			if (game.input.a && !(gamecond)) {
				restart();
			}
		});
		var gesture = new GestureDetector(game.rootScene);
		game.rootScene.addEventListener(Event.DOUBLETAP, function() {
			if(!gamecond) {
				restart();
			}
		});

		//クッキーに保存していた値を反映
		if( isset(cookieSetting['volume']) ){
			setSoundvolume(cookieSetting['volume']);
			vol_slider.value = cookieSetting['volume']*100;
		}else{
			setSoundvolume(0.4);
			vol_slider.value = 40;
		}
		if( isset(cookieSetting['gamebgm']) ){
			gamebgm = parseInt(cookieSetting['gamebgm'],10);
		}else{
			gamebgm = 1;
		}
		/**************************************************************/
		/************************* 問 題 設 定 **************************/
		/**************************************************************/


		//次の問題を作成→動く(次の問題生成)→正解判定→動く→正解なら次の問題→正解判定→...の繰り返し
			//restart();
			game.addEventListener('enterframe', function () {
				if(gamecond){ //Game続行状態
					//3...2...1...go...のスピード設定
					countdown=countdown-game.level*2;
				}

				//3 or 2 or 1 or go の判定
				// countdown が...
				//300超過	：3
				//300~200	：2
				//200～100	：1
				//100～0		：0(spray)
				//0			：flag設定初期化
				if( countdown>300 && gamecond ){
					timeimage.image = game.assets['images/timecount3.png'];
				}else if( countdown<=300 && countdown>200 && gamecond ){
					timeimage.image = game.assets['images/timecount2.png'];
					if(threeflag){//タイマーが切り替わる瞬間だけ音がなるように設定
						if(beepstartflag){
							beep.stop();
						} 
					beep.play(); 
					threeflag=false; 
					beepstartflag=true;}

				}else if(countdown<=200 && countdown>100 && gamecond){
					timeimage.image = game.assets['images/timecount1.png'];
					if(twoflag){
						beep.stop(); 
						beep.play(); 
						twoflag=false;
					}

				}else if(countdown<=100 && countdown>0 && gamecond){
					timeimage.image = game.assets['images/timecount0.png'];
					if(oneflag){
						beep.stop(); 
						beep.play(); 
						oneflag=false;
					}

				}else if(countdown<=0 && gamecond){

					//count0で回答をセットし，スプレーする
					quiz.image=game.assets[spray(ans,getSlctCond(red,blue,yellow))];
					if(spraystartflag){
						splay.stop();
					}
					spraystartflag =true;
					splay.play();
					//フラグ初期化
					threeflag = true;
					twoflag   = true;
					oneflag   = true;

					//不正解
					if(getSlctCond(red,blue,yellow)!=ans){
						//console.log("miss");
						var windowflag = true;
						gamecond=false;	
						game.assets[numtoBGM(gamebgm)].stop();
						if(fin_flag){fin.stop();}
						fin.play();
						fin_flag=true;
						var twi_message="ShufflePaintJSで"+game.score+"点を出しました! #ShufflePaintJS";
						var clickElement = document.getElementById("twibutton");
						
						clickElement.addEventListener("click", function() {
							//クリック時のイベントを記述
							if(windowflag){
								window.open( "http://twitter.com/intent/tweet?text="+encodeURIComponent(twi_message), "_blank" ,'width=400,height=500');
								windowflag=false;
							}
						},false);

    						restartLabel.x = 30; restartLabel.y = 210;
    						restartLabel.text = "PRESS SHIFT KEY OR DOUBLE TAP TO RESTART";
    						game.rootScene.addChild(restartLabel);
							
							game.rootScene.addEventListener(enchant.Event.A_BUTTON_DOWN, function() {
								if (game.input.a && !(gamecond)) {
									restart();
								}
							});
							var gesture = new GestureDetector(game.rootScene);
							game.rootScene.addEventListener(Event.DOUBLETAP, function() {
								if(!gamecond) {
									restart();
								}
							});

					}else{
						//一旦出題用スプライトをすべて破棄(しないとその場に残り続ける)
						game.rootScene.removeChild(fin_quiz);
						game.rootScene.removeChild(quiz);
						game.rootScene.removeChild(next_quiz);

						//終わった問題用スプライト生成
						fin_quiz = new Sprite(114,114);
						fin_quiz.image=game.assets[spray(ans,getSlctCond(red,blue,yellow))];	//お題ナンバーをスプライト(画像)に反映
						game.rootScene.addChild(fin_quiz);
						fin_quiz.scale(1,1);
						fin_quiz.x=130;
						fin_quiz.y=60;
						
						//NextQuizをQuizに昇格
						quiz = new Sprite(114,114);	//スプライト生成
						//お題ナンバーをスプライト(画像)に反映
						quiz.image=game.assets[generateQuizImage(next_ans,quiz)];	
						game.rootScene.addChild(quiz);
						ans=next_ans;
						quiz.scale(1,1);
						quiz.x=370;	//画像の初期配置
						quiz.y=60;	//画像の初期配置

						//next_quiz作成
						prev_prev_quiz_ans = prev_quiz_ans;
						prev_quiz_ans = ans;
						next_ans=makerand(prev_quiz_ans,prev_prev_quiz_ans);				//乱数でお題作成
						next_quiz = new Sprite(114,114);	//スプライト生成
						next_quiz.image=game.assets[generateQuizImage(next_ans,next_quiz)];	//お題ナンバーをスプライト(画像)に反映
						next_quiz.scale(1,1);
						game.rootScene.addChild(next_quiz);
						next_quiz.x=610;
						next_quiz.y=60;

						fin_quiz.tl.moveTo(-120,60,60/game.level);

						game.score++;
						if(game.score==5){game.level=2;}
						else if(game.score==10){game.level=3;}
						else if(game.score==15){game.level=4;}
						else if(game.score==20){game.level=5;}
						else if(game.score==35){game.level=6;}
						else if(game.score==60){game.level=7;}
						else if(game.score==100){game.level=8;}
						quiz.tl.moveTo(130,60,60/game.level);
						next_quiz.tl.moveTo(370,60,60/game.level);
						countdown=300+120+game.level*2;
					}

				}
			});

	}
	game.start();
}





	//move condmark
	//↓mark.condの対応する場所
	//             1
	//
	//          3     2
	//一度の入力で60度回転
function changeSlctCondtoRight(mark){
		mark.rad = 0;        	// ラジアン
       	mark.degree = 0;     		// 角度
       	var peroflotate=20;		//1フレームに対する回転速度

        if(mark.cond==1){
       	mark.onenterframe = function(){
       		if(mark.degree<=120){
           		mark.rad = (Math.PI/180)*(mark.degree-90);  // ラジアン = PI/180 * 角度
       			mark.x = 50 + 20 * Math.cos(mark.rad); 		// 中心点 + (半径 * cos(ラジアン))
       			mark.y = 40 + 20 * Math.sin(mark.rad); 		// 中心点 + (半径 * sin(ラジアン))
       			mark.degree+=peroflotate;             		// ワンフレーム毎に＋５ずつ角度が増える
       		}
       		mark.cond=2;
       	}
    }
    if(mark.cond==2){
       	mark.onenterframe = function(){
       		if(mark.degree<=120){
           		mark.rad = (Math.PI/180)*(mark.degree+30);  // ラジアン = PI/180 * 角度
       			mark.x = 50 + 20 * Math.cos(mark.rad); 		// 中心点 + (半径 * cos(ラジアン))
       			mark.y = 40 + 20 * Math.sin(mark.rad); 		// 中心点 + (半径 * sin(ラジアン))
       			mark.degree+=peroflotate;                   // ワンフレーム毎に＋５ずつ角度が増える
       		}
       		mark.cond=3;
       	}
    }
    if(mark.cond==3){
       	mark.onenterframe = function(){
       		if(mark.degree<=120){
           		mark.rad = (Math.PI/180)*(mark.degree+150); // ラジアン = PI/180 * 角度
       			mark.x = 50 + 20 * Math.cos(mark.rad); 		// 中心点 + (半径 * cos(ラジアン))
       			mark.y = 40 + 20 * Math.sin(mark.rad); 		// 中心点 + (半径 * sin(ラジアン))
       			mark.degree+=peroflotate;                   // ワンフレーム毎に＋５ずつ角度が増える
       		}
       		mark.cond=1;
       	}
    }
}



function changeSlctCondtoLeft(mark){
		mark.rad = 0;        		// ラジアン
       	mark.degree = 0;     		// 角度
       	var peroflotate=20;			//1フレームに対する回転速度

    if(mark.cond==1){
       	mark.onenterframe = function(){
       		if(mark.degree>=-120){
           		mark.rad = (Math.PI/180)*(mark.degree-90);  // ラジアン = PI/180 * 角度
       			mark.x = 50 + 20 * Math.cos(mark.rad); 		// 中心点 + (半径 * cos(ラジアン))
       			mark.y = 40 + 20 * Math.sin(mark.rad); 		// 中心点 + (半径 * sin(ラジアン))
       			mark.degree-=peroflotate;                   // ワンフレーム毎に＋５ずつ角度が増える
       		}
       		mark.cond=3;
       	}
    }
    if(mark.cond==2){
       	mark.onenterframe = function(){
       		if(mark.degree>=-120){
           		mark.rad = (Math.PI/180)*(mark.degree+30);  // ラジアン = PI/180 * 角度
       			mark.x = 50 + 20 * Math.cos(mark.rad); 		// 中心点 + (半径 * cos(ラジアン))
       			mark.y = 40 + 20 * Math.sin(mark.rad); 		// 中心点 + (半径 * sin(ラジアン))
       			mark.degree-=peroflotate;                   // ワンフレーム毎に＋５ずつ角度が増える
       		}
       		mark.cond=1;
       	}
    }
    if(mark.cond==3){
       	mark.onenterframe = function(){
       		if(mark.degree>=-120){
           		mark.rad = (Math.PI/180)*(mark.degree+150); // ラジアン = PI/180 * 角度
       			mark.x = 50 + 20 * Math.cos(mark.rad); 		// 中心点 + (半径 * cos(ラジアン))
       			mark.y = 40 + 20 * Math.sin(mark.rad); 		// 中心点 + (半径 * sin(ラジアン))
       			mark.degree-=peroflotate;                   // ワンフレーム毎に＋５ずつ角度が増える
       		}
       		mark.cond=2;
       	}
    }
}

function getSlctCond(red,blue,yellow){
	if(red.cond==1) return 1;
	if(blue.cond==1) return 2;
	if(yellow.cond==1) return 3;
}

//次の出題を決定するための乱数関数
function makerand(prev=null,prev_prev=null){
	var ret = Math.floor(Math.random() * 3 ) + 1 ;

	//3連続同じお題になるのを防止
	while(prev == prev_prev && prev == ret){
		ret = Math.floor(Math.random() * 3 ) + 1 ;
	}
	return ret;
}

function generateQuizImage(num,quiz){
	if(num==1){
		return'images/cross_nothing.png';
	} 

	if(num==2){
		return'images/circle_nothing.png';
	} 

	if(num==3){
		return'images/triangle_nothing.png';
	} 
}

//スプレーを行ったあとの画像をreturn
function spray(quiz,ans){
	if(quiz==1){
		switch(ans){
			case 1:
				return 'images/cross_red.png'; 
			case 2:
				return'images/cross_blue.png';
			case 3:
				return'images/cross_yellow.png';
		}
	}else if(quiz==2){
		switch(ans){
			case 1:
				return 'images/circle_red.png'; 
			case 2:
				return'images/circle_blue.png';
			case 3:
				return'images/circle_yellow.png';
		}
	}else if(quiz==3){
		switch(ans){
			case 1:
				return 'images/triangle_red.png'; 
			case 2:
				return'images/triangle_blue.png';
			case 3:
				return'images/triangle_yellow.png';
		}
	}
}

function changeBGMtoUp(num){

        if(num==1){return 'musics/tra.mp3';}
        else if(num==2){return 'musics/roa.mp3';}
        else if(num==3){return 'musics/tec.mp3';}
}

function changeBGMtoDown(num){

        if(num==1){return 'musics/roa.mp3';}
        else if(num==2){return 'musics/tec.mp3';}
        else if(num==3){return 'musics/tra.mp3';}
}

function numtoBGM(num){

        if(num==1){return 'musics/tec.mp3';}
        else if(num==2){return 'musics/tra.mp3';}
        else if(num==3){return 'musics/roa.mp3';}
}

function setBGMNumber(name){
	if(name=='musics/tec.mp3'){
		document.cookie="gamebgm=1"+"; max-age="+cookie_save_sec;
			return 1;
		}
	if(name=='musics/tra.mp3'){
		document.cookie="gamebgm=2"+"; max-age="+cookie_save_sec;
			return 2;
		}
	if(name=='musics/roa.mp3'){
		document.cookie="gamebgm=3"+"; max-age="+cookie_save_sec;
			return 3;
		}
}

function setBGMvolume(vol){
	game.assets["musics/tec.mp3"].volume = vol;
	game.assets["musics/roa.mp3"].volume = vol;
	game.assets["musics/tra.mp3"].volume = vol;
	game.assets["SEs/fin.mp3"].volume = vol;
}

function setSEvolume(vol){
	game.assets["SEs/beep.mp3"].volume = vol;
	game.assets["SEs/spray.mp3"].volume = vol;
}

function setSoundvolume(vol){
	setBGMvolume(vol);
	setSEvolume(vol);
}

function restart(){
		game.rootScene.removeChild(restartLabel);
		game.rootScene.removeChild(titleLabel);
		game.rootScene.removeChild(quiz);
		game.rootScene.removeChild(next_quiz);

		ans=makerand();				//乱数でお題作成
		quiz.image=game.assets[generateQuizImage(ans,quiz)];	//お題ナンバーをスプライト(画像)に反映
		quiz.scale(1,1);
		game.rootScene.addChild(quiz);
		quiz.x=370;	//画像の初期配置
		quiz.y=60;	//画像の初期配置
		prev_quiz_ans = ans;

		next_ans=makerand();				//乱数でお題作成
		next_quiz = new Sprite(114,114);	//スプライト生成
		next_quiz.image=game.assets[generateQuizImage(next_ans,next_quiz)];	//お題ナンバーをスプライト(画像)に反映
		next_quiz.scale(1,1);
		game.rootScene.addChild(next_quiz);
		next_quiz.x=610;
		next_quiz.y=60;

		game.level=1;
		game.score=0;
		countdown=300+120+game.level*2;
		threeflag=true;
		twoflag=true;
		oneflag=true;
		beepstartflag = false;
		spraystartflag=false;
		bgmname = numtoBGM(gamebgm);
		game.assets[bgmname].play();
		gamecond=true;
		quiz.tl.moveTo(130,60,60/game.level);
		next_quiz.tl.moveTo(370,60,60/game.level);
}

function isset(data){
    if(data === "" || data === null || data === undefined){
        return false;
    }else{
        return true;
    }
};