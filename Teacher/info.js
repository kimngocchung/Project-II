function fetchInfo() {
    fetch('/Teacher/getInfo')
        .then(response => response.json())
        .then(data => {
            data.forEach(teacher => {
            document.getElementById('teachercode').value = teacher.teachercode;
            document.getElementById('fullname').value = teacher.fullname;
            document.getElementById('email').value = teacher.email;
            document.getElementById('phonenumber').value = teacher.phonenumber;
            document.getElementById('dateofbirth').value = teacher.dob;
            });
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    fetchInfo();
});

document.getElementById('saveButton').addEventListener('click', function (event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form
    const teacherInfo = {
        teachercode: document.getElementById('teachercode').value,
        fullname: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        phonenumber: document.getElementById('phonenumber').value,
        dateofbirth: document.getElementById('dateofbirth').value,
    };
    // Gửi dữ liệu đến server
    fetch('/Teacher/saveInfo', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacherInfo),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        showSuccessMessage('Lưu thông tin thành công');
        // Xử lý sau khi lưu thành công, ví dụ: thông báo cho người dùng
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});

function showSuccessMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.style.position = 'fixed';
    messageElement.style.bottom = '20px';
    messageElement.style.right = '20px';
    messageElement.style.backgroundColor = 'green';
    messageElement.style.color = 'white';
    messageElement.style.padding = '10px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.zIndex = '1000';
    messageElement.innerText = message;

    document.body.appendChild(messageElement);

    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, 3000);
}