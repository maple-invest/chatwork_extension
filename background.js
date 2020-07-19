// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

console.log("extension loaded!");

var setting = {
    'line_count_repry': 1,
	'line_count_long_sentences': 5,
	'fold_repry': true,
	'fold_long_sentences': true
}

function load_option(){
	chrome.storage.sync.get([
		'line_count_repry',
		'line_count_long_sentences',
		'fold_repry',
		'fold_long_sentences'], function(items) {
			if(items.fold_repry == null){
				console.log("setting init!")
				chrome.storage.sync.set(setting);
			}else{
				console.log("setting load!")
				setting.line_count_repry = items.line_count_repry
				setting.line_count_long_sentences = items.line_count_long_sentences
				setting.fold_repry = items.fold_repry
				setting.fold_long_sentences = items.fold_long_sentences
				console.log(setting)
			}
	});
}

console.log("option load!");
load_option()

// 長文を折りたたむ
function fold_long_sentences(message_object){
	// 設定が無効 OR メッセージが無い場合はスキップ
	var message = message_object.find('pre').html();
	if ( !setting.fold_long_sentences || message == null) {
		return false;
	}

	// 返信メッセージは hide_reply_message 管轄なのでスキップ
	var reply = message_object.find('pre').find('._replyMessage').html();
	if(reply){
		return false;
	}
	
	// 正規表現で改行コードを検索→該当したら配列に追加→lenghtでカウント
	// 0から数えるので補正値+1をする
	var targetStr = "\n" ; // \r も必要？
	var line_count = ( message.match( new RegExp( targetStr, "g" ) ) || [] ).length + 1;

	// 指定行で文字表示を打ち切る書き換え
	limit = setting.line_count_long_sentences
	if(line_count > limit){
		line = []
		line[0] = message.indexOf(targetStr);
		for (let i = 0; i < limit-1; i++) {
		    line[i+1] = message.indexOf(targetStr, line[i] + 1);
		}
		message_object.find('pre').hide();
		message_object.find('pre').after('<div class=\"was_folded\"></div><pre style=\"border-bottom: dotted 4px #B7CFD3;\">'+message.slice( 0, line[limit-1] )+'</pre>');
		return true;
	}
	return false;
}

// 返信メッセージの非表示化
function hide_reply_message(message_object){
	//設定が無効ならスキップ
	if(!setting.fold_repry){
		return false;
	}
	var reply = message_object.find('pre').find('._replyMessage').html();

	//早期リターンにすべき
	//返信があるメッセージなら非表示化
	if(reply){
		// ここに条件をカスタマイズして○件以上のリアクションがあれば回避とか面白そう
		//message_object.hide();//要素を完全に非表示化
		//message_object.find('pre').hide();//要素の返信相手と内容を非表示化（枠は残る）

		//要素の1行目だけ残す（誰あての返信か分かりやすい）
		//message_object.find('pre').hide();
		//後でリファクタリング（共通化可能）
		var message = message_object.find('pre').html();
		var targetStr = "\n" ; // \r も必要？
		var line_count = ( message.match( new RegExp( targetStr, "g" ) ) || [] ).length + 1;

		// 指定行で文字表示を打ち切る書き換え
		limit = setting.line_count_repry
		if(line_count > limit){
			line = []
			line[0] = message.indexOf(targetStr);
			for (let i = 0; i < limit-1; i++) {
			    line[i+1] = message.indexOf(targetStr, line[i] + 1);
			}
			message_object.find('pre').hide();
			message_object.find('pre').after('<div class=\"was_folded\"></div><pre style=\"border-bottom: dotted 4px #B7CFD3;\">'+message.slice( 0, line[limit-1] )+'</pre>');

			return true;
		}
	}
	return false;
}

function mark_as_processed(message_object){
	message_object.find('div').first().append('<div class=\"processed_message\"></div>');
}

// 画面上のメッセージ内容を読み取って書き換え処理を行う
function rewrite_message(){
	console.log("rewrite_message start!");

	$(function(){
		//読み込まれているメッセージ数を図りたかった　結果→リロード時40count
		var counter = 0;
		// _messageIdから始まるid要素を取得
	    $("[id^='_messageId']").each(function(){
	    	counter++;

	    	//既に処理済みのメッセージの場合は処理除外する/未処理ならフラグ追加
	    	if($(this).find('.processed_message').html() != null){
	    		return true;
	    	}
	    	mark_as_processed($(this));

	    	// 自分の投稿メッセージは処理除外
	    	if($(this).find('._avatarHoverTip').data('aid') == $('#_myStatusIcon').find('img').data('aid') ){
	    		//console.log($(this).find('._avatarHoverTip').data('aid'));
	    		//console.log($('#_myStatusIcon').find('img').data('aid'));
	    		return true;
	    	}

	    	// 自分宛てに通知された場合は処理除外する
	    	// [class 仕様] 通知ありTO : fzprrx / 通知ありRE : xnqWz
	    	if($(this).hasClass('xnqWz') || $(this).hasClass('fzprrx')){
	    		return true;
	    	}

	    	// 各関数は処理を行った場合に早期リターン(continue)する
	    	if (hide_reply_message($(this))) {
	    		return true;//continueと同様
	    	}
	    	if (fold_long_sentences($(this))) {
	    		return true;
	    	}

	//	    
	//	    if(!value) {
	//	        return true;
	//	    }
	//	    
	//	    if(value.indexOf('Symfoware') == -1) {
	//	        return true;
	//	    }
	//	    
	//	    $(this).html('');

	        //console.log(value);
	        //console.log($(this).find('pre').find('div').html());
	    });
	    console.log("count!");
	    console.log(counter);

	    // メッセージdivがクリックされるとpreの表示/非表示を切り替える
	    // 画面ロードされるたびにイベントを再登録する為にrewrite_messageに実装
	    // offで登録済みのイベントを解除してから再度onしている
	    $("[id^='_messageId']").each(function(){
	    	// 折りたたまれてないメッセージは処理スキップ
	    	if( $(this).find('.was_folded').html() == null ){
	    		return true;
	    	}
	    	$(this).find('pre').off().on('click', function() {
	    	  $(this).parent().find('pre').slideToggle('slow');
	    	});
	    });
	});
}

// チェットのメインとなるdiv要素を取得
function load_container(target_class ,callbackFunc) {
    // 読み出せるまで一定時間毎に実行
    var id = setInterval(function () {
    	//container = $('.sc-epGmkI, .cMoFQn')[0]
    	//sub_container = $('.sc-dphlzf, .hnKbti')[0]
    	container = $(target_class)[0]

        if (container != null) {
            // 読み込みが完了したらタイマー停止
            clearInterval(id);
            // コールバック関数を実行して要素を渡す
            if (callbackFunc) callbackFunc(container);
        }
    }, 1000);
}

//オブザーバーの作成
var sub_observer = new MutationObserver(rewrite_message);
var main_observer = new MutationObserver(create_sub_observer);

function create_sub_observer(){
	load_container('.sc-dphlzf, .hnKbti', function (sub_container) {
		console.log(sub_container);

		//サブ要素（チャット内でのメッセージロード時に変化）
		sub_observer.disconnect();
		sub_observer.observe(sub_container, {
		    attributes: true,
		    childList:  true
		});

		// グローバルスコープで worl_flag を定義して一定時間以内の多重起動を阻止する
		rewrite_message();
	});

}

function view_initial_explanation(){
	// デバック用データ
	chrome.storage.sync.set({ 'initial_explanation_skip': false });

	chrome.storage.sync.get('initial_explanation_skip', function(items) {
		if( items.initial_explanation_skip ){
			return false;
		}else{
			$('body').prepend('<div class=\"popup show\"><div class=\"content_back\"></div><div class=\"content\"><p>「Chatwork 表示すっきりツール」をご利用頂き有難うございます！</p><button class=\"btn-square\" id=\"close\">使ってみる！</button></div><div class=\"content_back\"></div></div>');
			$(".popup").css({"display": "none", "height": "100vh", "width": "100%", "position": "fixed", "z-index": "2", "top": "0", "left": "0"});
			$(".content_back").css({"height": "100vh", "width": "25%", "background": "black", "opacity": "0.7",});
			$(".content").css({"background": "#fff", "padding": "30px", "width": "50%", "text-align": "center"});
			$(".show").css({"display": "flex", "justify-content": "center", "align-items": "center"});
			$(".btn-square").css({"position": "relative", "display": "inline-block", "padding": "0.25em 0.5em", "text-decoration": "none", "color": "#FFF", "background": "#fd9535", "border-bottom": "solid 2px #d27d00", "border-radius": "4px", "font-weight": "bold", "align-items": "center"});

			$("#close").on("click", function() {
			  $(".popup").fadeOut();
			  // 確認ボタンをクリックするとskipフラグが登録されて、移行は説明画面を表示しなくなる
			  chrome.storage.sync.set({ 'initial_explanation_skip': true });
			});
		}
	});
}

window.onload = function(){
	console.log("initialize start!");

	// 初回起動時に説明画面を表示する
	view_initial_explanation();

	// onload → div要素ロード → オブザーバーset → サブオブザーバーset → rewrite_message実行

	//メイン要素を取得して結果をコールバック関数の引数に渡す
	//要素が取得できるまで待機して実行される
	load_container('.sc-epGmkI, .cMoFQn', function (main_container) {
		console.log(main_container);



		//監視の開始
		//メイン要素（チャット切り替え時に変化）
		main_observer.disconnect();
		main_observer.observe(main_container, {
		    attributes: true,
		    childList:  true
		});

		create_sub_observer();

		console.log("initialize complete!");
	});

	//メモ
	// 課題1 : オブザーバーの連続起動問題（メッセージロード時）
	// →　メッセージロード時の関数起動を少しだけwaitする
	// メッセージは読み込めた物から反映されるが、そのたびにオブザーバーが変化検知して複数回起動するのが原因

    // サブオブザーバーの多重起動問題
    // 新しいメッセージのロード時にサブオブザーバー複数が同時にrewriteを読んでしまう
    // メッセージをロードするたびにサブオブザーバーが増えるので酷いことになる

    // オブザーバー起動時にログを履かせて調査する
    // 起動する毎にカウントを増やすログを出して動きを解明する

    //別なアプローチ
    //タイマーで一定時間毎にrewriteする仕組みにする
    //アクションオブザーバーは変更検知したらタイマーの残り時間を減らす介入をする

}
