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

// 画面上のメッセージ内容を読み取って書き換え処理を行う
function rewrite_message(){
	$(function(){
		//読み込まれているメッセージ数を図りたかった　結果→リロード時40count
		var counter = 0;
		// _messageIdから始まるid要素を取得
	    $("[id^='_messageId']").each(function(){
	    	counter++;

	    	// 自分宛てに通知された場合は「fzprrx」classが指定されるので処理除外する
	    	if($(this).hasClass('fzprrx')){
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
	    $("[id^='_messageId']").off().on('click', function() {
	      console.log($(this).text());
	      $(this).find('pre').slideToggle('slow');
	    });
	});
}

window.onload = function(){
	console.log("window onload start!");

	// chatworkのindex.jsでページ内容がロード完了するのを待つ
	setTimeout(function(){
		console.log("initialize  start!");

		//オブザーバーの作成
		var observer = new MutationObserver(rewrite_message);
		//監視の開始
		//チャット切り替え
		observer.observe(document.getElementsByClassName('sc-epGmkI cMoFQn')[0], {
		    attributes: true,
		    childList:  true
		});
		//メッセージ追加ロード
		observer.observe(document.getElementsByClassName('sc-dphlzf hnKbti')[0], {
		    attributes: true,
		    childList:  true
		});
		//初回起動
	    rewrite_message();
	},1000);

	//メモ
	// 課題1 : オブザーバーの連続起動問題（メッセージロード時）
	// →　メッセージロード時の関数起動を少しだけwaitする
	// メッセージは読み込めた物から反映されるが、そのたびにオブザーバーが変化検知して複数回起動するのが原因
	// 課題2 : 別チャットロード時にオブザーバー２が無効化される（読み直しが必要）
	// →　オブザーバ１の実行語処理にオブザーバー２の設定処理を組み込む
}
