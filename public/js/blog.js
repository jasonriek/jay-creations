let blog_content = document.getElementById('blog-content');
let submit_button = document.getElementById('submit-button');
let form = document.getElementById('form');
let files = document.getElementById('files');

files.onchange = function() {
    let src = URL.createObjectURL(this.files[0]);
    let file_name = files.files[0].name;
    try {
        tinymce.activeEditor.insertContent(`<img src="${src}" name="${file_name}" width="100" height="100" />`);
    }
    catch(err) {
        console.log(err);
    }

}

function submitForm(e) {   
    let subject = document.getElementById('subject').value;
    let author = document.getElementById('author').value;
    let content = tinymce.get('my-expressjs-tinymce-app').getContent();
    let form_data = new FormData();
    blog_content.value = content;
    form_data.append('SUBJECT', subject);
    form_data.append('AUTHOR', author);
    form_data.append('CONTENT', content);
    for(let i = 0; i < files.files.length; i++) {
        form_data.append('FILES', files.files[i]);
    }
    fetch('/blog_write', {
        method: 'POST',
        body: form_data,
    })
    .then((res) => console.log(res))
    .catch((err) => ("Error occured", err));
}

form.addEventListener('submit', submitForm);