// 性別選択のインタラクション
document.addEventListener('DOMContentLoaded', () => {
  const genderOptions = document.querySelectorAll('.gender-option');
  
  genderOptions.forEach(option => {
    option.addEventListener('click', () => {
      const radio = option.previousElementSibling;
      if (radio && radio.type === 'radio') {
        radio.checked = true;
      }
    });
  });
});