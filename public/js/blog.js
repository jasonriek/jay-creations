let blog_content = document.getElementById('blog-content');
let submit_link = document.getElementById('submit');
let submit_button = document.getElementById('submit-button');

submit_link.onclick = function() {
    let content = ''; 
    content = tinymce.get('my-expressjs-tinymce-app').getContent();
    if(content.length) {
        blog_content.value = content;
        submit_button.click();
    }
}