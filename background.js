// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

console.log("extension loaded!");


// 長文を折りたたむ
function fold_long_sentences(message_object){
	var message = message_object.find('pre').html();
	if (message == null) {
		return false;
	}
	
	// 正規表現で改行コードを検索→該当したら配列に追加→lenghtでカウント
	// 0から数えるので補正値+1をする
	var targetStr = "\n" ; // \r も必要？
	var line_count = ( message.match( new RegExp( targetStr, "g" ) ) || [] ).length + 1;

	console.log(message)
	console.log(message.length)
	console.log(line_count)

	// 5行目で文字表示を打ち切る書き換え
	if(line_count > 5){
		var line_1 = message.indexOf(targetStr);
		var line_2 = message.indexOf(targetStr, line_1 + 1);
		var line_3 = message.indexOf(targetStr, line_2 + 1);
		var line_4 = message.indexOf(targetStr, line_3 + 1);
		var line_5 = message.indexOf(targetStr, line_4 + 1);

		message_object.find('pre').hide();
		message_object.find('pre').after('<pre style=\"border-bottom: dotted 2px #B7CFD3;\">'+message.slice( 0, line_5 )+'</pre>');
		return true;
	}
	return false;
}

// 返信メッセージの非表示化
function hide_reply_message(message_object){
	var reply = message_object.find('pre').find('._replyMessage').html();

	//早期リターンにすべき
	//返信があるメッセージなら非表示化
	if(reply){
		// ここに条件をカスタマイズして○件以上のリアクションがあれば回避とか面白そう
		//message_object.hide();//要素を完全に非表示化
		//message_object.find('pre').hide();//要素の返信相手と内容を非表示化（枠は残る）

		//要素の1行目だけ残す（誰あての返信か分かりやすい）
		message_object.find('pre').hide();
		//後でリファクタリング（共通化可能）
		var message = message_object.find('pre').html();
		var targetStr = "\n" ; // \r も必要？
		var line_1 = message.indexOf(targetStr);
		message_object.find('pre').after('<pre style=\"border-bottom: dotted 2px #B7CFD3;\">'+message.slice( 0, line_1 )+'</pre>');

		return true;
	}
	return false;
}

var execute_flag = false;
function is_multiple_execute(){
	// 実行フラグが有効ならば短時間の多重起動なので早期リターン
	if(execute_flag){
		return true;
	}

	// 実行フラグを有効化して一定時間後に無効化する
	execute_flag = true;
	setTimeout(function(){
		execute_flag = false;
	},3000);
	return false;
}

function mark_as_processed(message_object){
	message_object.find('div').first().append('<div class=\"processed_message\"></div>');
}

// 画面上のメッセージ内容を読み取って書き換え処理を行う
function rewrite_message(){
	console.log("rewrite_message start!");

	//　短時間の多重起動防止
	if( is_multiple_execute() ){
		//console.log("multiple execute block");
		return false;
	}

	$(function(){
		//読み込まれているメッセージ数を図りたかった　結果→リロード時40count
		var counter = 0;
		// _messageIdから始まるid要素を取得
	    $("[id^='_messageId']").each(function(){
	    	counter++;

	    	//既に処理済みのメッセージの場合は処理除外する/未処理ならフラグ追加
	    	if($(this).hasClass('processed_message')){
	    		return true;
	    	}
	    	mark_as_processed($(this));

	    	// メッセージdivがクリックされるとpreの表示/非表示を切り替える
	    	// 画面ロードされるたびにイベントを再登録する為にrewrite_messageに実装
	    	// offで登録済みのイベントを解除してから再度onしている
	    	$(this).find('.sc-hARARD').off().on('click', function() {
	    	  $(this).find('pre').slideToggle('slow');
	    	});

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

function create_sub_observer(){
	load_container('.sc-dphlzf, .hnKbti', function (sub_container) {
		console.log(sub_container);

		//オブザーバーの作成
		var sub_observer = new MutationObserver(rewrite_message);

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

window.onload = function(){
	console.log("initialize start!");

	// onload → div要素ロード → オブザーバーset → サブオブザーバーset → rewrite_message実行

	//メイン要素を取得して結果をコールバック関数の引数に渡す
	//要素が取得できるまで待機して実行される
	load_container('.sc-epGmkI, .cMoFQn', function (main_container) {
		console.log(main_container);

		//オブザーバーの作成
		var main_observer = new MutationObserver(create_sub_observer);

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



}
