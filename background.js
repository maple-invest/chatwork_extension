// Copyright (c) 2020 メープル＠ペンギン会員 All rights reserved.

// 初期設定のロード
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
      if( items.fold_repry == null ){
        chrome.storage.sync.set(setting);
      }else{
        setting.line_count_repry = items.line_count_repry;
        setting.line_count_long_sentences = items.line_count_long_sentences;
        setting.fold_repry = items.fold_repry;
        setting.fold_long_sentences = items.fold_long_sentences;
      }
  });
}
load_option();

// 指定行で打ち切った表示内容を返す
function slice_message(message, limit){
  // 正規表現で改行コードを検索→該当したら配列に追加→lenghtでカウント
  // 0から数えるので補正値+1をする
  var targetStr = "\n";
  var line_count = ( message.match( new RegExp( targetStr, "g" ) ) || [] ).length + 1;

  if( line_count > limit ){
    line = [];
    line[0] = message.indexOf(targetStr);
    for ( let i = 0; i < limit-1; i++ ) {
      line[i+1] = message.indexOf(targetStr, line[i] + 1);
    }
    return '<div class=\"was_folded\"></div><pre style=\"border-bottom: dotted 4px #B7CFD3;\">'+message.slice( 0, line[limit-1] )+'</pre>';
  }
  return false;
}

// 長文を折りたたむ
function fold_long_sentences(message_object){
  // 設定が無効 OR メッセージが無い場合はスキップ
  var message = message_object.find('pre').html();
  if ( !setting.fold_long_sentences || message == null ) {
    return false;
  }

  // 返信メッセージは hide_reply_message 管轄なのでスキップ
  var reply = message_object.find('pre').find('._replyMessage').html();
  if( reply ){
    return false;
  }

  var str = slice_message(message, setting.line_count_long_sentences)
  if ( str ){
    message_object.find('pre').hide();
    message_object.find('pre').after(str);
    return true;
  }
  return false;
}

// 返信メッセージの非表示化
function hide_reply_message(message_object){
  // 設定が無効 OR メッセージが無い場合はスキップ
  var reply = message_object.find('pre').find('._replyMessage').html();
  if( !setting.fold_repry || reply == null ){
    return false;
  }

  var str = slice_message(message_object.find('pre').html(), setting.line_count_repry)
  if ( str ){
    message_object.find('pre').hide();
    message_object.find('pre').after(str);
    return true;
  }
  return false;
}

function mark_as_processed(message_object){
  message_object.find('div').first().append('<div class=\"processed_message\"></div>');
}

// 画面上のメッセージ内容を読み取って書き換え処理を行う
function rewrite_message(){
  $(function(){
    var my_aid = $('#_myStatusIcon').find('img').data('aid');
    // _messageIdから始まるid要素を取得
    $("[id^='_messageId']").each(function(){
      //既に処理済みのメッセージの場合は処理除外する/未処理ならフラグ追加
      if( $(this).find('.processed_message').html() != null ){
        return true;
      }
      mark_as_processed($(this));

      // 自分の投稿メッセージは処理除外
      if( $(this).find('._avatarHoverTip').data('aid') == my_aid ){
        return true;
      }

      // 自分宛てに通知された場合は処理除外する
      // [class 仕様] 通知ありTO : fzprrx / 通知ありRE : xnqWz
      if( $(this).hasClass('xnqWz') || $(this).hasClass('fzprrx') ){
        return true;
      }

      // 各関数は処理を行った場合にcontinueする
      if ( hide_reply_message($(this)) ) {
        return true;
      }
      if ( fold_long_sentences($(this)) ) {
        return true;
      }
    });

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
    container = $(target_class)[0];
    if ( container != null ) {
      // 読み込みが完了したらタイマー停止
      clearInterval(id);
      // コールバック関数を実行して要素を渡す
      if ( callbackFunc ) callbackFunc(container);
    }
  }, 1000);
}

//オブザーバーの作成
var sub_observer = new MutationObserver(rewrite_message);
var main_observer = new MutationObserver(create_sub_observer);

function create_sub_observer(){
  load_container('.sc-dphlzf, .hnKbti', function (sub_container) {

    //サブ要素（チャット内でのメッセージロード時に変化）
    sub_observer.disconnect();
    sub_observer.observe(sub_container, {
      attributes: true,
      childList:  true
    });

    rewrite_message();
  });

}

function view_initial_explanation(){
  chrome.storage.sync.get('initial_explanation_skip', function(items) {
    if( items.initial_explanation_skip ){
      return false;
    }else{
      explanation_1_url = chrome.extension.getURL('explanation_1.png');
      explanation_2_url = chrome.extension.getURL('explanation_2.png');

      // ToDo : リファクタリング
      $('body').prepend('<div class=\"popup show\"><div class=\"content_back\"></div><div class=\"content\"><div style=\"height: 80%; overflow-y: scroll;\"><h1>「Chatwork 表示すっきりツール」をご利用頂き有難うございます！</h1><br/><br/><h2>こんなお悩みを解決します！</h2><ul><li>メッセージが流れる問題</li><li>自分に関係の無い返信メッセージが多くて読みにくい</li><li>長文メッセージが多いとスクロールが大変</li></ul><br/><br/><h2>このツールができること</h2><ul><li>長文メッセージの折りたたみ表示</li><li>他人宛の返信メッセージの折りたたみ表示</li><li>自分宛てに通知されるメッセージは折りたたみません</li></ul><img src=\"'+explanation_1_url+'\", width=\"100%\"><br/><img src=\"'+explanation_2_url+'\", width=\"100%\"></div><button class=\"btn-square\" id=\"close\">使ってみる！</button></div><div class=\"content_back\"></div></div>');
      $(".popup").css({"display": "none", "height": "100%", "width": "100%", "position": "fixed", "z-index": "2", "top": "0", "left": "0"});
      $(".content_back").css({"height": "100%", "width": "15%", "background": "black", "opacity": "0.7",});
      $(".content").css({"background": "#fff", "padding": "30px", "width": "80%"});
      $(".show").css({"display": "flex", "justify-content": "center", "align-items": "center"});
      $(".btn-square").css({"position": "relative", "display": "inline-block", "padding": "0.25em 0.5em", "text-decoration": "none", "color": "#FFF", "background": "#fd9535", "border-bottom": "solid 2px #d27d00", "border-radius": "4px", "font-weight": "bold", "align-items": "center", "width": "60%", "margin": "3% 20%"});

      $("#close").on("click", function() {
        $(".popup").fadeOut();
        // 確認ボタンをクリックするとskipフラグが登録されて、移行は説明画面を表示しなくなる
        chrome.storage.sync.set({ 'initial_explanation_skip': true });
      });
    }
  });
}

window.onload = function(){
  // 初回起動時に説明画面を表示する
  view_initial_explanation();

  // onload → div要素ロード → オブザーバーset → サブオブザーバーset → rewrite_message実行
  //メイン要素を取得して結果をコールバック関数の引数に渡す
  //要素が取得できるまで待機して実行される
  load_container('.sc-epGmkI, .cMoFQn', function (main_container) {
    //監視の開始 メイン要素（チャット切り替え時に変化）
    main_observer.disconnect();
    main_observer.observe(main_container, {
      attributes: true,
      childList:  true
    });

    create_sub_observer();
  });
}
