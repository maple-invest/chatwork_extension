// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


//var elements = document.getElementsByClassName('ctr-p');
//console.log(elements);
console.log("aaa!");

window.onload = function(){
	console.log("bbb!");

	// chatworkのindex.jsでページ内容がロードされてるので、ロード終了まで待つ
	// sleep処理はイケてないので読み込み終了をリスナーする仕組みにしたい
	// あるいは一定時間毎に読み込みしなおすとか？
	setTimeout(function(){
	     console.log("ccc!");
	     	$(function(){
	     		//読み込まれているメッセージ数を図りたかった　結果→リロード時40count
	     		var counter = 0;
	     		// _messageIdから始まるid要素を取得
	     		// 自分宛てにメンションされた場合は「jYUPSi」classが指定されるので、それで処理から外すこと
	     	    $("[id^='_messageId']").each(function(){
	     	    	counter++;

	     	        var reply = $(this).find('pre').find('._replyMessage').html();

	     	        //返信があるメッセージなら非表示化
	     	        if(reply){
	     	        	// ここに条件をカスタマイズして○件以上のリアクションがあれば回避とか面白そう
	     	        	$(this).hide();//非表示化
	     	        	return true;
	     	        }

	     	        //長文を折りたたむ
	     	        var message = $(this).find('pre').html();
	     	        
	     	        // 正規表現で改行コードを検索→該当したら配列に追加→lenghtでカウント
	     	        // 0から数えるので補正値+1をする
	     	        var targetStr = "\n" ; // \r も必要？
	     	        var line_count = ( message.match( new RegExp( targetStr, "g" ) ) || [] ).length + 1;

	     	        console.log(message)
	     	        console.log(message.length)
	     	        console.log(line_count)

	     	        // 3行目で文字表示を打ち切る書き換え
	     	        if(line_count > 3){
	     	        	var line_1 = message.indexOf(targetStr);
	     	        	var line_2 = message.indexOf(targetStr, line_1 + 1);
	     	        	var line_3 = message.indexOf(targetStr, line_2 + 1);

	     	        	$(this).find('pre').html(message.slice( 0, line_3 ));
	     	        }
	     	        

	     //	        
	     //	        if(!value) {
	     //	            return true;
	     //	        }
	     //	        
	     //	        if(value.indexOf('Symfoware') == -1) {
	     //	            return true;
	     //	        }
	     //	        
	     //	        $(this).html('');

	     	        //console.log(value);
	     	        //console.log($(this).find('pre').find('div').html());
	     	    });
	     	    console.log("count!");
	     	    console.log(counter);
	     	});
	},3000);
}
