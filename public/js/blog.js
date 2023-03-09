let blog_content = document.getElementById('blog-content');
let submit_button = document.getElementById('submit-button');
let form = document.getElementById('form');
let files = document.getElementById('image');

files.onchange = function() {
    let src = URL.createObjectURL(this.files[0]);
    let image_name = this.files[0].name;
    try {
        let form_data = new FormData();
        form_data.append('IMAGE', this.files[0]);
  
     
        fetch('/blog_write/image_upload', {
            method: 'POST',
            body: form_data,
        })
        .then((res) => {
            res.text().then((data) => {
                src = `/images/blog/${image_name}`;
                tinymce.activeEditor.insertContent(`<img src="${src}" width="100" height="100" />`);
            })
            
        })
        .catch((err) => ("Error occured", err));
        
    }
    catch(err) {
        console.log(err);
    }

}

function submitForm(e) {   
    let content = tinymce.get('my-expressjs-tinymce-app').getContent();
    blog_content.value = content.replace('src="image', 'src="/image');
}



form.addEventListener('submit', submitForm);