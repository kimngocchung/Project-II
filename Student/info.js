function fetchInfo() {
    fetch('/Student/getInfo')
        .then(response => response.json())
        .then(data => {
            data.forEach(student => {
                document.getElementById('studentcode').value = student.studentcode;
                document.getElementById('fullname').value = student.fullname;
                document.getElementById('email').value = student.email;
                document.getElementById('phonenumber').value = student.phonenumber;
                document.getElementById('dateofbirth').value = student.dob;
                document.getElementById('class').value = student.class;
                document.getElementById('password').value = student.password;
            });
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}

function getFullname() {
    fetch('/Student/getFullname')
        .then(response => response.json())
        .then(menu => {
            const studentNameView = document.getElementById('student-name-view');
            studentNameView.innerHTML = `<i class="bi bi-person-circle"></i>SV: ${menu.fullname}`;
        })
        .catch(error => console.error('Error fetching menu:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    fetchInfo();
});

document.getElementById('saveButton').addEventListener('click', function (event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form
    const studentInfo = {
        studentcode: document.getElementById('studentcode').value,
        fullname: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        phonenumber: document.getElementById('phonenumber').value,
        dateofbirth: document.getElementById('dateofbirth').value,
        className: document.getElementById('class').value,
        password: document.getElementById('password').value,
    };
    // Gửi dữ liệu đến server
    fetch('/Student/saveInfo', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentInfo),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            showSuccessMessage('Lưu thông tin thành công');
            // Xử lý sau khi lưu thành công, ví dụ: thông báo cho người dùng
            getFullname();
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