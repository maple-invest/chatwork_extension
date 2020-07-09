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
	     		// _messageIdから始まるid要素を取得
	     	    $("[id^='_messageId']").each(function(){
	     	        var value = $(this).html();
	     	        $(this).hide();//非表示化

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

	     	        console.log(value);
	     	    });
	     	});
	},5000);
}
