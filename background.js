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
	},5000);
}
