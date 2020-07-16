// Saves options to chrome.storage
function save_options() {
  var line_count_repry = document.getElementById('line_count_repry').value;
  var line_count_long_sentences = document.getElementById('line_count_long_sentences').value;
  var fold_repry = document.getElementById('fold_repry').checked;
  var fold_long_sentences = document.getElementById('fold_long_sentences').checked;

  chrome.storage.sync.set({
    line_count_repry: line_count_repry,
    line_count_long_sentences: line_count_long_sentences,
    fold_repry: fold_repry,
    fold_long_sentences: fold_long_sentences
  });
}

// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    line_count_repry: line_count_repry,
    line_count_long_sentences: line_count_long_sentences,
    fold_repry: fold_repry,
    fold_long_sentences: fold_long_sentences
  }, function(items) {
    document.getElementById('line_count_repry').value = items.line_count_repry;
    document.getElementById('line_count_long_sentences').value = items.line_count_long_sentences;
    document.getElementById('fold_repry').checked = items.fold_repry;
    document.getElementById('fold_long_sentences').checked = items.fold_long_sentences;
  });
}

//todo : リファクタリング
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('line_count_repry').addEventListener('change', save_options);
document.getElementById('line_count_long_sentences').addEventListener('change', save_options);
document.getElementById('fold_repry').addEventListener('change', save_options);
document.getElementById('fold_long_sentences').addEventListener('change', save_options);
